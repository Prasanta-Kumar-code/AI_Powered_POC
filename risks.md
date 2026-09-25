# Critical Risk Register

## Rating Method
**Critical:** credible path to data loss, cross-tenant disclosure, unsafe side effect, or inability to operate/recover.  
**High:** likely production outage, material compliance exposure, or severe quality/cost failure.  
**Medium:** significant maintainability or customer-impact risk that can be controlled before scale.

## Critical Risks

### R-001: Missing Product Requirements Baseline
**Evidence:** `project-docs/01-product-requirements.md` is absent.  
**Impact:** Teams can implement incompatible scope and declare success without shared acceptance criteria. Security, privacy, and availability requirements may be omitted entirely.  
**Mitigation:** Restore the document, version it, assign an owner, and require traceability from requirement to design, test, metric, and release gate.  
**Status:** Open, release-blocking.

### R-002: Cross-Tenant Data Disclosure
**Evidence:** The system relies on workspace predicates and optional RLS, while chunks, conversations, messages, jobs, audit records, caches, and exports are not fully specified.  
**Impact:** A single missing predicate, stale cache key, worker context, or SQL join can expose one customer’s documents to another. RAG makes the disclosure plausible and difficult for users to detect.  
**Mitigation:** Mandatory RLS, fail-closed tenant context, authorization-aware cache keys, isolated fixtures, adversarial retrieval tests, and alerts on authorization anomalies.  
**Status:** Open, release-blocking.

### R-003: Stale or Incorrect Access After Revocation
**Evidence:** [Database Design](project-docs/06-database-design.md) includes a chunk visibility snapshot but also requires current authorization filtering.  
**Impact:** A copied ACL can retain access after a source permission is revoked, or produce inconsistent answers after a grant. This is a confidentiality and correctness failure.  
**Mitigation:** Make current ACL evaluation authoritative, define revocation SLA, invalidate caches and active sessions as required, and test revocation during active queries and queued jobs.  
**Status:** Open, release-blocking.

### R-004: Prompt Injection Reaches Agent Capabilities
**Evidence:** [RAG Architecture](project-docs/11-rag-architecture.md), [Agent Design](project-docs/12-agent-design.md), and [Prompt Engineering Guide](project-docs/13-prompt-engineering-guide.md) recognize untrusted content, but do not define an enforceable tool firewall or capability isolation.  
**Impact:** A malicious document can influence planning, exfiltrate accessible data, trigger unauthorized tool use, or manipulate approval context. A model safety instruction is not a security boundary.  
**Mitigation:** Separate planner and executor, use an allowlisted tool registry outside model control, validate arguments deterministically, isolate credentials per tool, require approval over a parameter hash, and run injection replay tests.  
**Status:** Open, release-blocking for agents.

### R-005: Destructive or Duplicate Side Effects After Timeout
**Evidence:** Agent design says side effects need approval but does not specify idempotency keys, durable action state, reconciliation, or uncertain-outcome handling.  
**Impact:** A network timeout can cause a retry to create duplicate tickets, messages, or changes. The user may approve an action whose target state has changed.  
**Mitigation:** Use provider-supported idempotency, durable action records, compare-and-set preconditions, no automatic retry after uncertain side effects, reconciliation jobs, and compensating actions.  
**Status:** Open, release-blocking before write tools.

### R-006: Uncontrolled Connector SSRF or Credential Exposure
**Evidence:** Connectors are promised, but their interface, URL validation, credential storage, egress isolation, and webhook verification are unspecified.  
**Impact:** A connector can access internal metadata services, private hosts, or leak OAuth tokens through redirects and logs.  
**Mitigation:** Use fixed connector implementations and domain allowlists, resolve and validate IPs, block private/link-local ranges, disable unsafe redirects, isolate connector workers, vault credentials, and verify webhook signatures.  
**Status:** Open, release-blocking for connectors.

## High Risks

### R-007: Ambiguous Queue Semantics Cause Data Loss or Stalled Ingestion
**Evidence:** The architecture leaves the queue as an unspecified abstraction and the deployment guide allows ElastiCache or another durable queue.  
**Impact:** Redis-style transient behavior may lose jobs or fail to provide safe replay; an incorrect visibility timeout can create duplicate processing. Backlogs can make documents appear searchable when they are not.  
**Mitigation:** Select one durable service and specify delivery, visibility, deduplication, DLQ, replay, and freshness semantics.  
**Status:** Open.

### R-008: Runtime Choice Creates an Unoperable Production Platform
**Evidence:** AWS deployment permits ECS Fargate or EKS without a decision.  
**Impact:** Network, IAM, rollout, scaling, cost, and on-call procedures may diverge between implementation and operations. The team can ship a design that nobody can reliably run.  
**Mitigation:** Choose one runtime for v1 and validate it with a staging deployment, failure drill, and named owner.  
**Status:** Open.

### R-009: Embedding Migration Corrupts or Fragments Retrieval
**Evidence:** The schema uses `vector(1536)` while the AI layer promises provider independence.  
**Impact:** A model change can make inserts fail, mix incompatible vectors, or silently degrade recall. Reindexing can also overload PostgreSQL and delay ingestion.  
**Mitigation:** Version embeddings and indexes, store model/dimension/metric metadata, build parallel indexes, evaluate offline, cut over by flag, and rate-limit backfills.  
**Status:** Open.

