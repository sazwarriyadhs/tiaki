package store

import (
	"context"
	"encoding/json"
	"fmt"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"

	"github.com/tiaki-platform/tiaki-api/internal/auditor"
)

type AuditorStore struct {
	DB *pgxpool.Pool
}

func (s *AuditorStore) GetOverview(
	ctx context.Context,
	organisationID string,
) (auditor.Overview, error) {
	if s == nil || s.DB == nil {
		return auditor.Overview{}, fmt.Errorf(
			"auditor database is not configured",
		)
	}

	if organisationID == "" {
		return auditor.Overview{}, fmt.Errorf(
			"organisation_id is required",
		)
	}

	const query = `
SELECT
    (
        SELECT COUNT(*)
        FROM app.compliance_assessments
        WHERE organisation_id = $1
    ),
    (
        SELECT COUNT(*)
        FROM app.findings
        WHERE organisation_id = $1
        AND status NOT IN ('closed', 'verified')
    ),
    (
        SELECT COUNT(*)
        FROM app.findings
        WHERE organisation_id = $1
        AND status NOT IN ('closed', 'verified')
        AND severity = 'critical'
    ),
    (
        SELECT COUNT(*)
        FROM app.evidence
        WHERE organisation_id = $1
    ),
    (
        SELECT COUNT(*)
        FROM app.documents
        WHERE organisation_id = $1
    ),
    (
        SELECT COUNT(*)
        FROM app.corrective_actions
        WHERE organisation_id = $1
        AND status NOT IN ('closed', 'completed')
    ),
    (
        SELECT COUNT(*)
        FROM app.corrective_actions
        WHERE organisation_id = $1
        AND verification_status = 'pending'
    ),
    (
        SELECT COUNT(*)
        FROM app.certificates
        WHERE organisation_id = $1
        AND status = 'active'
    ),
    (
        SELECT COUNT(*)
        FROM audit.audit_logs
        WHERE organisation_id = $1
    ),
    (
        SELECT COUNT(*)
        FROM app.v_traceability_breaks
        WHERE organisation_id = $1
    ),
    (
        SELECT COUNT(*)
        FROM app.ai_assessments
        WHERE organisation_id = $1
    )
`

	var result auditor.Overview

	err := s.DB.QueryRow(
		ctx,
		query,
		organisationID,
	).Scan(
		&result.Assessments,
		&result.OpenFindings,
		&result.CriticalFindings,
		&result.Evidence,
		&result.Documents,
		&result.OpenCAPA,
		&result.PendingCAPAVerify,
		&result.ActiveCertificates,
		&result.Activity,
		&result.TraceabilityBreaks,
		&result.AIRiskAssessments,
	)

	if err != nil {
		return auditor.Overview{}, fmt.Errorf(
			"auditor overview query: %w",
			err,
		)
	}

	return result, nil
}

func (s *AuditorStore) ListAudits(
	ctx context.Context,
	organisationID string,
) ([]auditor.Audit, error) {
	if s == nil || s.DB == nil {
		return nil, fmt.Errorf("auditor database is not configured")
	}

	if organisationID == "" {
		return nil, fmt.Errorf("organisation_id is required")
	}

	const query = `
SELECT
    a.id,
    a.organisation_id,
    o.legal_name,
    a.premises_id,
    p.name,
    a.framework_id,
    f.code,
    f.name,
    f.version,
    a.status,
    a.score::double precision,
    a.summary,
    a.assessor_id,
    u.display_name,
    a.assessed_at,
    a.evidence_ids
FROM app.compliance_assessments a
JOIN app.organisations o
    ON o.id = a.organisation_id
JOIN app.compliance_frameworks f
    ON f.id = a.framework_id
LEFT JOIN app.premises p
    ON p.id = a.premises_id
LEFT JOIN app.users u
    ON u.id = a.assessor_id
WHERE a.organisation_id = $1
ORDER BY a.assessed_at DESC, a.id DESC
`

	rows, err := s.DB.Query(ctx, query, organisationID)
	if err != nil {
		return nil, fmt.Errorf("list audits query: %w", err)
	}
	defer rows.Close()

	audits := make([]auditor.Audit, 0)

	for rows.Next() {
		var (
			aud       auditor.Audit
			premises  *string
			version   *string
			score     *float64
			summary   *string
			assessor  *string
			assessorN *string
			assessed  time.Time
			evidence  []byte
		)

		if err := rows.Scan(
			&aud.ID,
			&aud.OrganisationID,
			&aud.OrganisationName,
			&aud.PremisesID,
			&premises,
			&aud.FrameworkID,
			&aud.FrameworkCode,
			&aud.FrameworkName,
			&version,
			&aud.Status,
			&score,
			&summary,
			&aud.AssessorID,
			&assessorN,
			&assessed,
			&evidence,
		); err != nil {
			return nil, fmt.Errorf("scan audit row: %w", err)
		}

		if aud.PremisesID != nil {
			aud.PremisesName = premises
		}

		aud.FrameworkVersion = version
		aud.Score = score
		aud.Summary = summary
		aud.AssessorName = assessorN
		aud.AssessedAt = assessed.Format(time.RFC3339)

		var evidenceValue any
		if len(evidence) > 0 {
			if err := json.Unmarshal(evidence, &evidenceValue); err != nil {
				return nil, fmt.Errorf("decode evidence_ids for audit %s: %w", aud.ID, err)
			}
		} else {
			evidenceValue = []any{}
		}
		aud.EvidenceIDs = evidenceValue

		_ = assessor

		audits = append(audits, aud)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("iterate audits: %w", err)
	}

	return audits, nil
}

