# API Design

## Conventions
The Express API is versioned under `/v1`. JSON uses camelCase externally and typed schemas internally. Dates are ISO 8601 UTC strings. Errors use a stable envelope with `code`, `message`, `details`, and `requestId`; messages never reveal authorization-sensitive resource existence.

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "The request could not be processed.",
    "details": [{"field": "question", "reason": "required"}],
    "requestId": "req_01HX..."
  }
}
```

## Resource Endpoints
| Method | Path | Purpose |
|---|---|---|
| GET | `/v1/workspaces` | List accessible workspaces |
| POST | `/v1/workspaces/{workspaceId}/sources` | Register a source |
| POST | `/v1/workspaces/{workspaceId}/documents` | Create an upload session |
| GET | `/v1/workspaces/{workspaceId}/jobs/{jobId}` | Read job status |
| POST | `/v1/workspaces/{workspaceId}/conversations` | Create conversation |
| POST | `/v1/workspaces/{workspaceId}/conversations/{id}/messages` | Ask a question |
| GET | `/v1/workspaces/{workspaceId}/audit-events` | Query audit records |

## Streaming Answers
Use Server-Sent Events for ordered answer events: `message.started`, `message.delta`, `citation.added`, `message.completed`, and `message.failed`. Every event includes `requestId`, `conversationId`, and a sequence number. The server closes the stream after completion or a terminal error; clients reconnect only when the event contract permits it.

## Query Contract
```json
{
  "question": "What is the incident escalation policy?",
  "conversationId": "uuid",
  "filters": {"sourceIds": ["uuid"]},
  "clientRequestId": "unique-client-key"
}
```
Validate length, encoding, filters, and idempotency key. Do not accept a client-supplied tenant or authorization decision.

## Security and Reliability
Authenticate with OIDC-issued tokens, validate issuer/audience/signature, and resolve membership server-side. Apply per-user and per-workspace rate limits. Use idempotency for uploads, message creation, and job submission. Set request deadlines and payload limits. Return `429` with `Retry-After` for throttling, `503` for provider degradation, and `202` for asynchronous jobs.

## API Evolution
Prefer additive changes. Deprecate fields with telemetry and a published date. Contract-test the API against generated TypeScript clients. Never expose provider-specific response shapes to the browser.

## Common Mistakes
- Returning `404` versus `403` in a way that leaks restricted resources.
- Treating a streaming connection as an unbounded request.
- Retrying non-idempotent requests automatically.
- Logging access tokens, prompts, or entire documents.
- Using one generic `500` path without a stable operational error code.