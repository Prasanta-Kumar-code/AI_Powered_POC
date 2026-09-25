# Performance Guidelines

## Budgets
Initial budgets: p75 time to first answer token under 2.5 seconds, p95 complete answer under 8 seconds, p95 retrieval under 1.5 seconds, web initial route JavaScript under 250 KB compressed for the core route, API availability 99.9%, and worker queue age under 60 seconds during normal load. Revisit budgets using real usage data.

## Frontend
Use server rendering for stable data, stream where it improves perceived response, split heavy admin and source-preview code, optimize images, and avoid unnecessary client hydration. Keep message rendering incremental and bounded. Measure Core Web Vitals on representative low-bandwidth devices.

## API and Database
Use connection pooling, prepared or parameterized queries, appropriate indexes, bounded result sets, and pagination. Profile hybrid retrieval plans with realistic data. Cache only data whose authorization key and invalidation semantics are explicit. Avoid N+1 queries in workspace and citation views.

## AI and Retrieval
Limit candidate count, context tokens, output length, and agent steps. Use a fast classifier or cached embedding only where evaluation proves quality remains acceptable. Track provider queue time, network time, retrieval time, model time, and validation time separately so optimization targets the real bottleneck.

## Workers
Use controlled concurrency, batch embedding calls within provider limits, checkpoint long jobs, and apply backpressure. A queue that grows faster than workers can process it is a product incident, not merely an infrastructure metric.

## Measurement
Use traces and synthetic checks for the critical query path. Compare p50, p95, and p99 by workspace plan and operation. Performance changes must include before/after measurements and a cost impact. Do not optimize generated-token speed by removing citations or validation.

## Common Mistakes
- Measuring only average latency.
- Adding a cache without tenant-aware invalidation.
- Increasing model size to solve a retrieval problem.
- Ignoring cold starts, database connection exhaustion, and queue age.
- Treating Core Web Vitals as unrelated to a streaming AI workflow.