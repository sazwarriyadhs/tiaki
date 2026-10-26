package handlers

import (
	"encoding/json"
	"errors"
	"net/http"
	"strconv"
	"strings"

	"github.com/tiaki-platform/tiaki-api/internal/equipment"
	"github.com/tiaki-platform/tiaki-api/internal/rbac"
)

type EquipmentHandler struct {
	Service *equipment.Service
}

func NewEquipmentHandler(service *equipment.Service) *EquipmentHandler {
	return &EquipmentHandler{
		Service: service,
	}
}

func (h *EquipmentHandler) Overview(
	w http.ResponseWriter,
	r *http.Request,
) {
	if r.Method != http.MethodGet {
		writeEquipmentJSONError(
			w,
			http.StatusMethodNotAllowed,
			"method_not_allowed",
			"GET required",
		)
		return
	}

	principal, ok := equipmentPrincipal(r)
	if !ok {
		writeEquipmentJSONError(
			w,
			http.StatusUnauthorized,
			"unauthorized",
			"authentication and organisation context are required",
		)
		return
	}

	if h == nil || h.Service == nil {
		writeEquipmentJSONError(
			w,
			http.StatusInternalServerError,
			"equipment_not_configured",
			"equipment service is not configured",
		)
		return
	}

	response, err := h.Service.GetOverview(
		r.Context(),
		principal.OrganisationID,
	)
	if err != nil {
		writeEquipmentJSONError(
			w,
			http.StatusInternalServerError,
			"equipment_overview_error",
			err.Error(),
		)
		return
	}

	writeEquipmentJSON(w, http.StatusOK, response)
}

func (h *EquipmentHandler) List(
	w http.ResponseWriter,
	r *http.Request,
) {
	if r.Method != http.MethodGet {
		writeEquipmentJSONError(
			w,
			http.StatusMethodNotAllowed,
			"method_not_allowed",
			"GET required",
		)
		return
	}

	principal, ok := equipmentPrincipal(r)
	if !ok {
		writeEquipmentJSONError(
			w,
			http.StatusUnauthorized,
			"unauthorized",
			"authentication and organisation context are required",
		)
		return
	}

	if h == nil || h.Service == nil {
		writeEquipmentJSONError(
			w,
			http.StatusInternalServerError,
			"equipment_not_configured",
			"equipment service is not configured",
		)
		return
	}

	response, err := h.Service.ListEquipment(
		r.Context(),
		principal.OrganisationID,
	)
	if err != nil {
		writeEquipmentJSONError(
			w,
			http.StatusInternalServerError,
			"equipment_list_error",
			err.Error(),
		)
		return
	}

	writeEquipmentJSON(w, http.StatusOK, response)
}

func (h *EquipmentHandler) Get(
	w http.ResponseWriter,
	r *http.Request,
) {
	if r.Method != http.MethodGet {
		writeEquipmentJSONError(
			w,
			http.StatusMethodNotAllowed,
			"method_not_allowed",
			"GET required",
		)
		return
	}

	principal, ok := equipmentPrincipal(r)
	if !ok {
		writeEquipmentJSONError(
			w,
			http.StatusUnauthorized,
			"unauthorized",
			"authentication and organisation context are required",
		)
		return
	}

	if h == nil || h.Service == nil {
		writeEquipmentJSONError(
			w,
			http.StatusInternalServerError,
			"equipment_not_configured",
			"equipment service is not configured",
		)
		return
	}

	equipmentID := equipmentPathID(
		r,
		"/api/v1/equipment/",
	)

	if equipmentID == "" {
		writeEquipmentJSONError(
			w,
			http.StatusBadRequest,
			"invalid_equipment_id",
			"equipment id is required",
		)
		return
	}

	response, err := h.Service.GetEquipment(
		r.Context(),
		principal.OrganisationID,
		equipmentID,
	)
	if err != nil {
		writeEquipmentJSONError(
			w,
			http.StatusNotFound,
			"equipment_not_found",
			"equipment record was not found for this organisation",
		)
		return
	}

	writeEquipmentJSON(
		w,
		http.StatusOK,
		map[string]any{
			"data": response,
			"meta": map[string]any{
				"status": "ok",
			},
		},
	)
}

