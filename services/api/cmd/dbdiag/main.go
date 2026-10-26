package main

import (
    "context"
    "fmt"
    "net/url"
    "os"

    "github.com/tiaki-platform/tiaki-api/internal/config"
    "github.com/tiaki-platform/tiaki-api/internal/database"
)

func main() {
    cfg := config.Load()

    fmt.Println("=== TIAKI DB DIAGNOSTIC ===")
    fmt.Println("Host:", cfg.PostgresHost)
    fmt.Println("Port:", cfg.PostgresPort)
    fmt.Println("DB:", cfg.PostgresDB)
    fmt.Println("User:", cfg.PostgresUser)
    fmt.Println("Password set:", cfg.PostgresPass != "")
    fmt.Println("SSL:", cfg.PostgresSSLMode)

    dsn := cfg.PostgresURL()

    u, err := url.Parse(dsn)
    if err != nil {
        fmt.Println("DSN parse error:", err)
        os.Exit(1)
    }

    u.User = url.User(u.User.Username())
    fmt.Println("Sanitized DSN:", u.String())

    db, err := database.Connect(context.Background(), dsn)
    if err != nil {
        fmt.Println("PGX CONNECT ERROR:", err)
        os.Exit(1)
    }

    defer db.Close()

    fmt.Println("PGX CONNECT: SUCCESS")
}
