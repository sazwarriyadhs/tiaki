package handlers

import (
	"encoding/json"
	"errors"
	"net/http"
	"strings"

	"github.com/jackc/pgx/v5"

	"github.com/tiaki-platform/tiaki-api/internal/auditor"
	"github.com/tiaki-platform/tiaki-api/internal/rbac"
)

type AuditsHandler struct {
	Service *auditor.AuditsService
}

func (h *AuditsHandler) List(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		return
	}

	principal, ok := rbac.FromContext(r.Context())
	if !ok || principal.UserID == "" || principal.OrganisationID == "" {
		writeAuditJSONError(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	if h == nil || h.Service == nil {
		writeAuditJSONError(w, http.StatusInternalServerError, "audit service is not configured")
		return
	}

	response, err := h.Service.List(
		r.Context(),
		principal.OrganisationID,
	)
	if err != nil {
		writeAuditJSONError(w, http.StatusInternalServerError, err.Error())
		return
	}

	writeAuditJSON(w, http.StatusOK, response)
}

func (h *AuditsHandler) Detail(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		return
	}

	principal, ok := rbac.FromContext(r.Context())
	if !ok || principal.UserID == "" || principal.OrganisationID == "" {
		writeAuditJSONError(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	if h == nil || h.Service == nil {
		writeAuditJSONError(w, http.StatusInternalServerError, "audit service is not configured")
		return
	}

	prefix := "/api/v1/auditor/audits/"
	id := strings.TrimPrefix(r.URL.Path, prefix)
	id = strings.TrimSpace(id)

	if id == "" || strings.Contains(id, "/") {
		writeAuditJSONError(w, http.StatusBadRequest, "audit_id is required")
		return
	}

	response, err := h.Service.Get(
		r.Context(),
		principal.OrganisationID,
		id,
	)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			writeAuditJSONError(w, http.StatusNotFound, "audit not found")
			return
		}

		writeAuditJSONError(w, http.StatusInternalServerError, err.Error())
		return
	}

	writeAuditJSON(w, http.StatusOK, response)
}

func writeAuditJSON(
	w http.ResponseWriter,
	status int,
	value any,
) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)

	_ = json.NewEncoder(w).Encode(value)
}

func writeAuditJSONError(
	w http.ResponseWriter,
	status int,
	message string,
) {
	writeAuditJSON(w, status, map[string]any{
		"error": map[string]any{
			"message": message,
		},
	})
}
