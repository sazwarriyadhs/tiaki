package store

import (
	"context"
	"errors"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"

	"github.com/tiaki-platform/tiaki-api/internal/auditor"
)

type AuditsStore struct {
	DB *pgxpool.Pool
}

func (s *AuditsStore) ListAudits(ctx context.Context, organisationID string) ([]auditor.Audit, error) {
	if s == nil || s.DB == nil {
		return nil, errors.New("audit store is not configured")
	}

	if organisationID == "" {
		return nil, errors.New("organisation_id is required")
	}

	const query = `
SELECT
    ca.id,
    ca.organisation_id,
    o.legal_name AS organisation_name,
    ca.framework_id,
    cf.code AS framework_code,
    cf.name AS framework_name,
    ca.premises_id,
    p.name AS premises_name,
    ca.assessor_id,
    u.display_name AS assessor_name,
    ca.assessed_at,
    ca.status,
    ca.score::text,
    ca.summary,
    ca.evidence_ids
FROM app.compliance_assessments ca
JOIN app.organisations o
  ON o.id = ca.organisation_id
JOIN app.compliance_frameworks cf
  ON cf.id = ca.framework_id
LEFT JOIN app.premises p
  ON p.id = ca.premises_id
LEFT JOIN app.users u
  ON u.id = ca.assessor_id
WHERE ca.organisation_id = $1
ORDER BY ca.assessed_at DESC, ca.id DESC
`

	rows, err := s.DB.Query(ctx, query, organisationID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	result := make([]auditor.Audit, 0)

	for rows.Next() {
		var item auditor.Audit

		if err := rows.Scan(
			&item.ID,
			&item.OrganisationID,
			&item.OrganisationName,
			&item.FrameworkID,
			&item.FrameworkCode,
			&item.FrameworkName,
			&item.PremisesID,
			&item.PremisesName,
			&item.AssessorID,
			&item.AssessorName,
			&item.AssessedAt,
			&item.Status,
			&item.Score,
			&item.Summary,
			&item.EvidenceIDs,
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

func (s *AuditsStore) GetAudit(
	ctx context.Context,
	organisationID string,
	auditID string,
) (auditor.Audit, error) {
	if s == nil || s.DB == nil {
		return auditor.Audit{}, errors.New("audit store is not configured")
	}

	if organisationID == "" {
		return auditor.Audit{}, errors.New("organisation_id is required")
	}

	if auditID == "" {
		return auditor.Audit{}, errors.New("audit_id is required")
	}

	const query = `
SELECT
    ca.id,
    ca.organisation_id,
    o.legal_name AS organisation_name,
    ca.framework_id,
    cf.code AS framework_code,
    cf.name AS framework_name,
    ca.premises_id,
    p.name AS premises_name,
    ca.assessor_id,
    u.display_name AS assessor_name,
    ca.assessed_at,
    ca.status,
    ca.score::text,
    ca.summary,
    ca.evidence_ids
FROM app.compliance_assessments ca
JOIN app.organisations o
  ON o.id = ca.organisation_id
JOIN app.compliance_frameworks cf
  ON cf.id = ca.framework_id
LEFT JOIN app.premises p
  ON p.id = ca.premises_id
LEFT JOIN app.users u
  ON u.id = ca.assessor_id
WHERE ca.organisation_id = $1
  AND ca.id = $2
`

	var item auditor.Audit

	err := s.DB.QueryRow(ctx, query, organisationID, auditID).Scan(
		&item.ID,
		&item.OrganisationID,
		&item.OrganisationName,
		&item.FrameworkID,
		&item.FrameworkCode,
		&item.FrameworkName,
		&item.PremisesID,
		&item.PremisesName,
		&item.AssessorID,
		&item.AssessorName,
		&item.AssessedAt,
		&item.Status,
		&item.Score,
		&item.Summary,
		&item.EvidenceIDs,
	)

	if errors.Is(err, pgx.ErrNoRows) {
		return auditor.Audit{}, pgx.ErrNoRows
	}

	if err != nil {
		return auditor.Audit{}, err
	}

	return item, nil
}
