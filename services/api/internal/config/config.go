package config

import (
	"net/url"
	"os"
	"path/filepath"
	"strconv"
	"strings"
	"time"
)

type Config struct {
	AppName string
	AppEnv  string

	APIHost string
	APIPort int

	PostgresHost    string
	PostgresPort    int
	PostgresDB      string
	PostgresUser    string
	PostgresPass    string
	PostgresSSLMode string

	RedisHost string
	RedisPort int

	JWTSecret string
	JWTTTL    time.Duration

	ShutdownTimeoutSeconds int
}

func Load() Config {
	// Load .env only when the corresponding environment variables
	// are not already present. Explicit OS environment variables win.
	loadDotEnv()

	return Config{
		AppName: getEnv("APP_NAME", "TIAKI"),
		AppEnv:  getEnv("APP_ENV", "development"),

		APIHost: getEnv("API_HOST", "0.0.0.0"),
		APIPort: getIntEnv("API_PORT", 8093),

		PostgresHost:    getEnv("POSTGRES_HOST", "localhost"),
		PostgresPort:    getIntEnv("POSTGRES_PORT", 15441),
		PostgresDB:      getEnv("POSTGRES_DB", "tiaki"),
		PostgresUser:    getEnv("POSTGRES_USER", "tiaki"),
		PostgresPass:    os.Getenv("POSTGRES_PASSWORD"),
		PostgresSSLMode: getEnv("POSTGRES_SSLMODE", "disable"),

		RedisHost: getEnv("REDIS_HOST", "localhost"),
		RedisPort: getIntEnv("REDIS_PORT", 6385),

		JWTSecret: getEnv("JWT_SECRET", ""),
		JWTTTL: time.Duration(
			getIntEnv("JWT_ACCESS_TTL_MINUTES", 15),
		) * time.Minute,

		ShutdownTimeoutSeconds: getIntEnv(
			"API_SHUTDOWN_TIMEOUT_SECONDS",
			10,
		),
	}
}

func (c Config) PostgresURL() string {
	u := &url.URL{
		Scheme: "postgres",
		User:   url.UserPassword(c.PostgresUser, c.PostgresPass),
		Host:   c.PostgresHost + ":" + strconv.Itoa(c.PostgresPort),
		Path:   "/" + c.PostgresDB,
	}

	q := url.Values{}
	q.Set("sslmode", c.PostgresSSLMode)
	u.RawQuery = q.Encode()

	return u.String()
}

func (c Config) RedisAddress() string {
	return c.RedisHost + ":" + strconv.Itoa(c.RedisPort)
}

// loadDotEnv loads D:\TIAKI\.env when running the API locally.
//
// Existing environment variables are never overwritten.
// This means:
//
//	Windows environment > .env > application defaults
func loadDotEnv() {
	candidates := []string{}

	if explicit := os.Getenv("TIAKI_ENV_FILE"); explicit != "" {
		candidates = append(candidates, explicit)
	}

	// Current working directory.
	candidates = append(candidates, ".env")

	// When launched from D:\TIAKI\services\api,
	// the project root .env is ../../.env.
	if cwd, err := os.Getwd(); err == nil {
		candidates = append(
			candidates,
			filepath.Join(cwd, "..", "..", ".env"),
		)
	}

	// Also try relative to the executable location.
	if exe, err := os.Executable(); err == nil {
		exeDir := filepath.Dir(exe)

		candidates = append(
			candidates,
			filepath.Join(exeDir, ".env"),
			filepath.Join(exeDir, "..", "..", ".env"),
		)
	}

	seen := make(map[string]bool)

	for _, candidate := range candidates {
		path, err := filepath.Abs(candidate)
		if err != nil {
			continue
		}

		path = filepath.Clean(path)

		if seen[path] {
			continue
		}
		seen[path] = true

		if err := loadDotEnvFile(path); err == nil {
			return
		}
	}
}

func loadDotEnvFile(path string) error {
	data, err := os.ReadFile(path)
	if err != nil {
		return err
	}

	lines := strings.Split(string(data), "\n")

	for _, line := range lines {
		line = strings.TrimSpace(line)

		if line == "" || strings.HasPrefix(line, "#") {
			continue
		}

		// Support optional "export KEY=value".
		line = strings.TrimPrefix(line, "export ")

		key, value, ok := strings.Cut(line, "=")
		if !ok {
			continue
		}

		key = strings.TrimSpace(key)
		value = strings.TrimSpace(value)

		if key == "" {
			continue
		}

		// Remove optional surrounding quotes.
		if len(value) >= 2 {
			if (value[0] == '"' && value[len(value)-1] == '"') ||
				(value[0] == '\'' && value[len(value)-1] == '\'') {
				value = value[1 : len(value)-1]
			}
		}

		// Do not overwrite an explicitly supplied environment variable.
		if _, exists := os.LookupEnv(key); exists {
			continue
		}

		_ = os.Setenv(key, value)
	}

	return nil
}

func getEnv(key, fallback string) string {
	value := os.Getenv(key)

	if value == "" {
		return fallback
	}

	return value
}

func getIntEnv(key string, fallback int) int {
	value := os.Getenv(key)

	if value == "" {
		return fallback
	}

	parsed, err := strconv.Atoi(value)

	if err != nil {
		return fallback
	}

	return parsed
}
