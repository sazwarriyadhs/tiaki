"use client";

import {
  Activity,
  AlertTriangle,
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  FileCheck2,
  FileSearch,
  GitBranch,
  ShieldCheck,
  Target,
} from "lucide-react";
import { useEffect, useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";

type Overview = {
  assessments: number;
  open_findings: number;
  critical_findings: number;
  evidence: number;
  documents: number;
  open_capa: number;
  pending_capa_verification: number;
  active_certificates: number;
  activity: number;
  traceability_breaks: number;
  ai_risk_assessments: number;
};

type ApiResponse = {
  data: Overview;
  meta: {
    status: string;
  };
};

function getToken() {
  if (typeof window === "undefined") return "";

  return (
    localStorage.getItem("tiaki_access_token") ||
    sessionStorage.getItem("tiaki_access_token") ||
    ""
  );
}

async function loadOverview(): Promise<ApiResponse> {
  const token = getToken();

  if (!token) {
    throw new Error("No Auditor access token found");
  }

  const response = await fetch(
    `${
      process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8093"
    }/api/v1/auditor/overview`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
      cache: "no-store",
    }
  );

  if (!response.ok) {
    const body = await response.text();

    throw new Error(
      `Auditor API ${response.status}: ${
        body || response.statusText
      }`
    );
  }

  return response.json();
}

function Metric({
  icon: Icon,
  label,
  value,
  meta,
}: {
  icon: typeof ShieldCheck;
  label: string;
  value: string | number;
  meta: string;
}) {
  return (
    <article className="auditor-kpi">
      <div className="auditor-kpi-icon">
        <Icon size={17} strokeWidth={1.8} />
      </div>

      <div className="auditor-kpi-label">{label}</div>

      <div className="auditor-kpi-value">{value}</div>

      <div className="auditor-kpi-meta">{meta}</div>
    </article>
  );
}

