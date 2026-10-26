"use client";

import {
  Activity,
  AlertTriangle,
  BarChart3,
  Bell,
  Camera,
  CheckCircle2,
  ClipboardCheck,
  Database,
  FileCheck2,
  Gauge,
  Package,
  Settings,
  ShieldCheck,
  Thermometer,
  Users,
  Wifi,
  Wrench,
  type LucideIcon,
} from "lucide-react";

import CommanderShell from "./CommanderShell";

type ModuleMetric = {
  label: string;
  value: string;
  detail: string;
  icon: LucideIcon;
};

type ModuleRow = {
  title: string;
  detail: string;
  status?: string;
};

type Props = {
  children?: React.ReactNode;
  title: string;
  eyebrow?: string;
  description: string;
  icon: LucideIcon;
  metrics?: ModuleMetric[];
  rows?: ModuleRow[];
  emptyTitle?: string;
  emptyDescription?: string;
  actionLabel?: string;
};

function MetricCard({ item }: { item: ModuleMetric }) {
  const Icon = item.icon;

  return (
    <div
      style={{
        background: "#ffffff",
        border: "1px solid #e5e7eb",
        borderRadius: 16,
        padding: 20,
        minHeight: 142,
        boxShadow: "0 1px 3px rgba(15,23,42,.04)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 18,
        }}
      >
        <span
          style={{
            width: 40,
            height: 40,
            borderRadius: 12,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#ecfdf5",
            color: "#047857",
          }}
        >
          <Icon size={19} />
        </span>

        <span
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: "#cbd5e1",
          }}
        />
      </div>

      <div
        style={{
          fontSize: 28,
          lineHeight: 1,
          fontWeight: 800,
          color: "#0f172a",
        }}
      >
        {item.value}
      </div>

      <div
        style={{
          marginTop: 8,
          fontSize: 13,
          fontWeight: 700,
          color: "#334155",
        }}
      >
        {item.label}
      </div>

      <div
        style={{
          marginTop: 4,
          fontSize: 12,
          color: "#94a3b8",
        }}
      >
        {item.detail}
      </div>
    </div>
  );
}

function EmptyPanel({
  title,
  description,
  actionLabel,
  icon: Icon,
}: {
  title: string;
  description: string;
  actionLabel?: string;
  icon: LucideIcon;
}) {
  return (
    <div
      style={{
        background: "#ffffff",
        border: "1px solid #e5e7eb",
        borderRadius: 18,
        minHeight: 280,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 32,
      }}
    >
      <div style={{ textAlign: "center", maxWidth: 480 }}>
        <div
          style={{
            width: 58,
            height: 58,
            margin: "0 auto 18px",
            borderRadius: 16,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#f0fdf4",
            color: "#047857",
          }}
        >
          <Icon size={27} />
        </div>

        <h3
          style={{
            margin: 0,
            fontSize: 17,
            fontWeight: 800,
            color: "#0f172a",
          }}
        >
          {title}
        </h3>

        <p
          style={{
            margin: "9px auto 0",
            fontSize: 13,
            lineHeight: 1.7,
            color: "#64748b",
          }}
        >
          {description}
        </p>

        {actionLabel && (
          <button
            type="button"
            style={{
              marginTop: 20,
              border: "1px solid #047857",
              background: "#047857",
              color: "#ffffff",
              borderRadius: 10,
              padding: "10px 16px",
              fontSize: 12,
              fontWeight: 800,
              cursor: "pointer",
            }}
          >
            + {actionLabel}
          </button>
        )}
      </div>
    </div>
  );
}

