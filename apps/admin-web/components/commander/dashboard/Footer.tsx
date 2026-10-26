"use client";
import type { ApiState } from "./types";
import { Activity, Database, Thermometer } from "lucide-react";

export function Footer({
  apiState,
}: {
  apiState: ApiState;
}) {
  return (
    <footer className="commander-footer">
      <div className="footer-brand">
        <span className="system-dot" />

        <strong>TIAKI Commander</strong>

        <span>
          {apiState === "connected"
            ? "System Operational"
            : apiState === "loading"
              ? "Connecting"
              : "API Attention Required"}
        </span>
      </div>

      <div className="footer-status">
        <span>
          <Activity
            size={13}
            aria-hidden="true"
          />
          API :8093
        </span>

        <span>
          <Database
            size={13}
            aria-hidden="true"
          />
          PostgreSQL 17
        </span>

        <span>
          <Thermometer
            size={13}
            aria-hidden="true"
          />
          NZ / Pacific-Auckland
        </span>
      </div>
    </footer>
  );
}
