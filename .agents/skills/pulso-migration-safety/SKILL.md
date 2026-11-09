---
name: pulso-migration-safety
description: Plans and validates safe versioned Prisma and PostgreSQL migrations, including schema review, data preservation, approval gates, and migration-status checks.
---

# PULSO migration safety

Use whenever changing the Prisma schema, SQL, database migration history, or
commands that alter database state.

1. Read `docs/development/README.md`, the Prisma schema, and all relevant existing
   migrations. Confirm the current database and migration state before proposing
   an operation.
2. Use a reviewed, versioned Prisma migration for schema changes. Do not replace
   migration history with `prisma db push` or reset a database to make a change
   convenient.
3. Check whether the migration loses or transforms data, drops/renames objects,
   or creates deployment-order risks. Prefer an expand-and-contract transition
   when compatibility across versions is needed.
4. Never run destructive or data-loss commands, including `prisma migrate reset`,
   `prisma db push --accept-data-loss`, destructive SQL, or volume removal,
   without explicit human approval.


5. The workspace approval hook forces a prompt for every `run_command` and
   direct edits to Prisma schema/migration files. Do not bypass, disable, or
   reinterpret one prompt as blanket approval for another operation/environment.
6. Do not apply a migration to production. Production changes require explicit
   human authorization and the approved deployment process.
7. Validate with the smallest safe checks available, such as schema validation,
   migration diff/status, and relevant tests. Clearly distinguish checks from
   operations that changed a database.
8. Report affected data, rollback limits, exact commands, results, and remaining
   risks. Never claim database safety solely because a migration command exited
   successfully.