export default function EnterpriseModulePage({
  title,
  eyebrow = "TIAKI COMMANDER",
  description,
  icon: PageIcon,
  metrics,
  rows = [],
  emptyTitle,
  emptyDescription,
  actionLabel,
}: Props) {
  return (
    <CommanderShell>
      <main className="page">
        <section
          style={{
            marginBottom: 24,
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 24,
            flexWrap: "wrap",
          }}
        >
          <div style={{ display: "flex", gap: 15, alignItems: "flex-start" }}>
            <div
              style={{
                width: 48,
                height: 48,
                flex: "0 0 auto",
                borderRadius: 14,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "#ecfdf5",
                color: "#047857",
                border: "1px solid #d1fae5",
              }}
            >
              <PageIcon size={23} />
            </div>

            <div>
              <div
                style={{
                  fontSize: 10,
                  letterSpacing: ".12em",
                  fontWeight: 800,
                  color: "#059669",
                  marginBottom: 6,
                }}
              >
                {eyebrow}
              </div>

              <h1
                style={{
                  margin: 0,
                  fontSize: 28,
                  lineHeight: 1.15,
                  fontWeight: 850,
                  color: "#0f172a",
                }}
              >
                {title}
              </h1>

              <p
                style={{
                  margin: "8px 0 0",
                  maxWidth: 760,
                  fontSize: 13,
                  lineHeight: 1.7,
                  color: "#64748b",
                }}
              >
                {description}
              </p>
            </div>
          </div>

          <div
            style={{
              border: "1px solid #e2e8f0",
              borderRadius: 10,
              background: "#ffffff",
              padding: "9px 12px",
              fontSize: 11,
              fontWeight: 700,
              color: "#64748b",
            }}
          >
            API READY · NO LIVE DATA
          </div>
        </section>

        <section
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
            gap: 14,
            marginBottom: 20,
          }}
        >
          {(metrics ?? []).map((item) => (
            <MetricCard key={item.label} item={item} />
          ))}
        </section>

        <section
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
            marginBottom: 12,
            flexWrap: "wrap",
          }}
        >
          <div>
            <h2
              style={{
                margin: 0,
                fontSize: 16,
                fontWeight: 800,
                color: "#0f172a",
              }}
            >
              Operational Data
            </h2>

            <div
              style={{
                marginTop: 3,
                fontSize: 12,
                color: "#94a3b8",
              }}
            >
              Live data will appear here when the corresponding API is connected.
            </div>
          </div>

          <div style={{ display: "flex", gap: 8 }}>
            <button
              type="button"
              style={{
                border: "1px solid #e2e8f0",
                background: "#ffffff",
                borderRadius: 9,
                padding: "8px 12px",
                color: "#475569",
                fontSize: 11,
                fontWeight: 700,
              }}
            >
              Filter
            </button>

            <button
              type="button"
              style={{
                border: "1px solid #d1fae5",
                background: "#ecfdf5",
                borderRadius: 9,
                padding: "8px 12px",
                color: "#047857",
                fontSize: 11,
                fontWeight: 800,
              }}
            >
              Refresh
            </button>
          </div>
        </section>

        {rows.length > 0 ? (
          <section
            style={{
              background: "#ffffff",
              border: "1px solid #e5e7eb",
              borderRadius: 18,
              overflow: "hidden",
            }}
          >
            {rows.map((row, index) => (
              <div
                key={row.title}
                style={{
                  padding: "16px 20px",
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 20,
                  borderBottom:
                    index === rows.length - 1
                      ? "none"
                      : "1px solid #f1f5f9",
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 800,
                      color: "#0f172a",
                    }}
                  >
                    {row.title}
                  </div>

                  <div
                    style={{
                      marginTop: 4,
                      fontSize: 12,
                      color: "#64748b",
                    }}
                  >
                    {row.detail}
                  </div>
                </div>

                {row.status && (
                  <span
                    style={{
                      alignSelf: "center",
                      borderRadius: 999,
                      padding: "5px 9px",
                      background: "#f1f5f9",
                      color: "#64748b",
                      fontSize: 10,
                      fontWeight: 800,
                    }}
                  >
                    {row.status}
                  </span>
                )}
              </div>
            ))}
          </section>
        ) : (
          <EmptyPanel
            icon={PageIcon}
            title={emptyTitle ?? "No data available"}
            description={emptyDescription ?? "Operational data will appear here when available."}
            actionLabel={actionLabel}
          />
        )}
      </main>
    </CommanderShell>
  );
}
