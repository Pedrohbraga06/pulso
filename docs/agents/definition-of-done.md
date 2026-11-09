# Definition of Done

Use with [Definition of Ready](definition-of-ready.md). "Done" is evaluated
against the approved scope and acceptance criteria, not against activity or
files written.

## Required gates

- Scope, source requirements, acceptance criteria and applicable human approvals
  are explicit. No unresolved P0/P1 issue or unapproved business/architecture
  assumption remains.
- Each task has a named owner and scope. Parallel edits had exclusive file
  ownership or used separate worktrees and were reconciled.
- Code follows root/nested `AGENTS.md`, accepted ADRs, workspace boundaries,
  tenant isolation and repository conventions.
- Inputs are validated at trust boundaries; errors are explicit and consistent;
  logs do not disclose secrets or sensitive data; backend rules and permissions
  remain authoritative.
- Data integrity, transaction boundaries, precision, migration safety,
  dependency impact and operational effects are reviewed where relevant.
- Tests cover acceptance behavior, negative cases and regressions. Security
  review is independent/read-only when auth, permissions, tenant isolation,
  personal data, secrets, AI/data access or security controls are affected.
- Documentation, contracts and migration history are updated. No real secrets
  or `.env` files are versioned.

## Required evidence

Run and report every applicable check, with exact command, actual result and
environment prerequisites:

- Typecheck.
- Lint.
- Build.
- Focused unit/integration/E2E/frontend tests.
- Migration/schema validation without unapproved database mutation.
- Security/operational review and release checks when applicable.

A test file, mock-only check, build, static review, or skipped test does not
prove runtime behavior. Record failures, skips and blocked criteria explicitly;
never weaken tests, TypeScript, lint or security controls to obtain a pass.

## Completion states

Track separately in the delivery report:

1. **Implemented** — approved change exists in the assigned files.
2. **Tested** — relevant checks ran and evidence is recorded.
3. **Reviewed** — independent review is complete or explicitly not applicable.
4. **Approved** — human approval gates are satisfied.
5. **Deployed** — deployment was explicitly authorized and observed.

Do not label a task or sprint complete while a required state is pending, a
criterion is unverified, or a P0/P1 risk remains open.
