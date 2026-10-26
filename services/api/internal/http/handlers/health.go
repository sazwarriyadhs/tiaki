package handlers

import (
	"context"
	"encoding/json"
	"net/http"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/redis/go-redis/v9"

	"github.com/tiaki-platform/tiaki-api/internal/version"
)

type HealthHandler struct {
	DB    *pgxpool.Pool
	Redis *redis.Client
}

func (h *HealthHandler) Health(
	w http.ResponseWriter,
	r *http.Request,
) {
	writeJSON(
		w,
		http.StatusOK,
		map[string]interface{}{
			"service": version.Service,
			"version": version.Version,
			"status":  "ok",
		},
	)
}

func (h *HealthHandler) Ready(
	w http.ResponseWriter,
	r *http.Request,
) {
	ctx, cancel := context.WithTimeout(
		r.Context(),
		3*time.Second,
	)

	defer cancel()

	dbStatus := "ok"
	redisStatus := "ok"

	if h.DB == nil || h.DB.Ping(ctx) != nil {
		dbStatus = "error"
	}

	if h.Redis == nil || h.Redis.Ping(ctx).Err() != nil {
		redisStatus = "error"
	}

	status := http.StatusOK

	if dbStatus != "ok" || redisStatus != "ok" {
		status = http.StatusServiceUnavailable
	}

	writeJSON(
		w,
		status,
		map[string]interface{}{
			"service": version.Service,
			"version": version.Version,
			"status": func() string {
				if status == http.StatusOK {
					return "ready"
				}
				return "not_ready"
			}(),
			"dependencies": map[string]string{
				"postgres": dbStatus,
				"redis":    redisStatus,
			},
		},
	)
}

func writeJSON(
	w http.ResponseWriter,
	status int,
	data interface{},
) {
	w.Header().Set(
		"Content-Type",
		"application/json; charset=utf-8",
	)

	w.WriteHeader(status)

	_ = json.NewEncoder(w).Encode(data)
}
