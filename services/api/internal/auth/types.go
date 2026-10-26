package auth

import "time"

type Claims struct {
	UserID         string   `json:"sub"`
	OrganisationID string   `json:"organisation_id,omitempty"`
	Roles          []string `json:"roles,omitempty"`
	TokenID        string   `json:"jti"`
	Type           string   `json:"typ"`
	IssuedAt       int64    `json:"iat"`
	ExpiresAt      int64    `json:"exp"`
}

type LoginRequest struct {
	Login    string `json:"login"`
	Password string `json:"password"`
}

type RefreshRequest struct {
	RefreshToken string `json:"refresh_token"`
}

type TokenResponse struct {
	AccessToken  string `json:"access_token"`
	RefreshToken string `json:"refresh_token"`
	TokenType    string `json:"token_type"`
	ExpiresIn    int64  `json:"expires_in"`
}

type Session struct {
	ID        string
	UserID    string
	ExpiresAt time.Time
}
