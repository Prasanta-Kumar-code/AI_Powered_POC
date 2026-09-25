# AtlasAI Development Execution Plan

This is the implementation checklist for the production-ready AI knowledge workspace described in `project-docs/`. Execute items in order unless a dependency is explicitly marked parallel. Do not accept production customer data or enable write-capable agents until all release-blocking gates pass.

## 0. Execution Rules and V1 Decisions

- [ ] Assign accountable owners for product, platform, security, data, AI quality, UX, and operations.
- [ ] Restore and approve `project-docs/01-product-requirements.md`; mark requirements as must, should, or could.
- [ ] Create an ADR index and decision log in the repository.
- [ ] Select **ECS Fargate** for the v1 runtime; keep EKS as a future alternative, not an active deployment path.
- [ ] Select **Amazon SQS standard queues with SQS dead-letter queues** for asynchronous ingestion and agent jobs; use FIFO only for workflows that require ordering.
- [ ] Select **Amazon RDS PostgreSQL Multi-AZ with pgvector** as the initial relational and vector store.
- [ ] Select **Amazon S3** for encrypted source objects and derived artifacts.
- [ ] Select the organization’s OIDC provider for user identity; use short-lived service roles for AWS workloads.
- [ ] Use **OpenAI through an internal AI gateway**; no browser or domain module may call the provider directly.
- [ ] Define the v1 supported file types as PDF, DOCX, Markdown, HTML, and plain text; reject all others explicitly.
- [ ] Define v1 exclusions: arbitrary connectors, autonomous write actions, model fine-tuning, and multimodal generation.

**Gate 0:** Approved requirements baseline, threat model owner, runtime decision, queue decision, data classification, and release acceptance criteria exist before application scaffolding begins.

## 1. Product and Delivery Baseline

- [ ] Convert requirements into a traceability matrix: requirement, user story, API, data entity, UI flow, test, metric, and owner.
- [ ] Define v1 personas, permissions, workspace plans, usage limits, retention classes, and support expectations.
- [ ] Define measurable release targets: answer success, citation validity, retrieval latency, first-token latency, ingestion freshness, availability, cost per query, and accessibility.
- [ ] Create a labeled evaluation set with normal questions, no-answer questions, stale documents, duplicate documents, prompt-injection documents, and cross-workspace access attempts.
- [ ] Define the product glossary: workspace, source, document, version, chunk, citation, conversation, job, agent run, approval, and audit event.
- [ ] Create an ownership matrix for repositories, AWS accounts, production access, on-call, incident response, and model/provider accounts.
- [ ] Create a risk register with due dates and explicit acceptance criteria for each critical risk.

**Exit criteria:** Product, security, and engineering approve the same v1 scope and success metrics.

## 2. Repository and Local Development Foundation

- [ ] Initialize the monorepo using pnpm workspaces and Turborepo.
- [ ] Create `apps/web`, `apps/api`, `apps/worker`, `packages/contracts`, `packages/domain`, `packages/ai`, `packages/config`, and `packages/observability`.
- [ ] Create `db/migrations`, `db/seeds`, `infrastructure/terraform`, `infrastructure/docker`, `evals`, and test directories.
- [ ] Pin Node.js, pnpm, TypeScript, and package versions using repository and CI configuration.
- [ ] Add strict TypeScript, ESLint, Prettier, import rules, commit hooks, and conventional commit guidance.
- [ ] Add `.env.example` with non-secret names only; validate configuration at startup.
- [ ] Add Docker Compose for local PostgreSQL with pgvector, LocalStack or equivalent AWS fakes, and the local queue adapter.
- [ ] Add health and readiness endpoints for API and worker processes.
- [ ] Add a local seed command that creates two workspaces, multiple roles, sample documents, and deliberately restricted data.
- [ ] Add a README with setup, test, migration, evaluation, and troubleshooting commands.

**Exit criteria:** A new engineer can clone the repository, start dependencies, run migrations, seed isolated fixtures, and execute all fast checks without production credentials.

## 3. Contracts Before Implementations

- [ ] Define versioned JSON schemas for API requests, API responses, error envelopes, and pagination.
- [ ] Define the SSE schema: event names, sequence numbers, correlation IDs, heartbeats, terminal events, cancellation, and reconnect behavior.
- [ ] Define citation schema: source ID, document version ID, chunk ID, passage offsets, title, page/section metadata, and validation status.
- [ ] Define domain state machines for source, document version, ingestion job, message, agent run, approval, and deletion.
- [ ] Define SQS message schemas, idempotency keys, attempt metadata, visibility timeout, and dead-letter behavior.
- [ ] Define provider interfaces for chat completion, embeddings, moderation, object storage, queue, identity, and vector retrieval.
- [ ] Generate typed clients and validators from the approved contracts where practical.
- [ ] Add contract tests for every browser, API, worker, and provider boundary.

