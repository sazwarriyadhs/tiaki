export const kpis = [
  {
    label: "ACTIVE AUDITS",
    value: "08",
    meta: "2 scheduled this week",
    icon: "◫"
  },
  {
    label: "EVIDENCE PENDING",
    value: "23",
    meta: "7 require review",
    icon: "◈"
  },
  {
    label: "OPEN FINDINGS",
    value: "14",
    meta: "2 critical",
    icon: "!"
  },
  {
    label: "VERIFICATION QUEUE",
    value: "07",
    meta: "2 overdue",
    icon: "✓"
  }
];

export const findings = [
  {
    id: "FIND-2026-0047",
    class: "NC",
    title: "Material certificate missing",
    programme: "HALAL-001",
    owner: "QA",
    due: "03 Oct 2026",
    status: "OPEN",
    severity: "critical"
  },
  {
    id: "FIND-2026-0046",
    class: "NC",
    title: "Supplier verification incomplete",
    programme: "HALAL-001",
    owner: "Purchasing",
    due: "05 Oct 2026",
    status: "OPEN",
    severity: "high"
  },
  {
    id: "FIND-2026-0045",
    class: "OBS",
    title: "Record inconsistency",
    programme: "HALAL-002",
    owner: "Production",
    due: "08 Oct 2026",
    status: "REVIEW",
    severity: "warning"
  },
  {
    id: "FIND-2026-0044",
    class: "NC",
    title: "Traceability record gap",
    programme: "HALAL-003",
    owner: "Warehouse",
    due: "10 Oct 2026",
    status: "OPEN",
    severity: "high"
  }
];

export const activities = [
  ["Evidence uploaded", "access-review.pdf", "14:32"],
  ["Finding created", "FIND-2026-0047", "13:51"],
  ["Corrective action submitted", "CA-2026-0019", "13:20"],
  ["Trace investigation opened", "TRACE-2026-0007", "12:47"],
  ["Verification completed", "VER-2026-0011", "11:36"]
];

export const audits = [
  {
    id: "AUD-2026-0024",
    name: "Halal Assurance Programme Review",
    organization: "PT Example Indonesia",
    lead: "Lead Auditor",
    period: "01 Sep 2026 — 30 Sep 2026",
    status: "IN PROGRESS",
    progress: 82
  },
  {
    id: "AUD-2026-0023",
    name: "Supplier & Material Assurance Audit",
    organization: "PT Nusantara Foods",
    lead: "Senior Auditor",
    period: "15 Sep 2026 — 05 Oct 2026",
    status: "FIELDWORK",
    progress: 61
  },
  {
    id: "AUD-2026-0022",
    name: "Traceability System Assessment",
    organization: "PT Agro Prima",
    lead: "Lead Auditor",
    period: "01 Sep 2026 — 20 Sep 2026",
    status: "REVIEW",
    progress: 91
  }
];
