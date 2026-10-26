# API Integration

Do not hard-code backend endpoints into UI components.

Recommended future structure:

lib/
  api.ts
  auth.ts
  permissions.ts

services/
  audit.service.ts
  evidence.service.ts
  finding.service.ts
  corrective-action.service.ts
  verification.service.ts
  traceability.service.ts
  audit-trail.service.ts

API integration should be implemented after the TIAKI backend service contracts are confirmed.
