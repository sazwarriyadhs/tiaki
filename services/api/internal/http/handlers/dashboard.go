package handlers

import (
	"encoding/json"
	"log"
	"net/http"

	"github.com/tiaki-platform/tiaki-api/internal/dashboard"
	"github.com/tiaki-platform/tiaki-api/internal/rbac"
)

type DashboardHandler struct {
	Service *dashboard.Service
	Logger  *log.Logger
}

func (h *DashboardHandler) Summary(
	w http.ResponseWriter,
	r *http.Request,
) {
	if r.Method != http.MethodGet {
		writeDashboardJSONError(
			w,
			http.StatusMethodNotAllowed,
			"method_not_allowed",
			"GET required",
		)
		return
	}

	principal, ok := rbac.FromContext(r.Context())

	if !ok {
		writeDashboardJSONError(
			w,
			http.StatusUnauthorized,
			"unauthorized",
			"authentication required",
		)
		return
	}

	if principal.UserID == "" || principal.OrganisationID == "" {
		writeDashboardJSONError(
			w,
			http.StatusUnauthorized,
			"invalid_principal",
			"organisation context is required",
		)
		return
	}

	response, err := h.Service.GetSummary(
		r.Context(),
		principal.OrganisationID,
	)

	if err != nil {
		if h.Logger != nil {
			h.Logger.Printf(
				"dashboard summary failed: user_id=%s organisation_id=%s error=%v",
				principal.UserID,
				principal.OrganisationID,
				err,
			)
		}

		writeDashboardJSONError(
			w,
			http.StatusInternalServerError,
			"dashboard_error",
			err.Error(),
		)
		return
	}

	writeDashboardJSON(
		w,
		http.StatusOK,
		response,
	)
}

func writeDashboardJSON(
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

func writeDashboardJSONError(
	w http.ResponseWriter,
	status int,
	code string,
	message string,
) {
	writeDashboardJSON(
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
