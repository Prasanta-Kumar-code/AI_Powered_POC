# User Stories and Acceptance Criteria

## Epic: Identity and Workspaces
- As a user, I can sign in and see only workspaces where I have membership.
- As an administrator, I can invite a member with a role and revoke access.
- As a security reviewer, I can see role changes in the audit log.

**Acceptance:** revoked users receive 403 responses for workspace resources; role changes take effect on the next authorization check; invitation tokens expire and are single use.

## Epic: Knowledge Sources
- As an administrator, I can register an approved source and define its sync schedule.
- As a user, I can upload a supported file and see processing progress.
- As an operator, I can retry a failed job without creating duplicate chunks.

**Acceptance:** unsupported or oversized files fail with a user-safe error; source versions are immutable; retries are idempotent; deleted sources are excluded from retrieval.

## Epic: Grounded Answers
- As a user, I can ask a question and receive a streamed answer.
- As a user, I can open each citation at the relevant source passage.
- As a user, I can give positive or negative feedback and optionally state why.

**Acceptance:** a successful factual answer includes citations; no-evidence queries produce an explicit abstention; partial provider failure is represented as an actionable error; answer and citation events share a correlation ID.

## Epic: Governance
- As an administrator, I can set a monthly token budget and request rate.
- As a security reviewer, I can filter audit events by user, workspace, action, and time.
- As an operator, I can see model, embedding, retrieval, and latency metrics.

**Acceptance:** budget enforcement occurs before provider invocation; audit events do not contain raw secrets; metrics use stable dimensions and do not permit unbounded cardinality.

## Epic: Agents
- As a user, I can ask an agent to prepare a draft using authorized knowledge.
- As an administrator, I can enable only approved tools for a workspace.
- As a user, I must approve any external side effect before execution.

**Acceptance:** tools have schemas and timeouts; plans and tool calls are logged; denied or expired approvals cannot execute; failed actions do not silently retry side effects.

## Definition of Ready
The story has a user outcome, authorization rule, error behavior, observable signals, test data, and an explicit non-goal. Security-sensitive stories include a threat-model note.

## Definition of Done
Code, tests, telemetry, migrations, documentation, accessibility checks, and rollback notes are complete. The change passes CI, security scanning, and relevant evaluation sets.

## Mistakes to Avoid
- Writing stories as implementation tasks without a user outcome.
- Defining only the happy path for model and ingestion workflows.
- Accepting “AI quality” without a labeled evaluation set or review protocol.
- Letting an agent story omit the approval boundary.