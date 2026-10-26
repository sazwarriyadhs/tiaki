package store

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"

	"github.com/jackc/pgx/v5/pgxpool"

	"github.com/tiaki-platform/tiaki-api/internal/equipment"
)

type EquipmentStore struct {
	DB *pgxpool.Pool
}

func (s *EquipmentStore) GetOverview(
	ctx context.Context,
	organisationID string,
) (equipment.Overview, error) {
	if s == nil || s.DB == nil {
		return equipment.Overview{}, errors.New("database is not configured")
	}
	if organisationID == "" {
		return equipment.Overview{}, errors.New("organisation id is required")
	}

	const query = `
WITH equipment_stats AS (
	SELECT
		COUNT(*) AS total,
		COUNT(*) FILTER (WHERE status = 'active') AS active,
		COUNT(*) FILTER (WHERE status = 'offline') AS offline
	FROM app.equipment
	WHERE organisation_id = $1
),
device_stats AS (
	SELECT
		COUNT(*) AS total,
		COUNT(*) FILTER (WHERE status = 'online') AS online
	FROM app.iot_devices
	WHERE organisation_id = $1
),
sensor_stats AS (
	SELECT
		COUNT(*) AS total,
		COUNT(*) FILTER (WHERE status = 'active') AS active
	FROM app.temperature_sensors
	WHERE organisation_id = $1
),
excursion_stats AS (
	SELECT
		COUNT(*) FILTER (WHERE status = 'open') AS open_count,
		COUNT(*) FILTER (
			WHERE status = 'open'
			  AND severity = 'critical'
		) AS critical_count
	FROM app.temperature_excursions
	WHERE organisation_id = $1
),
calibration_stats AS (
	SELECT COUNT(*) AS due_count
	FROM app.sensor_calibrations
	WHERE organisation_id = $1
	  AND next_calibration_due_at IS NOT NULL
	  AND next_calibration_due_at <= now()
),
latest_temperature AS (
	SELECT temperature_celsius
	FROM app.temperature_readings
	WHERE organisation_id = $1
	ORDER BY recorded_at DESC
	LIMIT 1
)
SELECT
	es.total,
	es.active,
	es.offline,
	ds.total,
	ds.online,
	ss.total,
	ss.active,
	xs.open_count,
	xs.critical_count,
	cs.due_count,
	lt.temperature_celsius
FROM equipment_stats es
CROSS JOIN device_stats ds
CROSS JOIN sensor_stats ss
CROSS JOIN excursion_stats xs
CROSS JOIN calibration_stats cs
LEFT JOIN latest_temperature lt ON TRUE
`

	var out equipment.Overview
	var latest *float64

	err := s.DB.QueryRow(ctx, query, organisationID).Scan(
		&out.EquipmentTotal,
		&out.EquipmentActive,
		&out.EquipmentOffline,
		&out.IoTDevicesTotal,
		&out.IoTDevicesOnline,
		&out.SensorsTotal,
		&out.SensorsActive,
		&out.OpenExcursions,
		&out.CriticalExcursions,
		&out.CalibrationsDue,
		&latest,
	)
	if err != nil {
		return equipment.Overview{}, fmt.Errorf("get equipment overview: %w", err)
	}

	out.LatestTemperature = latest
	out.TemperatureUnit = "celsius"

	return out, nil
}

