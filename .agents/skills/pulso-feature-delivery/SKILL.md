---
name: pulso-feature-delivery
description: Coordinates a PULSO feature from approved requirements through design, implementation, tests, independent review, and a human-readable delivery report.
---

# PULSO feature delivery

Use this workflow for non-trivial product/engineering work. Scale roles and
checks to impact; do not invoke every specialist for a small, reversible change.

1. **Discovery:** read root/nested `AGENTS.md`, applicable product and technical
   docs, ADRs, current behavior and source revision. Identify affected users,
   systems, data and risks.
2. **Approval/source:** link an approved PRD/roadmap/issue or explicit human
   requirement. If product intent, priority or policy is missing, stop and ask
   the Founder/CTO; do not infer it from scaffolding.
3. **Requirements:** PM/BA assess outcome, evidence and workflow; PO specifies
   stories, business rules, states, errors and observable acceptance criteria.
4. **Architecture:** Architect and relevant Database/Engineering specialists
   assess boundaries, API/data contracts, transactions, migrations, operations,
   dependencies and ADR needs. Keep new ADRs Proposed until human acceptance.
5. **Security design:** threat-model authentication, authorization, tenant
   isolation, privacy, dependencies, secrets and AI/action boundaries before
   implementation when applicable. Request independent read-only security
   review for affected trust boundaries.
6. **Planning/Ready:** Engineering Manager assigns one accountable owner per
   task, exclusive file ownership, dependencies, estimates, worktree strategy,
   test plan and approval gates. Do not start implementation until
   `docs/agents/definition-of-ready.md` is met.
7. **Implementation:** developers implement only approved, assigned scope.
   Frontend is not authorization; business/financial calculations and access
   control remain server-side.
8. **Independent review:** request code/architecture review on a stable diff;
   the author does not approve their own work. Security remains read-only.
9. **QA:** QA executes acceptance, negative, regression, tenant and concurrency
   tests as relevant. Report only observed results and blockers.
10. **Release validation:** evaluate build, migration, rollback, observability,
    dependency and operational readiness. Use the release-readiness skill when
    preparing a release.
11. **Human approval:** obtain explicit Founder/CTO decisions for reserved
    product/architecture scope, risk, destructive data, budget, critical
    permissions and production deployment. Approval is specific to the
    operation and environment.
12. **Report:** use `docs/agents/delivery-report-template.md`; distinguish
    implemented, tested, reviewed, approved and deployed.

# Handoff requirements

Every handoff identifies the task, approved acceptance criteria, owner, owned
files, dependencies, commands actually run, observed results, unresolved
questions and risks. A reviewer receives a stable diff/revision, not a verbal
claim.
