# Database Design

## Storage Strategy
PostgreSQL is the system of record. Enable `pgcrypto` for UUID generation and `vector` for embeddings. Store document bytes in S3, not in relational rows. Store normalized metadata and extracted text references in PostgreSQL. Every tenant-owned table has `workspace_id` and a foreign key to the workspace.

## Core Entities
- `users`: identity-provider subject, email, display name, timestamps.
- `workspaces`: tenant name, plan, status, limits, timestamps.
- `memberships`: user-workspace relation, role, status, unique `(workspace_id, user_id)`.
- `sources`: connector or upload configuration, owner, status, schedule.
- `documents`: logical document identity, source, title, current version, visibility.
- `document_versions`: immutable checksum, object key, parser version, ingestion state.
- `chunks`: versioned text, token count, ordinal, embedding, metadata, visibility snapshot.
- `conversations` and `messages`: user sessions, model metadata, citations, feedback.
- `jobs`: idempotency key, type, state, attempts, error code, timestamps.
- `audit_events`: actor, action, resource, outcome, correlation ID, redacted metadata.

## Important Constraints
Use UUID primary keys, UTC timestamps, check constraints for state machines, and unique constraints for source checksums and job idempotency. Soft deletion is appropriate for sources and documents where auditability is required; retrieval predicates must exclude deleted records. Never rely on application filtering alone for tenant boundaries.

## Example Schema
```sql
create table chunks (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id),
  document_version_id uuid not null references document_versions(id),
  ordinal integer not null check (ordinal >= 0),
  content text not null,
  token_count integer not null check (token_count > 0),
  embedding vector(1536),
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now(),
  unique (document_version_id, ordinal)
);
create index chunks_workspace_idx on chunks(workspace_id);
create index chunks_embedding_idx on chunks using hnsw (embedding vector_cosine_ops);
```

## Retrieval Query Rules
The retrieval query must join workspace membership, source status, document status, and current version state before ranking. Use parameterized SQL. For stronger defense in depth, configure PostgreSQL row-level security in production and set a request-scoped tenant variable through a trusted connection layer.

## Migration Practices
Use versioned forward migrations, review generated SQL, keep migrations reversible where practical, and test migrations against a production-like database. Backfill in batches with progress markers. Never mix destructive column removal with an application release that still reads the column.

## Backup and Retention
Use encrypted automated backups, point-in-time recovery, and a documented restore drill. Retention must distinguish legal/audit records from user content. Deleting a document must remove or tombstone searchable chunks and schedule object deletion according to policy.

## Common Mistakes
- Storing embeddings without the embedding model and dimension metadata.
- Updating a document in place and losing source-version provenance.
- Omitting `workspace_id` from join tables.
- Creating an approximate-vector index before measuring query plans.
- Treating JSONB as a substitute for stable relational constraints.