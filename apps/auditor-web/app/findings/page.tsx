import { Target } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";

export default function FindingsPage() {
  return (
    <div className="module-page">
      <PageHeader
        eyebrow="Assurance"
        title="Findings"
        description="Classify and manage audit findings by severity, requirement and evidence."
        icon={Target}
      />

      <div className="commander-card">
        <div className="empty-state">
          <Target />
          <h3>Findings workspace ready</h3>
          <p>
            Critical, major and minor findings will be tracked
            through their complete lifecycle.
          </p>
        </div>
      </div>
    </div>
  );
}
