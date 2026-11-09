---
trigger: model_decision
description: Apply when a change introduces or revises a significant PULSO architecture, domain, API, database, or infrastructure decision.
---

# Architecture decision records

- Read existing architecture docs and ADRs before proposing a new decision.
- Record consequential alternatives, tradeoffs, and context in
  `docs/architecture/decisions/` using the repository template.
- New decisions start with status `Proposed`. Only the human owner can approve
  them by changing the status to `Accepted`.
- There is no PRD or roadmap in the repository. Do not treat an unapproved
  technical proposal as product direction.
- Keep implementation aligned with accepted decisions, or ask for approval to
  revise them.
