"use client";

import {
  Activity,
  BarChart3,
  Database,
  Gauge,
  TrendingUp,
} from "lucide-react";

import OperationalModuleFrame from "@/components/commander/OperationalModuleFrame";

export default function AnalyticsPage() {
  return (
    <OperationalModuleFrame
      eyebrow="COMMAND INTELLIGENCE"
      title="Analytics"
      description="Analyse operational performance, production activity, compliance and quality indicators."
      actionLabel="Create Report"
      searchPlaceholder="Search analytics..."
      filterLabel="All Metrics"
      metrics={[
        {
          label: "Data Points",
          value: "0",
          description: "Available operational records",
          icon: <Database size={20} />,
        },
        {
          label: "KPIs",
          value: "0",
          description: "Configured performance indicators",
          icon: <Gauge size={20} />,
        },
        {
          label: "Trends",
          value: "0",
          description: "Tracked operational trends",
          icon: <TrendingUp size={20} />,
        },
        {
          label: "Reports",
          value: "0",
          description: "Generated analytics reports",
          icon: <BarChart3 size={20} />,
        },
      ]}
      columns={[
        { key: "metric", label: "Metric" },
        { key: "category", label: "Category" },
        { key: "value", label: "Value" },
        { key: "trend", label: "Trend" },
        { key: "updated", label: "Updated" },
      ]}
      emptyTitle="No analytics data"
      emptyDescription="Operational data will populate analytics once production and monitoring records are available."
    />
  );
}
