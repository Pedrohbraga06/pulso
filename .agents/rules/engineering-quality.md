---
trigger: always_on
description: Apply PULSO engineering quality, evidence, maintainability and operational invariants to all work.
---

# Engineering quality

- Keep architecture modular and workspace boundaries explicit; reuse existing
  patterns and typed contracts before adding abstractions or dependencies.
- Use strict TypeScript and validate untrusted input at system boundaries.
- Keep business rules and authorization in the backend. The frontend is not a
  security control.
- Return explicit, consistent errors; never silently swallow failures or return
  success-shaped fallbacks.
- Use transactions and database constraints for invariants that span writes;
  document precision, concurrency, idempotency and rollback behavior.
- Keep migrations versioned and reviewable. Never reset, drop, truncate or
  accept data loss without explicit, operation-specific human approval.
- Use structured logs and observability appropriate to the system; never log
  secrets or unapproved sensitive payloads.
- Review direct/transitive dependency provenance and impact; do not install
  dependencies without a concrete requirement.
- Test observable behavior and relevant negative/security cases. Report only
  commands actually run, with exact results and blockers.
- Update architecture, API, operations and user documentation affected by a
  change. Preserve reviewable Git history; do not rewrite or hide failures.
