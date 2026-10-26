"use client";

import {
  Activity,
  AlertTriangle,
  BarChart3,
  Bell,
  CalendarDays,
  Camera,
  CheckCircle2,
  ChevronDown,
  ClipboardCheck,
  Database,
  FileCheck2,
  Gauge,
  LayoutDashboard,
  Menu,
  Package,
  RefreshCw,
  Search,
  Settings,
  ShieldCheck,
  Snowflake,
  Thermometer,
  Users,
  Video,
  Wifi,
  X,
  Zap,
} from "lucide-react";

import Link from "next/link";
import type {
  ApiState,
  DashboardResponse,
  DashboardSummary,
} from "./dashboard/types";
import { KPIGrid } from "./dashboard/KPIGrid";
import { Hero } from "./dashboard/Hero";
import { Footer } from "./dashboard/Footer";
import { LiveMonitoring } from "./dashboard/LiveMonitoring";
import { usePathname } from "next/navigation";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  formatNumber,
  formatPercent,
  formatQuantity,
  formatTemperature,
  getColdChainMeta,
} from "./dashboard/helpers";

type IconType = typeof LayoutDashboard;

type NavItem = {
  label: string;
  icon: IconType;
  href: string;
  badge?: string;
};

type NavGroup = {
  title: string;
  items: NavItem[];
};

const navGroups: NavGroup[] = [
  {
    title: "COMMAND CENTER",
    items: [
      { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
      { label: "Live Monitor", icon: Activity, href: "/live-monitor" },
      { label: "Batches", icon: Package, href: "/batches" },
      { label: "Alerts", icon: AlertTriangle, href: "/alerts" },
    ],
  },
  {
    title: "OPERATIONS",
    items: [
      { label: "Slaughter Ops", icon: ClipboardCheck, href: "/slaughter-ops" },
      { label: "Compliance", icon: ShieldCheck, href: "/compliance" },
      { label: "Analytics", icon: BarChart3, href: "/analytics" },
    ],
  },
  {
    title: "QUALITY & CONTROL",
    items: [
      { label: "Equipment / IoT", icon: Gauge, href: "/equipment-iot" },
      { label: "CCTV & Media", icon: Video, href: "/cctv-media" },
    ],
  },
  {
    title: "ADMINISTRATION",
    items: [
      { label: "Users & Roles", icon: Users, href: "/users-roles" },
      { label: "Settings", icon: Settings, href: "/settings" },
    ],
  },
];


const API_BASE =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ||
  "http://localhost:8093";

function getStoredToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  const storageKeys = [
    "tiaki_access_token",
    "access_token",
    "accessToken",
    "token",
    "auth_token",
    "jwt",
  ];

  for (const key of storageKeys) {
    const localValue = window.localStorage.getItem(key);

    if (localValue) {
      return localValue;
    }

    const sessionValue = window.sessionStorage.getItem(key);

    if (sessionValue) {
      return sessionValue;
    }
  }

  const cookieNames = [
    "tiaki_access_token",
    "access_token",
    "accessToken",
    "token",
    "auth_token",
    "jwt",
  ];

  const cookies = document.cookie
    .split(";")
    .map((item) => item.trim());

  for (const name of cookieNames) {
    const prefix = `${name}=`;
    const cookie = cookies.find((item) =>
      item.startsWith(prefix)
    );

    if (cookie) {
      return decodeURIComponent(cookie.slice(prefix.length));
    }
  }

  return null;
}


function Logo() {
  return (
    <div className="commander-logo-wrap">
      <img
        src="/logo.png"
        alt="TIAKI — Halal Slaughter Intelligence"
        width={180}
        className="commander-logo"
      />
    </div>
  );
}