export default function AuditorDashboardPage() {
  const [data, setData] = useState<Overview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    loadOverview()
      .then((response) => {
        if (!active) return;
        setData(response.data);
      })
      .catch((err) => {
        if (!active) return;

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load Auditor data"
        );
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const attention =
    data &&
    (data.critical_findings > 0 ||
      data.traceability_breaks > 0);

  const date = new Intl.DateTimeFormat("en-NZ", {
    weekday: "long",
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "Pacific/Auckland",
  }).format(new Date());

  const time = new Intl.DateTimeFormat("en-NZ", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Pacific/Auckland",
  }).format(new Date());

  return (
    <>
      <section className="auditor-hero">
        <div className="auditor-hero-copy">
          <div className="auditor-eyebrow">
            <span />
            NEW ZEALAND · HALAL ASSURANCE
          </div>

          <h1>Good Morning, Auditor</h1>

          <p>
            Halal audit and assurance command workspace.
            Monitor assessments, evidence, findings,
            corrective actions and traceability from one
            place.
          </p>

          <div className="auditor-hero-date">
            <CalendarDays size={15} />
            <span>
              {date} · {time} NZ
            </span>
          </div>
        </div>

        <div className="auditor-system-card">
          <div className="auditor-system-label">
            SYSTEM STATUS
          </div>

          <div className="auditor-system-status">
            <span
              className={
                attention
                  ? "auditor-status-dot warning"
                  : "auditor-status-dot"
              }
            />

            {loading
              ? "Connecting"
              : attention
                ? "Attention Required"
                : "Operational"}
          </div>

          <div className="auditor-system-grid">
            <div>
              <span>API</span>
              <strong>
                {loading
                  ? "Connecting"
                  : error
                    ? "Attention"
                    : "Connected"}
              </strong>
            </div>

            <div>
              <span>DATABASE</span>
              <strong>PostgreSQL 17</strong>
            </div>

            <div>
              <span>REGION</span>
              <strong>NZ · Pacific/Auckland</strong>
            </div>
          </div>
        </div>
      </section>

      {error && (
        <div className="auditor-api-alert">
          <AlertTriangle size={17} />

          <div>
            <strong>Auditor API unavailable</strong>
            <span>{error}</span>
          </div>
        </div>
      )}

      <section className="auditor-kpi-grid">
        <Metric
          icon={ClipboardCheck}
          label="ASSESSMENTS"
          value={loading ? "—" : data?.assessments ?? 0}
          meta="Compliance assessments"
        />

        <Metric
          icon={AlertTriangle}
          label="OPEN FINDINGS"
          value={loading ? "—" : data?.open_findings ?? 0}
          meta={
            loading
              ? "Loading"
              : `${data?.critical_findings ?? 0} critical findings`
          }
        />

        <Metric
          icon={FileSearch}
          label="EVIDENCE"
          value={loading ? "—" : data?.evidence ?? 0}
          meta={
            loading
              ? "Loading"
              : `${data?.documents ?? 0} supporting documents`
          }
        />

        <Metric
          icon={ShieldCheck}
          label="ASSURANCE STATUS"
          value={
            loading
              ? "—"
              : attention
                ? "Attention"
                : "Operational"
          }
          meta={
            loading
              ? "Loading"
              : `${data?.active_certificates ?? 0} active certificates`
          }
        />

        <Metric
          icon={Target}
          label="OPEN CAPA"
          value={loading ? "—" : data?.open_capa ?? 0}
          meta="Corrective actions"
        />

        <Metric
          icon={CheckCircle2}
          label="CAPA VERIFICATION"
          value={
            loading
              ? "—"
              : data?.pending_capa_verification ?? 0
          }
          meta="Pending verification"
        />

        <Metric
          icon={GitBranch}
          label="TRACEABILITY"
          value={
            loading
              ? "—"
              : data?.traceability_breaks ?? 0
          }
          meta="Open traceability breaks"
        />

        <Metric
          icon={Activity}
          label="AI RISK ASSESSMENTS"
          value={
            loading
              ? "—"
              : data?.ai_risk_assessments ?? 0
          }
          meta="Risk intelligence"
        />
      </section>

      <section className="auditor-content-grid">
        <article className="auditor-panel">
          <div className="auditor-panel-header">
            <div>
              <div className="auditor-panel-eyebrow">
                AUDIT WORKSPACE
              </div>

              <h2>Assurance Overview</h2>
            </div>

            <ShieldCheck size={19} />
          </div>

          <div className="auditor-overview-list">
            <div>
              <span>Open CAPA</span>
              <strong>
                {loading ? "—" : data?.open_capa ?? 0}
              </strong>
            </div>

            <div>
              <span>Pending CAPA Verification</span>
              <strong>
                {loading
                  ? "—"
                  : data?.pending_capa_verification ?? 0}
              </strong>
            </div>

            <div>
              <span>Traceability Breaks</span>
              <strong>
                {loading
                  ? "—"
                  : data?.traceability_breaks ?? 0}
              </strong>
            </div>

            <div>
              <span>AI Risk Assessments</span>
              <strong>
                {loading
                  ? "—"
                  : data?.ai_risk_assessments ?? 0}
              </strong>
            </div>
          </div>
        </article>

        <article className="auditor-panel">
          <div className="auditor-panel-header">
            <div>
              <div className="auditor-panel-eyebrow">
                SYSTEM ACTIVITY
              </div>

              <h2>Recent Activity</h2>
            </div>

            <Activity size={19} />
          </div>

          <div className="auditor-empty">
            <FileCheck2 size={28} />

            <strong>
              {loading
                ? "Loading activity"
                : data?.activity
                  ? `${data.activity} activity records`
                  : "No audit activity yet"}
            </strong>

            <span>
              Auditor activity will appear here as
              assessments, evidence, findings and
              verification actions are recorded.
            </span>
          </div>
        </article>
      </section>

      <section className="auditor-quick-actions">
        <div className="auditor-panel-header">
          <div>
            <div className="auditor-panel-eyebrow">
              QUICK ACTIONS
            </div>

            <h2>Auditor Workspace</h2>
          </div>
        </div>

        <div className="auditor-action-grid">
          <a href="/audits">
            <ClipboardCheck size={18} />
            <span>
              <strong>Audits</strong>
              <small>Review assurance assessments</small>
            </span>
          </a>

          <a href="/evidence">
            <FileSearch size={18} />
            <span>
              <strong>Evidence</strong>
              <small>Review submitted evidence</small>
            </span>
          </a>

          <a href="/findings">
            <AlertTriangle size={18} />
            <span>
              <strong>Findings</strong>
              <small>Manage audit findings</small>
            </span>
          </a>

          <a href="/verification">
            <ShieldCheck size={18} />
            <span>
              <strong>Verification</strong>
              <small>Verify corrective actions</small>
            </span>
          </a>
        </div>
      </section>

      <footer className="auditor-footer">
        <div className="auditor-footer-brand">
          <span className="auditor-footer-dot" />
          <strong>TIAKI Auditor</strong>
          <span>
            {error
              ? "API Attention Required"
              : "System Operational"}
          </span>
        </div>

        <div className="auditor-footer-status">
          <span>
            <Activity size={12} />
            API :8093
          </span>

          <span>
            <ShieldCheck size={12} />
            Halal Assurance
          </span>

          <span>
            <GitBranch size={12} />
            NZ / Pacific-Auckland
          </span>
        </div>
      </footer>
    </>
  );
}
