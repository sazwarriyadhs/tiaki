package auditor

import (
	"context"
	"errors"
)

type AuditsStore interface {
	ListAudits(context.Context, string) ([]Audit, error)
	GetAudit(context.Context, string, string) (Audit, error)
}

type AuditsService struct {
	Store AuditsStore
}

func (s *AuditsService) List(
	ctx context.Context,
	organisationID string,
) (AuditListResponse, error) {
	if organisationID == "" {
		return AuditListResponse{}, errors.New("organisation_id is required")
	}

	if s == nil || s.Store == nil {
		return AuditListResponse{}, errors.New("audit store is not configured")
	}

	items, err := s.Store.ListAudits(ctx, organisationID)
	if err != nil {
		return AuditListResponse{}, err
	}

	return AuditListResponse{
		Data: items,
		Meta: Meta{Status: "ok"},
	}, nil
}

func (s *AuditsService) Get(
	ctx context.Context,
	organisationID string,
	auditID string,
) (AuditDetailResponse, error) {
	if organisationID == "" {
		return AuditDetailResponse{}, errors.New("organisation_id is required")
	}

	if auditID == "" {
		return AuditDetailResponse{}, errors.New("audit_id is required")
	}

	if s == nil || s.Store == nil {
		return AuditDetailResponse{}, errors.New("audit store is not configured")
	}

	item, err := s.Store.GetAudit(ctx, organisationID, auditID)
	if err != nil {
		return AuditDetailResponse{}, err
	}

	return AuditDetailResponse{
		Data: item,
		Meta: Meta{Status: "ok"},
	}, nil
}
