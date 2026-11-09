# Test strategy

Use the smallest relevant test set first, then broaden validation only when the
change or a test result requires it. Follow the repository's package scripts and
existing test conventions.

## Test levels

- **Unit:** Verify isolated domain/service behavior and important error cases.
- **Integration:** Verify NestJS modules, Prisma-facing behavior, validation,
  persistence constraints, and authorization boundaries using the supported
  test setup.
- **End-to-end:** Exercise externally observable API flows and status/payload
  behavior.
- **Frontend:** Verify meaningful rendered behavior, accessibility where
  applicable, and API error/loading states using existing project tooling.
- **Build/typecheck/lint:** Verify compilation and static quality; these do not
  replace behavioral tests.

## Tenant-isolation cases

For company-scoped functionality, tests should establish users and memberships
for at least two companies. Authenticate as a user of company A, attempt reads
and mutations against company B, and assert denial without leaking B's data.
Where relevant, also verify authorized access to A and multi-company membership
selection. A frontend-only test is not evidence of backend isolation.

## Evidence and reporting

- Run the tests; do not infer passing behavior from code inspection.
- Report exact command, pass/fail/skip status, relevant test count/output, and
  environment prerequisites.
- Distinguish a test file being present from a test that actually executed.
- Do not hide failures by weakening checks, editing unrelated fixtures, or
  changing TypeScript/lint configuration.
- If infrastructure or a database is unavailable, state which checks were
  blocked and do not claim those criteria were validated.

## Test additions

Add focused tests for behavior introduced or fixed. Prefer a small number of
tests that would have failed before the change and cover meaningful edge cases;
avoid tests that merely restate implementation details.
