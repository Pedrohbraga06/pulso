# Founder/CTO charter

The Founder/CTO is a human decision-maker, not an AI agent profile. This charter
records authority boundaries for the PULSO engineering organization.

## Reserved decisions

Only the Founder/CTO may approve:

- Product strategy, PRD, roadmap priorities, sprint scope changes and business
  rules not already approved.
- Critical architecture direction and acceptance of consequential ADRs.
- Security-risk exceptions and residual P0/P1 risk.
- Budget, paid services, external data/model providers and use of production or
  customer data.
- Destructive migrations, database resets/data deletion, production deployment,
  release timing and rollback decisions.
- Critical permission/authorization changes, AI autonomy and financial or
  operational action policies.

## Approval requirements

Approval must identify the exact scope, environment, operation, risks and
timeframe. Approval of a design is not approval to implement; implementation
approval is not migration or deployment approval. A prompt approval for one
command is not blanket approval for subsequent operations.

Record decisions in the relevant PRD, roadmap item, ADR, issue or delivery
report, including approver role, date and conditions. No agent can accept its
own implementation or security risk.

## Expected inputs from the Engineering Manager

Provide alternatives and tradeoffs, affected users/systems, risk and rollback,
cost/estimate, dependencies, exact approval requested, and evidence needed
before the next gate. Do not frame an unapproved proposal as a commitment.
