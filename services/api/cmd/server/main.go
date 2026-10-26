package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/tiaki-platform/tiaki-api/internal/auditor"
	"github.com/tiaki-platform/tiaki-api/internal/auth"

	"github.com/tiaki-platform/tiaki-api/internal/auth/token"
	"github.com/tiaki-platform/tiaki-api/internal/batches"
	"github.com/tiaki-platform/tiaki-api/internal/config"
	"github.com/tiaki-platform/tiaki-api/internal/dashboard"
	"github.com/tiaki-platform/tiaki-api/internal/database"
	"github.com/tiaki-platform/tiaki-api/internal/equipment"
	"github.com/tiaki-platform/tiaki-api/internal/http/handlers"
	"github.com/tiaki-platform/tiaki-api/internal/http/middleware"
	redisclient "github.com/tiaki-platform/tiaki-api/internal/redis"
	"github.com/tiaki-platform/tiaki-api/internal/store"
	"github.com/tiaki-platform/tiaki-api/internal/version"
)

func main() {
	logger := log.New(
		os.Stdout,
		"TIAKI API ",
		log.LstdFlags|log.Lmicroseconds,
	)

	cfg := config.Load()

	logger.Printf(
		"starting %s v%s",
		version.Service,
		version.Version,
	)

	logger.Printf(
		"environment=%s",
		cfg.AppEnv,
	)

	ctx := context.Background()

	// --------------------------------------------------------
	// PostgreSQL
	// --------------------------------------------------------

	db, err := database.Connect(
		ctx,
		cfg.PostgresURL(),
	)

	if err != nil {
		logger.Fatalf(
			"postgres connection failed: %v",
			err,
		)
	}

	defer db.Close()

	logger.Println("postgres connected")

	// --------------------------------------------------------
	// Redis
	// --------------------------------------------------------

	redis, err := redisclient.Connect(
		ctx,
		cfg.RedisAddress(),
	)

	if err != nil {
		logger.Fatalf(
			"redis connection failed: %v",
			err,
		)
	}

	defer redis.Close()

	logger.Println("redis connected")

	// --------------------------------------------------------
	// Health
	// --------------------------------------------------------

	health := &handlers.HealthHandler{
		DB:    db,
		Redis: redis,
	}

	// --------------------------------------------------------
	// Authentication
	// --------------------------------------------------------

	if cfg.JWTSecret == "" {
		logger.Fatal("JWT_SECRET is required")
	}

	tokenManager, err := token.New(
		cfg.JWTSecret,
		cfg.JWTTTL,
	)

	if err != nil {
		logger.Fatalf(
			"JWT initialization failed: %v",
			err,
		)
	}

	authStore := &store.AuthStore{
		DB: db,
	}

	authService := &auth.Service{
		Store:        authStore,
		TokenManager: tokenManager,
	}

	authHandler := &handlers.AuthHandler{
		Service: authService,
	}

	logger.Printf(
		"authentication initialized; access_ttl=%s",
		cfg.JWTTTL,
	)

	// --------------------------------------------------------

	// --------------------------------------------------------
	// Dashboard
	// --------------------------------------------------------

	dashboardStore := &store.DashboardStore{
		DB: db,
	}

	dashboardService := &dashboard.Service{
		Store: dashboardStore,
	}

	dashboardHandler := &handlers.DashboardHandler{
		Service: dashboardService,
		Logger:  logger,
	}

	batchStore := &store.BatchStore{
		DB: db,
	}

	batchService := &batches.Service{
		Store: batchStore,
	}

	batchHandler := &handlers.BatchesHandler{
		Service: batchService,
		Logger:  logger,
	}

	// --------------------------------------------------------
	// Auditor
	// --------------------------------------------------------

	auditorStore := &store.AuditorStore{
		DB: db,
	}

	auditorService := &auditor.Service{
		Store: auditorStore,
	}

	auditorHandler := &handlers.AuditorHandler{
		Service: auditorService,
		Logger:  logger,
	}
	// Router
	// --------------------------------------------------------

	// --------------------------------------------------------
	// Equipment / IoT / Temperature
	// --------------------------------------------------------

	equipmentStore := &store.EquipmentStore{
		DB: db,
	}

	equipmentService := &equipment.Service{
		Store: equipmentStore,
	}

	equipmentHandler := handlers.NewEquipmentHandler(
		equipmentService,
	)
	mux := http.NewServeMux()

	// --------------------------------------------------------
	// Protected Equipment / IoT routes
	// --------------------------------------------------------

	mux.Handle(
		"/api/v1/equipment/overview",
		middleware.AuthRequired(tokenManager)(
			http.HandlerFunc(equipmentHandler.Overview),
		),
	)

	mux.Handle(
		"/api/v1/equipment/devices",
		middleware.AuthRequired(tokenManager)(
			http.HandlerFunc(equipmentHandler.Devices),
		),
	)

	mux.Handle(
		"/api/v1/equipment/sensors",
		middleware.AuthRequired(tokenManager)(
			http.HandlerFunc(equipmentHandler.Sensors),
		),
	)

	mux.Handle(
		"/api/v1/equipment/sensors/",
		middleware.AuthRequired(tokenManager)(
			http.HandlerFunc(equipmentHandler.Readings),
		),
	)

	mux.Handle(
		"/api/v1/equipment/excursions",
		middleware.AuthRequired(tokenManager)(
			http.HandlerFunc(equipmentHandler.Excursions),
		),
	)

	mux.Handle(
		"/api/v1/equipment/thresholds",
		middleware.AuthRequired(tokenManager)(
			http.HandlerFunc(equipmentHandler.Thresholds),
		),
	)

	mux.Handle(
		"/api/v1/equipment/calibrations",
		middleware.AuthRequired(tokenManager)(
			http.HandlerFunc(equipmentHandler.Calibrations),
		),
	)

	mux.Handle(
		"/api/v1/equipment",
		middleware.AuthRequired(tokenManager)(
			http.HandlerFunc(equipmentHandler.List),
		),
	)

	mux.Handle(
		"/api/v1/equipment/",
		middleware.AuthRequired(tokenManager)(
			http.HandlerFunc(equipmentHandler.Get),
		),
	)

	// Public health routes.

	mux.HandleFunc(
		"/health",
		health.Health,
	)

	mux.HandleFunc(
		"/ready",
		health.Ready,
	)

	mux.HandleFunc(
		"/api/v1/health",
		health.Health,
	)

	// Public authentication routes.

	mux.HandleFunc(
		"/api/v1/auth/login",
		authHandler.Login,
	)

	mux.HandleFunc(
		"/api/v1/auth/refresh",
		authHandler.Refresh,
	)

	mux.HandleFunc(
		"/api/v1/auth/logout",
		authHandler.Logout,
	)

	// Protected authentication route.

	mux.Handle(
		"/api/v1/auth/me",
		middleware.AuthRequired(tokenManager)(
			http.HandlerFunc(authHandler.Me),
		),
	)

	// Protected dashboard route.

	mux.Handle(
		"/api/v1/dashboard/summary",
		middleware.AuthRequired(tokenManager)(
			http.HandlerFunc(dashboardHandler.Summary),
		),
	)

	mux.Handle(
		"/api/v1/batches",
		middleware.AuthRequired(tokenManager)(
			http.HandlerFunc(batchHandler.List),
		),
	)

	// Protected auditor overview route.

	mux.Handle(
		"/api/v1/auditor/overview",
		middleware.AuthRequired(tokenManager)(
			http.HandlerFunc(auditorHandler.Overview),
		),
	)
	// Protected auditor lookup routes.

	mux.Handle(
		"/api/v1/auditor/frameworks",
		middleware.AuthRequired(tokenManager)(
			http.HandlerFunc(auditorHandler.Frameworks),
		),
	)

	mux.Handle(
		"/api/v1/auditor/premises",
		middleware.AuthRequired(tokenManager)(
			http.HandlerFunc(auditorHandler.Premises),
		),
	)

	mux.Handle(
		"/api/v1/auditor/assessors",
		middleware.AuthRequired(tokenManager)(
			http.HandlerFunc(auditorHandler.Assessors),
		),
	)
	// Protected auditor audit list route.
	mux.Handle(
		"/api/v1/auditor/audits",
		middleware.AuthRequired(tokenManager)(
			http.HandlerFunc(auditorHandler.Audits),
		),
	)
	// Protected auditor audit detail route.
	mux.Handle(
		"/api/v1/auditor/audits/",
		middleware.AuthRequired(tokenManager)(
			http.HandlerFunc(auditorHandler.Audit),
		),
	)
	handler := middleware.CORS(
		middleware.Recovery(
			logger,
			middleware.RequestLogger(
				logger,
				mux,
			),
		),
	)

	server := &http.Server{
		Addr:              cfg.APIHost + ":" + itoa(cfg.APIPort),
		Handler:           handler,
		ReadHeaderTimeout: 5 * time.Second,
		ReadTimeout:       15 * time.Second,
		WriteTimeout:      15 * time.Second,
		IdleTimeout:       60 * time.Second,
	}

	// --------------------------------------------------------
	// Server
	// --------------------------------------------------------

	go func() {
		logger.Printf(
			"listening on %s",
			server.Addr,
		)

		if err := server.ListenAndServe(); err != nil &&
			err != http.ErrServerClosed {

			logger.Fatalf(
				"http server failed: %v",
				err,
			)
		}
	}()

	// --------------------------------------------------------
	// Shutdown
	// --------------------------------------------------------

	stop := make(chan os.Signal, 1)

	signal.Notify(
		stop,
		os.Interrupt,
		syscall.SIGTERM,
	)

	<-stop

	logger.Println("shutdown signal received")

	shutdownCtx, cancel := context.WithTimeout(
		context.Background(),
		time.Duration(
			cfg.ShutdownTimeoutSeconds,
		)*time.Second,
	)

	defer cancel()

	if err := server.Shutdown(shutdownCtx); err != nil {
		logger.Printf(
			"graceful shutdown failed: %v",
			err,
		)
	}

	logger.Println("TIAKI API stopped")
}

func itoa(value int) string {
	if value == 0 {
		return "0"
	}

	negative := value < 0

	if negative {
		value = -value
	}

	digits := make([]byte, 0, 10)

	for value > 0 {
		digits = append(
			digits,
			byte('0'+value%10),
		)

		value /= 10
	}

	for i, j := 0, len(digits)-1; i < j; i, j = i+1, j-1 {
		digits[i], digits[j] = digits[j], digits[i]
	}

	if negative {
		digits = append(digits, '-')

		for i, j := 0, len(digits)-1; i < j; i, j = i+1, j-1 {
			digits[i], digits[j] = digits[j], digits[i]
		}
	}

	return string(digits)
}
