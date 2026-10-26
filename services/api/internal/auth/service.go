package auth

import (
	"context"
	"crypto/rand"
	"encoding/base64"
	"errors"
	"net"
	"net/http"
	"strings"
	"time"

	"github.com/tiaki-platform/tiaki-api/internal/auth/password"
	"github.com/tiaki-platform/tiaki-api/internal/auth/token"
	"github.com/tiaki-platform/tiaki-api/internal/store"
)

type Service struct {
	Store        *store.AuthStore
	TokenManager *token.Manager
}

func (s *Service) Login(
	ctx context.Context,
	login string,
	plainPassword string,
	ip string,
	userAgent string,
) (TokenResponse, error) {

	var response TokenResponse

	if strings.TrimSpace(login) == "" ||
		plainPassword == "" {
		return response, errors.New("invalid credentials")
	}

	account, err := s.Store.FindAccount(ctx, login)

	if err != nil {
		return response, errors.New("invalid credentials")
	}

	if account.Status != "active" {
		return response, errors.New("account unavailable")
	}

	if account.LockedUntil != nil &&
		account.LockedUntil.After(time.Now()) {
		return response, errors.New("account temporarily locked")
	}

	if err := password.Compare(
		account.PasswordHash,
		plainPassword,
	); err != nil {
		return response, errors.New("invalid credentials")
	}

	info, err := s.Store.GetUserInfo(ctx, account.UserID)

	if err != nil {
		return response, err
	}

	access, ttl, err := s.TokenManager.Generate(
		info.UserID,
		info.OrganisationID,
		info.Roles,
	)

	if err != nil {
		return response, err
	}

	refresh, err := generateRefreshToken()

	if err != nil {
		return response, err
	}

	if err := s.Store.CreateRefreshSession(
		ctx,
		info.UserID,
		refresh,
		time.Now().Add(30*24*time.Hour),
		ip,
		userAgent,
	); err != nil {
		return response, err
	}

	return TokenResponse{
		AccessToken:  access,
		RefreshToken: refresh,
		TokenType:    "Bearer",
		ExpiresIn:    ttl,
	}, nil
}

func (s *Service) Refresh(
	ctx context.Context,
	refreshToken string,
) (TokenResponse, error) {

	var response TokenResponse

	if strings.TrimSpace(refreshToken) == "" {
		return response, errors.New("refresh token required")
	}

	userID, err := s.Store.RotateRefreshSession(
		ctx,
		refreshToken,
	)

	if err != nil {
		return response, err
	}

	info, err := s.Store.GetUserInfo(ctx, userID)

	if err != nil {
		return response, err
	}

	access, ttl, err := s.TokenManager.Generate(
		info.UserID,
		info.OrganisationID,
		info.Roles,
	)

	if err != nil {
		return response, err
	}

	nextRefresh, err := generateRefreshToken()

	if err != nil {
		return response, err
	}

	if err := s.Store.CreateRefreshSession(
		ctx,
		info.UserID,
		nextRefresh,
		time.Now().Add(30*24*time.Hour),
		"",
		"",
	); err != nil {
		return response, err
	}

	return TokenResponse{
		AccessToken:  access,
		RefreshToken: nextRefresh,
		TokenType:    "Bearer",
		ExpiresIn:    ttl,
	}, nil
}

func (s *Service) Logout(
	ctx context.Context,
	refreshToken string,
) error {
	return s.Store.RevokeRefreshSession(ctx, refreshToken)
}

func generateRefreshToken() (string, error) {
	buffer := make([]byte, 48)

	if _, err := rand.Read(buffer); err != nil {
		return "", err
	}

	return base64.RawURLEncoding.EncodeToString(buffer), nil
}

func ClientIP(r *http.Request) string {
	host, _, err := net.SplitHostPort(r.RemoteAddr)

	if err == nil {
		return host
	}

	return strings.TrimSpace(r.RemoteAddr)
}