func (s *AuditorStore) GetAudit(
	ctx context.Context,
	organisationID string,
	auditID string,
) (auditor.Audit, error) {
	if s == nil || s.DB == nil {
		return auditor.Audit{}, fmt.Errorf("auditor database is not configured")
	}

	if organisationID == "" {
		return auditor.Audit{}, fmt.Errorf("organisation_id is required")
	}

	if auditID == "" {
		return auditor.Audit{}, fmt.Errorf("audit_id is required")
	}

	const query = `
SELECT
    a.id,
    a.organisation_id,
    o.legal_name,
    a.premises_id,
    p.name,
    a.framework_id,
    f.code,
    f.name,
    f.version,
    a.status,
    a.score::double precision,
    a.summary,
    a.assessor_id,
    u.display_name,
    a.assessed_at,
    a.evidence_ids
FROM app.compliance_assessments a
JOIN app.organisations o
    ON o.id = a.organisation_id
JOIN app.compliance_frameworks f
    ON f.id = a.framework_id
LEFT JOIN app.premises p
    ON p.id = a.premises_id
LEFT JOIN app.users u
    ON u.id = a.assessor_id
WHERE a.id = $1
AND a.organisation_id = $2
`

	var (
		aud       auditor.Audit
		premises  *string
		version   *string
		score     *float64
		summary   *string
		assessorN *string
		assessed  time.Time
		evidence  []byte
	)

	err := s.DB.QueryRow(
		ctx,
		query,
		auditID,
		organisationID,
	).Scan(
		&aud.ID,
		&aud.OrganisationID,
		&aud.OrganisationName,
		&aud.PremisesID,
		&premises,
		&aud.FrameworkID,
		&aud.FrameworkCode,
		&aud.FrameworkName,
		&version,
		&aud.Status,
		&score,
		&summary,
		&aud.AssessorID,
		&assessorN,
		&assessed,
		&evidence,
	)

	if err != nil {
		if err == pgx.ErrNoRows {
			return auditor.Audit{}, pgx.ErrNoRows
		}

		return auditor.Audit{}, fmt.Errorf("get audit query: %w", err)
	}

	if aud.PremisesID != nil {
		aud.PremisesName = premises
	}

	aud.FrameworkVersion = version
	aud.Score = score
	aud.Summary = summary
	aud.AssessorName = assessorN
	aud.AssessedAt = assessed.Format(time.RFC3339)

	var evidenceValue any
	if len(evidence) > 0 {
		if err := json.Unmarshal(evidence, &evidenceValue); err != nil {
			return auditor.Audit{}, fmt.Errorf(
				"decode evidence_ids for audit %s: %w",
				aud.ID,
				err,
			)
		}
	} else {
		evidenceValue = []any{}
	}

	aud.EvidenceIDs = evidenceValue

	return aud, nil
}
func (s *AuditorStore) CreateAudit(
	ctx context.Context,
	organisationID string,
	request auditor.CreateAuditRequest,
) (auditor.Audit, error) {
	if s == nil || s.DB == nil {
		return auditor.Audit{}, fmt.Errorf("auditor database is not configured")
	}

	if organisationID == "" {
		return auditor.Audit{}, fmt.Errorf("organisation_id is required")
	}

	if request.FrameworkID == "" {
		return auditor.Audit{}, fmt.Errorf("framework_id is required")
	}

	var frameworkExists bool

	err := s.DB.QueryRow(
		ctx,
		`
SELECT EXISTS (
    SELECT 1
    FROM app.compliance_frameworks
    WHERE id = $1
      AND status = 'active'
)
`,
		request.FrameworkID,
	).Scan(&frameworkExists)

	if err != nil {
		return auditor.Audit{}, fmt.Errorf(
			"validate framework: %w",
			err,
		)
	}

	if !frameworkExists {
		return auditor.Audit{}, fmt.Errorf(
			"framework is not active or does not exist",
		)
	}

	// Validate premises ownership through:
	// premises -> facilities -> organisation.
	if request.PremisesID != nil && *request.PremisesID != "" {
		var premisesExists bool

		err := s.DB.QueryRow(
			ctx,
			`
SELECT EXISTS (
    SELECT 1
    FROM app.premises p
    JOIN app.facilities f
      ON f.id = p.facility_id
    WHERE p.id = $1
      AND f.organisation_id = $2
)
`,
			*request.PremisesID,
			organisationID,
		).Scan(&premisesExists)

		if err != nil {
			return auditor.Audit{}, fmt.Errorf(
				"validate premises: %w",
				err,
			)
		}

		if !premisesExists {
			return auditor.Audit{}, fmt.Errorf(
				"premises does not belong to organisation",
			)
		}
	}

	// Validate assessor when supplied.
	if request.AssessorID != nil && *request.AssessorID != "" {
		var assessorExists bool

		err := s.DB.QueryRow(
			ctx,
			`
SELECT EXISTS (
    SELECT 1
    FROM app.users
    WHERE id = $1
)
`,
			*request.AssessorID,
		).Scan(&assessorExists)

		if err != nil {
			return auditor.Audit{}, fmt.Errorf(
				"validate assessor: %w",
				err,
			)
		}

		if !assessorExists {
			return auditor.Audit{}, fmt.Errorf(
				"assessor does not exist",
			)
		}
	}

	evidenceJSON := []byte(`[]`)

	if request.EvidenceIDs != nil {
		data, err := json.Marshal(request.EvidenceIDs)
		if err != nil {
			return auditor.Audit{}, fmt.Errorf(
				"encode evidence_ids: %w",
				err,
			)
		}

		evidenceJSON = data
	}

	assessedAt := time.Now()

	if request.AssessedAt != nil && *request.AssessedAt != "" {
		parsed, err := time.Parse(time.RFC3339, *request.AssessedAt)
		if err != nil {
			return auditor.Audit{}, fmt.Errorf(
				"invalid assessed_at: %w",
				err,
			)
		}

		assessedAt = parsed
	}

	status := "open"

	if request.Status != nil && *request.Status != "" {
		status = *request.Status
	}

	var premisesID string

	if request.PremisesID != nil {
		premisesID = *request.PremisesID
	}

	var assessorID string

	if request.AssessorID != nil {
		assessorID = *request.AssessorID
	}

	const insertQuery = `
INSERT INTO app.compliance_assessments (
    organisation_id,
    premises_id,
    framework_id,
    assessed_at,
    status,
    score,
    summary,
    assessor_id,
    evidence_ids
)
VALUES (
    $1,
    NULLIF($2, '')::uuid,
    $3,
    $4,
    $5,
    $6,
    $7,
    NULLIF($8, '')::uuid,
    $9::jsonb
)
RETURNING id
`

	var auditID string

	err = s.DB.QueryRow(
		ctx,
		insertQuery,
		organisationID,
		premisesID,
		request.FrameworkID,
		assessedAt,
		status,
		request.Score,
		request.Summary,
		assessorID,
		evidenceJSON,
	).Scan(&auditID)

	if err != nil {
		return auditor.Audit{}, fmt.Errorf(
			"create audit insert: %w",
			err,
		)
	}

	return s.GetAudit(
		ctx,
		organisationID,
		auditID,
	)
}

