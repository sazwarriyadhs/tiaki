package handlers

import (
	"encoding/json"
	"errors"
	"log"
	"net/http"
	"strings"

	"github.com/jackc/pgx/v5"

	"github.com/tiaki-platform/tiaki-api/internal/auditor"
	"github.com/tiaki-platform/tiaki-api/internal/rbac"
)

type AuditorHandler struct {
	Service *auditor.Service
	Logger  *log.Logger
}

func (h *AuditorHandler) Overview(
	w http.ResponseWriter,
	r *http.Request,
) {
	if r.Method != http.MethodGet {
		writeAuditorJSONError(
			w,
			http.StatusMethodNotAllowed,
			"method_not_allowed",
			"GET required",
		)
		return
	}

	principal, ok := rbac.FromContext(r.Context())
	if !ok || principal.UserID == "" || principal.OrganisationID == "" {
		writeAuditorJSONError(
			w,
			http.StatusUnauthorized,
			"unauthorized",
			"authentication and organisation context are required",
		)
		return
	}

	if h == nil || h.Service == nil {
		writeAuditorJSONError(
			w,
			http.StatusInternalServerError,
			"auditor_not_configured",
			"auditor service is not configured",
		)
		return
	}

	response, err := h.Service.GetOverview(
		r.Context(),
		principal.OrganisationID,
	)

	if err != nil {
		h.logError(
			"auditor overview failed",
			principal.UserID,
			principal.OrganisationID,
			"",
			err,
		)

		writeAuditorJSONError(
			w,
			http.StatusInternalServerError,
			"auditor_overview_error",
			err.Error(),
		)
		return
	}

	writeAuditorJSON(
		w,
		http.StatusOK,
		response,
	)
}

func (h *AuditorHandler) Audits(
	w http.ResponseWriter,
	r *http.Request,
) {
	switch r.Method {
	case http.MethodGet:
		h.listAudits(w, r)

	case http.MethodPost:
		h.createAudit(w, r)

	default:
		writeAuditorJSONError(
			w,
			http.StatusMethodNotAllowed,
			"method_not_allowed",
			"GET or POST required",
		)
	}
}
func (h *AuditorHandler) listAudits(
	w http.ResponseWriter,
	r *http.Request,
) {
	if r.Method != http.MethodGet {
		writeAuditorJSONError(
			w,
			http.StatusMethodNotAllowed,
			"method_not_allowed",
			"GET required",
		)
		return
	}

	principal, ok := rbac.FromContext(r.Context())
	if !ok || principal.UserID == "" || principal.OrganisationID == "" {
		writeAuditorJSONError(
			w,
			http.StatusUnauthorized,
			"unauthorized",
			"authentication and organisation context are required",
		)
		return
	}

	if h == nil || h.Service == nil {
		writeAuditorJSONError(
			w,
			http.StatusInternalServerError,
			"auditor_not_configured",
			"auditor service is not configured",
		)
		return
	}

	response, err := h.Service.ListAudits(
		r.Context(),
		principal.OrganisationID,
	)

	if err != nil {
		h.logError(
			"auditor list failed",
			principal.UserID,
			principal.OrganisationID,
			"",
			err,
		)

		writeAuditorJSONError(
			w,
			http.StatusInternalServerError,
			"auditor_list_error",
			err.Error(),
		)
		return
	}

	writeAuditorJSON(
		w,
		http.StatusOK,
		response,
	)
}

func (h *AuditorHandler) Audit(
	w http.ResponseWriter,
	r *http.Request,
) {
	if r.Method != http.MethodGet {
		writeAuditorJSONError(
			w,
			http.StatusMethodNotAllowed,
			"method_not_allowed",
			"GET required",
		)
		return
	}

	principal, ok := rbac.FromContext(r.Context())
	if !ok || principal.UserID == "" || principal.OrganisationID == "" {
		writeAuditorJSONError(
			w,
			http.StatusUnauthorized,
			"unauthorized",
			"authentication and organisation context are required",
		)
		return
	}

	auditID := strings.Trim(
		strings.TrimPrefix(r.URL.Path, "/api/v1/auditor/audits/"),
		"/",
	)

	if auditID == "" {
		writeAuditorJSONError(
			w,
			http.StatusBadRequest,
			"invalid_audit_id",
			"audit id is required",
		)
		return
	}

	if h == nil || h.Service == nil {
		writeAuditorJSONError(
			w,
			http.StatusInternalServerError,
			"auditor_not_configured",
			"auditor service is not configured",
		)
		return
	}

	response, err := h.Service.GetAudit(
		r.Context(),
		principal.OrganisationID,
		auditID,
	)

	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			writeAuditorJSONError(
				w,
				http.StatusNotFound,
				"audit_not_found",
				"audit record was not found for this organisation",
			)
			return
		}

		h.logError(
			"auditor detail failed",
			principal.UserID,
			principal.OrganisationID,
			auditID,
			err,
		)

		writeAuditorJSONError(
			w,
			http.StatusInternalServerError,
			"auditor_detail_error",
			err.Error(),
		)
		return
	}

	writeAuditorJSON(
		w,
		http.StatusOK,
		response,
	)
}

