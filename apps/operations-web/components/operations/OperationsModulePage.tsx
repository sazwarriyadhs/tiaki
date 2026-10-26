"use client";

import {
  Activity,
  RefreshCw,
  Search,
} from "lucide-react";

import { OperationsShell } from "@/components/layout/OperationsShell";

type OperationsModulePageProps = {
  title: string;
  description: string;
};

export default function OperationalModulePage({
  title,
  description,
}: OperationsModulePageProps) {
  return (
    <OperationsShell>
      <main className="page operational-module-page">

        <section className="commander-hero operational-module-hero">
          <div className="hero-copy">
            <div className="eyebrow">
              TIAKI OPERATIONS
            </div>

            <h1>{title}</h1>

            <p>{description}</p>
          </div>

          <div className="hero-system operational-module-action">
            <span className="hero-system-label">
              System Status
            </span>

            <strong>
              API READY · NO LIVE DATA
            </strong>
          </div>
        </section>

        <section className="kpi-grid operational-module-kpis">

          <article className="commander-kpi">
            <div className="kpi-icon">
              <Activity size={18} />
            </div>

            <div className="commander-kpi-label">
              Records
            </div>

            <div className="commander-kpi-value">
              —
            </div>

            <div className="commander-kpi-meta">
              Awaiting live API data
            </div>
          </article>

          <article className="commander-kpi">
            <div className="kpi-icon">
              <Activity size={18} />
            </div>

            <div className="commander-kpi-label">
              Active
            </div>

            <div className="commander-kpi-value">
              —
            </div>

            <div className="commander-kpi-meta">
              Awaiting live API data
            </div>
          </article>

          <article className="commander-kpi">
            <div className="kpi-icon">
              <Activity size={18} />
            </div>

            <div className="commander-kpi-label">
              Exceptions
            </div>

            <div className="commander-kpi-value">
              —
            </div>

            <div className="commander-kpi-meta">
              Awaiting live API data
            </div>
          </article>

          <article className="commander-kpi">
            <div className="kpi-icon">
              <Activity size={18} />
            </div>

            <div className="commander-kpi-label">
              Status
            </div>

            <div className="commander-kpi-value">
              READY
            </div>

            <div className="commander-kpi-meta">
              Connected to TIAKI API
            </div>
          </article>

        </section>

        <section className="card operational-data-card">

          <div className="operational-data-header">

            <div>
              <h2>{title} Data</h2>

              <p>
                Live operational records for this workspace.
              </p>
            </div>

            <div>
              <button
                type="button"
                className="commander-button commander-button-secondary"
                disabled
              >
                <RefreshCw size={16} />
                Refresh
              </button>
            </div>

          </div>

          <div className="operational-data-filter-bar">

            <div className="operational-data-toolbar">

              <div className="operational-data-search">
                <Search size={16} />

                <input
                  type="search"
                  placeholder={`Search ${title.toLowerCase()}...`}
                  aria-label={`Search ${title}`}
                  disabled
                />
              </div>

              <select
                className="operational-data-filter-select"
                disabled
                defaultValue=""
                aria-label="Filter"
              >
                <option value="">
                  All records
                </option>
              </select>

              <button
                type="button"
                className="commander-button commander-button-secondary"
                disabled
              >
                Refresh
              </button>

            </div>

          </div>

          <div className="operational-data-table-wrapper">

            <table className="operational-data-table">

              <thead>
                <tr>
                  <th>ID</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Updated</th>
                </tr>
              </thead>

              <tbody>
              </tbody>

            </table>

          </div>

          <div className="operational-data-empty-state">

            <div className="empty-state-icon">
              <Activity size={22} />
            </div>

            <h3>
              No live data
            </h3>

            <p>
              This workspace is ready for the Operations API.
              No fabricated operational records are displayed.
            </p>

          </div>

        </section>

      </main>
    </OperationsShell>
  );
}
