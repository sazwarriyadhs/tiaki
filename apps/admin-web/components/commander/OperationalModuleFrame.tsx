"use client";

import {
  Activity,
  BarChart3,
  CalendarDays,
  ChevronDown,
  CircleHelp,
  Filter,
  LayoutGrid,
  List,
  Plus,
  RefreshCw,
  Search,
} from "lucide-react";

import CommanderShell from "./CommanderShell";

export type ModuleMetric = {
  label: string;
  value: string;
  description: string;
  icon?: React.ReactNode;
};

export type ModuleColumn = {
  key: string;
  label: string;
};

export type ModuleRow = Record<string, React.ReactNode>;

type OperationalModuleFrameProps = {
  eyebrow: string;
  title: string;
  description: string;
  actionLabel?: string;
  metrics: ModuleMetric[];
  columns: ModuleColumn[];
  rows?: ModuleRow[];
  emptyTitle: string;
  emptyDescription: string;
  searchPlaceholder?: string;
  filterLabel?: string;
  children?: React.ReactNode;
};

export default function OperationalModuleFrame({
  eyebrow,
  title,
  description,
  actionLabel,
  metrics,
  columns,
  rows = [],
  emptyTitle,
  emptyDescription,
  searchPlaceholder = "Search...",
  filterLabel = "All Status",
  children,
}: OperationalModuleFrameProps) {
  return (
    <CommanderShell>
      <main className="page operational-module-page">

        {/* ======================================================
            MODULE HERO
            ====================================================== */}
        <section className="commander-hero operational-module-hero">

          <div className="hero-copy">

            <div className="eyebrow">
              <Activity
                size={15}
                strokeWidth={2}
                aria-hidden="true"
              />
              <span>{eyebrow}</span>
            </div>

            <h1>{title}</h1>

            <p>{description}</p>

          </div>

          {actionLabel && (
            <div className="hero-system operational-module-action">

              <div className="hero-system-label">
                MODULE ACTION
              </div>

              <button
                type="button"
                className="commander-button commander-button-primary"
              >
                <Plus
                  size={17}
                  strokeWidth={2}
                  aria-hidden="true"
                />
                <span>{actionLabel}</span>
              </button>

              <div className="hero-system-grid">
                <div>
                  <span className="hero-system-status" />
                  <span>Operational</span>
                </div>
              </div>

            </div>
          )}

        </section>

        {/* ======================================================
            KPI
            ====================================================== */}
        <section
          className="kpi-grid operational-module-kpis"
          aria-label={`${title} metrics`}
        >

          {metrics.map((metric) => (
            <article
              className="commander-kpi"
              key={metric.label}
            >

              <div className="kpi-icon">
                {metric.icon ?? (
                  <BarChart3
                    size={20}
                    strokeWidth={1.8}
                    aria-hidden="true"
                  />
                )}
              </div>

              <div className="commander-kpi-label">
                {metric.label}
              </div>

              <div className="commander-kpi-value">
                {metric.value}
              </div>

              <div className="commander-kpi-meta">
                {metric.description}
              </div>

            </article>
          ))}

        </section>

        {/* ======================================================
            OPERATIONAL DATA
            ====================================================== */}
        <section className="card commander-panel operational-data-panel">

          <div className="panel-header">

            <div>
              <div className="panel-title">
                OPERATIONAL DATA
              </div>

              <h2 className="batches-section-title">
                {title} Register
              </h2>

              <p className="panel-subtitle">
                Review and manage operational records.
              </p>
            </div>

            <div className="batches-view-toggle">

              <button
                type="button"
                className="batches-view-button active"
              >
                <List
                  size={17}
                  strokeWidth={1.8}
                  aria-hidden="true"
                />
                <span>Table</span>
              </button>

              <button
                type="button"
                className="batches-view-button"
              >
                <LayoutGrid
                  size={17}
                  strokeWidth={1.8}
                  aria-hidden="true"
                />
                <span>Board</span>
              </button>

            </div>

          </div>

          <div className="operational-data-toolbar">

            <label className="operational-data-search">

              <Search
                size={17}
                strokeWidth={1.8}
                aria-hidden="true"
              />

              <input
                type="text"
                placeholder={searchPlaceholder}
                aria-label={searchPlaceholder}
              />

            </label>

            <label className="operational-data-filter">

              <Filter
                size={16}
                strokeWidth={1.8}
                aria-hidden="true"
              />

              <select
                defaultValue="all"
                aria-label="Filter status"
              >
                <option value="all">
                  {filterLabel}
                </option>
                <option value="active">
                  Active
                </option>
                <option value="pending">
                  Pending
                </option>
                <option value="completed">
                  Completed
                </option>
                <option value="hold">
                  On Hold
                </option>
              </select>

              <ChevronDown
                size={15}
                strokeWidth={1.8}
                aria-hidden="true"
              />

            </label>

            <button
              type="button"
              className="operational-data-date"
            >
              <CalendarDays
                size={16}
                strokeWidth={1.8}
                aria-hidden="true"
              />
              <span>Date Range</span>
              <ChevronDown
                size={15}
                strokeWidth={1.8}
                aria-hidden="true"
              />
            </button>

            <button
              type="button"
              className="commander-button commander-button-secondary operational-data-refresh"
            >
              <RefreshCw
                size={16}
                strokeWidth={1.8}
                aria-hidden="true"
              />
              <span>Refresh</span>
            </button>

          </div>

          {children}

          {rows.length > 0 ? (

            <div className="operational-data-table-wrapper">

              <table className="operational-data-table">

                <thead>
                  <tr>
                    {columns.map((column) => (
                      <th key={column.key}>
                        {column.label}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {rows.map((row, index) => (
                    <tr key={index}>
                      {columns.map((column) => (
                        <td key={column.key}>
                          {row[column.key]}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>

              </table>

            </div>

          ) : (

            <div className="empty-state operational-data-empty-state">

              <div className="empty-state-icon">
                <CircleHelp
                  size={28}
                  strokeWidth={1.7}
                  aria-hidden="true"
                />
              </div>

              <h3>{emptyTitle}</h3>

              <p>{emptyDescription}</p>

              {actionLabel && (
                <button
                  type="button"
                  className="commander-button commander-button-primary"
                >
                  <Plus
                    size={16}
                    strokeWidth={2}
                    aria-hidden="true"
                  />
                  <span>{actionLabel}</span>
                </button>
              )}

            </div>

          )}

        </section>

      </main>
    </CommanderShell>
  );
}
