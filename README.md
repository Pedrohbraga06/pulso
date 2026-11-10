# PULSO

PULSO is a business intelligence and operations platform for multi-tenant companies, initially focused on restaurants and food operations.

## Goals

- Centralize operational and financial intelligence
- Support natural-language analytics over enterprise data
- Provide actionable alerts and scenario simulation
- Keep a modular monorepo architecture for future verticals

## Stack

- Frontend: React + TypeScript + Vite + Tailwind
- Backend: Node.js + NestJS + Swagger
- Database: PostgreSQL + Prisma
- Cache/queue: Redis
- Tooling: pnpm workspaces, Docker Compose, Vitest, TypeScript

## Repository structure

- `apps/api`: NestJS backend API
- `apps/web`: React frontend
- `packages/contracts`: shared contracts and types
- `infrastructure/docker`: local infrastructure definitions
- `docs`: architecture and development guidance

## Local setup

1. Create the local API environment file:
   ```bash
   cp apps/api/.env.example apps/api/.env
   openssl rand -hex 32
   ```
   Set the generated value as `JWT_SECRET` in `apps/api/.env`; never commit it.
2. Install workspace dependencies:
   ```bash
   pnpm install --frozen-lockfile
   ```
3. Start PostgreSQL and Redis:
   ```bash
   docker compose --env-file apps/api/.env -f infrastructure/docker/docker-compose.yml up -d --wait
   ```
4. Apply the versioned database migrations:
   ```bash
   pnpm --filter api db:migrate
   ```
5. Start the API:
   ```bash
   pnpm --dir apps/api run start:dev
   ```
6. Start the web app:
   ```bash
   pnpm --dir apps/web run dev
   ```
7. Open the Swagger docs:
   - `http://localhost:3001/docs`

## Key ports

- API: `http://localhost:3001`
- Swagger: `http://localhost:3001/docs`
- PostgreSQL: `localhost:5433`
- Redis: `localhost:6380`

## Security notes

- Store secret values in local `.env` files only
- Keep tenant isolation enforced in the backend
- Do not trust `tenant_id` values from the client
- Use the database as the source of truth for analytics and financial calculations

## Status

The technical foundation and the first identity/company-administration flows are
implemented. The operational layer (catalog, recipes, inventory and alerts) is
still a proposal in `docs/planning/sprint-2-operational-layer.md`; its screens
currently use demo data and its product scope has not been approved.
