---
name: pulso-release-readiness
description: Validates PULSO release evidence, migration and rollback readiness, security/operations reviews, residual risks and explicit Founder/CTO deployment approval.
---

# PULSO release readiness

Use only after implementation has a stable revision and approved acceptance
criteria. This skill validates readiness; it does not deploy.

1. Read the approved scope/criteria, Definition of Done, test strategy,
   delivery report, accepted ADRs and full release diff.
2. Confirm each criterion's state separately: implemented, tested, reviewed,
   approved and (only if observed) deployed.
3. Verify exact typecheck, lint, build and relevant unit/integration/E2E/UI
   commands and actual outputs. Identify skips, environment blockers, flaky
   results and unverified behavior.
4. Request independent code/architecture review. Request read-only Application
   Security review for auth, permissions, tenant boundaries, sensitive data,
   dependencies, secrets, AI actions or security controls.
5. For database changes, confirm versioned migration, schema constraints,
   backward compatibility, data preservation, backup/rollback strategy and
   migration status. Never reset, apply destructive operations, or deploy
   without separate explicit Founder/CTO approval.
6. For operational changes, verify monitoring/alerts, SLO/health criteria,
   capacity, backup/recovery, dependency and incident/rollback owners.
7. Classify open findings and risks. Any unresolved P0/P1 blocks release
   readiness unless the Founder/CTO explicitly records accepted risk and
   rationale.
8. Produce the delivery report with evidence, approvals required, release
   recommendation and limitations. Only the human owner authorizes production
   deployment.
