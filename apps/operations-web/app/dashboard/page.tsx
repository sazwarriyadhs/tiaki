import {
  Activity,
  AlertTriangle,
  ClipboardCheck,
  Factory,
  Package,
  RefreshCw,
} from "lucide-react";

import { OperationsShell } from "@/components/layout/OperationsShell";

const kpis = [
  {
    label: "Animals Received",
    value: "—",
    meta: "Awaiting live API data",
    icon: <Activity size={18} />,
  },
  {
    label: "Slaughter Completed",
    value: "—",
    meta: "Awaiting live API data",
    icon: <ClipboardCheck size={18} />,
  },
  {
    label: "Carcass Processed",
    value: "—",
    meta: "Awaiting live API data",
    icon: <Factory size={18} />,
  },
  {
    label: "Meat Batches",
    value: "—",
    meta: "Awaiting live API data",
    icon: <Package size={18} />,
  },
];

const flow = [
  "Animal Intake",
  "Ante-Mortem",
  "Slaughter",
  "Post-Mortem",
  "Carcass",
  "Cutting",
  "Meat Batch",
  "Release",
];

export default function DashboardPage() {
  return (
    <OperationsShell>
      <main className="page">

        <section className="commander-hero">
          <div className="hero-copy">
            <div className="eyebrow">
              TIAKI OPERATIONS
            </div>

            <h1>
              Operations Command Center
            </h1>

            <p>
              Daily RPH operational overview from animal intake
              through slaughter, processing, traceability and release.
            </p>
          </div>

          <div className="hero-system">
            <span className="hero-system-label">
              System Status
            </span>

            <strong>
              API READY · NO LIVE DATA
            </strong>
          </div>
        </section>

        <section className="kpi-grid">

          {kpis.map((kpi) => (
            <article
              className="commander-kpi"
              key={kpi.label}
            >
              <div className="kpi-icon">
                {kpi.icon}
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
          ))}

        </section>

        <section className="card operational-data-card">

          <div className="operational-data-header">

            <div>
              <h2>
                Production Flow
              </h2>

              <p>
                Operational lifecycle from animal intake to released
                meat batch.
              </p>
            </div>

            <button
              type="button"
              className="commander-button commander-button-secondary"
              disabled
            >
              <RefreshCw size={16} />
              Refresh
            </button>

          </div>

          <div className="operational-data-table-wrapper">

            <table className="operational-data-table">

              <thead>
                <tr>
                  <th>Stage</th>
                  <th>Records</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {flow.map((stage) => (
                  <tr key={stage}>
                    <td>{stage}</td>

                    <td>—</td>

                    <td>
                      <span className="status-badge">
                        NO LIVE DATA
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>

            </table>

          </div>

        </section>

        <section className="kpi-grid">

          <article className="card">

            <div className="panel-header">
              <div>
                <h2 className="panel-title">
                  Active Exceptions
                </h2>

                <p className="panel-subtitle">
                  Operational exceptions requiring review.
                </p>
              </div>
            </div>

            <div className="operational-data-empty-state">

              <div className="empty-state-icon">
                <AlertTriangle size={22} />
              </div>

              <h3>
                No live exception data
              </h3>

              <p>
                Exception records will appear here when connected
                to the verified Operations API.
              </p>

            </div>

          </article>

          <article className="card">

            <div className="panel-header">
              <div>
                <h2 className="panel-title">
                  Recent Operations
                </h2>

                <p className="panel-subtitle">
                  Latest operational activities.
                </p>
              </div>
            </div>

            <div className="operational-data-empty-state">

              <div className="empty-state-icon">
                <Activity size={22} />
              </div>

              <h3>
                No live operation data
              </h3>

              <p>
                Recent activities will appear here after a verified
                Operations API endpoint is connected.
              </p>

            </div>

          </article>

        </section>

      </main>
    </OperationsShell>
  );
}