export function Sidebar({
  mobileOpen,
  onClose,
  alertCount,
}: {
  mobileOpen: boolean;
  onClose: () => void;
  alertCount: number;
}) {
  const pathname = usePathname();

  const groups = useMemo(
    () =>
      navGroups.map((group) => ({
        ...group,
        items: group.items.map((item) =>
          item.label === "Alerts"
            ? {
                ...item,
                badge:
                  alertCount > 0
                    ? String(alertCount)
                    : undefined,
              }
            : item,
        ),
      })),
    [alertCount],
  );

  return (
    <>
      {mobileOpen && (
        <button
          type="button"
          className="sidebar-overlay"
          aria-label="Close navigation"
          onClick={onClose}
        />
      )}

      <aside
        className={`sidebar ${
          mobileOpen ? "sidebar-mobile-open" : ""
        }`}
      >
        <div className="sidebar-inner">
          <div className="sidebar-header">
            <Logo />

            <button
              type="button"
              className="mobile-close"
              onClick={onClose}
              aria-label="Close navigation"
            >
              <X size={19} aria-hidden="true" />
            </button>
          </div>

          <nav
            className="sidebar-nav"
            aria-label="Primary navigation"
          >
            {groups.map((group) => (
              <div
                className="nav-group"
                key={group.title}
              >
                <div className="nav-section-title">
                  {group.title}
                </div>

                <div className="nav-items">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const active =
                      pathname === item.href;

                    return (
                      <Link
                        href={item.href}
                        key={item.label}
                        className={`commander-nav-item ${
                          active ? "active" : ""
                        }`}
                        aria-current={
                          active ? "page" : undefined
                        }
                        onClick={onClose}
                      >
                        <span
                          className="nav-icon"
                          aria-hidden="true"
                        >
                          <Icon
                            size={18}
                            strokeWidth={1.8}
                            focusable="false"
                          />
                        </span>

                        <span className="nav-text">
                          {item.label}
                        </span>

                        {item.badge && (
                          <span
                            className="nav-badge"
                            aria-label={`${item.badge} alerts`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>

          <div className="sidebar-user">
            <div className="sidebar-user-avatar">
              TC
            </div>

            <div className="sidebar-user-copy">
              <div className="sidebar-user-name">
                Commander
              </div>

              <div className="sidebar-user-role">
                TIAKI Operations
              </div>
            </div>

            <button
              type="button"
              className="sidebar-user-menu"
              aria-label="Account menu"
            >
              <ChevronDown
                size={16}
                aria-hidden="true"
              />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

export function Topbar({
  onMenu,
  apiState,
  onRefresh,
  alertCount = 0,
}: {
  onMenu: () => void;
  apiState: ApiState;
  onRefresh: () => void;
  alertCount?: number;
}) {
  const [query, setQuery] = useState("");

  const statusLabel =
    apiState === "connected"
      ? "Connected"
      : apiState === "loading"
        ? "Connecting"
        : "Unavailable";

  return (
    <header className="topbar">
      <div className="topbar-mobile-menu">
        <button
          type="button"
          className="icon-button"
          onClick={onMenu}
          aria-label="Open navigation"
        >
          <Menu size={20} aria-hidden="true" />
        </button>
      </div>

      <div className="topbar-search">
        <Search
          size={17}
          aria-hidden="true"
          className="topbar-search-icon"
        />

        <input
          value={query}
          onChange={(event) =>
            setQuery(event.target.value)
          }
          placeholder="Search animals, batches, sessions..."
          aria-label="Search"
        />
      </div>

      <div className="topbar-spacer" />



      <button
        type="button"
        className="topbar-icon-button"
        aria-label="Refresh dashboard"
        title="Refresh dashboard"
        onClick={onRefresh}
      >
        <RefreshCw
          size={18}
          aria-hidden="true"
        />
      </button>

      <button
        type="button"
        className="topbar-icon-button"
        aria-label="Notifications"
      >
        <Bell size={18} aria-hidden="true" />
        {alertCount > 0 && (
          <span
            className="notification-dot"
            aria-label={`${alertCount} active alerts`}
          />
        )}
      </button>

    </header>
  );
}


function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  onAction,
  href,
}: {
  icon: IconType;
  title: string;
  description: string;
  action?: string;
  onAction?: () => void;
  href?: string;
}) {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">
        <Icon
          size={22}
          strokeWidth={1.7}
          aria-hidden="true"
        />
      </div>

      <div className="empty-state-title">
        {title}
      </div>

      <div className="empty-state-description">
        {description}
      </div>

      {action && href ? (
        <Link
          href={href}
          className="empty-state-action"
        >
          {action}
        </Link>
      ) : action ? (
        <button
          type="button"
          className="empty-state-action"
          onClick={onAction}
        >
          {action}
        </button>
      ) : null}
    </div>
  );
}


function CompliancePanel({
  summary,
}: {
  summary: DashboardSummary | null;
}) {
  if (!summary) {
    return (
      <section className="card commander-panel">
        <div className="panel-header">
          <div>
            <div className="panel-title">
              Halal Compliance
            </div>

            <div className="panel-subtitle">
              Current control status
            </div>
          </div>

          <ShieldCheck
            size={19}
            className="panel-header-icon"
            aria-hidden="true"
          />
        </div>

        <EmptyState
          icon={ShieldCheck}
          title="Waiting for compliance data"
          description="The dashboard will display halal control results when the API returns operational records."
        />
      </section>
    );
  }

  const checks =
    summary.halal.checks_today;

  const pass =
    summary.halal.pass;

  const fail =
    summary.halal.fail;

  const pending =
    summary.halal.pending;

  return (
    <section className="card commander-panel">
      <div className="panel-header">
        <div>
          <div className="panel-title">
            Halal Compliance
          </div>

          <div className="panel-subtitle">
            Today&apos;s control checks
          </div>
        </div>

        <ShieldCheck
          size={19}
          className="panel-header-icon"
          aria-hidden="true"
        />
      </div>

      <div className="compliance-empty">
        <div className="compliance-score">
          {formatPercent(
            summary.halal
              .compliance_rate,
          )}
        </div>

        <div className="compliance-label">
          Current compliance rate
        </div>

        <div className="compliance-description">
          {checks === 0
            ? "No halal control checks have been recorded today."
            : `${formatNumber(
                checks,
              )} halal control checks recorded today.`}
        </div>

        <div className="compliance-divider" />

        <div className="compliance-row">
          <div className="compliance-row-icon">
            <CheckCircle2
              size={15}
              aria-hidden="true"
            />
          </div>

          <span>Passed</span>

          <small>
            {formatNumber(pass)}
          </small>
        </div>

        <div className="compliance-row">
          <div className="compliance-row-icon">
            <AlertTriangle
              size={15}
              aria-hidden="true"
            />
          </div>

          <span>Failed</span>

          <small>
            {formatNumber(fail)}
          </small>
        </div>

        <div className="compliance-row">
          <div className="compliance-row-icon">
            <ClipboardCheck
              size={15}
              aria-hidden="true"
            />
          </div>

          <span>Pending</span>

          <small>
            {formatNumber(pending)}
          </small>
        </div>
      </div>
    </section>
  );
}

function AlertsPanel({
  summary,
}: {
  summary: DashboardSummary | null;
}) {
  const open =
    summary?.alerts.open ?? 0;

  const critical =
    summary?.alerts.critical ?? 0;

  return (
    <section className="card commander-panel">
      <div className="panel-header">
        <div>
          <div className="panel-title">
            Alerts & Notifications
          </div>

          <div className="panel-subtitle">
            Latest operational signals
          </div>
        </div>

        <Link
          href="/alerts"
          className="panel-link"
        >
          View All
        </Link>
      </div>

      {summary === null ? (
        <EmptyState
          icon={AlertTriangle}
          title="Waiting for alert data"
          description="Alert information will appear here after the dashboard API responds."
        />
      ) : open === 0 ? (
        <EmptyState
          icon={CheckCircle2}
          title="No active alerts"
          description="There are currently no open operational alerts recorded."
        />
      ) : (
        <div className="empty-table">
          <div className="empty-table-icon">
            <AlertTriangle
              size={20}
              aria-hidden="true"
            />
          </div>

          <div className="empty-table-title">
            {formatNumber(open)} open alert
            {open === 1 ? "" : "s"}
          </div>

          <div className="empty-table-description">
            {formatNumber(
              critical,
            )} critical alert
            {critical === 1 ? "" : "s"} require
            attention.
          </div>
        </div>
      )}
    </section>
  );
}

function SessionsPanel({
  summary,
}: {
  summary: DashboardSummary | null;
}) {
  const active =
    summary?.operations.active_sessions ?? 0;

  const planned =
    summary?.operations.planned_today ?? 0;

  return (
    <section className="card commander-panel sessions-panel">
      <div className="panel-header">
        <div>
          <div className="panel-title">
            Today&apos;s Slaughter Sessions
          </div>

          <div className="panel-subtitle">
            Operational schedule status
          </div>
        </div>

        <Link
          href="/slaughter-ops"
          className="panel-link"
        >
          View All
        </Link>
      </div>

      {summary === null ? (
        <EmptyState
          icon={ClipboardCheck}
          title="Waiting for schedule data"
          description="Session status will appear after the dashboard API responds."
        />
      ) : (
        <div className="empty-table">
          <div className="empty-table-icon">
            <ClipboardCheck
              size={20}
              aria-hidden="true"
            />
          </div>

          <div className="empty-table-title">
            {active === 0
              ? "No active sessions"
              : `${formatNumber(active)} active session${active === 1 ? "" : "s"}`}
          </div>

          <div className="empty-table-description">
            {formatNumber(
              planned,
            )} session
            {planned === 1 ? "" : "s"} planned today.
          </div>
        </div>
      )}
    </section>
  );
}

function ThroughputPanel({
  summary,
}: {
  summary: DashboardSummary | null;
}) {
  return (
    <section className="card commander-panel">
      <div className="panel-header">
        <div>
          <div className="panel-title">
            Production & Throughput
          </div>

          <div className="panel-subtitle">
            Today&apos;s production snapshot
          </div>
        </div>

        <BarChart3
          size={19}
          className="panel-header-icon"
          aria-hidden="true"
        />
      </div>

      {summary === null ? (
        <div className="chart-empty">
          <div className="chart-empty-message">
            <BarChart3
              size={21}
              aria-hidden="true"
            />

            <span>
              Waiting for production data
            </span>
          </div>
        </div>
      ) : (
        <div className="chart-empty">
          <div className="chart-empty-grid">
            {[1, 2, 3, 4, 5, 6].map(
              (item) => (
                <span key={item} />
              ),
            )}
          </div>

          <div className="chart-empty-message">
            <BarChart3
              size={21}
              aria-hidden="true"
            />

            <span>
              {formatNumber(
                summary.operations
                  .slaughtered_today,
              )} slaughtered ·{" "}
              {formatQuantity(
                summary.meat_production
                  .quantity_today,
                summary.meat_production
                  .unit || "kg",
              )} produced
            </span>
          </div>
        </div>
      )}
    </section>
  );
}

function RecentActivity() {
  return (
    <section className="card commander-panel">
      <div className="panel-header">
        <div>
          <div className="panel-title">
            Recent Activity
          </div>

          <div className="panel-subtitle">
            Operational event stream
          </div>
        </div>

        <Link
          href="/analytics"
          className="panel-link"
        >
          View All
        </Link>
      </div>

      <EmptyState
        icon={FileCheck2}
        title="No recent activity"
        description="Operational events will appear here as batches, slaughter, compliance and traceability activity is recorded."
      />
    </section>
  );
}

function QuickActions() {
  const actions = [
    [Package, "New Batch", "/batches"],
    [
      CalendarDays,
      "Schedule Session",
      "/slaughter-ops",
    ],
    [
      ClipboardCheck,
      "Compliance Check",
      "/compliance",
    ],
    [BarChart3, "View Reports", "/analytics"],
    [Users, "Manage Users", "/users-roles"],
    [
      Zap,
      "Equipment Health",
      "/equipment-iot",
    ],
  ] as const;

  return (
    <section className="card quick-actions">
      <div className="panel-header">
        <div>
          <div className="panel-title">
            Quick Actions
          </div>

          <div className="panel-subtitle">
            Common Commander operations
          </div>
        </div>
      </div>

      <div className="quick-action-grid">
        {actions.map(
          ([Icon, label, href]) => (
            <Link
              href={href}
              className="quick-action"
              key={label}
            >
              <span className="quick-action-icon">
                <Icon
                  size={18}
                  strokeWidth={1.8}
                  aria-hidden="true"
                />
              </span>

              <span>{label}</span>
            </Link>
          ),
        )}
      </div>
    </section>
  );
}


export default function Commander() {
  const [mobileOpen, setMobileOpen] =
    useState(false);

  const [summary, setSummary] =
    useState<DashboardSummary | null>(null);

  const [apiState, setApiState] =
    useState<ApiState>("loading");

  const [error, setError] =
    useState<string | null>(null);

  const fetchDashboard =
    useCallback(async () => {
      setApiState("loading");
      setError(null);

      try {
        const token =
          getStoredToken();

        const headers: HeadersInit = {
          Accept: "application/json",
        };

        if (token) {
          headers.Authorization =
            token.startsWith("Bearer ")
              ? token
              : `Bearer ${token}`;
        }

        const response =
          await fetch(
            `${API_BASE}/api/v1/dashboard/summary`,
            {
              method: "GET",
              headers,
              credentials: "include",
              cache: "no-store",
            },
          );

        if (!response.ok) {
          let message =
            `Dashboard API returned HTTP ${response.status}`;

          try {
            const body =
              await response.json();

            if (
              body?.message &&
              typeof body.message === "string"
            ) {
              message = body.message;
            }

            if (
              body?.error &&
              typeof body.error === "string"
            ) {
              message = body.error;
            }
          } catch {
            // Keep HTTP fallback message.
          }

          throw new Error(message);
        }

        const payload =
          (await response.json()) as DashboardResponse;

        if (
          !payload ||
          !payload.data
        ) {
          throw new Error(
            "Dashboard API returned an invalid response.",
          );
        }

        setSummary(payload.data);
        setApiState("connected");
      } catch (requestError) {
        console.error(
          "TIAKI dashboard request failed:",
          requestError,
        );

        setApiState("error");

        setError(
          requestError instanceof Error
            ? requestError.message
            : "Unable to connect to the dashboard API.",
        );
      }
    }, []);

  useEffect(() => {
    void fetchDashboard();

    const timer =
      window.setInterval(
        () => {
          void fetchDashboard();
        },
        30_000,
      );

    return () =>
      window.clearInterval(timer);
  }, [fetchDashboard]);

  const alertCount =
    summary?.alerts.open ?? 0;

  return (
    <div className="commander-shell">
      <Sidebar
        mobileOpen={mobileOpen}
        onClose={() =>
          setMobileOpen(false)
        }
        alertCount={alertCount}
      />

      <main className="main-area">
        <Topbar
          onMenu={() =>
            setMobileOpen(true)
          }
          apiState={apiState}
          alertCount={alertCount}
          onRefresh={() =>
            void fetchDashboard()
          }
        />

        <div className="page">
          <Hero
            apiState={apiState}
          />

          {error && (
            <section
              className="card commander-panel"
              role="alert"
            >
              <div className="panel-header">
                <div>
                  <div className="panel-title">
                    Commander connection issue
                  </div>

                  <div className="panel-subtitle">
                    The latest operational summary could not be retrieved.
                  </div>
                </div>

                <AlertTriangle
                  size={19}
                  className="panel-header-icon"
                  aria-hidden="true"
                />
              </div>

              <div className="empty-state">
                <div className="empty-state-icon">
                  <AlertTriangle
                    size={22}
                    strokeWidth={1.7}
                    aria-hidden="true"
                  />
                </div>

                <div className="empty-state-title">
                  {error}
                </div>

                <div className="empty-state-description">
                  Check that the TIAKI API is running on
                  port 8093 and that your Commander session
                  is authenticated.
                </div>

                <button
                  type="button"
                  className="empty-state-action"
                  onClick={() =>
                    void fetchDashboard()
                  }
                >
                  Retry
                </button>
              </div>
            </section>
          )}

          <KPIGrid
            summary={summary}
            loading={apiState === "loading"}
          />

          <div className="dashboard-grid-main">
            <LiveMonitoring />

            <CompliancePanel
              summary={summary}
            />

            <AlertsPanel
              summary={summary}
            />
          </div>

          <div className="dashboard-grid-bottom">
            <SessionsPanel
              summary={summary}
            />

            <ThroughputPanel
              summary={summary}
            />

            <RecentActivity />
          </div>

          <QuickActions />

          <Footer
            apiState={apiState}
          />
        </div>
      </main>
    </div>
  );
}
