# PULSO Web

The PULSO web application is a React, TypeScript, and Vite SPA with an authenticated
workspace and a responsive dark visual system.

## Development

Run the API and web app from the repository root with `pnpm dev`, or start only
the frontend with `pnpm --filter web dev`. The default API URL is
`http://localhost:3001`. To override it, copy `.env.example` to `.env.local` and
set `VITE_API_BASE_URL`.

Useful checks:

```sh
pnpm --filter web typecheck
pnpm --filter web lint
pnpm --filter web test
pnpm --filter web build
```

## Routes

- `/login` and `/register` — API-backed authentication.
- `/app/overview` — operational overview.
- `/app/products`, `/app/categories`, `/app/ingredients` — catalog.
- `/app/inventory`, `/app/movements`, `/app/recipes`, `/app/alerts` — operations.
- `/app/profile`, `/app/company`, `/app/users`, `/app/settings` — administration.
- `/app/accept-invitation` — accept a company invitation.

Unauthenticated users are redirected to `/login`. The API is authoritative for
authentication, authorization, roles, and company access.

## Real integrations and demonstrations

Authentication, profile, company membership, member management, and invitations
use existing API endpoints. The access token stays in memory; reloading the page
requires signing in again because the API does not provide a refresh-token flow.
The company selector only offers memberships returned by the authenticated API.
Selecting a company is a UI context choice, not an authorization control.

Catalog, sales summaries, recipes, inventory balances, movements, and alerts are
clearly labeled demonstration data held in `src/demo/data.ts`. They are not
persisted, do not call operational endpoints, and do not define the pending
Sprint 2 business rules. Password recovery and profile/company editing are
unavailable because the current API has no corresponding endpoints.

Invitation creation returns a sensitive one-time token because the API does not
send email. The interface displays it only after creation and warns the user to
share it securely. Never include a real invitation token in logs or screenshots.

## Structure

- `src/app` — route guards, auth context, and session provider.
- `src/components` — shared visual primitives and icons.
- `src/features` — auth, dashboard, catalog, operations, and admin pages.
- `src/layouts` — authenticated and public application shells.
- `src/services` — API client.
- `src/demo` — isolated non-persistent fixtures.
- `src/styles.css` — PULSO visual system and responsive rules.
