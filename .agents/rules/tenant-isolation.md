---
trigger: glob
globs: "**/apps/api/src/**/*.ts, **/apps/api/prisma/**/*.prisma, **/apps/api/prisma/migrations/**/*.sql"
description: Apply when implementing or reviewing backend authorization, company-scoped data, Prisma models, or migrations.
---

# Tenant isolation invariants

- Never treat a client-provided `tenantId`, company ID, header, or route parameter
  as proof that the authenticated user belongs to that company.
- Derive the actor from the verified authenticated identity and validate the
  actor's persisted Membership for the requested company on the backend.
- Scope every company-owned read, write, update, and delete to an authorized
  Membership; do not rely on frontend filtering.
- Avoid leaking whether another company's records exist through response bodies,
  status codes, or error details.
- Add behavior tests that authenticate as a user in company A and attempt to
  access company B; verify both reads and mutations are denied when relevant.
- Review schema constraints and service boundaries so that tenant isolation is
  not dependent on a single controller check.
