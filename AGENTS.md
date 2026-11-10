# AGENTS.md

## Project identity

PULSO is a B2B SaaS platform focused on operational intelligence for companies, with an initial emphasis on restaurants, food services, and delivery businesses.

## Core principles

- Prefer clean, maintainable architecture over quick hacks.
- Respect the monorepo structure and workspace boundaries.
- Keep business logic in the backend; the frontend should consume data through APIs.
- Enforce tenant isolation at the service and database layers.
- Avoid adding commercial features before the Sprint 0 foundation is stable.
- Do not version secrets or `.env` files.

## Technical stack

- pnpm workspaces for package management
- React + TypeScript + Vite for the web app
- NestJS + TypeScript for the API
- Prisma + PostgreSQL for persistence
- Redis for local infrastructure and future caching/background tasks
- Docker Compose for local environment startup
## Required workflow

1. Work in small, verifiable stages.
2. Validate each stage with the smallest relevant commands.
3. Keep a clear separation between infrastructure, domain logic, and application code.
4. Prefer deterministic, typed solutions over ad-hoc behavior.
5. Update documentation when architecture or setup changes.

## Agent collaboration

- Follow `docs/agents/README.md` and the relevant role definition in `.agents/agents/`.
- Read relevant project documentation before making changes. No approved product PRD or roadmap is currently present; treat proposed planning documents as drafts and ask the human owner instead of inventing requirements or priorities.
- The Engineering Manager coordinates work and reports recommendations; only the human owner approves product strategy, scope changes, destructive migrations, or production deployment.
- Assign exclusive file ownership before parallel implementation. Do not have agents edit the same files at the same time.
- Keep Security Engineer reviews independent and read-only. QA reports a check as passing only after running it and recording its actual result.
- Report changed files, commands and outcomes, acceptance criteria, risks, and work left incomplete.
- Never weaken tests, lint, TypeScript, or security controls to make a task appear complete.

## Engineering governance

- The human Founder/CTO is the final authority for strategy, product scope, critical architecture, security-risk acceptance, budget, destructive data changes, and production release.
- Apply [Definition of Ready](docs/agents/definition-of-ready.md), [Definition of Done](docs/agents/definition-of-done.md), and the applicable workflow in [the agent handbook](docs/agents/README.md). Scale the roles and gates to task risk; do not skip a required approval.
- Treat backend authorization and persisted data as authoritative. Frontend behavior, agent instructions, and file ownership conventions are not security boundaries.
- Validate inputs at system boundaries, use typed contracts and consistent errors, keep logs structured and free of secrets/sensitive payloads, and instrument production behavior where the architecture supports it.
- Keep database changes versioned and additive by default. Review transaction boundaries and integrity constraints; destructive changes require explicit, operation-specific human approval.
- Pin and review dependencies, preserve lockfiles, document architectural changes, and keep Git history reviewable. Never store credentials, tokens, private data, or `.env` files in version control.
- AI/data systems must ground outputs in authorized, traceable sources. Do not fabricate enterprise facts, cross tenant boundaries, or execute or authorize financial/operational actions without an explicit, validated authorization flow and human-approved policy.
- Read [the security policy](docs/security/engineering-security-policy.md) for detailed security and data-handling requirements.

## Safety rules

- Never trust client-provided tenant identifiers.
- Keep DB access behind the backend and Prisma service layer.
- Ensure all operational calculations are derived from backend data.
- Use `.env.example` as the public shape of environment variables, not real secrets.

## Sprint 0 focus

The current goal is to establish the foundation for the project:

- monorepo structure
- pnpm workspace configuration
- React frontend skeleton
- NestJS backend skeleton
- Dockerized PostgreSQL and Redis
- Prisma integration and schema sync
- health endpoint and Swagger docs
- validation through typecheck and tests