func (h *EquipmentHandler) Devices(
	w http.ResponseWriter,
	r *http.Request,
) {
	if r.Method != http.MethodGet {
		writeEquipmentJSONError(
			w,
			http.StatusMethodNotAllowed,
			"method_not_allowed",
			"GET required",
		)
		return
	}

	principal, ok := equipmentPrincipal(r)
	if !ok {
		writeEquipmentJSONError(
			w,
			http.StatusUnauthorized,
			"unauthorized",
			"authentication and organisation context are required",
		)
		return
	}

	if h == nil || h.Service == nil {
		writeEquipmentJSONError(
			w,
			http.StatusInternalServerError,
			"equipment_not_configured",
			"equipment service is not configured",
		)
		return
	}

	response, err := h.Service.ListDevices(
		r.Context(),
		principal.OrganisationID,
	)
	if err != nil {
		writeEquipmentJSONError(
			w,
			http.StatusInternalServerError,
			"equipment_devices_error",
			err.Error(),
		)
		return
	}

	writeEquipmentJSON(w, http.StatusOK, response)
}

func (h *EquipmentHandler) Sensors(
	w http.ResponseWriter,
	r *http.Request,
) {
	if r.Method != http.MethodGet {
		writeEquipmentJSONError(
			w,
			http.StatusMethodNotAllowed,
			"method_not_allowed",
			"GET required",
		)
		return
	}

	principal, ok := equipmentPrincipal(r)
	if !ok {
		writeEquipmentJSONError(
			w,
			http.StatusUnauthorized,
			"unauthorized",
			"authentication and organisation context are required",
		)
		return
	}

	if h == nil || h.Service == nil {
		writeEquipmentJSONError(
			w,
			http.StatusInternalServerError,
			"equipment_not_configured",
			"equipment service is not configured",
		)
		return
	}

	response, err := h.Service.ListSensors(
		r.Context(),
		principal.OrganisationID,
	)
	if err != nil {
		writeEquipmentJSONError(
			w,
			http.StatusInternalServerError,
			"equipment_sensors_error",
			err.Error(),
		)
		return
	}

	writeEquipmentJSON(w, http.StatusOK, response)
}

func (h *EquipmentHandler) Readings(
	w http.ResponseWriter,
	r *http.Request,
) {
	if r.Method != http.MethodGet {
		writeEquipmentJSONError(
			w,
			http.StatusMethodNotAllowed,
			"method_not_allowed",
			"GET required",
		)
		return
	}

	principal, ok := equipmentPrincipal(r)
	if !ok {
		writeEquipmentJSONError(
			w,
			http.StatusUnauthorized,
			"unauthorized",
			"authentication and organisation context are required",
		)
		return
	}

	if h == nil || h.Service == nil {
		writeEquipmentJSONError(
			w,
			http.StatusInternalServerError,
			"equipment_not_configured",
			"equipment service is not configured",
		)
		return
	}

	sensorID := equipmentPathID(
		r,
		"/api/v1/equipment/sensors/",
	)

	if sensorID == "" {
		writeEquipmentJSONError(
			w,
			http.StatusBadRequest,
			"invalid_sensor_id",
			"sensor id is required",
		)
		return
	}

	limit := 100

	if value := r.URL.Query().Get("limit"); value != "" {
		parsed, err := strconv.Atoi(value)

		if err != nil || parsed <= 0 {
			writeEquipmentJSONError(
				w,
				http.StatusBadRequest,
				"invalid_limit",
				"limit must be a positive integer",
			)
			return
		}

		limit = parsed
	}

	if limit > 500 {
		limit = 500
	}

	response, err := h.Service.ListReadings(
		r.Context(),
		principal.OrganisationID,
		sensorID,
		limit,
	)
	if err != nil {
		writeEquipmentJSONError(
			w,
			http.StatusInternalServerError,
			"equipment_readings_error",
			err.Error(),
		)
		return
	}

	writeEquipmentJSON(
		w,
		http.StatusOK,
		map[string]any{
			"data": response,
			"meta": map[string]any{
				"status": "ok",
				"count":  len(response.Items),
			},
		},
	)
}

