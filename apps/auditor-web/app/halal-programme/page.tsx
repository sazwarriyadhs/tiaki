import { WorkflowPage } from "@/components/common/WorkflowPage";

export default function HalalProgrammePage() {
  return (
    <WorkflowPage
      eyebrow="Assurance"
      title="Halal Programme Review"
      description="Review halal programme requirements, controls, materials, suppliers, processes and critical points."
      action="New Review"
      items={[
        {
          id: "HP-2026-001",
          title: "Halal Assurance Programme",
          subtitle: "PT Example Indonesia · 86% complete",
          status: "IN REVIEW",
          statusType: "info"
        },
        {
          id: "HP-2026-002",
          title: "Material Control Programme",
          subtitle: "PT Nusantara Foods · 72% complete",
          status: "FIELDWORK",
          statusType: "warning"
        },
        {
          id: "HP-2026-003",
          title: "Supplier Assurance",
          subtitle: "PT Agro Prima · 94% complete",
          status: "READY",
          statusType: "success"
        }
      ]}
    />
  );
}
