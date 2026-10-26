import { FileSearch } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";

export default function EvidencePage() {
  return (
    <div className="module-page">
      <PageHeader
        eyebrow="Assurance"
        title="Evidence Review"
        description="Review documents, photos, certificates, records and interview evidence."
        icon={FileSearch}
      />

      <div className="commander-card">
        <div className="empty-state">
          <FileSearch />
          <h3>Evidence workspace ready</h3>
          <p>
            Evidence packages will appear here for auditor review,
            validation and traceability.
          </p>
        </div>
      </div>
    </div>
  );
}
