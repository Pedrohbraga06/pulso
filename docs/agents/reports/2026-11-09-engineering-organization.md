# Delivery report: PULSO engineering organization

## Outcome

The organizational governance structure is documented and configured for the
Google Antigravity surfaces examined. The Founder/CTO approved this
organizational proposal on 2026-11-09. This approval does not approve Sprint 2
product scope, its proposed ADRs, implementation, migrations, or release.

| State | Result |
| --- | --- |
| Implemented | Yes: role profiles, rules, skills, policies, templates, approval hook and governance tests |
| Tested | Yes: final governance test run passed 7/7; see commands below |
| Reviewed | Yes: independent QA, Application Security, Architect and Orchestrator reviews were performed; residuals are recorded below |
| Approved | Organizational structure only, by the Founder/CTO on 2026-11-09 |
| Deployed | Not applicable; live Antigravity discovery and enforcement were not verified |

## Scope and acceptance criteria

- Document a professional organization with clear boundaries for the human
  Founder/CTO and 14 AI specialties.
- Establish ready/done gates, adaptive delivery stages, security and quality
  rules, sprint planning/release checklists, report templates and traceability.
- Add automated checks for role/config structure and approval-hook behavior.
- Preserve product scope and existing migrations; do not begin Sprint 2.
- Keep Antigravity capability claims limited to documented and observed
  behavior.

## Organization and configuration

The 14 AI specialties are Engineering Manager / Chief Orchestrator, Product
Manager, Product Owner, Business Analyst, Principal Software Architect, UX/UI
Designer, Senior Backend Engineer, Senior Frontend Engineer, Database
Engineer, QA Automation Engineer, Application Security Engineer, DevOps /
Site Reliability Engineer, Data Engineer and AI/ML Engineer. The Founder/CTO
remains the human authority and is not represented as an AI agent.

## Activating a specialty

Select the corresponding custom agent in the active Antigravity agent manager;
the profile ID is the directory name below. The documented CLI manager is
`agy agents`, but it returned no profiles in this environment. Therefore these
paths define the intended role mapping, not proof that the active installation
can discover or invoke them. Do not claim a role ran until the selected
surface confirms it.

| Specialty | Profile ID |
| --- | --- |
| Engineering Manager / Chief Orchestrator | `engineering-manager` |
| Product Manager | `product-manager` |
| Product Owner | `product-owner` |
| Business Analyst | `business-analyst` |
| Principal Software Architect | `software-architect` |
| UX/UI Designer | `ux-ui-designer` |
| Senior Backend Engineer | `backend-developer` |
| Senior Frontend Engineer | `frontend-developer` |
| Database Engineer | `database-engineer` |
| QA Automation Engineer | `qa-engineer` |
| Application Security Engineer | `application-security-engineer` |
| DevOps / Site Reliability Engineer | `devops-sre-engineer` |
| Data Engineer | `data-engineer` |
| AI/ML Engineer | `ai-ml-engineer` |

Role profiles live in `.agents/agents/<role>/agent.md`. Three global rules cover
engineering quality, human approval gates and AI/data governance. Skills cover
feature delivery, sprint planning, migration safety and release readiness. The
handbook identifies the feature-delivery skill as the canonical workflow,
defines Ready/Done gates and links the PRD, roadmap, sprint, review, test and
delivery-report artifacts.

The approval hook requires human confirmation for every `run_command`, and
gates direct edits to Prisma schema/migrations and local environment files.
This is a defense-in-depth prompt, not an operating-system ACL or proof that
Antigravity enforced a prompt.

## Files changed

- `AGENTS.md` and `docs/agents/README.md`: global authority, invariants, roles,
  workflow and tool limitations.
- `.agents/agents/`: relocated and revised nine existing profiles; added
  Business Analyst, UX/UI Designer, Database Engineer, Data Engineer and
  AI/ML Engineer.
- `.agents/rules/`: engineering quality, human approval gates, AI/data
  governance.
- `.agents/skills/`: feature delivery and migration safety updates; sprint
  planning and release readiness skills.
- `.agents/hooks/pre-tool-approval.mjs` and `.agents/hooks.json`: approval
  behavior for shell commands and sensitive local writes.
