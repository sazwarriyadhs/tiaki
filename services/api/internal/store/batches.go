package store

import (
	"context"
	"encoding/json"
	"fmt"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/tiaki-platform/tiaki-api/internal/batches"
)

type BatchStore struct {
	DB *pgxpool.Pool
}

func (s *BatchStore) List(
	ctx context.Context,
	organisationID string,
) ([]batches.Batch, error) {

	if s == nil || s.DB == nil {
		return nil, fmt.Errorf("batch store database is not configured")
	}

	if organisationID == "" {
		return nil, fmt.Errorf("organisation_id is required")
	}

	const query = `
WITH batch_base AS (
    SELECT
        ab.id,
        ab.batch_no,
        ab.species_code,
        COALESCE(ab.supplier_name, '') AS supplier_name,
        ab.animal_count,
        ab.received_at,
        ab.status,
        ab.created_at
    FROM app.animal_batches ab
    WHERE ab.organisation_id = $1
),
slaughter_stats AS (
    SELECT
        se.batch_id,
        COUNT(DISTINCT se.id)::int AS slaughtered_count,
        COUNT(DISTINCT hcc.id)::int AS halal_checks,
        COUNT(DISTINCT hcc.id)
            FILTER (
                WHERE LOWER(COALESCE(hcc.result, '')) = 'pass'
            )::int AS halal_pass,
        COUNT(DISTINCT hcc.id)
            FILTER (
                WHERE LOWER(COALESCE(hcc.result, '')) = 'fail'
            )::int AS halal_fail,
        COUNT(DISTINCT hcc.id)
            FILTER (
                WHERE LOWER(COALESCE(hcc.result, ''))
                    NOT IN ('pass', 'fail')
            )::int AS halal_pending,
        COUNT(DISTINCT c.id)::int AS carcasses
    FROM app.slaughter_events se
    LEFT JOIN app.halal_control_checks hcc
        ON hcc.slaughter_event_id = se.id
    LEFT JOIN app.carcasses c
        ON c.slaughter_event_id = se.id
        AND c.organisation_id = se.organisation_id
    WHERE se.organisation_id = $1
    GROUP BY se.batch_id
),
meat_outputs AS (
    SELECT
        x.batch_id,
        jsonb_agg(
            jsonb_build_object(
                'id', x.id,
                'batch_no', x.batch_no,
                'quantity', x.quantity,
                'unit', x.unit,
                'produced_at', x.produced_at,
                'status', x.status,
                'halal_status', x.halal_status
            )
            ORDER BY x.produced_at DESC
        ) AS outputs
    FROM (
        SELECT DISTINCT
            se.batch_id,
            mb.id,
            mb.batch_no,
            mb.quantity,
            mb.unit,
            mb.produced_at,
            mb.status,
            mb.halal_status
        FROM app.slaughter_events se
        JOIN app.carcasses c
            ON c.slaughter_event_id = se.id
            AND c.organisation_id = se.organisation_id
        JOIN app.cutting_inputs ci
            ON ci.carcass_id = c.id
        JOIN app.cutting_runs cr
            ON cr.id = ci.cutting_run_id
            AND cr.organisation_id = se.organisation_id
        JOIN app.meat_batches mb
            ON mb.cutting_run_id = cr.id
            AND mb.organisation_id = se.organisation_id
        WHERE se.organisation_id = $1
    ) x
    GROUP BY x.batch_id
)
SELECT
    b.id,
    b.batch_no,
    b.species_code,
    b.supplier_name,
    b.animal_count,
    COALESCE(ss.slaughtered_count, 0),
    GREATEST(
        b.animal_count -
        COALESCE(ss.slaughtered_count, 0),
        0
    ),
    b.status,
    b.received_at,
    b.created_at,
    COALESCE(ss.halal_checks, 0),
    COALESCE(ss.halal_pass, 0),
    COALESCE(ss.halal_fail, 0),
    COALESCE(ss.halal_pending, 0),
    COALESCE(ss.carcasses, 0),
    COALESCE(
        mo.outputs,
        '[]'::jsonb
    )
FROM batch_base b
LEFT JOIN slaughter_stats ss
    ON ss.batch_id = b.id
LEFT JOIN meat_outputs mo
    ON mo.batch_id = b.id
ORDER BY
    b.received_at DESC,
    b.created_at DESC
`

	rows, err := s.DB.Query(ctx, query, organisationID)
	if err != nil {
		return nil, fmt.Errorf(
			"list batches query: %w",
			err,
		)
	}
	defer rows.Close()

	result := make([]batches.Batch, 0)

	for rows.Next() {
		var (
			item         batches.Batch
			halalChecks  int
			halalPass    int
			halalFail    int
			halalPending int
			carcasses    int
			meatJSON     []byte
		)

		if err := rows.Scan(
			&item.ID,
			&item.BatchNo,
			&item.SpeciesCode,
			&item.SupplierName,
			&item.AnimalCount,
			&item.SlaughteredCount,
			&item.RemainingCount,
			&item.Status,
			&item.ReceivedAt,
			&item.CreatedAt,
			&halalChecks,
			&halalPass,
			&halalFail,
			&halalPending,
			&carcasses,
			&meatJSON,
		); err != nil {
			return nil, fmt.Errorf(
				"scan batch row: %w",
				err,
			)
		}

		item.Halal = batches.HalalSummary{
			Checks:  halalChecks,
			Pass:    halalPass,
			Fail:    halalFail,
			Pending: halalPending,
		}

		item.Carcasses = carcasses
		item.MeatOutputs = []batches.MeatOutput{}

		if len(meatJSON) > 0 {
			if err := json.Unmarshal(
				meatJSON,
				&item.MeatOutputs,
			); err != nil {
				return nil, fmt.Errorf(
					"decode meat outputs: %w",
					err,
				)
			}
		}

		result = append(result, item)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf(
			"iterate batches: %w",
			err,
		)
	}

	return result, nil
}

