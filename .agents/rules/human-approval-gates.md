---
trigger: always_on
description: Preserve Founder/CTO approval for product, critical architecture, security risk, destructive data, budget and production release decisions.
---

# Human approval gates

- The human Founder/CTO is the final authority for product strategy, scope,
  critical architecture, residual security risk, budget, destructive data
  changes, critical permissions and production releases.
- Do not infer approval from a prompt, plan, test, proposed ADR, merged code or
  another environment's approval. Record exact scope, environment and operation.
- Never execute database reset/destructive operations, data-loss migration,
  production deployment, or critical permission changes without explicit,
  operation-specific human approval.
- Do not mark an ADR Accepted until the human owner accepts it.
- Security exceptions require stated impact, mitigation, owner and expiry; only
  the human owner may accept residual risk.
- Hooks, role prompts, file ownership and sandbox warnings are defense in depth,
  not authorization to proceed without the required human decision.
