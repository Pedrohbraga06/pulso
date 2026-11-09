---
name: pulso-feature-delivery
description: Coordinates a PULSO feature from approved requirements through design, implementation, tests, independent review, and a human-readable delivery report.
---

# PULSO feature delivery

Use this workflow for non-trivial features. Scale it down for trivial changes;
do not invoke every role without a reason.

1. Read root `AGENTS.md`, applicable nested instructions, relevant architecture
   and development docs, and existing behavior.
2. Check for an approved PRD, roadmap item, or user requirement. The repository
   currently has no PRD or roadmap; stop to ask the human owner where scope,
   priority, or business behavior is unspecified.
3. Have the Product Manager assess priority and impact and the Product Owner
   define stories, rules, and observable acceptance criteria when product
   decisions are involved.
4. Have the Architect review domain boundaries, persistence, API contracts,
   tenant isolation, operational effects, and ADR needs when the change warrants
   it. Keep proposed ADRs marked `Proposed` until the human owner accepts them.
5. The Engineering Manager divides approved work into bounded tasks, assigns one
   owner per file, records dependencies, and avoids concurrent edits to the same
   files. Use isolated worktrees for parallel implementation where available.
6. Backend and/or Frontend implement only their assigned scope. DevOps handles
   infrastructure impact only when necessary.
7. QA runs tests covering the acceptance criteria and relevant regressions.
   Never report a test as passing without actual execution.
8. Request an independent, read-only Security review when authentication,
   authorization, tenant isolation, personal data, secrets, or security
   boundaries are affected.
9. Request human approval before destructive migrations, production deployment,
   scope expansion, and product or architecture decisions reserved for the
   owner.
10. Consolidate the outcome using `docs/agents/delivery-report-template.md`.

# Handoff requirements

Every handoff identifies the task, acceptance criteria, owned files, dependencies,
commands actually run, observed results, unresolved questions, and risks. A
reviewer receives the final diff or a stable commit/worktree, not a verbal claim.
