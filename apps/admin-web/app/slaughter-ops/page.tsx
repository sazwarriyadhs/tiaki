"use client";

import {
  Activity,
  Beef,
  ClipboardCheck,
  Clock3,
  Users,
} from "lucide-react";

import OperationalModuleFrame from "@/components/commander/OperationalModuleFrame";

export default function SlaughterOpsPage() {
  return (
    <OperationalModuleFrame
      eyebrow="HALAL OPERATIONS"
      title="Slaughter Ops"
      description="Monitor slaughter operations, operator activity, sessions and halal control checkpoints."
      actionLabel="Start Session"
      searchPlaceholder="Search slaughter session..."
      filterLabel="All Sessions"
      metrics={[
        {
          label: "Active Sessions",
          value: "0",
          description: "Slaughter sessions in progress",
          icon: <Activity size={20} />,
        },
        {
          label: "Animals",
          value: "0",
          description: "Animals processed",
          icon: <Beef size={20} />,
        },
        {
          label: "Operators",
          value: "0",
          description: "Registered slaughter operators",
          icon: <Users size={20} />,
        },
        {
          label: "Controls",
          value: "0",
          description: "Halal control checkpoints",
          icon: <ClipboardCheck size={20} />,
        },
      ]}
      columns={[
        { key: "session", label: "Session" },
        { key: "facility", label: "Facility" },
        { key: "operator", label: "Operator" },
        { key: "animals", label: "Animals" },
        { key: "status", label: "Status" },
      ]}
      emptyTitle="No slaughter sessions"
      emptyDescription="Active slaughter sessions and halal control records will appear here."
    />
  );
}
