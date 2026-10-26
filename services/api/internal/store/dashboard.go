package store

import (
	"context"

	"github.com/jackc/pgx/v5/pgxpool"

	"github.com/tiaki-platform/tiaki-api/internal/dashboard"
)

type DashboardStore struct {
	DB *pgxpool.Pool
}

func (s *DashboardStore) GetSummary(
	ctx context.Context,
	organisationID string,
) (dashboard.Summary, error) {

	var out dashboard.Summary

	const q = `
WITH
business_day AS (
    SELECT
        (
            (
                (CURRENT_TIMESTAMP AT TIME ZONE 'Pacific/Auckland')::date
            )::timestamp
            AT TIME ZONE 'Pacific/Auckland'
        ) AS start_at,
        (
            (
                (
                    (CURRENT_TIMESTAMP AT TIME ZONE 'Pacific/Auckland')::date
                    + 1
                )::timestamp
            )
            AT TIME ZONE 'Pacific/Auckland'
        ) AS end_at
),

site_stats AS (
    SELECT
        COUNT(*)::bigint AS total,
        COUNT(*) FILTER (
            WHERE status = 'active'
        )::bigint AS active
    FROM app.facilities
    WHERE organisation_id = $1
),

equipment_stats AS (
    SELECT
        COUNT(*)::bigint AS total,
        COUNT(*) FILTER (
            WHERE status = 'active'
        )::bigint AS active
    FROM app.equipment
    WHERE organisation_id = $1
),

temperature_sensor_stats AS (
    SELECT
        COUNT(*)::bigint AS sensors
    FROM app.temperature_sensors
    WHERE organisation_id = $1
),

temperature_reading_stats AS (
    SELECT
        COUNT(*)::bigint AS readings_today
    FROM app.temperature_readings
    WHERE organisation_id = $1
        AND recorded_at >= (SELECT start_at FROM business_day)
        AND recorded_at < (SELECT end_at FROM business_day)
),

latest_sensor_readings AS (
    SELECT DISTINCT ON (sensor_id)
        sensor_id,
        temperature_celsius
    FROM app.temperature_readings
    WHERE organisation_id = $1
    ORDER BY sensor_id, recorded_at DESC
),

temperature_latest_stats AS (
    SELECT
        AVG(temperature_celsius)::double precision AS latest_average_c
    FROM latest_sensor_readings
),

temperature_excursion_stats AS (
    SELECT
        COUNT(*)::bigint AS excursions_open
    FROM app.temperature_excursions
    WHERE organisation_id = $1
        AND status = 'open'
),

animal_arrival_stats AS (
    SELECT
        COUNT(*)::bigint AS arrivals_today,
        COALESCE(
            SUM(ab.animal_count),
            0
        )::bigint AS livestock_received_today
    FROM app.animal_arrivals aa
    JOIN app.animal_batches ab
        ON ab.id = aa.batch_id
        AND ab.organisation_id = aa.organisation_id
    WHERE aa.organisation_id = $1
        AND aa.arrived_at >= (SELECT start_at FROM business_day)
        AND aa.arrived_at < (SELECT end_at FROM business_day)
),

slaughter_stats AS (
    SELECT
        COUNT(*)::bigint AS slaughtered_today
    FROM app.slaughter_events
    WHERE organisation_id = $1
        AND event_at >= (SELECT start_at FROM business_day)
        AND event_at < (SELECT end_at FROM business_day)
),

schedule_stats AS (
    SELECT
        COUNT(*) FILTER (
            WHERE scheduled_start >= (SELECT start_at FROM business_day)
                AND scheduled_start < (SELECT end_at FROM business_day)
                AND status = 'planned'
        )::bigint AS planned_today,

        COUNT(*) FILTER (
            WHERE status IN ('in_progress', 'active')
        )::bigint AS active_sessions
    FROM app.slaughter_schedules
    WHERE organisation_id = $1
),

halal_check_stats AS (
    SELECT
        COUNT(*) FILTER (
            WHERE hcc.checked_at >= (SELECT start_at FROM business_day)
                AND hcc.checked_at < (SELECT end_at FROM business_day)
        )::bigint AS checks_today,

        COUNT(*) FILTER (
            WHERE hcc.result = 'pass'
                AND hcc.checked_at >= (SELECT start_at FROM business_day)
                AND hcc.checked_at < (SELECT end_at FROM business_day)
        )::bigint AS pass_count,

        COUNT(*) FILTER (
            WHERE hcc.result = 'fail'
                AND hcc.checked_at >= (SELECT start_at FROM business_day)
                AND hcc.checked_at < (SELECT end_at FROM business_day)
        )::bigint AS fail_count,

        COUNT(*) FILTER (
            WHERE hcc.result = 'pending'
                AND hcc.checked_at >= (SELECT start_at FROM business_day)
                AND hcc.checked_at < (SELECT end_at FROM business_day)
        )::bigint AS pending_count
    FROM app.halal_control_checks hcc
    JOIN app.slaughter_events se
        ON se.id = hcc.slaughter_event_id
        AND se.organisation_id = $1
    WHERE hcc.checked_at >= (SELECT start_at FROM business_day)
        AND hcc.checked_at < (SELECT end_at FROM business_day)
),

halal_rate_stats AS (
    SELECT
        CASE
            WHEN (pass_count + fail_count) = 0
                THEN NULL::double precision
            ELSE (
                pass_count::double precision
                /
                (pass_count + fail_count)::double precision
            ) * 100.0
        END AS compliance_rate
    FROM halal_check_stats
),

post_mortem_stats AS (
    SELECT
        COUNT(*) FILTER (
            WHERE pmi.outcome = 'passed'
        )::bigint AS passed,

        COUNT(*) FILTER (
            WHERE pmi.outcome = 'held'
        )::bigint AS held,

        COUNT(*) FILTER (
            WHERE pmi.outcome = 'rejected'
        )::bigint AS rejected,

        COUNT(*) FILTER (
            WHERE pmi.outcome = 'conditional'
        )::bigint AS conditional
    FROM app.post_mortem_inspections pmi
    JOIN app.slaughter_events se
        ON se.id = pmi.slaughter_event_id
        AND se.organisation_id = $1
    WHERE pmi.inspected_at >= (SELECT start_at FROM business_day)
        AND pmi.inspected_at < (SELECT end_at FROM business_day)
),

carcass_stats AS (
    SELECT
        COUNT(*) FILTER (
            WHERE created_at >= (SELECT start_at FROM business_day)
                AND created_at < (SELECT end_at FROM business_day)
        )::bigint AS produced_today,

        SUM(weight_kg) FILTER (
            WHERE created_at >= (SELECT start_at FROM business_day)
                AND created_at < (SELECT end_at FROM business_day)
        )::double precision AS weight_today,

        COUNT(*) FILTER (
            WHERE halal_status = 'pending'
        )::bigint AS pending,

        COUNT(*) FILTER (
            WHERE halal_status = 'supported'
        )::bigint AS supported,

        COUNT(*) FILTER (
            WHERE halal_status = 'held'
        )::bigint AS held,

        COUNT(*) FILTER (
            WHERE halal_status = 'rejected'
        )::bigint AS rejected
    FROM app.carcasses
    WHERE organisation_id = $1
),

meat_production_stats AS (
    SELECT
        COUNT(*) FILTER (
            WHERE produced_at >= (SELECT start_at FROM business_day)
                AND produced_at < (SELECT end_at FROM business_day)
        )::bigint AS batches_today,

        SUM(quantity) FILTER (
            WHERE produced_at >= (SELECT start_at FROM business_day)
                AND produced_at < (SELECT end_at FROM business_day)
                AND unit = 'kg'
        )::double precision AS quantity_today
    FROM app.meat_batches
    WHERE organisation_id = $1
),

certificate_stats AS (
    SELECT
        COUNT(*) FILTER (
            WHERE status = 'active'
        )::bigint AS active,

        COUNT(*) FILTER (
            WHERE status = 'active'
                AND expires_on >= CURRENT_TIMESTAMP
                AND expires_on < CURRENT_TIMESTAMP + INTERVAL '30 days'
        )::bigint AS expiring,

        COUNT(*) FILTER (
            WHERE status = 'suspended'
        )::bigint AS suspended,

        COUNT(*) FILTER (
            WHERE status = 'pending'
        )::bigint AS pending
    FROM app.certificates
    WHERE organisation_id = $1
),

finding_stats AS (
    SELECT
        COUNT(*) FILTER (
            WHERE status = 'open'
        )::bigint AS open_count,

        COUNT(*) FILTER (
            WHERE status = 'open'
                AND severity = 'critical'
        )::bigint AS critical_count
    FROM app.findings
    WHERE organisation_id = $1
),

ai_stats AS (
    SELECT
        AVG(risk_score)::double precision AS score
    FROM app.ai_assessments
    WHERE organisation_id = $1
        AND status = 'generated'
)

SELECT
    COALESCE(ss.total, 0),
    COALESCE(ss.active, 0),

    COALESCE(es.total, 0),
    COALESCE(es.active, 0),

    COALESCE(tss.sensors, 0),
    COALESCE(trs.readings_today, 0),
    COALESCE(tes.excursions_open, 0),
    tls.latest_average_c,

    hcs.checks_today,
    hcs.pass_count,
    hcs.fail_count,
    hcs.pending_count,
    hrs.compliance_rate,

    COALESCE(css.active, 0),
    COALESCE(css.expiring, 0),
    COALESCE(css.suspended, 0),
    COALESCE(css.pending, 0),

    COALESCE(fs.open_count, 0)
        +
    COALESCE(tes.excursions_open, 0),

    COALESCE(fs.critical_count, 0),

    ais.score,

    COALESCE(aas.arrivals_today, 0),
    COALESCE(aas.livestock_received_today, 0),

    COALESCE(slgs.slaughtered_today, 0),

    COALESCE(schs.active_sessions, 0),
    COALESCE(schs.planned_today, 0),

    COALESCE(pms.passed, 0),
    COALESCE(pms.held, 0),
    COALESCE(pms.rejected, 0),
    COALESCE(pms.conditional, 0),

    COALESCE(cs.produced_today, 0),
    cs.weight_today,

    COALESCE(cs.pending, 0),
    COALESCE(cs.supported, 0),
    COALESCE(cs.held, 0),
    COALESCE(cs.rejected, 0),

    COALESCE(mps.batches_today, 0),
    mps.quantity_today

FROM site_stats ss
CROSS JOIN equipment_stats es
CROSS JOIN temperature_sensor_stats tss
CROSS JOIN temperature_reading_stats trs
CROSS JOIN temperature_excursion_stats tes
CROSS JOIN temperature_latest_stats tls
CROSS JOIN animal_arrival_stats aas
CROSS JOIN slaughter_stats slgs
CROSS JOIN schedule_stats schs
CROSS JOIN halal_check_stats hcs
CROSS JOIN halal_rate_stats hrs
CROSS JOIN post_mortem_stats pms
CROSS JOIN carcass_stats cs
CROSS JOIN meat_production_stats mps
CROSS JOIN certificate_stats css
CROSS JOIN finding_stats fs
CROSS JOIN ai_stats ais
`

	err := s.DB.QueryRow(
		ctx,
		q,
		organisationID,
	).Scan(
		&out.Sites.Total,
		&out.Sites.Active,

		&out.Equipment.Total,
		&out.Equipment.Active,

		&out.Temperature.Sensors,
		&out.Temperature.ReadingsToday,
		&out.Temperature.ExcursionsOpen,
		&out.Temperature.LatestAverageC,

		&out.Halal.ChecksToday,
		&out.Halal.Pass,
		&out.Halal.Fail,
		&out.Halal.Pending,
		&out.Halal.ComplianceRate,

		&out.Certifications.Active,
		&out.Certifications.Expiring,
		&out.Certifications.Suspended,
		&out.Certifications.Pending,

		&out.Alerts.Open,
		&out.Alerts.Critical,

		&out.AIRisk.Score,

		&out.Operations.ArrivalsToday,
		&out.Operations.LivestockReceivedToday,
		&out.Operations.SlaughteredToday,
		&out.Operations.ActiveSessions,
		&out.Operations.PlannedToday,

		&out.PostMortem.Passed,
		&out.PostMortem.Held,
		&out.PostMortem.Rejected,
		&out.PostMortem.Conditional,

		&out.Carcasses.ProducedToday,
		&out.Carcasses.WeightToday,
		&out.Carcasses.Pending,
		&out.Carcasses.Supported,
		&out.Carcasses.Held,
		&out.Carcasses.Rejected,

		&out.MeatProduction.BatchesToday,
		&out.MeatProduction.QuantityToday,
	)

	if err != nil {
		return dashboard.Summary{}, err
	}

	out.MeatProduction.Unit = "kg"

	return out, nil
}