- `scripts/governance/config.test.mjs` and `package.json`: repeatable governance
  checks exposed as `pnpm test:governance`.
- `docs/agents/`: Founder/CTO charter, Ready/Done, team handbook, sprint and
  review templates, test strategy, delivery template, changelog and this report.
- `docs/product/`: product-document index and PRD/roadmap templates; no product
  requirements or roadmap were invented.
- `docs/security/engineering-security-policy.md`: security, data, AI and
  release controls, including the missing classification/retention policy.
- `docs/architecture/decisions/0004-recipe-versioning-and-cost-semantics.md`:
  clarified as a proposed technical decision, leaving product semantics to
  approved requirements.

Pre-existing Sprint 2 planning and Proposed ADR documents were preserved.
They remain unapproved and are outside the approved organizational scope.
There were no production code or migration changes.

## Reviews and conflict resolution

- **QA:** Independently audited governance checks and reported 6/6 tests
  passing at that point. The final expanded local suite below passes 7/7.
  QA correctly noted that static tests cannot prove live agent discovery or
  prompt enforcement. The final documentation-only refinements were not sent
  for a second independent QA audit.
- **Application Security:** The initial review found a MEDIUM risk: command
  text-matching could be bypassed by wrapped shell commands. Remediation changed
  all `run_command` calls to `force_ask` and added a regression check. The
  security follow-up found no remaining issue at the hook-contract level.
  Actual platform invocation/enforcement remains unverified.
- **Architect:** Identified ambiguity in the canonical workflow, writable
  Security role boundaries, product policy embedded in an ADR, missing data
  classification/retention ownership, and approval traceability. The workflow
  was made canonical, Security was made read-only, ADR 0004 was clarified,
  policy gaps were escalated to the Founder/CTO, and this report is linked from
  the changelog for approval/review traceability. These documentation
  corrections have not received a second independent Architect audit.
- **Orchestrator simulation:** A hypothetical CSV export task was correctly
  stopped because priority, export fields, role eligibility and privacy policy
  were unspecified. This confirmed that the documented process escalates
  unknown product/data policy rather than inventing it.

## Commands and observed results

| Command | Result |
| --- | --- |
| `pnpm test:governance` | Pass: 7 tests, 0 failures, including local Markdown links and approval-hook behavior |
| `node --check scripts/governance/config.test.mjs` | Pass |
| `node --check .agents/hooks/pre-tool-approval.mjs` | Pass |
| JSON parse of `.agents/hooks.json` and `package.json` | Pass |
| `agy agents` | Returned no listed agents; this does not establish successful profile discovery |
| Direct agent smoke test | Blocked by Google authentication; no login was attempted |

Application typecheck, lint, build and product tests were not run because
production source code was not changed. The Antigravity App/CLI versions
reported in the inspected environments differed, so behavior must be checked
in the owner's active installation.

## Limitations, risks and human decisions

1. **Live configuration behavior — unresolved, medium:** agent discovery and
   approval-prompt display have not been verified in an authenticated
   Antigravity session. The user must verify these in the installed surface
   before treating the controls as runtime-enforced.
2. **Data policy — pending Founder/CTO decision:** no approved classification,
   purpose, access or retention/deletion schedule exists. Any task using
   production, personal, financial or customer data must wait for direction.
3. **Product sources — pending owner input:** the repository still has no
   approved PRD or roadmap. Product work must use an approved user requirement
   or wait for these sources.
4. **Review independence — follow-up advisable:** final documentation
   refinements were covered by automated checks but not by a second QA or
   Architect audit.
5. **Platform limitations:** Antigravity IDE workflows are deprecated;
   reusable processes are Skills. `/teamwork` is plan-dependent, and
   worktree support must be verified for the active surface. Copilot CLI
   dynamic workflows are not represented as Antigravity workflows.

## Recommendations

- Have the owner verify custom-agent discovery and approval prompts in the
  authenticated target installation before relying on them at runtime.
- Approve product PRD/roadmap and data classification/retention policy before
  product tasks require those decisions or handle sensitive data.
- Keep `pnpm test:governance` in the repository's CI once the organization
  configuration is accepted as a maintained project control.

No Sprint 2 implementation was started. No migration, database reset,
production deployment or commit was performed.
