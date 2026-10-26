"use client";

import { useCallback, useEffect, useState } from "react";
import { Sidebar, Topbar } from "./Commander";

type ApiState =
  | "loading"
  | "connected"
  | "error";

type CommanderShellProps = {
  children: React.ReactNode;
};

type DashboardSummaryResponse = {
  data?: {
    alerts?: {
      open?: number | null;
      critical?: number | null;
    };
  };
};

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ||
  "http://localhost:8093";

function getStoredToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  const keys = [
    "tiaki_access_token",
    "access_token",
    "accessToken",
    "token",
    "auth_token",
    "jwt",
  ];

  for (const key of keys) {
    const value = window.localStorage.getItem(key);

    if (value) {
      return value;
    }
  }

  for (const key of keys) {
    const value = window.sessionStorage.getItem(key);

    if (value) {
      return value;
    }
  }

  return null;
}

export default function CommanderShell({
  children,
}: CommanderShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const [apiState, setApiState] =
    useState<ApiState>("loading");

  const [alertCount, setAlertCount] =
    useState(0);

  const checkHealth = useCallback(async () => {
    setApiState("loading");

    try {
      const response = await fetch(
        `${API_BASE}/health`,
        {
          method: "GET",
          cache: "no-store",
        },
      );

      if (!response.ok) {
        throw new Error(
          `Health check failed: ${response.status}`,
        );
      }

      setApiState("connected");
    } catch {
      setApiState("error");
    }
  }, []);

  const fetchAlertCount = useCallback(async () => {
    const token = getStoredToken();

    if (!token) {
      setAlertCount(0);
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE}/api/v1/dashboard/summary`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          credentials: "include",
          cache: "no-store",
        },
      );

      if (!response.ok) {
        if (
          response.status === 401 ||
          response.status === 403
        ) {
          setAlertCount(0);
        }

        return;
      }

      const payload =
        (await response.json()) as DashboardSummaryResponse;

      const openAlerts =
        payload.data?.alerts?.open ?? 0;

      setAlertCount(
        Number.isFinite(openAlerts)
          ? Math.max(0, Number(openAlerts))
          : 0,
      );
    } catch {
      setAlertCount(0);
    }
  }, []);

  const refreshCommanderState = useCallback(async () => {
    await Promise.all([
      checkHealth(),
      fetchAlertCount(),
    ]);
  }, [checkHealth, fetchAlertCount]);

  useEffect(() => {
    void refreshCommanderState();

    const interval = window.setInterval(() => {
      void refreshCommanderState();
    }, 30000);

    return () => {
      window.clearInterval(interval);
    };
  }, [refreshCommanderState]);

  return (
    <div className="commander-shell">
      <Sidebar
        mobileOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
        alertCount={alertCount}
      />

      <main className="main-area">
        <Topbar
          onMenu={() => setMobileOpen(true)}
          apiState={apiState}
          onRefresh={refreshCommanderState}
          alertCount={alertCount}
        />

        {children}
      </main>
    </div>
  );
}
