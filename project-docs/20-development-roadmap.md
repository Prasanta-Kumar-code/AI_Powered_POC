# Development Roadmap

## Phase 0: Foundations, Weeks 1-2
Confirm product scope, threat model, identity provider, AWS accounts, repository, CI, coding standards, observability baseline, and evaluation dataset format. Deliver architecture decisions, local Docker environment, and a vertical-slice definition of done.

## Phase 1: Trusted RAG MVP, Weeks 3-7
Build workspace membership, document upload, S3 storage, extraction, chunking, embeddings, pgvector retrieval, grounded streaming answers, citations, audit events, and basic feedback. Gate on tenant-isolation tests, citation validation, and restore-tested database backups.

## Phase 2: Pilot Readiness, Weeks 8-11
Add source versioning, connector framework, administrator controls, budgets, rate limits, usage dashboards, accessibility review, load tests, and incident runbooks. Run a pilot with curated documents and weekly quality review.

## Phase 3: Production Hardening, Weeks 12-16
Add high-value connectors, parallel reindexing, stronger retention controls, SSO configuration, security assessment, blue/green deployment, disaster-recovery drills, and formal support procedures.

## Phase 4: Governed Agents, Weeks 17-24
Release read-only researcher and comparer agents, tool schemas, run budgets, trace views, approval records, and deterministic agent evaluation. Introduce side-effect tools only after a separate security review and rollback design.

## Prioritization Framework
Score opportunities by user value, trust impact, adoption, implementation effort, operational risk, and evidence quality. Security, data isolation, and recoverability are gates, not tradeable roadmap points.

## Release Gates
Every phase ends with a demo, evaluation report, threat-model update, runbook review, and known-risk register. No production promotion occurs with unresolved critical vulnerabilities, untested destructive migrations, or unknown tenant-isolation behavior.

## Common Mistakes
- Starting with autonomous agents before RAG quality is measurable.
- Calling an internal demo production-ready without recovery drills.
- Treating connector count as more valuable than source correctness.
- Planning features without capacity, cost, and operational ownership.