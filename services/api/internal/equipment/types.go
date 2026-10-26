package equipment

import "time"

type Overview struct {
	EquipmentTotal     int64    `json:"equipmentTotal"`
	EquipmentActive    int64    `json:"equipmentActive"`
	EquipmentOffline   int64    `json:"equipmentOffline"`
	IoTDevicesTotal    int64    `json:"iotDevicesTotal"`
	IoTDevicesOnline   int64    `json:"iotDevicesOnline"`
	SensorsTotal       int64    `json:"sensorsTotal"`
	SensorsActive      int64    `json:"sensorsActive"`
	OpenExcursions     int64    `json:"openExcursions"`
	CriticalExcursions int64    `json:"criticalExcursions"`
	CalibrationsDue    int64    `json:"calibrationsDue"`
	LatestTemperature  *float64 `json:"latestTemperature,omitempty"`
	TemperatureUnit    string   `json:"temperatureUnit"`
}

type Equipment struct {
	ID            string         `json:"id"`
	FacilityID    string         `json:"facilityId"`
	PremisesID    *string        `json:"premisesId,omitempty"`
	Code          string         `json:"code"`
	Name          string         `json:"name"`
	EquipmentType string         `json:"equipmentType"`
	Manufacturer  *string        `json:"manufacturer,omitempty"`
	Model         *string        `json:"model,omitempty"`
	SerialNo      *string        `json:"serialNo,omitempty"`
	Status        string         `json:"status"`
	Metadata      map[string]any `json:"metadata"`
	CreatedAt     time.Time      `json:"createdAt"`
	UpdatedAt     time.Time      `json:"updatedAt"`
	DeviceCount   int64          `json:"deviceCount"`
	SensorCount   int64          `json:"sensorCount"`
	LatestReading *Reading       `json:"latestReading,omitempty"`
}

type IoTDevice struct {
	ID           string         `json:"id"`
	EquipmentID  *string        `json:"equipmentId,omitempty"`
	DeviceUID    string         `json:"deviceUid"`
	DeviceType   string         `json:"deviceType"`
	Manufacturer *string        `json:"manufacturer,omitempty"`
	Model        *string        `json:"model,omitempty"`
	Firmware     *string        `json:"firmwareVersion,omitempty"`
	Protocol     *string        `json:"protocol,omitempty"`
	Status       string         `json:"status"`
	LastSeenAt   *time.Time     `json:"lastSeenAt,omitempty"`
	Metadata     map[string]any `json:"metadata"`
	CreatedAt    time.Time      `json:"createdAt"`
	UpdatedAt    time.Time      `json:"updatedAt"`
}

type Sensor struct {
	ID                  string         `json:"id"`
	EquipmentID         *string        `json:"equipmentId,omitempty"`
	DeviceID            *string        `json:"deviceId,omitempty"`
	SensorUID           string         `json:"sensorUid"`
	Name                string         `json:"name"`
	SensorType          string         `json:"sensorType"`
	Unit                string         `json:"unit"`
	LocationDescription *string        `json:"locationDescription,omitempty"`
	Status              string         `json:"status"`
	InstalledAt         *time.Time     `json:"installedAt,omitempty"`
	LastReadingAt       *time.Time     `json:"lastReadingAt,omitempty"`
	Metadata            map[string]any `json:"metadata"`
	CreatedAt           time.Time      `json:"createdAt"`
	UpdatedAt           time.Time      `json:"updatedAt"`
	LatestReading       *Reading       `json:"latestReading,omitempty"`
}

type Reading struct {
	ID                 string    `json:"id"`
	SensorID           string    `json:"sensorId"`
	RecordedAt         time.Time `json:"recordedAt"`
	TemperatureCelsius float64   `json:"temperatureCelsius"`
	Quality            string    `json:"quality"`
	SourceEventID      *string   `json:"sourceEventId,omitempty"`
	RawValue           *float64  `json:"rawValue,omitempty"`
}

type Threshold struct {
	ID                string     `json:"id"`
	SensorID          *string    `json:"sensorId,omitempty"`
	EquipmentID       *string    `json:"equipmentId,omitempty"`
	Name              string     `json:"name"`
	MinCelsius        *float64   `json:"minCelsius,omitempty"`
	MaxCelsius        *float64   `json:"maxCelsius,omitempty"`
	WarningMinCelsius *float64   `json:"warningMinCelsius,omitempty"`
	WarningMaxCelsius *float64   `json:"warningMaxCelsius,omitempty"`
	EffectiveFrom     time.Time  `json:"effectiveFrom"`
	EffectiveTo       *time.Time `json:"effectiveTo,omitempty"`
	Status            string     `json:"status"`
}

type Excursion struct {
	ID                        string     `json:"id"`
	SensorID                  string     `json:"sensorId"`
	ThresholdID               *string    `json:"thresholdId,omitempty"`
	StartedAt                 time.Time  `json:"startedAt"`
	EndedAt                   *time.Time `json:"endedAt,omitempty"`
	DurationSeconds           *int64     `json:"durationSeconds,omitempty"`
	MinObservedCelsius        *float64   `json:"minObservedCelsius,omitempty"`
	MaxObservedCelsius        *float64   `json:"maxObservedCelsius,omitempty"`
	TriggerTemperatureCelsius *float64   `json:"triggerTemperatureCelsius,omitempty"`
	Direction                 *string    `json:"direction,omitempty"`
	Severity                  string     `json:"severity"`
	Status                    string     `json:"status"`
	AcknowledgedAt            *time.Time `json:"acknowledgedAt,omitempty"`
	ResolvedAt                *time.Time `json:"resolvedAt,omitempty"`
	ResolutionNotes           *string    `json:"resolutionNotes,omitempty"`
}

type Calibration struct {
	ID                   string     `json:"id"`
	SensorID             string     `json:"sensorId"`
	CalibrationDate      time.Time  `json:"calibrationDate"`
	NextCalibrationDueAt *time.Time `json:"nextCalibrationDueAt,omitempty"`
	CalibrationMethod    *string    `json:"calibrationMethod,omitempty"`
	ReferenceStandard    *string    `json:"referenceStandard,omitempty"`
	Result               string     `json:"result"`
	PerformedBy          *string    `json:"performedBy,omitempty"`
	CertificateNo        *string    `json:"certificateNo,omitempty"`
	DeviationCelsius     *float64   `json:"deviationCelsius,omitempty"`
	Notes                *string    `json:"notes,omitempty"`
}

type ReadingsResponse struct {
	SensorID string    `json:"sensorId"`
	Items    []Reading `json:"items"`
}

type ListResponse[T any] struct {
	Data []T  `json:"data"`
	Meta Meta `json:"meta"`
}

type OverviewResponse struct {
	Data Overview `json:"data"`
	Meta Meta     `json:"meta"`
}

type Meta struct {
	Status string `json:"status"`
	Count  int    `json:"count,omitempty"`
}