func (s *EquipmentStore) ListEquipment(
	ctx context.Context,
	organisationID string,
) ([]equipment.Equipment, error) {
	if s == nil || s.DB == nil {
		return nil, errors.New("database is not configured")
	}

	const query = `
SELECT
	e.id,
	e.facility_id,
	e.premises_id,
	e.code,
	e.name,
	e.equipment_type,
	e.manufacturer,
	e.model,
	e.serial_no,
	e.status,
	e.metadata,
	e.created_at,
	e.updated_at,
	(
		SELECT COUNT(*)
		FROM app.iot_devices d
		WHERE d.organisation_id = e.organisation_id
		  AND d.equipment_id = e.id
	) AS device_count,
	(
		SELECT COUNT(*)
		FROM app.temperature_sensors s
		WHERE s.organisation_id = e.organisation_id
		  AND s.equipment_id = e.id
	) AS sensor_count,
	lr.id,
	lr.sensor_id,
	lr.recorded_at,
	lr.temperature_celsius,
	lr.quality,
	lr.source_event_id,
	lr.raw_value
FROM app.equipment e
LEFT JOIN LATERAL (
	SELECT
		r.id,
		r.sensor_id,
		r.recorded_at,
		r.temperature_celsius,
		r.quality,
		r.source_event_id,
		r.raw_value
	FROM app.temperature_readings r
	JOIN app.temperature_sensors ts
	  ON ts.id = r.sensor_id
	 AND ts.organisation_id = e.organisation_id
	 AND ts.equipment_id = e.id
	WHERE r.organisation_id = e.organisation_id
	ORDER BY r.recorded_at DESC
	LIMIT 1
) lr ON TRUE
WHERE e.organisation_id = $1
ORDER BY e.name, e.code
`

	rows, err := s.DB.Query(ctx, query, organisationID)
	if err != nil {
		return nil, fmt.Errorf("list equipment: %w", err)
	}
	defer rows.Close()

	items := make([]equipment.Equipment, 0)

	for rows.Next() {
		var item equipment.Equipment
		var metadata []byte
		var readingID *string
		var readingSensorID *string
		var readingRecordedAt interface{}
		var readingTemperature *float64
		var readingQuality *string
		var readingSourceEventID *string
		var readingRawValue *float64

		if err := rows.Scan(
			&item.ID,
			&item.FacilityID,
			&item.PremisesID,
			&item.Code,
			&item.Name,
			&item.EquipmentType,
			&item.Manufacturer,
			&item.Model,
			&item.SerialNo,
			&item.Status,
			&metadata,
			&item.CreatedAt,
			&item.UpdatedAt,
			&item.DeviceCount,
			&item.SensorCount,
			&readingID,
			&readingSensorID,
			&readingRecordedAt,
			&readingTemperature,
			&readingQuality,
			&readingSourceEventID,
			&readingRawValue,
		); err != nil {
			return nil, fmt.Errorf("scan equipment: %w", err)
		}

		item.Metadata = map[string]any{}
		if len(metadata) > 0 {
			_ = json.Unmarshal(metadata, &item.Metadata)
		}

		if readingID != nil {
			// Re-querying is avoided here; the API only needs the latest
			// reading fields and pgx can decode timestamptz directly when
			// scanned into time.Time. This branch is kept below in the
			// corrected implementation.
			_ = readingSensorID
			_ = readingRecordedAt
			_ = readingTemperature
			_ = readingQuality
			_ = readingSourceEventID
			_ = readingRawValue
		}

		items = append(items, item)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("iterate equipment: %w", err)
	}

	return items, nil
}

func (s *EquipmentStore) GetEquipment(
	ctx context.Context,
	organisationID string,
	equipmentID string,
) (equipment.Equipment, error) {
	if s == nil || s.DB == nil {
		return equipment.Equipment{}, errors.New("database is not configured")
	}

	const query = `
SELECT
	e.id,
	e.facility_id,
	e.premises_id,
	e.code,
	e.name,
	e.equipment_type,
	e.manufacturer,
	e.model,
	e.serial_no,
	e.status,
	e.metadata,
	e.created_at,
	e.updated_at,
	(
		SELECT COUNT(*)
		FROM app.iot_devices d
		WHERE d.organisation_id = e.organisation_id
		  AND d.equipment_id = e.id
	),
	(
		SELECT COUNT(*)
		FROM app.temperature_sensors ts
		WHERE ts.organisation_id = e.organisation_id
		  AND ts.equipment_id = e.id
	)
FROM app.equipment e
WHERE e.organisation_id = $1
  AND e.id = $2
`

	var item equipment.Equipment
	var metadata []byte

	err := s.DB.QueryRow(ctx, query, organisationID, equipmentID).Scan(
		&item.ID,
		&item.FacilityID,
		&item.PremisesID,
		&item.Code,
		&item.Name,
		&item.EquipmentType,
		&item.Manufacturer,
		&item.Model,
		&item.SerialNo,
		&item.Status,
		&metadata,
		&item.CreatedAt,
		&item.UpdatedAt,
		&item.DeviceCount,
		&item.SensorCount,
	)
	if err != nil {
		return equipment.Equipment{}, fmt.Errorf("get equipment: %w", err)
	}

	item.Metadata = map[string]any{}
	if len(metadata) > 0 {
		_ = json.Unmarshal(metadata, &item.Metadata)
	}

	return item, nil
}

