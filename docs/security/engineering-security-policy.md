# PULSO engineering security policy

## Authority and scope

The Founder/CTO accepts material security risk and approves security-critical
policy changes. The Application Security Engineer provides independent,
read-only review and cannot accept risk or approve their own implementation.
This policy complements root `AGENTS.md`, `.agents/rules/`, and service-level
controls; it does not replace authorization in the backend.

## Secure design requirements

- Threat-model authentication, authorization, tenant isolation, sensitive data,
  external integrations and AI/data flows during design, before implementation.
- Treat all client input, route parameters, headers, imported files, model output
  and third-party responses as untrusted.
- Derive identity from verified credentials and validate persisted Membership
  and role at every backend operation. Scope every query/mutation to the
  authorized company. Never use frontend checks or opaque IDs as authorization.
- Prevent cross-tenant references at service and database layers where
  practical; return errors that do not disclose another tenant's data.
- Validate and normalize at trust boundaries. Use parameterized DB operations,
  least privilege and explicit, typed contracts. Keep secrets and sensitive
  fields out of logs, errors, traces, fixtures and prompts unless approved and
  minimized.
- Use structured logs, correlation/trace context and useful security events.
  Define retention/access controls before logging personal or financial data.
- Review direct and transitive dependencies for provenance, maintenance,
  licenses, known vulnerabilities and lockfile changes. Do not add a dependency
  without a concrete need.

## Data, AI and financial/operational actions

- The repository has no approved PULSO data-classification or retention
  schedule yet. The Founder/CTO must approve the classification, purpose,
  access, retention and deletion rules before a task processes production,
  personal, financial or customer data. Do not invent retention periods.
- Classify data and use only data authorized for the task, tenant and
  environment. Production/customer data requires explicit approval and an
  approved handling path.
- AI outputs must be grounded in authorized, traceable sources, distinguish
  uncertainty from fact and never fabricate company data.
- Do not allow an AI system to write to production, move money, change financial
  records, commit inventory/sales actions or change permissions without an
  explicitly approved policy, server-side authorization, validation,
  idempotency/audit controls and human approval appropriate to impact.
- Never send secrets or customer data to unapproved external tools/services.

## Change and release controls

- Security review is required when authentication, authorization, tenant
  isolation, sensitive/personal data, secrets, dependency trust, AI autonomy,
  security controls or production infrastructure changes.
- Security review is independent and read-only. Findings include severity,
  evidence, impact/preconditions, recommendation and limitations.
- Do not weaken tests, lint, types, hooks, sandboxing or permissions to bypass a
  finding or approval prompt.
- Destructive migrations, database resets, production deployment and changes to
  critical permissions require explicit, operation-specific Founder/CTO
  approval. Validate backups, rollback and monitoring before release.
- A hook or agent prompt is defense in depth, not an ACL. Keep platform
  permissions and sandbox enabled; inspect the exact operation and target.

## Incident and exception handling

Immediately stop affected work for suspected secret exposure, cross-tenant
access, unauthorized production action or material data loss. Preserve relevant
evidence, notify the human owner through the approved channel, and do not
silently clean or rewrite history. Record an exception with scope, risk,
mitigation, expiry and Founder/CTO approval; exceptions do not become permanent
defaults.
