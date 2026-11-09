---
trigger: glob
globs: "**/*.test.ts, **/*.spec.ts, **/*.e2e-spec.ts, **/vitest.config.*, **/jest.config.*"
description: Apply when adding, modifying, or reporting tests and validation results.
---

# Test evidence

- Tests must exercise observable behavior or a meaningful regression, including
  relevant invalid-input and authorization cases.
- Do not weaken assertions, skip failing tests, or alter lint/TypeScript settings
  to make a task appear successful.
- Report a check as passing only after actually running it; include the command,
  result, and any relevant environment limitation.
- A build or typecheck does not substitute for tests, and adding a test does not
  prove it passes.
- Report skipped, flaky, blocked, or untested acceptance criteria explicitly.
