# Testing Strategy

## Test Pyramid
- **Unit:** parsers, chunkers, authorization policies, score normalization, error mapping.
- **Integration:** PostgreSQL queries, pgvector retrieval, queue handlers, object storage, provider adapters with fakes.
- **Contract:** API schemas, SSE event order, external connector contracts.
- **End-to-end:** sign-in, upload, ingestion, question, citation opening, administration.
- **Evaluation:** retrieval and answer quality against labeled datasets.
- **Security:** tenant isolation, injection, SSRF, upload abuse, rate limits, secret leakage.

## AI Evaluation
Maintain a versioned dataset containing questions, allowed source IDs, expected claim attributes, and expected abstention cases. Run deterministic retrieval tests and model-assisted grading only with a documented rubric and sampled human review. Track citation precision, citation recall, groundedness, answer completeness, refusal correctness, latency, and cost.

## Test Environments
Use ephemeral databases for pull requests and production-like staging for migration, load, and connector tests. Never use production customer content in development. Test fixtures should include multiple workspaces and deliberately similar document names to expose authorization bugs.

## Quality Gates
A pull request must pass formatting, lint, type checking, unit/integration tests, security scans, migration checks, and relevant AI evaluation thresholds. A release requires successful end-to-end smoke tests, no critical vulnerabilities, acceptable error budgets, and a rollback plan.

## Load and Resilience
Load test query concurrency, streaming connections, upload bursts, queue backlog, and provider throttling. Inject database, queue, object storage, and model failures. Verify timeouts, circuit breakers, graceful degradation, and dead-letter handling.

## Example Security Test
```text
Given workspace A has a document containing "A-SECRET"
And workspace B has a member who asks for "A-SECRET"
When the query is executed as workspace B
Then no retrieved chunk, citation, answer, cache entry, or log contains the secret
```

## Common Mistakes
- Testing only the model response while skipping retrieval and authorization.
- Using one workspace in all fixtures.
- Setting quality thresholds after seeing results.
- Treating end-to-end tests as a replacement for fast policy tests.
- Ignoring streaming disconnect and retry behavior.