func (s *BatchStore) GetSummary(
	ctx context.Context,
	organisationID string,
) (batches.Summary, error) {

	if s == nil || s.DB == nil {
		return batches.Summary{}, fmt.Errorf(
			"batch store database is not configured",
		)
	}

	if organisationID == "" {
		return batches.Summary{}, fmt.Errorf(
			"organisation_id is required",
		)
	}

	const query = `
WITH batch_stats AS (
    SELECT
        ab.id,
        ab.status,
        ab.animal_count,
        (
            SELECT COUNT(DISTINCT se.id)
            FROM app.slaughter_events se
            WHERE se.batch_id = ab.id
            AND se.organisation_id = ab.organisation_id
        )::int AS slaughtered_count,
        (
            SELECT COUNT(DISTINCT hcc.id)
            FROM app.slaughter_events se
            JOIN app.halal_control_checks hcc
                ON hcc.slaughter_event_id = se.id
            WHERE se.batch_id = ab.id
            AND se.organisation_id = ab.organisation_id
        )::int AS halal_checks,
        (
            SELECT COUNT(DISTINCT hcc.id)
            FROM app.slaughter_events se
            JOIN app.halal_control_checks hcc
                ON hcc.slaughter_event_id = se.id
            WHERE se.batch_id = ab.id
            AND se.organisation_id = ab.organisation_id
            AND LOWER(COALESCE(hcc.result, '')) = 'pass'
        )::int AS halal_pass
    FROM app.animal_batches ab
    WHERE ab.organisation_id = $1
)
SELECT
    COUNT(*)::int,
    COUNT(*) FILTER (
        WHERE status IN (
            'open',
            'active',
            'in_progress'
        )
    )::int,
    COALESCE(SUM(animal_count), 0)::int,
    COALESCE(SUM(slaughtered_count), 0)::int,
    COUNT(*) FILTER (
        WHERE halal_checks > 0
        AND halal_pass = halal_checks
    )::int
FROM batch_stats
`

	var summary batches.Summary

	if err := s.DB.QueryRow(
		ctx,
		query,
		organisationID,
	).Scan(
		&summary.TotalBatches,
		&summary.ActiveBatches,
		&summary.AnimalsReceived,
		&summary.AnimalsSlaughtered,
		&summary.HalalVerifiedBatches,
	); err != nil {
		return batches.Summary{}, fmt.Errorf(
			"batch summary query: %w",
			err,
		)
	}

	return summary, nil
}
