import { ListChecks } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";

export default function CorrectiveActionsPage() {
  return (
    <div className="module-page">
      <PageHeader
        eyebrow="Assurance"
        title="Corrective Actions"
        description="Track root cause, action owner, due date and implementation evidence."
        icon={ListChecks}
      />

      <div className="commander-card">
        <div className="empty-state">
          <ListChecks />
          <h3>Corrective action workspace ready</h3>
          <p>
            Corrective actions will move from finding assignment
            through implementation and verification.
          </p>
        </div>
      </div>
    </div>
  );
}
