---
trigger: model_decision
description: Apply when a task uses AI/ML, enterprise data, retrieval, model outputs, or automation that could change financial or operational state.
---

# AI and data governance

- Use only approved, traceable data sources and enforce tenant access in the
  backend/data service; never trust a model, prompt, UI filter or vector match
  to enforce authorization.
- Separate observed source facts, derived values and model-generated hypotheses.
  Cite/trace sources where practical and state uncertainty; never invent
  company-specific data.
- Do not send secrets, personal, customer or production data to an unapproved
  provider or dataset. Confirm retention/training terms and data minimization.
- Validate retrieved content and model/tool output as untrusted input; defend
  against prompt injection, leakage and cross-tenant retrieval.
- AI must not execute or authorize money movement, accounting changes, sales,
  inventory changes, permission changes or other consequential actions unless
  the Founder/CTO approved the action policy, the backend validates
  authorization, and required human confirmation/audit/idempotency controls are
  in place.
- Provide evaluation for correctness, grounding, refusal, privacy, security,
  latency and cost before enabling an approved capability.
