# Documentation Improvements

## Review Scope
This review covers the current contents of `project-docs/02` through `project-docs/25`. The requested `project-docs/01-product-requirements.md` is currently absent from the workspace, so product requirements cannot be reconciled against the architecture. Findings are intentionally critical and prioritize controls that must exist before production implementation.

## P0: Restore the Requirements Baseline
**Evidence:** `project-docs/01-product-requirements.md` is missing.  
**Problem:** There is no authoritative source for scope, release acceptance, non-functional requirements, data classes, supported connectors, user entitlements, or measurable product outcomes. The other documents contain assumptions, but none is a requirements baseline.  
**Improvement:** Restore the file and add a traceability matrix mapping every requirement to an API, data model, UI flow, test, metric, and operational owner. Mark requirements as must/should/could and define explicit v1 exclusions.

## P0: Make Tenant Isolation an Enforceable Invariant
**Evidence:** [Database Design](project-docs/06-database-design.md) requires tenant columns and recommends RLS, while [Backend Architecture](project-docs/09-backend-architecture.md) and [Security Guidelines](project-docs/15-security-guidelines.md) describe application checks.  
**Problem:** “Must filter by workspace” is not a complete control. The docs do not define RLS policies, connection-pool tenant context, transaction behavior, background-job authorization, cache key requirements, or cross-tenant test coverage.  
**Improvement:** Specify a single authorization model: RLS policies for every tenant-owned table, a trusted transaction-scoped tenant setting, repository predicates as defense in depth, and mandatory negative tests for HTTP, jobs, retrieval, caches, exports, logs, and agent runs. Fail closed when tenant context is absent.

## P0: Define the Production Runtime Choice
**Evidence:** [Deployment Guide](project-docs/18-deployment-guide.md) permits “ECS Fargate or EKS.”  
**Problem:** These are materially different operating models for networking, deployment, autoscaling, observability, IAM, incident response, and cost. A production guide cannot leave the core runtime undecided.  
**Improvement:** Select one target for v1, document why, define task/pod roles, health and readiness checks, autoscaling signals, rollout/rollback procedure, secrets injection, resource limits, and ownership. Record the alternative as a future ADR rather than an active design.

## P0: Select and Specify the Queue
**Evidence:** [System Architecture](project-docs/05-system-architecture.md) uses a generic job queue; [Deployment Guide](project-docs/18-deployment-guide.md) says “ElastiCache or a durable queue.”  
**Problem:** Redis/ElastiCache and a durable queue have different delivery, ordering, visibility, replay, durability, and failure semantics. Ingestion correctness and recovery cannot be implemented safely from this abstraction alone.  
**Improvement:** Choose the service and document message schema, deduplication key, visibility timeout, retry/backoff, ordering requirements, dead-letter retention, poison-message procedure, encryption, maximum payload, and replay ownership.

## P1: Define the Connector Contract
**Evidence:** Sources and connectors appear in [Product Vision](project-docs/02-project-vision.md), [User Stories](project-docs/04-user-stories.md), and [RAG Architecture](project-docs/11-rag-architecture.md), but no connector interface or lifecycle is defined.  
**Problem:** The product promises connectors without specifying incremental sync, deletions, remote ACL mapping, cursors, rate limits, webhook authenticity, reauthorization, token storage, or source freshness semantics.  
**Improvement:** Define a connector SPI with `discover`, `fetch`, `diff`, `delete`, checkpoint, and health operations. Specify how remote permissions map to local principals and what happens when permissions cannot be mapped. Treat connector sync as security-sensitive, not just ingestion plumbing.

## P1: Replace the Example Schema with a Complete Logical Model
**Evidence:** [Database Design](project-docs/06-database-design.md) lists entities but provides one partial `chunks` table only.  
**Problem:** There are no required columns, foreign keys, indexes, states, uniqueness rules, retention markers, or cascade behavior for memberships, documents, conversations, messages, jobs, citations, feedback, audit events, or model usage. Implementers can create incompatible schemas.  
**Improvement:** Add an ER diagram and table contract for every entity, including state transitions, ownership, deletion semantics, optimistic concurrency, audit immutability, and indexes justified by query plans.

## P1: Resolve Vector and Embedding Compatibility
**Evidence:** [Database Design](project-docs/06-database-design.md) hard-codes `vector(1536)` and HNSW, while [AI Architecture](project-docs/10-ai-architecture.md) and [RAG Architecture](project-docs/11-rag-architecture.md) require provider/model abstraction.  
**Problem:** A fixed dimension conflicts with model/provider migration unless there is a parallel-index strategy, which is only described conceptually. Distance metric, normalization, model version, and index rebuild procedure are not part of the schema contract.  
**Improvement:** Store embedding provider, model, dimension, metric, and normalization metadata. Define separate indexes or versioned tables, dual-write/backfill behavior, validation, cutover, and rollback.

## P1: Specify Retrieval Authorization Semantics
**Evidence:** [Database Design](project-docs/06-database-design.md) includes `visibility snapshot` in chunks, while its retrieval rules require current membership/source/document checks.  
**Problem:** A stale snapshot can grant access after a permission revocation or deny newly granted access. The docs do not say whether snapshot fields are advisory, authoritative, or regenerated.  
**Improvement:** Make current authorization authoritative at query time. Remove access decisions from copied chunk metadata, or define a transactional ACL version and invalidation protocol with bounded revocation latency.

