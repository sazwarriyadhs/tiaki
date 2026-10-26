# TIAKI Mobile

## Purpose

TIAKI Mobile is the field auditor client for the TIAKI Halal Assurance
& Audit Intelligence Platform.

The first commercial target is a FIANZ-ready auditor workflow.

## Product boundary

Mobile is a field execution client.

It does not make certification decisions.

Certification governance remains in the TIAKI assurance workflow.

## Core workflow

Application
→ Audit Planning
→ Document Review
→ Site Audit
→ Checklist
→ Evidence
→ Findings
→ Corrective Action
→ Verification
→ Audit Report
→ Certification Governance
→ Surveillance

## Architecture

### app

Application bootstrap, routing and theme.

### core

Cross-cutting infrastructure:

- API client
- Authentication
- Network state
- Secure storage
- Offline storage
- Synchronisation
- Security

### features

Business capabilities:

- Authentication
- Dashboard
- Audits
- Audit Checklist
- Premises
- Documents
- Evidence
- Findings
- Corrective Actions
- Verification
- Traceability
- Audit Report
- Notifications
- Profile

## Field-first principles

1. Real TIAKI API only.
2. No production mock data.
3. Offline-capable audit execution.
4. Evidence must remain traceable to an audit.
5. Findings must remain traceable to evidence.
6. Corrective actions must remain traceable to findings.
7. Synchronisation must be observable and recoverable.
8. Auditor identity and organisation scope must be preserved.
9. Mobile must never bypass backend authorization.
10. Certification decisions remain outside field execution.

## Initial targets

- Android
- Web

Future targets may include iOS.