func (h *AuditorHandler) logError(
	message string,
	userID string,
	organisationID string,
	auditID string,
	err error,
) {
	if h != nil && h.Logger != nil {
		h.Logger.Printf(
			"%s: user_id=%s organisation_id=%s audit_id=%s error=%v",
			message,
			userID,
			organisationID,
			auditID,
			err,
		)
	}
}

func writeAuditorJSON(
	w http.ResponseWriter,
	status int,
	payload any,
) {
	w.Header().Set(
		"Content-Type",
		"application/json; charset=utf-8",
	)

	w.WriteHeader(status)

	_ = json.NewEncoder(w).Encode(payload)
}

func writeAuditorJSONError(
	w http.ResponseWriter,
	status int,
	code string,
	message string,
) {
	writeAuditorJSON(
		w,
		status,
		map[string]any{
			"error": map[string]string{
				"code":    code,
				"message": message,
			},
		},
	)
}
func (h *AuditorHandler) createAudit(
	w http.ResponseWriter,
	r *http.Request,
) {
	principal, ok := rbac.FromContext(r.Context())

	if !ok ||
		principal.UserID == "" ||
		principal.OrganisationID == "" {
		writeAuditorJSONError(
			w,
			http.StatusUnauthorized,
			"unauthorized",
			"authentication and organisation context are required",
		)
		return
	}

	if h == nil || h.Service == nil {
		writeAuditorJSONError(
			w,
			http.StatusInternalServerError,
			"auditor_not_configured",
			"auditor service is not configured",
		)
		return
	}

	var request auditor.CreateAuditRequest

	decoder := json.NewDecoder(r.Body)

	if err := decoder.Decode(&request); err != nil {
		writeAuditorJSONError(
			w,
			http.StatusBadRequest,
			"invalid_request",
			"invalid JSON request body",
		)
		return
	}

	response, err := h.Service.CreateAudit(
		r.Context(),
		principal.OrganisationID,
		request,
	)

	if err != nil {
		h.logError(
			"auditor create failed",
			principal.UserID,
			principal.OrganisationID,
			"",
			err,
		)

		writeAuditorJSONError(
			w,
			http.StatusBadRequest,
			"auditor_create_error",
			err.Error(),
		)
		return
	}

	writeAuditorJSON(
		w,
		http.StatusCreated,
		response,
	)
}

func (h *AuditorHandler) Frameworks(
	w http.ResponseWriter,
	r *http.Request,
) {
	if r.Method != http.MethodGet {
		writeAuditorJSONError(
			w,
			http.StatusMethodNotAllowed,
			"method_not_allowed",
			"GET required",
		)
		return
	}

	principal, ok := rbac.FromContext(r.Context())
	if !ok || principal.UserID == "" || principal.OrganisationID == "" {
		writeAuditorJSONError(w, http.StatusUnauthorized, "unauthorized", "authentication and organisation context are required")
		return
	}

	organisationID := principal.OrganisationID

	response, err := h.Service.ListFrameworkOptions(
		r.Context(),
		organisationID,
	)
	if err != nil {
		writeAuditorJSONError(
			w,
			http.StatusBadRequest,
			"lookup_failed",
			err.Error(),
		)
		return
	}

	writeAuditorJSON(w, http.StatusOK, response)
}

func (h *AuditorHandler) Premises(
	w http.ResponseWriter,
	r *http.Request,
) {
	if r.Method != http.MethodGet {
		writeAuditorJSONError(
			w,
			http.StatusMethodNotAllowed,
			"method_not_allowed",
			"GET required",
		)
		return
	}

	principal, ok := rbac.FromContext(r.Context())
	if !ok || principal.UserID == "" || principal.OrganisationID == "" {
		writeAuditorJSONError(w, http.StatusUnauthorized, "unauthorized", "authentication and organisation context are required")
		return
	}

	organisationID := principal.OrganisationID

	response, err := h.Service.ListPremiseOptions(
		r.Context(),
		organisationID,
	)
	if err != nil {
		writeAuditorJSONError(
			w,
			http.StatusBadRequest,
			"lookup_failed",
			err.Error(),
		)
		return
	}

	writeAuditorJSON(w, http.StatusOK, response)
}

func (h *AuditorHandler) Assessors(
	w http.ResponseWriter,
	r *http.Request,
) {
	if r.Method != http.MethodGet {
		writeAuditorJSONError(
			w,
			http.StatusMethodNotAllowed,
			"method_not_allowed",
			"GET required",
		)
		return
	}

	principal, ok := rbac.FromContext(r.Context())
	if !ok || principal.UserID == "" || principal.OrganisationID == "" {
		writeAuditorJSONError(w, http.StatusUnauthorized, "unauthorized", "authentication and organisation context are required")
		return
	}

	organisationID := principal.OrganisationID

	response, err := h.Service.ListAssessorOptions(
		r.Context(),
		organisationID,
	)
	if err != nil {
		writeAuditorJSONError(
			w,
			http.StatusBadRequest,
			"lookup_failed",
			err.Error(),
		)
		return
	}

	writeAuditorJSON(w, http.StatusOK, response)
}
