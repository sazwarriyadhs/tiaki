package store

import (
	"context"
	"crypto/sha256"
	"encoding/hex"
	"errors"
	"strings"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
)

type AuthStore struct {
	DB *pgxpool.Pool
}

type Account struct {
	UserID         string
	PasswordHash   string
	Status         string
	FailedAttempts int
	LockedUntil    *time.Time
}

type UserInfo struct {
	UserID         string
	OrganisationID string
	Roles          []string
}

func NormalizeLogin(value string) string {
	return strings.ToLower(strings.TrimSpace(value))
}

func HashRefreshToken(value string) string {
	sum := sha256.Sum256([]byte(value))
	return hex.EncodeToString(sum[:])
}

func (s *AuthStore) FindAccount(
	ctx context.Context,
	login string,
) (Account, error) {

	normalized := NormalizeLogin(login)

	var a Account

	err := s.DB.QueryRow(
		ctx,
		`
        SELECT user_id, password_hash, status,
               failed_attempts, locked_until
        FROM app.auth_accounts
        WHERE login_normalized = $1
        `,
		normalized,
	).Scan(
		&a.UserID,
		&a.PasswordHash,
		&a.Status,
		&a.FailedAttempts,
		&a.LockedUntil,
	)

	return a, err
}

func (s *AuthStore) GetUserInfo(
	ctx context.Context,
	userID string,
) (UserInfo, error) {

	var info UserInfo

	err := s.DB.QueryRow(
		ctx,
		`
        SELECT
            u.id::text,
            COALESCE(
                (
                    SELECT ou.organisation_id::text
                    FROM app.organisation_users ou
                    WHERE ou.user_id = u.id

                    LIMIT 1
                ),
                ''
            )
        FROM app.users u
        WHERE u.id = $1
        `,
		userID,
	).Scan(
		&info.UserID,
		&info.OrganisationID,
	)

	if err != nil {
		return info, err
	}

	rows, err := s.DB.Query(
		ctx,
		`
        SELECT r.code
        FROM app.user_roles ur
        JOIN app.roles r ON r.id = ur.role_id
        WHERE ur.user_id = $1
        ORDER BY r.code
        `,
		userID,
	)

	if err != nil {
		return info, err
	}

	defer rows.Close()

	for rows.Next() {
		var role string

		if err := rows.Scan(&role); err != nil {
			return info, err
		}

		info.Roles = append(info.Roles, role)
	}

	if err := rows.Err(); err != nil {
		return info, err
	}

	return info, nil
}

func (s *AuthStore) CreateRefreshSession(
	ctx context.Context,
	userID string,
	token string,
	expires time.Time,
	ip string,
	userAgent string,
) error {

	_, err := s.DB.Exec(
		ctx,
		`
        INSERT INTO app.auth_refresh_sessions
            (user_id, token_hash, expires_at, ip_address, user_agent)
        VALUES
            ($1, $2, $3, NULLIF($4,'')::inet, $5)
        `,
		userID,
		HashRefreshToken(token),
		expires,
		ip,
		userAgent,
	)

	return err
}

func (s *AuthStore) RotateRefreshSession(
	ctx context.Context,
	token string,
) (string, error) {

	hash := HashRefreshToken(token)

	tx, err := s.DB.Begin(ctx)

	if err != nil {
		return "", err
	}

	defer func() {
		_ = tx.Rollback(ctx)
	}()

	var userID string

	err = tx.QueryRow(
		ctx,
		`
        SELECT user_id::text
        FROM app.auth_refresh_sessions
        WHERE token_hash = $1
          AND revoked_at IS NULL
          AND expires_at > now()
        FOR UPDATE
        `,
		hash,
	).Scan(&userID)

	if err != nil {
		return "", errors.New("invalid refresh token")
	}

	tag, err := tx.Exec(
		ctx,
		`
        UPDATE app.auth_refresh_sessions
        SET revoked_at = now()
        WHERE token_hash = $1
          AND revoked_at IS NULL
        `,
		hash,
	)

	if err != nil {
		return "", err
	}

	if tag.RowsAffected() != 1 {
		return "", errors.New("invalid refresh token")
	}

	if err := tx.Commit(ctx); err != nil {
		return "", err
	}

	return userID, nil
}

func (s *AuthStore) RevokeRefreshSession(
	ctx context.Context,
	token string,
) error {

	_, err := s.DB.Exec(
		ctx,
		`
        UPDATE app.auth_refresh_sessions
        SET revoked_at = now()
        WHERE token_hash = $1
          AND revoked_at IS NULL
        `,
		HashRefreshToken(token),
	)

	return err
}