**Gate 1:** No feature team may invent a private response shape or queue payload after this gate.

## 4. Identity, Authorization, and Tenant Isolation

- [ ] Integrate OIDC token validation with issuer, audience, signature, expiry, clock skew, and JWKS rotation checks.
- [ ] Implement users, workspaces, memberships, roles, invitations, membership status, and revocation.
- [ ] Define service principals for API, ingestion worker, connector worker, evaluation runner, and agent executor.
- [ ] Define delegated user context for jobs and agent runs without granting workers unrestricted user privileges.
- [ ] Add authorization policies for workspace, source, document, conversation, message, job, audit event, export, and agent approval resources.
- [ ] Add PostgreSQL row-level security for every tenant-owned table.
- [ ] Establish a trusted transaction-scoped tenant context; fail closed when it is absent or inconsistent.
- [ ] Keep repository-level workspace predicates as defense in depth.
- [ ] Define cache keys and stream authorization keys with workspace, user, resource, and permission version.
- [ ] Add negative tests for cross-tenant HTTP requests, direct SQL, background jobs, retrieval, caches, exports, and agent runs.
- [ ] Test permission revocation during an active stream, queued ingestion job, and agent run.
- [ ] Add audit events for authentication, membership, role, permission, source, document, query, export, approval, and administrative actions.

**Gate 2:** Security review confirms fail-closed tenant isolation with automated regression tests before documents are indexed.

## 5. Database, Migrations, and Data Lifecycle

- [ ] Create complete migrations for users, workspaces, memberships, invitations, sources, documents, document versions, chunks, conversations, messages, citations, feedback, jobs, usage ledger, approvals, and audit events.
- [ ] Add foreign keys, unique constraints, state checks, ownership columns, soft-delete markers, version columns, and deletion timestamps.
- [ ] Add indexes for authorization predicates, current document versions, job state, audit filters, conversation access, and usage aggregation.
- [ ] Store embedding provider, model, dimension, distance metric, normalization, and index version with each embedding set.
- [ ] Decide whether embeddings use versioned tables or a parallel-index strategy; document cutover and rollback.
- [ ] Do not use copied chunk visibility as authoritative access control; current permissions must be checked at retrieval.
- [ ] Define retention classes for source objects, extracted text, chunks, embeddings, conversations, feedback, usage, logs, and audit records.
- [ ] Implement deletion workflows that mark records unavailable immediately and remove objects, vectors, caches, and derived artifacts asynchronously.
- [ ] Implement customer export and deletion verification reports.
- [ ] Add migration CI against a clean database and an upgrade database with representative data.
- [ ] Test point-in-time restore and document the database/object/queue recovery order.

**Exit criteria:** Schema, permissions, retention, deletion, backup, and restore behavior are tested together, not only as individual components.

## 6. Infrastructure and Cloud Security

- [ ] Create separate AWS accounts or isolated environments for development, staging, and production.
- [ ] Provision networking with Terraform: VPC, private subnets, route tables, security groups, VPC endpoints, controlled egress, and no public database endpoint.
- [ ] Provision RDS PostgreSQL Multi-AZ with backups, encryption, parameter groups, monitoring, and connection limits.
- [ ] Provision S3 buckets with block-public-access, KMS encryption, versioning, lifecycle rules, object ownership, and access logs.
- [ ] Provision SQS queues and DLQs with encryption, retention, visibility timeout, redrive policy, and alarms.
- [ ] Provision ECS Fargate services for web, API, and workers with separate task roles and resource limits.
- [ ] Provision Secrets Manager entries and IAM policies with least privilege and rotation procedures.
- [ ] Configure WAF, ALB, TLS certificates, DNS, security headers, and restricted administrative access.
- [ ] Configure CloudWatch, OpenTelemetry export, dashboards, alarms, log retention, and redaction.
- [ ] Enable CloudTrail, GuardDuty, vulnerability scanning, dependency scanning, and container image scanning.
- [ ] Produce an SBOM and provenance-attested image for each release.

**Gate 3:** Staging infrastructure is reproducible from Terraform and passes an access-control review, vulnerability scan, and failure drill.

## 7. Backend and API Vertical Slice

- [ ] Implement Express request correlation, structured logging, request limits, timeouts, CORS, CSRF strategy, and safe error mapping.
- [ ] Implement authentication middleware and workspace authorization middleware.
- [ ] Implement workspace and membership endpoints with pagination and audit events.
- [ ] Implement upload-session creation with file-size, content-type, checksum, and quota validation.
- [ ] Implement S3 presigned upload and callback verification; never trust client-provided object metadata.
- [ ] Implement source, document, job-status, conversation, message, feedback, and audit endpoints.
- [ ] Implement idempotency for upload creation, message creation, source sync, and job submission.
- [ ] Implement SSE streaming with sequence numbers, heartbeat, cancellation, idle timeout, terminal events, and validated final persistence.
- [ ] Add API contract tests and authorization matrix tests.
- [ ] Add rate limits per user, workspace, IP, endpoint, and expensive operation.

