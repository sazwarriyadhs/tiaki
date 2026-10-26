package auditor

import (
	"context"
	"errors"
)

type Store interface {
	GetOverview(context.Context, string) (Overview, error)
	ListAudits(context.Context, string) ([]Audit, error)
	GetAudit(context.Context, string, string) (Audit, error)
	CreateAudit(context.Context, string, CreateAuditRequest) (Audit, error)
	ListFrameworkOptions(context.Context, string) ([]LookupItem, error)
	ListPremiseOptions(context.Context, string) ([]LookupItem, error)
	ListAssessorOptions(context.Context, string) ([]LookupItem, error)
}

type Service struct {
	Store Store
}

func (s *Service) GetOverview(
	ctx context.Context,
	organisationID string,
) (Response, error) {
	if organisationID == "" {
		return Response{}, errors.New("organisation_id is required")
	}

	if s == nil || s.Store == nil {
		return Response{}, errors.New("auditor store is not configured")
	}

	overview, err := s.Store.GetOverview(ctx, organisationID)
	if err != nil {
		return Response{}, err
	}

	return Response{
		Data: overview,
		Meta: Meta{Status: "ok"},
	}, nil
}

func (s *Service) ListAudits(
	ctx context.Context,
	organisationID string,
) (AuditListResponse, error) {
	if organisationID == "" {
		return AuditListResponse{}, errors.New("organisation_id is required")
	}

	if s == nil || s.Store == nil {
		return AuditListResponse{}, errors.New("auditor store is not configured")
	}

	audits, err := s.Store.ListAudits(ctx, organisationID)
	if err != nil {
		return AuditListResponse{}, err
	}

	return AuditListResponse{
		Data: audits,
		Meta: Meta{Status: "ok"},
	}, nil
}

func (s *Service) GetAudit(
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
		return AuditDetailResponse{}, errors.New("auditor store is not configured")
	}

	audit, err := s.Store.GetAudit(ctx, organisationID, auditID)
	if err != nil {
		return AuditDetailResponse{}, err
	}

	return AuditDetailResponse{
		Data: audit,
		Meta: Meta{Status: "ok"},
	}, nil
}
func (s *Service) CreateAudit(
	ctx context.Context,
	organisationID string,
	request CreateAuditRequest,
) (AuditCreateResponse, error) {
	if organisationID == "" {
		return AuditCreateResponse{}, errors.New("organisation_id is required")
	}

	if request.FrameworkID == "" {
		return AuditCreateResponse{}, errors.New("framework_id is required")
	}

	if s == nil || s.Store == nil {
		return AuditCreateResponse{}, errors.New("auditor store is not configured")
	}

	audit, err := s.Store.CreateAudit(
		ctx,
		organisationID,
		request,
	)
	if err != nil {
		return AuditCreateResponse{}, err
	}

	return AuditCreateResponse{
		Data: audit,
		Meta: Meta{Status: "ok"},
	}, nil
}

func (s *Service) ListFrameworkOptions(
	ctx context.Context,
	organisationID string,
) (LookupResponse, error) {
	if organisationID == "" {
		return LookupResponse{}, errors.New("organisation_id is required")
	}

	if s == nil || s.Store == nil {
		return LookupResponse{}, errors.New("auditor store is not configured")
	}

	data, err := s.Store.ListFrameworkOptions(ctx, organisationID)
	if err != nil {
		return LookupResponse{}, err
	}

	return LookupResponse{
		Data: data,
		Meta: Meta{Status: "ok"},
	}, nil
}

func (s *Service) ListPremiseOptions(
	ctx context.Context,
	organisationID string,
) (LookupResponse, error) {
	if organisationID == "" {
		return LookupResponse{}, errors.New("organisation_id is required")
	}

	if s == nil || s.Store == nil {
		return LookupResponse{}, errors.New("auditor store is not configured")
	}

	data, err := s.Store.ListPremiseOptions(ctx, organisationID)
	if err != nil {
		return LookupResponse{}, err
	}

	return LookupResponse{
		Data: data,
		Meta: Meta{Status: "ok"},
	}, nil
}

func (s *Service) ListAssessorOptions(
	ctx context.Context,
	organisationID string,
) (LookupResponse, error) {
	if organisationID == "" {
		return LookupResponse{}, errors.New("organisation_id is required")
	}

	if s == nil || s.Store == nil {
		return LookupResponse{}, errors.New("auditor store is not configured")
	}

	data, err := s.Store.ListAssessorOptions(ctx, organisationID)
	if err != nil {
		return LookupResponse{}, err
	}

	return LookupResponse{
		Data: data,
		Meta: Meta{Status: "ok"},
	}, nil
}
