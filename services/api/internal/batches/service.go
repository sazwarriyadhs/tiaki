package batches

import (
	"context"
	"errors"
)

type Store interface {
	List(
		ctx context.Context,
		organisationID string,
	) ([]Batch, error)

	GetSummary(
		ctx context.Context,
		organisationID string,
	) (Summary, error)
}

type Service struct {
	Store Store
}

func (s *Service) List(
	ctx context.Context,
	organisationID string,
) (Response, error) {

	if organisationID == "" {
		return Response{}, errors.New(
			"organisation_id is required",
		)
	}

	if s == nil || s.Store == nil {
		return Response{}, errors.New(
			"batch store is not configured",
		)
	}

	items, err := s.Store.List(
		ctx,
		organisationID,
	)

	if err != nil {
		return Response{}, err
	}

	summary, err := s.Store.GetSummary(
		ctx,
		organisationID,
	)

	if err != nil {
		return Response{}, err
	}

	return Response{
		Data: ResponseData{
			Summary: summary,
			Items:   items,
		},
		Meta: Meta{
			Status: "ok",
		},
	}, nil
}
