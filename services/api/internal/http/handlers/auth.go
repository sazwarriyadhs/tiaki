package handlers

import (
	"encoding/json"
	"net/http"
	"strings"

	"github.com/tiaki-platform/tiaki-api/internal/auth"
	"github.com/tiaki-platform/tiaki-api/internal/rbac"
)

type AuthHandler struct {
	Service *auth.Service
}

func (h *AuthHandler) Login(
	w http.ResponseWriter,
	r *http.Request,
) {
	var req auth.LoginRequest

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request")
		return
	}

	result, err := h.Service.Login(
		r.Context(),
		req.Login,
		req.Password,
		auth.ClientIP(r),
		r.UserAgent(),
	)

	if err != nil {
		writeError(w, http.StatusUnauthorized, err.Error())
		return
	}

	writeJSON(w, http.StatusOK, result)
}

func (h *AuthHandler) Refresh(
	w http.ResponseWriter,
	r *http.Request,
) {
	var req auth.RefreshRequest

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request")
		return
	}

	result, err := h.Service.Refresh(
		r.Context(),
		req.RefreshToken,
	)

	if err != nil {
		writeError(w, http.StatusUnauthorized, err.Error())
		return
	}

	writeJSON(w, http.StatusOK, result)
}

func (h *AuthHandler) Logout(
	w http.ResponseWriter,
	r *http.Request,
) {
	var req auth.RefreshRequest

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request")
		return
	}

	if err := h.Service.Logout(
		r.Context(),
		req.RefreshToken,
	); err != nil {
		writeError(
			w,
			http.StatusInternalServerError,
			"logout failed",
		)
		return
	}

	writeJSON(
		w,
		http.StatusOK,
		map[string]string{
			"status": "logged_out",
		},
	)
}

func (h *AuthHandler) Me(
	w http.ResponseWriter,
	r *http.Request,
) {
	principal, ok := rbac.FromContext(r.Context())

	if !ok {
		writeError(
			w,
			http.StatusUnauthorized,
			"authentication required",
		)
		return
	}

	writeJSON(
		w,
		http.StatusOK,
		map[string]interface{}{
			"user_id":         principal.UserID,
			"organisation_id": principal.OrganisationID,
			"roles":           principal.Roles,
		},
	)
}

func writeError(
	w http.ResponseWriter,
	status int,
	message string,
) {
	writeJSON(
		w,
		status,
		map[string]string{
			"error": strings.TrimSpace(message),
		},
	)
}
