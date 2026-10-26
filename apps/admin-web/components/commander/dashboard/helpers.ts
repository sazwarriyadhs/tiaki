import type { DashboardSummary } from "./types";

export function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-NZ").format(value);
}

export function formatPercent(value: number | null): string {
  if (value === null || Number.isNaN(value)) return "—";
  return `${value.toFixed(1)}%`;
}

export function formatTemperature(value: number | null): string {
  if (value === null || Number.isNaN(value)) return "—";
  return `${value.toFixed(1)}°C`;
}

export function formatQuantity(
  value: number | null,
  unit: string,
): string {
  if (value === null || Number.isNaN(value)) return "—";

  return `${new Intl.NumberFormat("en-NZ", {
    maximumFractionDigits: 1,
  }).format(value)} ${unit}`;
}

export function getColdChainMeta(summary: DashboardSummary): string {
  if (summary.temperature.sensors === 0) {
    return "No temperature sensors";
  }

  if (summary.temperature.excursions_open > 0) {
    return `${formatNumber(summary.temperature.excursions_open)} open excursion${
      summary.temperature.excursions_open === 1 ? "" : "s"
    }`;
  }

  if (summary.temperature.latest_average_c === null) {
    return `${formatNumber(summary.temperature.sensors)} sensor${
      summary.temperature.sensors === 1 ? "" : "s"
    } · no readings`;
  }

  return `${formatNumber(summary.temperature.sensors)} sensor${
    summary.temperature.sensors === 1 ? "" : "s"
  } · ${formatNumber(summary.temperature.readings_today)} readings today`;
}