**Exit criteria:** A member can authenticate, upload a document, see processing state, ask a question, receive a safe streamed response, open citations, and submit feedback.

## 8. Ingestion Pipeline

- [ ] Implement source checksum and document-version deduplication.
- [ ] Validate file signatures, size, expansion ratio, page count, encoding, and decompression limits.
- [ ] Isolate parsers from the API process with CPU, memory, time, and concurrency limits.
- [ ] Implement extraction for PDF, DOCX, Markdown, HTML, and plain text with parser version metadata.
- [ ] Preserve page, heading, section, table, and source-offset metadata.
- [ ] Implement semantic chunking with token limits, bounded overlap, and no split of important structured blocks.
- [ ] Generate embeddings through the AI gateway and validate dimension/model metadata.
- [ ] Write chunks transactionally and mark a document version searchable only after complete validation.
- [ ] Implement retryable failures, permanent failures, quarantine, SQS DLQ, and operator retry.
- [ ] Add freshness metrics, job age metrics, ingestion status UI, and failure reason categories.
- [ ] Test duplicate delivery, worker crash, partial embedding failure, deletion during ingestion, and replay.

**Gate 4:** Ingestion is idempotent, permission-aware, replayable, observable, and resource-bounded.

## 9. Retrieval-Augmented Generation

- [ ] Implement hybrid keyword and vector retrieval with authorization predicates applied before ranking.
- [ ] Define score normalization, candidate count, reranking policy, diversity rules, and context budget.
- [ ] Implement query classification and optional query rewriting behind feature flags.
- [ ] Build prompts with system policy, developer task, labeled untrusted context, and user question layers.
- [ ] Add deterministic prompt-injection handling for retrieved content and tool restrictions.
- [ ] Implement grounded answer generation with structured output and citation requirements.
- [ ] Validate citation IDs, source versions, offsets, and claim coverage before final delivery.
- [ ] Implement explicit abstention for insufficient or conflicting evidence.
- [ ] Persist model, embedding, retrieval, prompt, token, latency, and validation metadata without raw sensitive content by default.
- [ ] Add offline evaluation for recall@k, MRR/nDCG, citation precision/recall, groundedness, abstention, latency, and cost.
- [ ] Add regression tests for stale documents, duplicate documents, exact identifiers, prompt injection, and restricted sources.

**Gate 5:** Evaluation thresholds are approved and the system cannot deliver an unvalidated factual answer as successful output.

## 10. Frontend Product Experience

- [ ] Build accessible authentication, workspace selection, navigation, and role-aware administration routes.
- [ ] Build source upload, processing status, retry, deletion, and source-version views.
- [ ] Build conversation list, question composer, stream rendering, cancellation, retry, abstention, degraded-provider, and error states.
- [ ] Build inline citations with source title, version, page/section, passage preview, and access-aware errors.
- [ ] Build feedback controls and a report-issue workflow that does not expose sensitive content unnecessarily.
- [ ] Build administrator views for members, sources, limits, usage, audit events, and system health.
- [ ] Ensure keyboard navigation, screen-reader labels, live-region stream updates, focus management, contrast, reduced motion, and 200% zoom support.
- [ ] Validate responsive behavior on narrow mobile, tablet, and desktop viewports.
- [ ] Add browser tests for happy path, empty state, loading, streaming interruption, access denial, and long content.
- [ ] Measure Core Web Vitals and core route JavaScript size.

**Exit criteria:** A knowledge worker can complete the core workflow without documentation, keyboard users can complete it, and all failure states are understandable and recoverable.

## 11. Operations, Quality, and Cost Controls

- [ ] Define SLOs for API success, first token, complete answer, retrieval latency, ingestion freshness, queue age, citation validation, and availability.
- [ ] Define error budgets, multi-window burn-rate alerts, owners, escalation policies, and runbook links.
- [ ] Implement usage ledger entries for input/output tokens, embeddings, retries, model, provider request ID, workspace, operation, and price version.
- [ ] Add atomic budget reservation before expensive model calls and release/refund behavior for failures.
- [ ] Add per-workspace, per-user, per-request, and per-agent token/step/time limits.
- [ ] Add circuit breakers for OpenAI, PostgreSQL saturation, SQS backlog, and object-storage failures.
- [ ] Add dashboards for cost, quality, latency, queue age, ingestion failures, authorization failures, and provider health.
- [ ] Create runbooks for provider outage, cross-tenant suspicion, queue poison messages, database failover, restore, credential rotation, and deletion failure.
- [ ] Conduct on-call game days and record findings in the risk register.

