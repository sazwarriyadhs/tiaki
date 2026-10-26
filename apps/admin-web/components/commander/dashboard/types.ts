import type { LucideIcon } from "lucide-react";

export type DashboardSummary = {
  sites: {
    total: number;
    active: number;
  };

  equipment: {
    total: number;
    active: number;
  };

  temperature: {
    sensors: number;
    readings_today: number;
    excursions_open: number;
    latest_average_c: number | null;
  };

  halal: {
    compliance_rate: number | null;
    checks_today: number;
    pass: number;
    fail: number;
    pending: number;
  };

  certifications: {
    active: number;
    expiring: number;
    suspended: number;
    pending: number;
  };

  alerts: {
    open: number;
    critical: number;
  };

  ai_risk: {
    score: number | null;
  };

  operations: {
    arrivals_today: number;
    livestock_received_today: number;
    slaughtered_today: number;
    active_sessions: number;
    planned_today: number;
    avg_process_minutes: number | null;
  };

  post_mortem: {
    passed: number;
    held: number;
    rejected: number;
    conditional: number;
  };

  carcasses: {
    produced_today: number;
    weight_today: number | null;
    pending: number;
    supported: number;
    held: number;
    rejected: number;
  };

  meat_production: {
    batches_today: number;
    quantity_today: number | null;
    unit: string;
  };
};

export type DashboardResponse = {
  data: DashboardSummary;
  meta: {
    status: string;
  };
};

export type ApiState =
  | "loading"
  | "connected"
  | "error";

export type KpiDefinition = {
  label: string;
  value: string;
  meta: string;
  icon: LucideIcon;
};
