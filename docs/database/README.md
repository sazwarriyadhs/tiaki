# TIAKI production database baseline

46 ordered migrations for NZ-first halal slaughter intelligence.

- Migration state: `public.schema_migrations`
- Tenant/operational data: `app`
- Reference data: `ref`
- Immutable audit records: `audit`
- Runner verifies SHA-256 checksums before skipping an applied migration.
- Seed is reference-only and does not assert legal, halal, veterinary or regulatory approval.
- Do not run `docker compose down -v` on the TIAKI stack.
