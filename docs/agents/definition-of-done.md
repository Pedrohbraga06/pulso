# Definition of Done

A task is complete only when all applicable items are satisfied:

- The human-approved request and acceptance criteria are clear. Unspecified
  product or business behavior is resolved with the owner, not guessed.
- Changes stay within assigned scope and workspace boundaries. Concurrent agents
  had non-overlapping file ownership.
- Implementation follows `AGENTS.md`, accepted ADRs, tenant-isolation
  requirements, and existing project conventions.
- Tests cover meaningful behavior and relevant failure/authorization cases.
  Every reported passing check was actually executed; exact commands and results
  appear in the report.
- Applicable typecheck, lint, test, build, and migration/schema checks passed.
  Blocked or skipped checks are called out with reasons.
- Security review was independently performed when authentication,
  authorization, tenant isolation, personal data, secrets, or security
  boundaries changed.
- Infrastructure impacts were validated when relevant; no production deployment
  or destructive operation occurred without explicit human authorization.
- Documentation and versioned migration history reflect the change. No real
  secrets or `.env` files were added to version control.
- The final report lists changed files, validation evidence, unresolved risks,
  limitations, and required human decisions.

Do not label a task complete when a criterion is blocked, a relevant check has
not run, or a required approval is pending.
