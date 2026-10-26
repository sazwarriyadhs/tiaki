package middleware

import (
	"log"
	"net/http"
)

func Recovery(
	logger *log.Logger,
	next http.Handler,
) http.Handler {

	return http.HandlerFunc(
		func(w http.ResponseWriter, r *http.Request) {

			defer func() {

				if recovered := recover(); recovered != nil {

					logger.Printf(
						"panic recovered: %v",
						recovered,
					)

					http.Error(
						w,
						"internal server error",
						http.StatusInternalServerError,
					)
				}
			}()

			next.ServeHTTP(w, r)
		},
	)
}
