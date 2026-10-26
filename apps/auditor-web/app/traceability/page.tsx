import { GitBranch } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";

export default function TraceabilityPage() {
  return (
    <div className="module-page">
      <PageHeader
        eyebrow="Investigation"
        title="Traceability"
        description="Investigate relationships between suppliers, materials, processes, products and evidence."
        icon={GitBranch}
      />

      <div className="commander-card">
        <div className="empty-state">
          <GitBranch />
          <h3>Traceability workspace ready</h3>
          <p>
            Traceability investigations will connect operational
            records and assurance evidence.
          </p>
        </div>
      </div>
    </div>
  );
}
