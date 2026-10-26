package token

import (
	"crypto/rand"
	"encoding/hex"
	"errors"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

type Manager struct {
	secret []byte
	ttl    time.Duration
}

func New(secret string, ttl time.Duration) (*Manager, error) {
	if len(secret) < 32 {
		return nil, errors.New("JWT secret must be at least 32 characters")
	}

	return &Manager{
		secret: []byte(secret),
		ttl:    ttl,
	}, nil
}

func (m *Manager) Generate(
	userID string,
	organisationID string,
	roles []string,
) (string, int64, error) {

	now := time.Now()
	exp := now.Add(m.ttl)

	jtiBytes := make([]byte, 16)

	if _, err := rand.Read(jtiBytes); err != nil {
		return "", 0, err
	}

	claims := jwt.MapClaims{
		"sub":             userID,
		"organisation_id": organisationID,
		"roles":           roles,
		"jti":             hex.EncodeToString(jtiBytes),
		"typ":             "access",
		"iat":             now.Unix(),
		"exp":             exp.Unix(),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)

	signed, err := token.SignedString(m.secret)
	if err != nil {
		return "", 0, err
	}

	return signed, int64(m.ttl.Seconds()), nil
}

func (m *Manager) Parse(value string) (jwt.MapClaims, error) {
	token, err := jwt.Parse(
		value,
		func(token *jwt.Token) (interface{}, error) {
			if token.Method != jwt.SigningMethodHS256 {
				return nil, errors.New("unexpected signing method")
			}

			return m.secret, nil
		},
	)

	if err != nil {
		return nil, err
	}

	if !token.Valid {
		return nil, errors.New("invalid token")
	}

	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok {
		return nil, errors.New("invalid claims")
	}

	return claims, nil
}
