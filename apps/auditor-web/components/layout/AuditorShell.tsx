"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  Bell,
  Building2,
  ChevronDown,
  ClipboardCheck,
  FileCheck2,
  FileClock,
  FileSearch,
  Gavel,
  GitBranch,
  LayoutDashboard,
  Menu,
  RefreshCw,
  Search,
  Settings,
  ShieldCheck,
  X,
} from "lucide-react";
import {
  useMemo,
  useState,
  type ComponentType,
  type ReactNode,
} from "react";

type IconType = ComponentType<{
  size?: number;
  strokeWidth?: number;
  className?: string;
  "aria-hidden"?: boolean;
}>;

type NavItem = {
  label: string;
  href: string;
  icon: IconType;
};

type NavGroup = {
  title: string;
  items: NavItem[];
};

const navGroups: NavGroup[] = [
  {
    title: "Auditor",
    items: [
      {
        label: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
      },
      {
        label: "Audits",
        href: "/audits",
        icon: ClipboardCheck,
      },
      {
        label: "Evidence",
        href: "/evidence",
        icon: FileCheck2,
      },
      {
        label: "Findings",
        href: "/findings",
        icon: FileSearch,
      },
      {
        label: "Corrective Actions",
        href: "/corrective-actions",
        icon: Gavel,
      },
      {
        label: "Verification",
        href: "/verification",
        icon: ShieldCheck,
      },
      {
        label: "Traceability",
        href: "/traceability",
        icon: GitBranch,
      },
      {
        label: "Audit Trail",
        href: "/audit-trail",
        icon: FileClock,
      },
    ],
  },
  {
    title: "Operations",
    items: [
      {
        label: "Facilities",
        href: "/facilities",
        icon: Building2,
      },
      {
        label: "Slaughter Sessions",
        href: "/slaughter-sessions",
        icon: Activity,
      },
    ],
  },
  {
    title: "System",
    items: [
      {
        label: "Notifications",
        href: "/notifications",
        icon: Bell,
      },
      {
        label: "Settings",
        href: "/settings",
        icon: Settings,
      },
    ],
  },
];

function Logo() {
  return (
    <Link
      href="/dashboard"
      className="commander-logo-wrap"
      aria-label="TIAKI Auditor Dashboard"
    >
      <img
        src="/logo.png"
        alt="TIAKI — Halal Slaughter Intelligence"
        width={180}
        className="commander-logo"
      />
    </Link>
  );
}

export function Sidebar({
  mobileOpen,
  onClose,
}: {
  mobileOpen: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();

  const groups = useMemo(() => navGroups, []);

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
            aria-label="Auditor navigation"
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
                      pathname === item.href ||
                      (item.href !== "/dashboard" &&
                        pathname.startsWith(
                          `${item.href}/`,
                        ));

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
                          />
                        </span>

                        <span className="nav-text">
                          {item.label}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>

          <div className="sidebar-user">
            <div className="sidebar-user-avatar">
              AU
            </div>

            <div className="sidebar-user-copy">
              <div className="sidebar-user-name">
                Auditor
              </div>

              <div className="sidebar-user-role">
                TIAKI Assurance
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
  onRefresh,
}: {
  onMenu: () => void;
  onRefresh?: () => void;
}) {
  const [query, setQuery] = useState("");

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
          placeholder="Search audits, facilities, findings..."
          aria-label="Search Auditor workspace"
        />
      </div>

      <div className="topbar-spacer" />

      <div
        className="topbar-demo-context"
        aria-label="Auditor workspace context"
      >
        <span className="topbar-demo-badge">
          AUDITOR
        </span>

        <span className="topbar-demo-region">
          NZ · Pacific/Auckland
        </span>
      </div>

      <button
        type="button"
        className="topbar-icon-button"
        aria-label="Refresh Auditor workspace"
        title="Refresh Auditor workspace"
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
      </button>
    </header>
  );
}

export function AuditorShell({
  children,
  onRefresh,
}: {
  children: ReactNode;
  onRefresh?: () => void;
}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  /*
   * Login is intentionally isolated from the application shell.
   */
  if (pathname === "/login") {
    return <>{children}</>;
  }

  return (
    <div className="commander-shell">
      <Sidebar
        mobileOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
      />

      <main className="main-area">
        <Topbar
          onMenu={() => setMobileOpen(true)}
          onRefresh={onRefresh}
        />

        <div className="page">
          {children}
        </div>
      </main>
    </div>
  );
}

export default AuditorShell;