### R-010: Model or Prompt Regression Ships Without a Reliable Gate
**Evidence:** Evaluation metrics are named but no thresholds, sample sizes, grader calibration, or rollback trigger is defined.  
**Impact:** A prompt/model change can increase hallucinations, citation errors, unsafe refusals, latency, or cost while ordinary tests pass.  
**Mitigation:** Establish versioned golden and adversarial sets, human-calibrated grading, minimum thresholds, statistical tolerance, shadow evaluation, and automatic rollback/disable flags.  
**Status:** Open.

### R-011: Sensitive Data Persists Beyond Customer Expectations
**Evidence:** Retention is repeatedly deferred to policy; prompts, outputs, embeddings, logs, backups, feedback, and provider handling have no concrete lifecycle.  
**Impact:** Deletion requests may leave recoverable content in vectors, backups, traces, or model-provider systems. This creates contractual and regulatory exposure.  
**Mitigation:** Publish a data inventory, deletion workflow with verification, backup expiry policy, legal hold behavior, regional controls, provider data-processing terms, and deletion audit evidence.  
**Status:** Open.

### R-012: Streaming Answers Leak Authorization or Produce Unverifiable Partial State
**Evidence:** SSE events are described but reconnect, cancellation, proxy behavior, and reauthorization are not.  
**Impact:** A long-lived stream may continue after membership revocation, duplicate events on reconnect, persist an answer without validated citations, or leak content through intermediary logs.  
**Mitigation:** Bind streams to request authorization, use heartbeats and idle limits, sequence/replay rules, cancellation, redacted telemetry, and persist only validated final state.  
**Status:** Open.

### R-013: Upload and Parser Pipeline Enables Resource Exhaustion
**Evidence:** Security guidance mentions signatures and decompression limits, but no concrete quotas, sandbox, parser inventory, timeouts, or concurrency controls are defined.  
**Impact:** A crafted archive, document, OCR workload, or oversized file can exhaust worker CPU, memory, storage, or provider budget.  
**Mitigation:** Enforce per-file and per-workspace quotas, isolate parsers, cap pages/expansion/CPU/time, scan content, quarantine failures, and meter processing cost.  
**Status:** Open.

### R-014: Audit Trail Is Incomplete or Mutable
**Evidence:** Audit events are listed as an entity, but schema, immutability, retention, actor identity, service actors, ordering, and export integrity are not defined.  
**Impact:** Security investigations and compliance reports cannot establish who accessed, changed, exported, or approved data.  
**Mitigation:** Define append-only event schema, actor/service identity, event hash or protected sink, clock/order semantics, retention, access controls, and tamper-evident export.  
**Status:** Open.

### R-015: Cost Runaway Through Retries, Agents, or Large Contexts
**Evidence:** Budgets are mentioned but there is no authoritative usage ledger or atomic preflight reservation.  
**Impact:** Concurrent requests can overspend, retries can multiply provider cost, and agent loops can consume budget before an answer is produced.  
**Mitigation:** Reserve budget atomically, enforce per-request and per-run caps, meter failed/retried calls, cap context and steps, and implement circuit breakers and overage behavior.  
**Status:** Open.

### R-016: Disaster Recovery Does Not Restore a Consistent Knowledge State
**Evidence:** Database, S3, queue, secrets, and vector reindexing are mentioned separately, without a recovery order or consistency point.  
**Impact:** Restoring PostgreSQL without matching objects, queue checkpoints, or embedding versions can produce broken documents, duplicate jobs, or incorrect answers.  
**Mitigation:** Define RPO/RTO, backup compatibility, restore sequence, object/version recovery, queue replay boundaries, reindex procedure, and a recurring full recovery drill.  
**Status:** Open.

## Medium Risks

### R-017: Incomplete Relational Constraints Create Orphaned or Undeletable Data
The logical entity list lacks full foreign keys, cascade rules, state constraints, and indexes. Add a complete ERD and migration-tested schema before parallel implementation begins.

### R-018: Authorization Semantics Differ Between Human and Service Actors
Roles are named, but operator, worker, connector, and agent identities are not. Define service principals, delegated user context, least privilege, and audit attribution.

### R-019: API Contract Drift Breaks Web and Worker Clients
The documents describe typed contracts but provide no generated schema ownership or compatibility policy. Version OpenAPI/SSE schemas and contract-test every consumer.

### R-020: SLOs Are Not Actionable
Performance budgets are not the same as availability and quality SLOs. Define error budgets, burn-rate alerts, ownership, and escalation before production traffic.

### R-021: Supply-Chain Compromise Reaches Production
Scanning alone does not establish artifact provenance or dependency freshness. Add SBOMs, signed images, pinned actions, lockfile enforcement, and remediation SLAs.

### R-022: Unsupported Compliance and Residency Assumptions Block Sales
The business model describes enterprise packaging without a compliance matrix, regions, subprocessors, or contractual data controls. Validate these requirements with target customers before promising them.

## Immediate Release Blockers
Do not begin production rollout or enable write-capable agents until R-001 through R-006 are closed. Do not accept production customer content until R-007 through R-016 have owners, mitigations, tests, and operational runbooks.
