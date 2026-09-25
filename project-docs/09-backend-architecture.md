# Backend Architecture

## Module Boundaries
The Express application uses controllers, application services, domain policies, repositories, provider adapters, and infrastructure. Controllers translate HTTP to use-case inputs. Services coordinate business behavior. Policies answer authorization questions. Repositories own persistence. Adapters isolate OpenAI, S3, email, and queue details.

```text
src/
  modules/auth
  modules/workspaces
  modules/sources
  modules/conversations
  modules/ingestion
  modules/agents
  modules/audit
  platform/http
  platform/db
  platform/observability
  workers/
```

## Request Pipeline
1. Assign or propagate a correlation ID.
2. Parse and verify the identity token.
3. Resolve workspace membership and role.
4. Validate request schema and enforce limits.
5. Invoke a use case with a transaction boundary where required.
6. Map typed domain errors to safe HTTP errors.
7. Emit audit and telemetry events.

## Worker Design
Workers consume durable jobs with a visibility timeout, exponential backoff, attempt limits, and dead-letter routing. Each handler is idempotent using a job key and source checksum. CPU-heavy parsing belongs in worker processes. Provider calls have timeouts and circuit breakers. Poison inputs are quarantined with enough metadata for diagnosis.

## Transactions
Use short database transactions. Do not hold a transaction open while waiting for an LLM or external connector. Persist an intermediate state, perform the external operation, and finalize with a compare-and-set update. Use the outbox pattern when a database change must reliably emit an event.

## Observability
Emit structured JSON logs with request ID, workspace hash, actor hash, operation, outcome, duration, and provider status. Metrics include request counts, latency, queue age, job outcomes, token usage, retrieval hit rate, and citation validation. Traces cross API, database, queue, and provider boundaries with content redaction.

## Configuration
Parse environment variables once at startup into a typed configuration object. Fail fast for missing required production settings. Separate configuration from secrets, validate URLs and numeric limits, and provide safe local defaults only for local development.

## Common Mistakes
- Putting business policy in route handlers.
- Holding database transactions during network calls.
- Retrying an external side effect without an idempotency key.
- Adding raw prompt content to logs for convenience.
- Allowing worker concurrency to exceed provider or database capacity.