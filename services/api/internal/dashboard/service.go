package dashboard

import (
	"context"
	"errors"
)

type Store interface {
	GetSummary(ctx context.Context, organisationID string) (Summary, error)
}

type Service struct {
	Store Store
}

func (s *Service) GetSummary(
	ctx context.Context,
	organisationID string,
) (SummaryResponse, error) {

	if organisationID == "" {
		return SummaryResponse{}, errors.New("organisation_id is required")
	}

	if s == nil || s.Store == nil {
		return SummaryResponse{}, errors.New("dashboard store is not configured")
	}

	summary, err := s.Store.GetSummary(ctx, organisationID)
	if err != nil {
		return SummaryResponse{}, err
	}

	status := "ok"

	if isNoData(summary) {
		status = "no_data"
	}

	return SummaryResponse{
		Data: SummaryResponseData{
			Sites:          summary.Sites,
			Equipment:      summary.Equipment,
			Temperature:    summary.Temperature,
			Halal:          summary.Halal,
			Certifications: summary.Certifications,
			Alerts:         summary.Alerts,
			AIRisk:         summary.AIRisk,
			Operations:     summary.Operations,
			PostMortem:     summary.PostMortem,
			Carcasses:      summary.Carcasses,
			MeatProduction: summary.MeatProduction,
		},
		Meta: SummaryMeta{
			Status: status,
		},
	}, nil
}

func isNoData(s Summary) bool {
	return s.Sites.Total == 0 &&
		s.Equipment.Total == 0 &&
		s.Temperature.Sensors == 0 &&
		s.Temperature.ReadingsToday == 0 &&
		s.Temperature.ExcursionsOpen == 0 &&
		s.Halal.ChecksToday == 0 &&
		s.Certifications.Active == 0 &&
		s.Certifications.Expiring == 0 &&
		s.Certifications.Suspended == 0 &&
		s.Certifications.Pending == 0 &&
		s.Alerts.Open == 0 &&
		s.Alerts.Critical == 0 &&
		s.AIRisk.Score == nil &&
		s.Operations.ArrivalsToday == 0 &&
		s.Operations.LivestockReceivedToday == 0 &&
		s.Operations.SlaughteredToday == 0 &&
		s.Operations.ActiveSessions == 0 &&
		s.Operations.PlannedToday == 0 &&
		s.PostMortem.Passed == 0 &&
		s.PostMortem.Held == 0 &&
		s.PostMortem.Rejected == 0 &&
		s.PostMortem.Conditional == 0 &&
		s.Carcasses.ProducedToday == 0 &&
		s.Carcasses.Pending == 0 &&
		s.Carcasses.Supported == 0 &&
		s.Carcasses.Held == 0 &&
		s.Carcasses.Rejected == 0 &&
		s.MeatProduction.BatchesToday == 0 &&
		(s.MeatProduction.QuantityToday == nil ||
			*s.MeatProduction.QuantityToday == 0)
}
