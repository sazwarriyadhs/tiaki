package middleware

import (
	"net/http"

	"github.com/tiaki-platform/tiaki-api/internal/rbac"
)

func RequireRoles(
	roles ...string,
) func(http.Handler) http.Handler {

	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(
			func(w http.ResponseWriter, r *http.Request) {

				principal, ok :=
					rbac.FromContext(r.Context())

				if !ok {
					http.Error(
						w,
						`{"error":"authentication required"}`,
						http.StatusUnauthorized,
					)
					return
				}

				if !rbac.HasAnyRole(
					principal,
					roles...,
				) {
					http.Error(
						w,
						`{"error":"forbidden"}`,
						http.StatusForbidden,
					)
					return
				}

				next.ServeHTTP(w, r)
			},
		)
	}
}
