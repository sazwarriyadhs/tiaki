"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Activity,
  AlertTriangle,
  BarChart3,
  ClipboardCheck,
  ClipboardList,
  FileCheck2,
  FileText,
  LayoutDashboard,
  Menu,
  RefreshCw,
  Settings,
  ShieldCheck,
  Tags,
  Truck,
  Users,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

type ApiState = "loading" | "connected" | "error";

type OperationsShellProps = {
  children: React.ReactNode;
};

type NavItem = {
  label: string;
  href: string;
  icon: React.ReactNode;
};

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ||
  "http://localhost:8093";

const navigation: {
  title: string;
  items: NavItem[];
}[] = [
  {
    title: "Operations",
    items: [
      {
        label: "Dashboard",
        href: "/dashboard",
        icon: <LayoutDashboard size={18} />,
      },
      {
        label: "Animal Intake",
        href: "/animal-intake",
        icon: <Truck size={18} />,
      },
      {
        label: "Animal Batches",
        href: "/animal-batches",
        icon: <Tags size={18} />,
      },
      {
        label: "Ante-Mortem",
        href: "/ante-mortem",
        icon: <ClipboardCheck size={18} />,
      },
      {
        label: "Slaughter Schedule",
        href: "/slaughter-schedule",
        icon: <ClipboardList size={18} />,
      },
      {
        label: "Halal Slaughter",
        href: "/halal-slaughter",
        icon: <ShieldCheck size={18} />,
      },
      {
        label: "Stunning",
        href: "/stunning",
        icon: <Activity size={18} />,
      },
      {
        label: "Post-Mortem",
        href: "/post-mortem",
        icon: <ClipboardCheck size={18} />,
      },
      {
        label: "Carcass",
        href: "/carcass",
        icon: <FileCheck2 size={18} />,
      },
      {
        label: "Cutting",
        href: "/cutting",
        icon: <Activity size={18} />,
      },
      {
        label: "Meat Batches",
        href: "/meat-batches",
        icon: <Tags size={18} />,
      },
    ],
  },
  {
    title: "Control",
    items: [
      {
        label: "Exceptions",
        href: "/exceptions",
        icon: <AlertTriangle size={18} />,
      },
      {
        label: "Evidence",
        href: "/evidence",
        icon: <FileCheck2 size={18} />,
      },
      {
        label: "Traceability",
        href: "/traceability",
        icon: <BarChart3 size={18} />,
      },
      {
        label: "Operations Log",
        href: "/operations-log",
        icon: <FileText size={18} />,
      },
      {
        label: "Reports",
        href: "/reports",
        icon: <BarChart3 size={18} />,
      },
    ],
  },
];

function isActive(pathname: string, href: string) {
  if (href === "/dashboard") {
    return pathname === "/dashboard" || pathname === "/";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function OperationsShell({
  children,
}: OperationsShellProps) {
  const pathname = usePathname();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [apiState, setApiState] = useState<ApiState>("loading");

  const checkHealth = useCallback(async () => {
    setApiState("loading");

    try {
      const response = await fetch(`${API_BASE}/health`, {
        method: "GET",
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error(`Health check failed: ${response.status}`);
      }

      setApiState("connected");
    } catch {
      setApiState("error");
    }
  }, []);

  useEffect(() => {
    void checkHealth();

    const interval = window.setInterval(() => {
      void checkHealth();
    }, 30000);

    return () => window.clearInterval(interval);
  }, [checkHealth]);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const statusLabel =
    apiState === "connected"
      ? "Connected"
      : apiState === "error"
        ? "Unavailable"
        : "Connecting";

  return (
    <div className="commander-shell">
      {mobileOpen && (
        <button
          type="button"
          className="sidebar-overlay"
          aria-label="Close navigation"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside className={`sidebar ${mobileOpen ? "mobile-open" : ""}`}>
        <div className="sidebar-inner">
          <div className="sidebar-header">
            <Link href="/dashboard" className="commander-logo-link">
              <Image
                src="/logo.png"
                alt="TIAKI — Halal Slaughter Intelligence"
                width={180}
                height={52}
                className="commander-logo"
                priority
              />
            </Link>

            <button
              type="button"
              className="mobile-close"
              aria-label="Close navigation"
              onClick={() => setMobileOpen(false)}
            >
              <X size={20} />
            </button>
          </div>

          <nav className="sidebar-nav">
            {navigation.map((section) => (
              <div className="nav-group" key={section.title}>
                <div className="nav-section-title">
                  {section.title}
                </div>

                <div className="nav-items">
                  {section.items.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`commander-nav-item ${
                        isActive(pathname, item.href) ? "active" : ""
                      }`}
                    >
                      <span>{item.icon}</span>
                      <span className="nav-text">
                        {item.label}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </nav>

          <div className="sidebar-user">
            <div className="sidebar-user-avatar">OP</div>

            <div className="sidebar-user-copy">
              <div className="sidebar-user-name">
                Operator
              </div>
              <div className="sidebar-user-role">
                TIAKI Operations
              </div>
            </div>

            <button
              type="button"
              className="sidebar-user-menu"
              aria-label="Operations user settings"
              title="User settings"
            >
              <Settings size={17} />
            </button>
          </div>
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <button
            type="button"
            className="topbar-mobile-menu icon-button"
            aria-label="Open navigation"
            onClick={() => setMobileOpen(true)}
          >
            <Menu size={20} />
          </button>

          <div className="topbar-search">
            <Activity
              size={18}
              className="topbar-search-icon"
            />

            <input
              type="search"
              placeholder="Search animals, batches, sessions..."
              aria-label="Search operations"
            />
          </div>

          <div className="topbar-spacer" />

          <div className="topbar-location">
            <div className="topbar-location-icon">
              <Activity size={16} />
            </div>

            <div>
              <div className="topbar-location-name">
                TIAKI Operations
                <span className="country-code">NZ</span>
              </div>

              <div className="topbar-location-sub">
                {statusLabel}
              </div>
            </div>
          </div>

          <button
            type="button"
            className="topbar-icon-button icon-button"
            aria-label="Refresh API status"
            title="Refresh"
            onClick={() => void checkHealth()}
          >
            <RefreshCw size={18} />
          </button>
        </header>

        {children}
      </main>
    </div>
  );
}

export default OperationsShell;