func (s *AuditorStore) ListFrameworks(
	ctx context.Context,
) ([]auditor.FrameworkOption, error) {
	if s == nil || s.DB == nil {
		return nil, fmt.Errorf("auditor database is not configured")
	}

	const query = `
SELECT
    id,
    code,
    name,
    jurisdiction,
    version,
    status
FROM app.compliance_frameworks
WHERE status = 'active'
ORDER BY code
`

	rows, err := s.DB.Query(ctx, query)
	if err != nil {
		return nil, fmt.Errorf("list frameworks: %w", err)
	}
	defer rows.Close()

	result := make([]auditor.FrameworkOption, 0)

	for rows.Next() {
		var item auditor.FrameworkOption

		if err := rows.Scan(
			&item.ID,
			&item.Code,
			&item.Name,
			&item.Jurisdiction,
			&item.Version,
			&item.Status,
		); err != nil {
			return nil, fmt.Errorf("scan framework: %w", err)
		}

		result = append(result, item)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("iterate frameworks: %w", err)
	}

	return result, nil
}

func (s *AuditorStore) ListPremises(
	ctx context.Context,
	organisationID string,
) ([]auditor.PremisesOption, error) {
	if s == nil || s.DB == nil {
		return nil, fmt.Errorf("auditor database is not configured")
	}

	if organisationID == "" {
		return nil, fmt.Errorf("organisation_id is required")
	}

	const query = `
SELECT
    p.id,
    p.code,
    p.name,
    p.type,
    p.status
FROM app.premises p
JOIN app.facilities f
    ON f.id = p.facility_id
WHERE f.organisation_id = $1
ORDER BY p.code
`

	rows, err := s.DB.Query(ctx, query, organisationID)
	if err != nil {
		return nil, fmt.Errorf("list premises: %w", err)
	}
	defer rows.Close()

	result := make([]auditor.PremisesOption, 0)

	for rows.Next() {
		var item auditor.PremisesOption

		if err := rows.Scan(
			&item.ID,
			&item.Code,
			&item.Name,
			&item.Type,
			&item.Status,
		); err != nil {
			return nil, fmt.Errorf("scan premises: %w", err)
		}

		result = append(result, item)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("iterate premises: %w", err)
	}

	return result, nil
}

