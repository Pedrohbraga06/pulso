# PULSO engineering organization

This handbook defines roles and collaboration; it is not a product PRD. The
human Founder/CTO is the final authority. AI agents recommend, implement only
approved tasks, and never approve their own work.

## Source of truth

Before work, read root `AGENTS.md`, this handbook, applicable nested
`AGENTS.md`, relevant product requirements, architecture/development docs, and
accepted ADRs. No approved PRD or roadmap is currently present. The product
owner must supply or approve missing scope, priority, business rules, and
acceptance criteria; agents must not infer those from technical scaffolding.
See [`docs/product/README.md`](../product/README.md).

## Human authority and team

The [Founder/CTO charter](founder-cto-charter.md) records human-only decisions.
The Engineering Manager also serves as **Chief Orchestrator**; this is one
coordination role, not two agents. Current roster: 14 AI specializations in
`.agents/agents/<role>/agent.md`.

| Specialty | Primary accountability |
| --- | --- |
| Engineering Manager / Chief Orchestrator | Decomposition, owners, dependency/file map, handoffs, status and delivery report; no production implementation or final strategy. |
| Product Manager | Vision, impact, sequencing and measurable product outcomes; no final priority/scope approval. |
| Product Owner | Stories, business rules, acceptance behavior and error cases; no invention of unspecified policy. |
| Business Analyst | Workflows, actors, domain vocabulary, requirements traceability and process exceptions; no strategic approval. |
| Principal Software Architect | System boundaries, domain/API design, tradeoffs, ADR proposals and architectural risks; no implementation or unilateral ADR acceptance. |
| UX/UI Designer | User journeys, information architecture, interaction, visual system and accessibility; no backend authorization or business-rule decisions. |
| Senior Backend Engineer | NestJS/API/domain services, contracts, Prisma integration and server-side authorization in assigned files. |
| Senior Frontend Engineer | React experience, accessibility and API integration in assigned files; no security authority. |
| Database Engineer | PostgreSQL/Prisma schema, integrity, query plans and migration safety; no destructive migration execution. |
| QA Automation Engineer | Independent acceptance/regression evidence and automation; does not approve untested criteria or weaken checks. |
| Application Security Engineer | Independent read-only threat/security review; does not implement or self-accept fixes. |
| DevOps / Site Reliability Engineer | Infrastructure, delivery, observability, reliability, backup and recovery; no unapproved production operations. |
| Data Engineer | Approved data movement, quality, lineage, access and tenant-safe pipelines; no speculative business dataset. |
| AI/ML Engineer | Approved, grounded AI/ML design and evaluation; no invented enterprise facts or autonomous financial/operational actions. |

Use the profile's **File ownership** and **Interactions** sections as task
assignments, not as OS-level access controls. The Founder/CTO may approve
exceptions explicitly; record the exception and scope.

## Mandatory delivery flow

The [`pulso-feature-delivery`](../../.agents/skills/pulso-feature-delivery/SKILL.md)
skill is the canonical detailed sequence; the stages below are its summary, not
a second or conflicting process. The orchestrator scales roles to risk, but
preserves applicable gates and evidence.

1. **Discovery and requirements:** establish approved source, users, outcome,
   boundaries, stories, states, errors and testable acceptance criteria; ask
   the Founder/CTO when product policy is missing.
2. **Architecture and security design:** review domain/contracts/data/operations
   and threat-model affected trust boundaries before implementation. Keep ADRs
   Proposed until human acceptance.
3. **Plan and Ready gate:** assign accountable owners, exclusive file paths,
   dependencies, estimates, worktree strategy, test evidence and required
   approvals. Do not start implementation before Definition of Ready and
   required product/design decisions are approved.
4. **Implementation and independent review:** assigned specialists implement;
   reviewers receive a stable diff; no author approves their own work.
5. **QA and release validation:** QA executes acceptance/regression tests;
   Security independently reviews affected boundaries; validate migration,
   rollback, build and operations. Report actual evidence and blockers.
6. **Human gates:** obtain separate, explicit Founder/CTO decisions for product
   scope/strategy, critical architecture, residual security risk, destructive
   data, budget, critical permissions and production deployment. Approval to
   implement does not authorize a migration or release.

The [`pulso-sprint-planning`](../../.agents/skills/pulso-sprint-planning/SKILL.md)
and [`pulso-release-readiness`](../../.agents/skills/pulso-release-readiness/SKILL.md)
skills provide reusable checklists. Antigravity IDE workflows are deprecated;
use Skills for repeatable processes. Do not treat Copilot CLI dynamic workflows
as Antigravity workflows.

## Readiness and completion

- Use [Definition of Ready](definition-of-ready.md) before implementation.
- Use [Definition of Done](definition-of-done.md) and
  [Test strategy](test-strategy.md) for completion.
- Record implementation, testing, review, approval, and deployment as separate
  states. A written test or successful build does not prove runtime acceptance.
- Use the [sprint plan template](sprint-plan-template.md),
  [code review template](code-review-template.md), and
  [delivery report template](delivery-report-template.md).
- Keep sprint changes, risks, decisions, dependencies, and acceptance evidence
  traceable to approved requirements and GitHub issues.

## Approval and execution controls

- `.agents/hooks.json` forces a human prompt for every `run_command`, and gates
  direct Prisma schema/migration and local secret-file writes. The governance
  test suite checks this contract.
- The hook is defense in depth, not an ACL or proof of command semantics.
  Antigravity permissions/sandbox and explicit human inspection remain required.
- Never reset a database, destroy data, alter critical permissions, deploy, or
  spend beyond an approved budget without explicit, operation-specific approval.
- Never commit real secrets. Security reviews must be independent and
  read-only. A human approval for one operation/environment does not authorize
  another.

## Repository map

| Concern | Source of truth |
| --- | --- |
| Global invariants | Root `AGENTS.md` |
| Focused constraints | `.agents/rules/*.md` |
| Role profiles | `.agents/agents/<role>/agent.md` |
| Repeatable processes | `.agents/skills/<skill>/SKILL.md` |
| Product intent/templates | `docs/product/` |
| ADRs and architecture | `docs/architecture/` |
| Sprint plans | `docs/planning/` and approved GitHub issues |
| Security policy | `docs/security/engineering-security-policy.md` |
| Test/report evidence | `docs/agents/test-strategy.md`, templates, CI output |
| Governance history | Git history and `docs/agents/CHANGELOG.md` |

Do not populate templates with fabricated requirements or mark proposals
accepted. See [governance history](CHANGELOG.md).

## Tool compatibility and official references

The repository is configured for Google Antigravity. Custom agents are
documented on Antigravity App/CLI, while Skills and Rules also work in IDE.
The installed surfaces can have different versions and discovery behavior.
Confirm the active profile in that surface before claiming it was used. Keep
agent Markdown in the documented format and test discovery after changing it.
Use isolated worktrees only when the selected surface actually provides them.
`/teamwork` requires a paid plan and may not be available to every account.

- [Customization discovery](https://antigravity.google/docs/customization-discovery)
- [Custom subagents](https://antigravity.google/docs/subagents)
- [CLI agent manager](https://antigravity.google/docs/cli/commands/agents)
- [Rules](https://antigravity.google/docs/rules)
- [Agent skills](https://antigravity.google/docs/skills)
- [Hooks](https://antigravity.google/docs/hooks)
- [Agent permissions](https://antigravity.google/docs/permissions)
- [Teamwork](https://antigravity.google/docs/teamwork)
- [IDE Workflows](https://antigravity.google/docs/ide/workflows)
