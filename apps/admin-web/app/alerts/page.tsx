"use client";

import {
  AlertTriangle,
  BellRing,
  CheckCircle2,
  Clock3,
  ShieldAlert,
} from "lucide-react";

import OperationalModuleFrame from "@/components/commander/OperationalModuleFrame";

export default function AlertsPage() {
  return (
    <OperationalModuleFrame
      eyebrow="COMMAND CENTER"
      title="Alerts"
      description="Monitor operational, halal, quality and safety alerts requiring attention."
      actionLabel="Create Alert Rule"
      searchPlaceholder="Search alerts..."
      filterLabel="All Alert Status"
      metrics={[
        {
          label: "Total Alerts",
          value: "0",
          description: "Recorded alert events",
          icon: <BellRing size={20} />,
        },
        {
          label: "Critical",
          value: "0",
          description: "Critical alerts requiring action",
          icon: <ShieldAlert size={20} />,
        },
        {
          label: "Open",
          value: "0",
          description: "Alerts awaiting resolution",
          icon: <AlertTriangle size={20} />,
        },
        {
          label: "Resolved",
          value: "0",
          description: "Resolved alert events",
          icon: <CheckCircle2 size={20} />,
        },
      ]}
      columns={[
        { key: "alert", label: "Alert" },
        { key: "severity", label: "Severity" },
        { key: "source", label: "Source" },
        { key: "status", label: "Status" },
        { key: "time", label: "Detected" },
      ]}
      emptyTitle="No alerts recorded"
      emptyDescription="Operational alerts will appear here when monitoring sources generate actionable events."
    />
  );
}