func (s *AuditorStore) ListAssessors(
	ctx context.Context,
) ([]auditor.AssessorOption, error) {
	if s == nil || s.DB == nil {
		return nil, fmt.Errorf("auditor database is not configured")
	}

	const query = `
SELECT
    id,
    display_name,
    email
FROM app.users
WHERE display_name IS NOT NULL
ORDER BY display_name
`

	rows, err := s.DB.Query(ctx, query)
	if err != nil {
		return nil, fmt.Errorf("list assessors: %w", err)
	}
	defer rows.Close()

	result := make([]auditor.AssessorOption, 0)

	for rows.Next() {
		var item auditor.AssessorOption

		if err := rows.Scan(
			&item.ID,
			&item.DisplayName,
			&item.Email,
		); err != nil {
			return nil, fmt.Errorf("scan assessor: %w", err)
		}

		result = append(result, item)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("iterate assessors: %w", err)
	}

	return result, nil
}

func (s *AuditorStore) ListAssessorOptions(
	ctx context.Context,
	organisationID string,
) ([]auditor.LookupItem, error) {
	if s == nil || s.DB == nil {
		return nil, fmt.Errorf("auditor store is not configured")
	}

	if organisationID == "" {
		return nil, fmt.Errorf("organisation_id is required")
	}

	rows, err := s.DB.Query(ctx, `
        SELECT DISTINCT
            u.id,
            u.display_name,
            u.email
        FROM app.users u
        JOIN app.organisation_users ou
            ON ou.user_id = u.id
        WHERE ou.organisation_id = $1
          AND u.display_name IS NOT NULL
        ORDER BY u.display_name
    `, organisationID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	result := make([]auditor.LookupItem, 0)

	for rows.Next() {
		var item auditor.LookupItem

		if err := rows.Scan(
			&item.ID,
			&item.Name,
			&item.Email,
		); err != nil {
			return nil, err
		}

		result = append(result, item)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return result, nil
}

func (s *AuditorStore) ListFrameworkOptions(
	ctx context.Context,
	organisationID string,
) ([]auditor.LookupItem, error) {
	if s == nil || s.DB == nil {
		return nil, fmt.Errorf("auditor store is not configured")
	}

	if organisationID == "" {
		return nil, fmt.Errorf("organisation_id is required")
	}

	rows, err := s.DB.Query(ctx, `
        SELECT id, code, name
        FROM app.compliance_frameworks
        WHERE status = 'active'
        ORDER BY name
    `)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	result := make([]auditor.LookupItem, 0)

	for rows.Next() {
		var item auditor.LookupItem

		if err := rows.Scan(
			&item.ID,
			&item.Code,
			&item.Name,
		); err != nil {
			return nil, err
		}

		result = append(result, item)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return result, nil
}
func (s *AuditorStore) ListPremiseOptions(
	ctx context.Context,
	organisationID string,
) ([]auditor.LookupItem, error) {
	if s == nil || s.DB == nil {
		return nil, fmt.Errorf("auditor store is not configured")
	}

	if organisationID == "" {
		return nil, fmt.Errorf("organisation_id is required")
	}

	rows, err := s.DB.Query(ctx, `
        SELECT
            p.id,
            p.code,
            p.name
        FROM app.premises p
        JOIN app.facilities f
            ON f.id = p.facility_id
        WHERE f.organisation_id = $1
          AND p.status = 'active'
        ORDER BY p.name
    `, organisationID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	result := make([]auditor.LookupItem, 0)

	for rows.Next() {
		var item auditor.LookupItem

		if err := rows.Scan(
			&item.ID,
			&item.Code,
			&item.Name,
		); err != nil {
			return nil, err
		}

		result = append(result, item)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return result, nil
}
