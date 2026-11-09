# Definition of Ready

A task may enter implementation only when every applicable item is satisfied.
The Engineering Manager records blockers; the Founder/CTO resolves product and
strategic decisions.

## Product and behavior

- [ ] Objective and affected users are stated.
- [ ] Approved source of truth is linked (PRD, roadmap item, approved issue, or
  explicit human requirement).
- [ ] Included and excluded scope are explicit.
- [ ] User stories, business rules, states, negative cases and observable
  acceptance criteria are documented.
- [ ] Open product questions and assumptions are either resolved or explicitly
  excluded from the task. No agent has invented business policy.
- [ ] Role/permission behavior and tenant boundaries are specified.

## Technical readiness

- [ ] Dependencies, external contracts, affected modules and data ownership are
  identified.
- [ ] Architecture and API decisions are resolved or recorded as proposed ADRs
  with an approval gate.
- [ ] Migration/data-preservation, transaction, precision, concurrency and
  rollback risks are assessed where applicable.
- [ ] Security/privacy/threat-model review is planned for sensitive boundaries.
- [ ] Owner, reviewers, exclusive file ownership, worktree strategy and
  implementation sequence are assigned.
- [ ] Complexity estimate and major uncertainty are recorded.

## Verification

- [ ] Test levels and commands are identified.
- [ ] Required environments/test data and evidence are available or blockers are
  explicit.
- [ ] Accessibility, performance, observability and operational acceptance are
  considered where relevant.
- [ ] Human approvals needed before implementation, migration, permission
  changes, budget use or release are listed.

If a required item is unknown, stop at discovery/refinement and ask the human
owner instead of starting implementation.
