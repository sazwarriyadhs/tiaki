package rbac

import (
	"context"
)

type Principal struct {
	UserID         string
	OrganisationID string
	Roles          []string
}

type contextKey string

const principalKey contextKey = "tiaki_principal"

func WithPrincipal(
	ctx context.Context,
	principal Principal,
) context.Context {
	return context.WithValue(ctx, principalKey, principal)
}

func FromContext(ctx context.Context) (Principal, bool) {
	value := ctx.Value(principalKey)

	principal, ok := value.(Principal)

	return principal, ok
}

func HasRole(
	principal Principal,
	role string,
) bool {
	for _, item := range principal.Roles {
		if item == role || item == "owner" {
			return true
		}
	}

	return false
}

// HasExactRole checks only the explicitly assigned role.
// Unlike HasRole, owner does not implicitly pass this check.
func HasExactRole(
	principal Principal,
	role string,
) bool {
	for _, item := range principal.Roles {
		if item == role {
			return true
		}
	}

	return false
}

func HasAnyRole(
	principal Principal,
	roles ...string,
) bool {
	for _, role := range roles {
		if HasRole(principal, role) {
			return true
		}
	}

	return false
}
