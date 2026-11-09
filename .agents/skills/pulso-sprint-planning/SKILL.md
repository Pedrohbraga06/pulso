---
name: pulso-sprint-planning
description: Plans an approved PULSO sprint with measurable outcomes, scope, stories, dependencies, ownership, estimates, risks, test evidence and human approval gates without implementing features.
---

# PULSO sprint planning

Use before implementation when a sprint or multi-delivery initiative is being
planned. Planning does not approve product strategy; stop for human decisions.

1. Read root `AGENTS.md`, `docs/agents/README.md`, product source-of-truth docs,
   current architecture/ADRs and relevant system behavior.
2. Confirm the Founder/CTO-approved objective and source. If no approved PRD,
   roadmap item or requirement exists, report that gap and request owner
   direction; do not create scope or priorities.
3. Product Manager proposes outcome, impact, sequencing and exclusions;
   Business Analyst maps actors/workflows and traceability; Product Owner
   defines stories, rules, error behavior and acceptance criteria.
4. Principal Architect and relevant Database/Engineering specialists identify
   domain boundaries, contracts, dependencies, migration/operational risk and
   Proposed ADRs. Keep unapproved decisions visibly unresolved.
5. Application Security Engineer threat-models relevant trust/data/action
   boundaries before implementation. This is design input, separate from the
   later independent read-only audit.
6. UX/UI Designer proposes user journeys and accessible states when user
   experience changes. Data/AI roles participate only for approved data/AI
   scope; no AI initiative is inferred.
7. Engineering Manager records milestones, dependencies, estimate and
   uncertainty, task owners, exclusive file paths, worktree strategy, reviewers,
   test plan, evidence and human approval gates in
   `docs/agents/sprint-plan-template.md`.
8. Check every task against Definition of Ready. Report unresolved questions,
   conflicts, risks and items not Ready. Do not implement as part of this skill.
9. Request explicit Founder/CTO approval of the sprint scope and reserved
   decisions. An approved plan is not authorization for destructive migrations
   or production deployment.

Deliver the plan and an approval checklist. Distinguish approved facts,
recommendations, assumptions, pending decisions and rejected scope.
