import { Activity } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";

export default function AuditTrailPage() {
  return (
    <div className="module-page">
      <PageHeader
        eyebrow="Governance"
        title="Audit Trail"
        description="Immutable activity history for assurance and traceability workflows."
        icon={Activity}
      />

      <div className="commander-card">
        <div className="empty-state">
          <Activity />
          <h3>Audit trail workspace ready</h3>
          <p>
            System events, review actions, verification decisions
            and traceability changes will be recorded here.
          </p>
        </div>
      </div>
    </div>
  );
}
