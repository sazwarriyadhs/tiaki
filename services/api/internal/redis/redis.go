package redisclient

import (
	"context"
	"time"

	"github.com/redis/go-redis/v9"
)

func Connect(
	ctx context.Context,
	address string,
) (*redis.Client, error) {

	client := redis.NewClient(&redis.Options{
		Addr:         address,
		DialTimeout:  5 * time.Second,
		ReadTimeout:  3 * time.Second,
		WriteTimeout: 3 * time.Second,
		PoolSize:     10,
		MinIdleConns: 2,
	})

	pingCtx, cancel := context.WithTimeout(
		ctx,
		5*time.Second,
	)

	defer cancel()

	if err := client.Ping(pingCtx).Err(); err != nil {
		_ = client.Close()
		return nil, err
	}

	return client, nil
}