## P1: Define the Answer and Citation Data Contract
**Evidence:** [API Design](project-docs/07-api-design.md), [AI Architecture](project-docs/10-ai-architecture.md), and [Prompt Engineering Guide](project-docs/13-prompt-engineering-guide.md) mention citations and schemas but do not define one shared schema.  
**Problem:** Frontend, API, validator, persistence, and evaluation teams can disagree on citation IDs, offsets, source versions, claim coverage, abstention reasons, and partial-stream behavior.  
**Improvement:** Publish a versioned JSON schema and SSE event schema. Define citation identity, source-version pinning, passage offsets, validation failure behavior, truncation, cancellation, replay, and whether incomplete answers are persisted.

## P1: Add Data Governance and Compliance Requirements
**Evidence:** [Security Guidelines](project-docs/15-security-guidelines.md) says retention must be defined, but no schedule, data classification, residency, legal hold, export, deletion verification, or processor policy is specified.  
**Problem:** Enterprise customers cannot assess how prompts, embeddings, source objects, feedback, logs, and backups are handled. “According to policy” is not implementable.  
**Improvement:** Add a data inventory and lifecycle matrix covering collection purpose, classification, owner, region, retention, deletion SLA, backup expiry, legal hold, customer export, and OpenAI data-processing configuration.

## P1: Add Authentication Lifecycle Requirements
**Evidence:** OIDC is named in [Security Guidelines](project-docs/15-security-guidelines.md), but invitation, SSO, SCIM, session revocation, account linking, service identities, and break-glass access are not defined.  
**Improvement:** Specify token validation, key rotation, issuer/audience rules, logout and revocation behavior, invitation expiry, domain/tenant discovery, role provisioning, service-to-service identity, and emergency access logging.

## P1: Turn Observability into SLOs and Runbooks
**Evidence:** [DevOps Guide](project-docs/17-devops-guide.md) lists dashboards and [Performance Guidelines](project-docs/24-performance-guidelines.md) lists budgets.  
**Problem:** There are no alert thresholds, burn-rate policies, owners, escalation paths, sampling rules, or runbooks for the most serious failures.  
**Improvement:** Define SLOs for query success, first token, complete answer, retrieval, ingestion freshness, queue age, citation validation, and tenant-isolation alerts. Include alert routing, runbook links, and safe redaction rules.

## P1: Add AI Quality Release Gates
**Evidence:** [Testing Strategy](project-docs/16-testing-strategy.md) names metrics but does not set thresholds, confidence intervals, evaluator versioning, or human-review policy.  
**Improvement:** Define minimum retrieval and citation thresholds, abstention targets, injection-test pass criteria, regression tolerances, sample sizes, grader calibration, model-change approval, and rollback triggers. Separate offline quality gates from production monitoring.

## P2: Define Cost Governance Precisely
**Evidence:** [Business Model](project-docs/25-business-model.md), [AI Architecture](project-docs/10-ai-architecture.md), and [Performance Guidelines](project-docs/24-performance-guidelines.md) mention budgets and cost.  
**Problem:** There is no authoritative token accounting method, provider-price version, overage behavior, reservation policy, or cost allocation for retries and background jobs.  
**Improvement:** Define a usage ledger keyed by workspace, operation, model, prompt version, and provider request. Specify preflight budget checks, hard/soft limits, overage behavior, refunds, and reconciliation against provider invoices.

## P2: Complete the Threat Model
**Evidence:** [Security Guidelines](project-docs/15-security-guidelines.md) names threats but does not document trust boundaries, attack paths, assets, mitigations, residual risk, or verification.  
**Improvement:** Add a STRIDE-style threat model covering browser, API, workers, connectors, parser sandbox, queue, database, S3, OpenAI, CI/CD, and operators. Link each mitigation to a test, alert, or control owner.

## P2: Clarify Frontend Authentication and Streaming
**Evidence:** [Frontend Architecture](project-docs/08-frontend-architecture.md) and [API Design](project-docs/07-api-design.md) describe SSE but not browser authentication, CSRF, reconnect, backpressure, proxy buffering, or stream authorization.  
**Improvement:** Choose cookie or bearer-token semantics, define CORS/CSRF behavior, heartbeat and idle timeouts, event replay, cancel handling, proxy configuration, and authorization revalidation for long-lived streams.

## P2: Add Supply-Chain and Dependency Governance
**Evidence:** [Coding Standards](project-docs/14-coding-standards.md) and [DevOps Guide](project-docs/17-devops-guide.md) mention scanning, but no SBOM, provenance, base-image refresh SLA, lockfile policy, license review, or dependency exception process exists.  
**Improvement:** Require SBOM generation, signed/provenance-attested images, lockfile enforcement, critical CVE SLAs, action pinning, secret scanning, and documented exceptions.

## P2: Make the Roadmap Traceable
**Evidence:** [Development Roadmap](project-docs/20-development-roadmap.md) is phase-based but has no owner, dependency, exit metric, staffing assumption, or customer validation artifact.  
**Improvement:** Add a release backlog with accountable owner, dependency graph, capacity assumption, acceptance metric, risk, and go/no-go decision for every phase.

## Recommended Order
1. Restore product requirements and create traceability.
2. Select runtime and queue; document RLS and complete data contracts.
3. Define connector, citation, retention, identity, and cost contracts.
4. Add threat model, AI release gates, SLOs, and runbooks.
5. Only then implement production infrastructure and autonomous workflows.