func (h *EquipmentHandler) Excursions(
	w http.ResponseWriter,
	r *http.Request,
) {
	if r.Method != http.MethodGet {
		writeEquipmentJSONError(
			w,
			http.StatusMethodNotAllowed,
			"method_not_allowed",
			"GET required",
		)
		return
	}

	principal, ok := equipmentPrincipal(r)
	if !ok {
		writeEquipmentJSONError(
			w,
			http.StatusUnauthorized,
			"unauthorized",
			"authentication and organisation context are required",
		)
		return
	}

	if h == nil || h.Service == nil {
		writeEquipmentJSONError(
			w,
			http.StatusInternalServerError,
			"equipment_not_configured",
			"equipment service is not configured",
		)
		return
	}

	response, err := h.Service.ListExcursions(
		r.Context(),
		principal.OrganisationID,
	)
	if err != nil {
		writeEquipmentJSONError(
			w,
			http.StatusInternalServerError,
			"equipment_excursions_error",
			err.Error(),
		)
		return
	}

	writeEquipmentJSON(w, http.StatusOK, response)
}

func (h *EquipmentHandler) Thresholds(
	w http.ResponseWriter,
	r *http.Request,
) {
	if r.Method != http.MethodGet {
		writeEquipmentJSONError(
			w,
			http.StatusMethodNotAllowed,
			"method_not_allowed",
			"GET required",
		)
		return
	}

	principal, ok := equipmentPrincipal(r)
	if !ok {
		writeEquipmentJSONError(
			w,
			http.StatusUnauthorized,
			"unauthorized",
			"authentication and organisation context are required",
		)
		return
	}

	if h == nil || h.Service == nil {
		writeEquipmentJSONError(
			w,
			http.StatusInternalServerError,
			"equipment_not_configured",
			"equipment service is not configured",
		)
		return
	}

	response, err := h.Service.ListThresholds(
		r.Context(),
		principal.OrganisationID,
	)
	if err != nil {
		writeEquipmentJSONError(
			w,
			http.StatusInternalServerError,
			"equipment_thresholds_error",
			err.Error(),
		)
		return
	}

	writeEquipmentJSON(w, http.StatusOK, response)
}

func (h *EquipmentHandler) Calibrations(
	w http.ResponseWriter,
	r *http.Request,
) {
	if r.Method != http.MethodGet {
		writeEquipmentJSONError(
			w,
			http.StatusMethodNotAllowed,
			"method_not_allowed",
			"GET required",
		)
		return
	}

	principal, ok := equipmentPrincipal(r)
	if !ok {
		writeEquipmentJSONError(
			w,
			http.StatusUnauthorized,
			"unauthorized",
			"authentication and organisation context are required",
		)
		return
	}

	if h == nil || h.Service == nil {
		writeEquipmentJSONError(
			w,
			http.StatusInternalServerError,
			"equipment_not_configured",
			"equipment service is not configured",
		)
		return
	}

	response, err := h.Service.ListCalibrations(
		r.Context(),
		principal.OrganisationID,
	)
	if err != nil {
		writeEquipmentJSONError(
			w,
			http.StatusInternalServerError,
			"equipment_calibrations_error",
			err.Error(),
		)
		return
	}

	writeEquipmentJSON(w, http.StatusOK, response)
}

func equipmentPrincipal(r *http.Request) (rbac.Principal, bool) {
	if r == nil {
		return rbac.Principal{}, false
	}

	principal, ok := rbac.FromContext(r.Context())

	if !ok ||
		principal.UserID == "" ||
		principal.OrganisationID == "" {
		return rbac.Principal{}, false
	}

	return principal, true
}

func equipmentPathID(
	r *http.Request,
	prefix string,
) string {
	if r == nil {
		return ""
	}

	path := strings.TrimPrefix(
		r.URL.Path,
		prefix,
	)

	return strings.Trim(path, "/")
}

func writeEquipmentJSON(
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

func writeEquipmentJSONError(
	w http.ResponseWriter,
	status int,
	code string,
	message string,
) {
	writeEquipmentJSON(
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

var _ = errors.New
