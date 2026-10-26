"use client";

import {
  BellRing,
  Database,
  Globe2,
  LockKeyhole,
  Settings2,
  ShieldCheck,
} from "lucide-react";

import OperationalModuleFrame from "@/components/commander/OperationalModuleFrame";

export default function SettingsPage() {
  return (
    <OperationalModuleFrame
      eyebrow="ADMINISTRATION"
      title="Settings"
      description="Configure platform behaviour, organisation settings, security and operational preferences."
      actionLabel="Create Configuration"
      searchPlaceholder="Search settings..."
      filterLabel="All Settings"
      metrics={[
        {
          label: "Configurations",
          value: "0",
          description: "Configured platform settings",
          icon: <Settings2 size={20} />,
        },
        {
          label: "Security",
          value: "0",
          description: "Security controls configured",
          icon: <LockKeyhole size={20} />,
        },
        {
          label: "Notifications",
          value: "0",
          description: "Notification rules configured",
          icon: <BellRing size={20} />,
        },
        {
          label: "Integrations",
          value: "0",
          description: "Configured platform integrations",
          icon: <Globe2 size={20} />,
        },
      ]}
      columns={[
        { key: "setting", label: "Setting" },
        { key: "category", label: "Category" },
        { key: "value", label: "Value" },
        { key: "status", label: "Status" },
        { key: "updated", label: "Updated" },
      ]}
      emptyTitle="No configurable records"
      emptyDescription="Platform configuration records will appear here as settings are configured."
    />
  );
}
