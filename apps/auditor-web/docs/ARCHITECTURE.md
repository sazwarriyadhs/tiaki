# TIAKI Auditor Web Architecture

## Purpose

Frontend workspace for TIAKI audit and assurance operations.

## Core workflow

Audit
  -> Halal Programme Review
  -> Evidence Review
  -> Finding
  -> Corrective Action
  -> Verification
  -> Audit Trail

Traceability is a parallel assurance workflow:

Product
  -> Batch/Lot
  -> Process
  -> Material
  -> Supplier
  -> Evidence

## Frontend principles

1. Auditor remains the decision authority.
2. Evidence must be traceable to audit/control/finding context.
3. Finding changes must be auditable.
4. Corrective action must have ownership and due date.
5. Verification must be explicit.
6. AI assistance, when added, must not silently create final audit conclusions.
7. Backend contracts must be connected only after service/API contracts are confirmed.

## Current phase

Mock-data frontend foundation.