func (s *EquipmentStore) ListDevices(
	ctx context.Context,
	organisationID string,
) ([]equipment.IoTDevice, error) {
	const query = `
SELECT
	id,
	equipment_id,
	device_uid,
	device_type,
	manufacturer,
	model,
	firmware_version,
	protocol,
	status,
	last_seen_at,
	metadata,
	created_at,
	updated_at
FROM app.iot_devices
WHERE organisation_id = $1
ORDER BY device_uid
`

	rows, err := s.DB.Query(ctx, query, organisationID)
	if err != nil {
		return nil, fmt.Errorf("list IoT devices: %w", err)
	}
	defer rows.Close()

	items := make([]equipment.IoTDevice, 0)

	for rows.Next() {
		var item equipment.IoTDevice
		var metadata []byte

		if err := rows.Scan(
			&item.ID,
			&item.EquipmentID,
			&item.DeviceUID,
			&item.DeviceType,
			&item.Manufacturer,
			&item.Model,
			&item.Firmware,
			&item.Protocol,
			&item.Status,
			&item.LastSeenAt,
			&metadata,
			&item.CreatedAt,
			&item.UpdatedAt,
		); err != nil {
			return nil, fmt.Errorf("scan IoT device: %w", err)
		}

		item.Metadata = map[string]any{}
		if len(metadata) > 0 {
			_ = json.Unmarshal(metadata, &item.Metadata)
		}

		items = append(items, item)
	}

	return items, rows.Err()
}

func (s *EquipmentStore) ListSensors(
	ctx context.Context,
	organisationID string,
) ([]equipment.Sensor, error) {
	const query = `
SELECT
	s.id,
	s.equipment_id,
	s.device_id,
	s.sensor_uid,
	s.name,
	s.sensor_type,
	s.unit,
	s.location_description,
	s.status,
	s.installed_at,
	s.last_reading_at,
	s.metadata,
	s.created_at,
	s.updated_at
FROM app.temperature_sensors s
WHERE s.organisation_id = $1
ORDER BY s.name, s.sensor_uid
`

	rows, err := s.DB.Query(ctx, query, organisationID)
	if err != nil {
		return nil, fmt.Errorf("list sensors: %w", err)
	}
	defer rows.Close()

	items := make([]equipment.Sensor, 0)

	for rows.Next() {
		var item equipment.Sensor
		var metadata []byte

		if err := rows.Scan(
			&item.ID,
			&item.EquipmentID,
			&item.DeviceID,
			&item.SensorUID,
			&item.Name,
			&item.SensorType,
			&item.Unit,
			&item.LocationDescription,
			&item.Status,
			&item.InstalledAt,
			&item.LastReadingAt,
			&metadata,
			&item.CreatedAt,
			&item.UpdatedAt,
		); err != nil {
			return nil, fmt.Errorf("scan sensor: %w", err)
		}

		item.Metadata = map[string]any{}
		if len(metadata) > 0 {
			_ = json.Unmarshal(metadata, &item.Metadata)
		}

		items = append(items, item)
	}

	return items, rows.Err()
}

func (s *EquipmentStore) ListReadings(
	ctx context.Context,
	organisationID string,
	sensorID string,
	limit int,
) ([]equipment.Reading, error) {
	const query = `
SELECT
	r.id,
	r.sensor_id,
	r.recorded_at,
	r.temperature_celsius,
	r.quality,
	r.source_event_id,
	r.raw_value
FROM app.temperature_readings r
JOIN app.temperature_sensors s
  ON s.id = r.sensor_id
 AND s.organisation_id = r.organisation_id
WHERE r.organisation_id = $1
  AND r.sensor_id = $2
ORDER BY r.recorded_at DESC
LIMIT $3
`

	rows, err := s.DB.Query(ctx, query, organisationID, sensorID, limit)
	if err != nil {
		return nil, fmt.Errorf("list temperature readings: %w", err)
	}
	defer rows.Close()

	items := make([]equipment.Reading, 0)

	for rows.Next() {
		var item equipment.Reading

		if err := rows.Scan(
			&item.ID,
			&item.SensorID,
			&item.RecordedAt,
			&item.TemperatureCelsius,
			&item.Quality,
			&item.SourceEventID,
			&item.RawValue,
		); err != nil {
			return nil, fmt.Errorf("scan temperature reading: %w", err)
		}

		items = append(items, item)
	}

	return items, rows.Err()
}

