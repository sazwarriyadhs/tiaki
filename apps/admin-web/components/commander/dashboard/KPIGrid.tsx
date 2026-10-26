"use client";

import {
  Activity,
  AlertTriangle,
  ClipboardCheck,
  Package,
  ShieldCheck,
  Snowflake,
  Zap,
} from "lucide-react";

import type { DashboardSummary, KpiDefinition } from "./types";
import {
  formatNumber,
  formatPercent,
  formatQuantity,
  formatTemperature,
  getColdChainMeta,
} from "./helpers";

export function KPIGrid({
  summary,
  loading,
}: {
  summary: DashboardSummary | null;
  loading: boolean;
}) {
  const kpis: KpiDefinition[] = summary
    ? [
        {
          label: "ARRIVALS TODAY",
          value: formatNumber(
            summary.operations.arrivals_today,
          ),
          meta: `${formatNumber(
            summary.operations
              .livestock_received_today,
          )} livestock received`,
          icon: Package,
        },
        {
          label: "SLAUGHTERED TODAY",
          value: formatNumber(
            summary.operations
              .slaughtered_today,
          ),
          meta:
            summary.operations
              .slaughtered_today === 0
              ? "No slaughter events recorded"
              : "Completed slaughter events",
          icon: Activity,
        },
        {
          label: "HALAL COMPLIANCE",
          value: formatPercent(
            summary.halal.compliance_rate,
          ),
          meta: `${formatNumber(
            summary.halal.checks_today,
          )} checks today · ${formatNumber(
            summary.halal.fail,
          )} failed`,
          icon: ShieldCheck,
        },
        {
          label: "ACTIVE SESSIONS",
          value: formatNumber(
            summary.operations
              .active_sessions,
          ),
          meta: `${formatNumber(
            summary.operations.planned_today,
          )} planned today`,
          icon: ClipboardCheck,
        },
        {
          label: "CARCASSES TODAY",
          value: formatNumber(
            summary.carcasses
              .produced_today,
          ),
          meta:
            summary.carcasses.weight_today ===
            null
              ? "Weight not recorded"
              : `${new Intl.NumberFormat(
                  "en-NZ",
                  {
                    maximumFractionDigits: 1,
                  },
                ).format(
                  summary.carcasses.weight_today,
                )} kg total`,
          icon: Package,
        },
        {
          label: "MEAT PRODUCED",
          value: formatQuantity(
            summary.meat_production
              .quantity_today,
            summary.meat_production.unit ||
              "kg",
          ),
          meta: `${formatNumber(
            summary.meat_production
              .batches_today,
          )} production batches today`,
          icon: Zap,
        },
        {
          label: "COLD CHAIN",
          value: formatTemperature(
            summary.temperature
              .latest_average_c,
          ),
          meta: getColdChainMeta(summary),
          icon: Snowflake,
        },
        {
          label: "OPEN ALERTS",
          value: formatNumber(
            summary.alerts.open,
          ),
          meta: `${formatNumber(
            summary.alerts.critical,
          )} critical`,
          icon: AlertTriangle,
        },
      ]
    : [];

  return (
    <section
      className="kpi-grid"
      aria-label="Operational KPIs"
    >
      {loading && !summary
        ? Array.from({ length: 8 }).map(
            (_, index) => (
              <article
                className="commander-kpi"
                key={`loading-${index}`}
              >
                <div className="kpi-icon">
                  <Activity
                    size={17}
                    strokeWidth={1.8}
                    aria-hidden="true"
                  />
                </div>

                <div className="commander-kpi-label">
                  LOADING
                </div>

                <div className="commander-kpi-value">
                  —
                </div>

                <div className="commander-kpi-meta">
                  Loading operational data
                </div>
              </article>
            ),
          )
        : kpis.map((kpi) => {
            const Icon = kpi.icon;

            return (
              <article
                className="commander-kpi"
                key={kpi.label}
              >
                <div className="kpi-icon">
                  <Icon
                    size={17}
                    strokeWidth={1.8}
                    aria-hidden="true"
                  />
                </div>

                <div className="commander-kpi-label">
                  {kpi.label}
                </div>

                <div className="commander-kpi-value">
                  {kpi.value}
                </div>

                <div className="commander-kpi-meta">
                  {kpi.meta}
                </div>
              </article>
            );
          })}
    </section>
  );
}
