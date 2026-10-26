package password

import (
	"errors"

	"golang.org/x/crypto/bcrypt"
)

const cost = 12

func Hash(value string) (string, error) {
	if len(value) < 12 {
		return "", errors.New(
			"password must contain at least 12 characters",
		)
	}

	hash, err := bcrypt.GenerateFromPassword(
		[]byte(value),
		cost,
	)

	if err != nil {
		return "", err
	}

	return string(hash), nil
}

func Compare(hash string, value string) error {
	return bcrypt.CompareHashAndPassword(
		[]byte(hash),
		[]byte(value),
	)
}