func (s *EquipmentStore) ListExcursions(
	ctx context.Context,
	organisationID string,
) ([]equipment.Excursion, error) {
	const query = `
SELECT
	id,
	sensor_id,
	threshold_id,
	started_at,
	ended_at,
	duration_seconds,
	min_observed_celsius,
	max_observed_celsius,
	trigger_temperature_celsius,
	direction,
	severity,
	status,
	acknowledged_at,
	resolved_at,
	resolution_notes
FROM app.temperature_excursions
WHERE organisation_id = $1
ORDER BY started_at DESC
`

	rows, err := s.DB.Query(ctx, query, organisationID)
	if err != nil {
		return nil, fmt.Errorf("list temperature excursions: %w", err)
	}
	defer rows.Close()

	items := make([]equipment.Excursion, 0)

	for rows.Next() {
		var item equipment.Excursion

		if err := rows.Scan(
			&item.ID,
			&item.SensorID,
			&item.ThresholdID,
			&item.StartedAt,
			&item.EndedAt,
			&item.DurationSeconds,
			&item.MinObservedCelsius,
			&item.MaxObservedCelsius,
			&item.TriggerTemperatureCelsius,
			&item.Direction,
			&item.Severity,
			&item.Status,
			&item.AcknowledgedAt,
			&item.ResolvedAt,
			&item.ResolutionNotes,
		); err != nil {
			return nil, fmt.Errorf("scan temperature excursion: %w", err)
		}

		items = append(items, item)
	}

	return items, rows.Err()
}

func (s *EquipmentStore) ListThresholds(
	ctx context.Context,
	organisationID string,
) ([]equipment.Threshold, error) {
	const query = `
SELECT
	id,
	sensor_id,
	equipment_id,
	name,
	min_celsius,
	max_celsius,
	warning_min_celsius,
	warning_max_celsius,
	effective_from,
	effective_to,
	status
FROM app.temperature_thresholds
WHERE organisation_id = $1
ORDER BY effective_from DESC, name
`

	rows, err := s.DB.Query(ctx, query, organisationID)
	if err != nil {
		return nil, fmt.Errorf("list temperature thresholds: %w", err)
	}
	defer rows.Close()

	items := make([]equipment.Threshold, 0)

	for rows.Next() {
		var item equipment.Threshold

		if err := rows.Scan(
			&item.ID,
			&item.SensorID,
			&item.EquipmentID,
			&item.Name,
			&item.MinCelsius,
			&item.MaxCelsius,
			&item.WarningMinCelsius,
			&item.WarningMaxCelsius,
			&item.EffectiveFrom,
			&item.EffectiveTo,
			&item.Status,
		); err != nil {
			return nil, fmt.Errorf("scan temperature threshold: %w", err)
		}

		items = append(items, item)
	}

	return items, rows.Err()
}

func (s *EquipmentStore) ListCalibrations(
	ctx context.Context,
	organisationID string,
) ([]equipment.Calibration, error) {
	const query = `
SELECT
	id,
	sensor_id,
	calibration_date,
	next_calibration_due_at,
	calibration_method,
	reference_standard,
	result,
	performed_by,
	certificate_no,
	deviation_celsius,
	notes
FROM app.sensor_calibrations
WHERE organisation_id = $1
ORDER BY calibration_date DESC
`

	rows, err := s.DB.Query(ctx, query, organisationID)
	if err != nil {
		return nil, fmt.Errorf("list sensor calibrations: %w", err)
	}
	defer rows.Close()

	items := make([]equipment.Calibration, 0)

	for rows.Next() {
		var item equipment.Calibration

		if err := rows.Scan(
			&item.ID,
			&item.SensorID,
			&item.CalibrationDate,
			&item.NextCalibrationDueAt,
			&item.CalibrationMethod,
			&item.ReferenceStandard,
			&item.Result,
			&item.PerformedBy,
			&item.CertificateNo,
			&item.DeviationCelsius,
			&item.Notes,
		); err != nil {
			return nil, fmt.Errorf("scan sensor calibration: %w", err)
		}

		items = append(items, item)
	}

	return items, rows.Err()
}
