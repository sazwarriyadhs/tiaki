package middleware

import (
	"log"
	"net/http"
	"time"
)

func RequestLogger(
	logger *log.Logger,
	next http.Handler,
) http.Handler {

	return http.HandlerFunc(
		func(w http.ResponseWriter, r *http.Request) {

			start := time.Now()

			next.ServeHTTP(w, r)

			logger.Printf(
				"%s %s %s",
				r.Method,
				r.URL.Path,
				time.Since(start),
			)
		},
	)
}
