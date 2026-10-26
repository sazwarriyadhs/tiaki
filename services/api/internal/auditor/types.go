package auditor

type Overview struct {
	Assessments        int64 `json:"assessments"`
	OpenFindings       int64 `json:"open_findings"`
	CriticalFindings   int64 `json:"critical_findings"`
	Evidence           int64 `json:"evidence"`
	Documents          int64 `json:"documents"`
	OpenCAPA           int64 `json:"open_capa"`
	PendingCAPAVerify  int64 `json:"pending_capa_verification"`
	ActiveCertificates int64 `json:"active_certificates"`
	Activity           int64 `json:"activity"`
	TraceabilityBreaks int64 `json:"traceability_breaks"`
	AIRiskAssessments  int64 `json:"ai_risk_assessments"`
}

type Response struct {
	Data Overview `json:"data"`
	Meta Meta     `json:"meta"`
}

type Meta struct {
	Status string `json:"status"`
}

type Audit struct {
	ID               string `json:"id"`
	OrganisationID   string `json:"organisation_id"`
	OrganisationName string `json:"organisation_name"`

	PremisesID   *string `json:"premises_id,omitempty"`
	PremisesName *string `json:"premises_name,omitempty"`

	FrameworkID      string  `json:"framework_id"`
	FrameworkCode    string  `json:"framework_code"`
	FrameworkName    string  `json:"framework_name"`
	FrameworkVersion *string `json:"framework_version,omitempty"`

	Status  string   `json:"status"`
	Score   *float64 `json:"score,omitempty"`
	Summary *string  `json:"summary,omitempty"`

	AssessorID   *string `json:"assessor_id,omitempty"`
	AssessorName *string `json:"assessor_name,omitempty"`

	AssessedAt  string `json:"assessed_at"`
	EvidenceIDs any    `json:"evidence_ids"`
}

type CreateAuditRequest struct {
	FrameworkID string   `json:"framework_id"`
	PremisesID  *string  `json:"premises_id,omitempty"`
	AssessorID  *string  `json:"assessor_id,omitempty"`
	AssessedAt  *string  `json:"assessed_at,omitempty"`
	Status      *string  `json:"status,omitempty"`
	Score       *float64 `json:"score,omitempty"`
	Summary     *string  `json:"summary,omitempty"`
	EvidenceIDs any      `json:"evidence_ids,omitempty"`
}

type AuditCreateResponse struct {
	Data Audit `json:"data"`
	Meta Meta  `json:"meta"`
}

type AuditListResponse struct {
	Data []Audit `json:"data"`
	Meta Meta    `json:"meta"`
}

type AuditDetailResponse struct {
	Data Audit `json:"data"`
	Meta Meta  `json:"meta"`
}

type FrameworkOption struct {
	ID           string  `json:"id"`
	Code         string  `json:"code"`
	Name         string  `json:"name"`
	Jurisdiction string  `json:"jurisdiction"`
	Version      *string `json:"version,omitempty"`
	Status       string  `json:"status"`
}

type PremisesOption struct {
	ID     string `json:"id"`
	Code   string `json:"code"`
	Name   string `json:"name"`
	Type   string `json:"type"`
	Status string `json:"status"`
}

type AssessorOption struct {
	ID          string  `json:"id"`
	DisplayName string  `json:"display_name"`
	Email       *string `json:"email,omitempty"`
}

type FrameworksResponse struct {
	Data []FrameworkOption `json:"data"`
	Meta Meta              `json:"meta"`
}

type PremisesResponse struct {
	Data []PremisesOption `json:"data"`
	Meta Meta             `json:"meta"`
}

type AssessorsResponse struct {
	Data []AssessorOption `json:"data"`
	Meta Meta             `json:"meta"`
}

type LookupItem struct {
	ID    string `json:"id"`
	Name  string `json:"name"`
	Code  string `json:"code,omitempty"`
	Email string `json:"email,omitempty"`
}

type LookupResponse struct {
	Data []LookupItem `json:"data"`
	Meta Meta         `json:"meta"`
}
