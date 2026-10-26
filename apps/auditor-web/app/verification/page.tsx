import { FileCheck2 } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";

export default function VerificationPage() {
  return (
    <div className="module-page">
      <PageHeader
        eyebrow="Assurance"
        title="Verification"
        description="Review corrective-action evidence and record acceptance or rejection."
        icon={FileCheck2}
      />

      <div className="commander-card">
        <div className="empty-state">
          <FileCheck2 />
          <h3>Verification queue ready</h3>
          <p>
            Submitted corrective-action evidence will be available
            for auditor verification.
          </p>
        </div>
      </div>
    </div>
  );
}
