package handlers

import (
	"encoding/json"
	"log"
	"net/http"

	"github.com/tiaki-platform/tiaki-api/internal/batches"
	"github.com/tiaki-platform/tiaki-api/internal/rbac"
)

type BatchesHandler struct {
	Service *batches.Service
	Logger  *log.Logger
}

func (h *BatchesHandler) List(
	w http.ResponseWriter,
	r *http.Request,
) {
	if r.Method != http.MethodGet {
		writeBatchesJSONError(
			w,
			http.StatusMethodNotAllowed,
			"method_not_allowed",
			"GET required",
		)
		return
	}

	principal, ok := rbac.FromContext(r.Context())

	if !ok {
		writeBatchesJSONError(
			w,
			http.StatusUnauthorized,
			"unauthorized",
			"authentication required",
		)
		return
	}

	if principal.UserID == "" ||
		principal.OrganisationID == "" {

		writeBatchesJSONError(
			w,
			http.StatusUnauthorized,
			"invalid_principal",
			"organisation context is required",
		)
		return
	}

	if h == nil || h.Service == nil {
		writeBatchesJSONError(
			w,
			http.StatusInternalServerError,
			"batches_not_configured",
			"batches service is not configured",
		)
		return
	}

	response, err := h.Service.List(
		r.Context(),
		principal.OrganisationID,
	)

	if err != nil {
		if h.Logger != nil {
			h.Logger.Printf(
				"batches list failed: user_id=%s organisation_id=%s error=%v",
				principal.UserID,
				principal.OrganisationID,
				err,
			)
		}

		writeBatchesJSONError(
			w,
			http.StatusInternalServerError,
			"batches_error",
			err.Error(),
		)
		return
	}

	writeBatchesJSON(
		w,
		http.StatusOK,
		response,
	)
}

func writeBatchesJSON(
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

func writeBatchesJSONError(
	w http.ResponseWriter,
	status int,
	code string,
	message string,
) {
	writeBatchesJSON(
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
