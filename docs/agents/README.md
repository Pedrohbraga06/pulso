# PULSO agent team

This directory describes the shared delivery process. The Antigravity-native
custom agents live in `.agents/agents/`; repository-wide instructions remain in
`AGENTS.md`, with focused rules and skills in `.agents/rules/` and
`.agents/skills/`.

## Project context and source of truth

Read `README.md`, `AGENTS.md`, relevant nested `AGENTS.md`, and the applicable
architecture/development documentation before work. Current reference documents
include `docs/architecture/README.md` and `docs/development/README.md`.

No product PRD or roadmap was found in the repository during this setup. Product
Manager and Product Owner agents must not infer missing product strategy from
technical documents. Ask the human owner to provide or approve the requirement,
priority, business rule, and acceptance criteria where they are missing.

Use accepted ADRs as technical constraints. New significant decisions belong in
`docs/architecture/decisions/` and remain `Proposed` until a human accepts them.
The ADR directory is not a substitute for a product PRD.

## Configured roles

| Agent | Primary responsibility | Boundaries |
| --- | --- | --- |
| `engineering-manager` | Decomposes requests, assigns owners/dependencies, coordinates and reports | Does not implement production code or make final product/strategic decisions |
| `product-manager` | Product direction, priority, roadmap and impact analysis | Does not invent absent PRD/roadmap content or make final owner decisions |
| `product-owner` | Functional requirements, stories, business rules and acceptance criteria | Does not invent unspecified behavior or implement production code |
| `software-architect` | Domain/data/API architecture, tradeoffs, scalability and ADR proposals | ADRs remain proposed until human approval; does not implement |
| `backend-developer` | NestJS, TypeScript, Prisma, PostgreSQL, APIs and authorization | Assigned backend files only; tenant checks remain server-side |
| `frontend-developer` | React, TypeScript, Vite, Tailwind, accessibility and API integration | Assigned frontend files only; no business authorization in the client |
| `qa-engineer` | Unit, integration, E2E, regression and isolation test execution | Reports only checks actually run; does not weaken tests or implement production fixes |
| `security-engineer` | Independent auth, tenant-isolation, data-protection and LGPD review | Read-only and independent of implementation; reports evidence and limitations |
| `devops-engineer` | Docker, CI/CD, environments, observability, backups and infrastructure | No destructive infrastructure action or production deploy without human approval |

These are workspace custom subagents. The `tools` lists constrain available
capabilities, and `commandExecutionPolicy` controls command execution. File
ownership inside a directory is not an ACL in custom-agent Markdown; it is an
assignment rule, supported by Antigravity's workspace permissions, isolated
worktrees, review, and the approval hook. Do not treat role prompts as a
security boundary.

## How to use the team in Antigravity

- Open the repository as the workspace in the Antigravity App or CLI. Custom
  subagents are documented for those surfaces and are discovered from
  `.agents/agents/`. Each profile has `mainAgent: true` for selection as a
  primary agent and `subagent: true` for delegation.
- Give a request first to `engineering-manager` or select the specialist directly
  for a bounded task. The manager should invoke only roles that fit the task.
- Use `/pulso-feature-delivery` for a non-trivial feature and
  `/pulso-migration-safety` for schema or database changes. Skills are also
  automatically considered when their descriptions match.
- Antigravity `/teamwork` is a native paid-plan capability in the App and CLI.
  It can coordinate its own workers and milestones; it is not a guarantee that
  the platform will use these nine named custom profiles. Use it when its
  parallel coordination is useful, and still assign file ownership explicitly.
- Custom subagents are documented as available in App and CLI, not the IDE.
  Workspace rules and skills are documented across App, CLI, and IDE. Do not
  assume the IDE can invoke this custom roster.
- Antigravity IDE Workflows are deprecated; this repository uses Skills rather
  than adding legacy workflow files.

## Collaboration and approval flow

1. The Engineering Manager confirms scope, documents unknowns, and identifies
   dependencies. For product work, PM assesses priority/impact and PO specifies
   behavior and acceptance criteria.
2. The Architect reviews significant API, domain, data, or infrastructure
   choices and records proposed ADRs. The human owner approves product strategy,
   material scope changes, and proposed strategic/architecture choices.
3. The manager assigns bounded tasks and exclusive file ownership. Parallel
   implementation should use isolated worktrees (`branch`) where available.
   Review shared-file changes serially; agents must not edit the same file at
   once.
4. Backend, Frontend, and DevOps implement only relevant assigned work.
5. QA executes acceptance and regression tests. Security independently reviews
   changes affecting authentication, authorization, tenant isolation, personal
   data, secrets, or security boundaries.
6. The manager reports files, commands and real results, risks, incomplete work,
   and approvals needed using the delivery report template.

### Human approval gates

- `.agents/hooks.json` installs a workspace `PreToolUse` hook. It uses
  `force_ask` (which ignores cached permissions) for Prisma migration/schema
  commands, edits under Prisma `migrations/`, likely destructive commands,
  deployment/release commands, and writes to local `.env` files.
- The hook is a safeguard, not a complete security boundary. It inspects
  command text and common file-write tools; it cannot prove the semantics of
  every command or external MCP action. Keep Antigravity's permission/sandbox
  controls enabled and inspect the proposed operation before approving it.
  Do not disable the hook to get past a prompt.
- A human must explicitly authorize production deployment and destructive data
  changes. A prompt approval for one command is not blanket approval for other
  commands or environments.
- Never add real secrets to version control. `.env.example` may contain safe
  variable names/placeholders only.
- Custom-agent instructions do not enforce business approvals. The hook covers
  only listed tool calls; the human remains responsible for product and release
  decisions.

## Definition of Done and quality

See [Definition of Done](definition-of-done.md) and
[Test strategy](test-strategy.md). In summary, work is done only when the
approved criteria are implemented, relevant automated checks were run and
reported truthfully, security/operations impacts were reviewed where relevant,
documentation and migrations are consistent, and unresolved risks are explicit.

## Official Antigravity references

Configuration was based on the official documentation, checked during setup:

- [Rules](https://antigravity.google/docs/rules)
- [Agent skills](https://antigravity.google/docs/skills)
- [Custom subagents](https://antigravity.google/docs/subagents)
- [Hooks](https://antigravity.google/docs/hooks)
- [Permissions](https://antigravity.google/docs/permissions)
- [Teamwork](https://antigravity.google/docs/teamwork)
- [Customization discovery](https://antigravity.google/docs/customization-discovery)
- [IDE Workflows deprecation](https://antigravity.google/docs/ide/workflows/)

Tool availability and product UI may change; verify the current official
documentation if Antigravity changes its configuration format.
