package middleware

import (
	"net/http"
	"strings"

	"github.com/tiaki-platform/tiaki-api/internal/auth/token"
	"github.com/tiaki-platform/tiaki-api/internal/rbac"
)

func AuthRequired(
	manager *token.Manager,
) func(http.Handler) http.Handler {

	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(
			func(w http.ResponseWriter, r *http.Request) {

				header := strings.TrimSpace(
					r.Header.Get("Authorization"),
				)

				if header == "" ||
					!strings.HasPrefix(header, "Bearer ") {

					http.Error(
						w,
						`{"error":"authentication required"}`,
						http.StatusUnauthorized,
					)
					return
				}

				value := strings.TrimSpace(
					strings.TrimPrefix(header, "Bearer "),
				)

				if value == "" {
					http.Error(
						w,
						`{"error":"authentication required"}`,
						http.StatusUnauthorized,
					)
					return
				}

				claims, err := manager.Parse(value)

				if err != nil {
					http.Error(
						w,
						`{"error":"invalid token"}`,
						http.StatusUnauthorized,
					)
					return
				}

				if claims["typ"] != "access" {
					http.Error(
						w,
						`{"error":"invalid token type"}`,
						http.StatusUnauthorized,
					)
					return
				}

				userID, ok := claims["sub"].(string)

				if !ok || userID == "" {
					http.Error(
						w,
						`{"error":"invalid subject"}`,
						http.StatusUnauthorized,
					)
					return
				}

				organisationID, _ :=
					claims["organisation_id"].(string)

				var roles []string

				switch rawRoles := claims["roles"].(type) {
				case []interface{}:
					for _, raw := range rawRoles {
						if role, ok := raw.(string); ok {
							roles = append(roles, role)
						}
					}

				case []string:
					roles = append(
						roles,
						rawRoles...,
					)
				}

				principal := rbac.Principal{
					UserID:         userID,
					OrganisationID: organisationID,
					Roles:          roles,
				}

				ctx := rbac.WithPrincipal(
					r.Context(),
					principal,
				)

				next.ServeHTTP(
					w,
					r.WithContext(ctx),
				)
			},
		)
	}
}