**Gate 6:** Operations can detect, contain, explain, and recover from the top production failure modes.

## 12. Security and Compliance Verification

- [ ] Complete a STRIDE-style threat model for browser, API, workers, parsers, connectors, queue, database, S3, OpenAI, CI/CD, and operators.
- [ ] Run dependency, secret, SAST, container, IaC, and license scans in CI.
- [ ] Run DAST and authenticated API security tests in staging.
- [ ] Perform tenant-isolation penetration tests across API, retrieval, cache, exports, jobs, logs, and agents.
- [ ] Test SSRF, malicious uploads, decompression bombs, prompt injection, data exfiltration, rate-limit bypass, and replay attacks.
- [ ] Verify secure headers, TLS, cookie/token behavior, CSRF protection, CORS, and error redaction.
- [ ] Verify retention, deletion, customer export, legal hold, backup expiry, and provider data-processing controls.
- [ ] Review IAM policies and confirm no production task has broad wildcard permissions.
- [ ] Produce an incident-response plan and perform a tabletop exercise.

**Gate 7:** No critical or high-risk unresolved issue lacks an owner, mitigation, test, and approved exception.

## 13. Performance, Resilience, and Recovery

- [ ] Load test concurrent queries, SSE streams, uploads, ingestion bursts, queue backlog, and provider throttling.
- [ ] Test database connection exhaustion, slow vector queries, lock contention, and index rebuild impact.
- [ ] Test API, worker, queue, RDS, S3, and OpenAI failure modes with controlled fault injection.
- [ ] Verify backpressure and that worker concurrency respects provider, CPU, memory, and database limits.
- [ ] Execute blue/green or canary deployment with backward-compatible migrations.
- [ ] Execute point-in-time database restoration, S3 object restoration, secret recovery, queue replay, and vector reindexing from source objects.
- [ ] Measure achieved RPO/RTO and compare with customer-plan commitments.
- [ ] Test rollback of application, prompt, model, retrieval, and feature-flag changes.

**Gate 8:** Measured performance and recovery meet approved budgets; rollback and restore are proven, not merely documented.

## 14. Pilot and Production Launch

- [ ] Select design partners with synthetic or explicitly approved content and signed data-processing terms.
- [ ] Onboard pilot workspaces with least privilege, source inventory, retention settings, and usage budgets.
- [ ] Review weekly quality samples with human graders and compare against offline evaluation.
- [ ] Track activation, verified-answer rate, source click-through, abstention quality, latency, cost, support load, and incidents.
- [ ] Resolve pilot findings and update requirements, risk register, runbooks, and evaluation data.
- [ ] Freeze release candidate versions of application images, migrations, prompts, model settings, and infrastructure.
- [ ] Run final smoke, security, accessibility, performance, recovery, and compliance checks.
- [ ] Obtain product, security, operations, and executive go/no-go approval.
- [ ] Enable production access gradually with feature flags and monitor error budgets.

**Production gate:** No production launch with unresolved cross-tenant, deletion, credential, prompt-injection-to-tool, or recovery defects.

## 15. Post-Launch and Continuous Improvement

- [ ] Review SLOs, costs, quality, security alerts, support cases, and customer feedback weekly.
- [ ] Add representative failures to regression and adversarial evaluation sets.
- [ ] Re-run model, prompt, embedding, and retrieval evaluations before every material change.
- [ ] Reassess indexes, partitioning, queue throughput, connection pools, and storage lifecycle as volume grows.
- [ ] Rotate credentials, dependencies, base images, certificates, and signing keys on documented schedules.
- [ ] Conduct quarterly disaster-recovery, access-review, incident-response, and threat-model exercises.
- [ ] Maintain ADRs, API schemas, migration notes, runbooks, and customer-facing data documentation.
- [ ] Expand connectors and agent capabilities only when authorization, approval, rollback, evaluation, and observability are complete.

## Final Definition of Done

The project is production-ready only when:

- [ ] Every v1 requirement maps to implementation, test, metric, and owner.
- [ ] Tenant isolation is enforced by design and tested negatively across every data path.
- [ ] Ingestion is idempotent, replayable, resource-bounded, and deletion-aware.
- [ ] Answers are grounded, citation-validated, observable, and capable of safe abstention.
- [ ] Agents are bounded, permissioned, auditable, and read-only unless side effects have approval and rollback controls.
- [ ] Security, privacy, retention, compliance, cost, performance, and recovery controls are verified in staging.
- [ ] CI produces tested, scanned, provenance-attested artifacts and deploys through a controlled promotion path.
- [ ] Operations has dashboards, alerts, runbooks, ownership, and a tested recovery plan.
- [ ] Product, engineering, security, and operations approve the launch decision.
