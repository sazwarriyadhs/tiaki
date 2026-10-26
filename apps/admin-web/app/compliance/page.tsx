"use client";

import {
  BadgeCheck,
  ClipboardCheck,
  FileCheck2,
  ShieldCheck,
  TriangleAlert,
} from "lucide-react";

import OperationalModuleFrame from "@/components/commander/OperationalModuleFrame";

export default function CompliancePage() {
  return (
    <OperationalModuleFrame
      eyebrow="HALAL GOVERNANCE"
      title="Compliance"
      description="Track halal controls, compliance requirements, findings and verification status."
      actionLabel="New Compliance Check"
      searchPlaceholder="Search compliance record..."
      filterLabel="All Compliance Status"
      metrics={[
        {
          label: "Compliance Checks",
          value: "0",
          description: "Recorded compliance checks",
          icon: <ClipboardCheck size={20} />,
        },
        {
          label: "Passed",
          value: "0",
          description: "Checks passed",
          icon: <BadgeCheck size={20} />,
        },
        {
          label: "Findings",
          value: "0",
          description: "Open compliance findings",
          icon: <TriangleAlert size={20} />,
        },
        {
          label: "Verified",
          value: "0",
          description: "Verified halal controls",
          icon: <ShieldCheck size={20} />,
        },
      ]}
      columns={[
        { key: "check", label: "Compliance Check" },
        { key: "facility", label: "Facility" },
        { key: "standard", label: "Standard" },
        { key: "status", label: "Status" },
        { key: "date", label: "Date" },
      ]}
      emptyTitle="No compliance records"
      emptyDescription="Compliance checks and halal verification records will appear here."
    />
  );
}
