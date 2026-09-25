# Folder Structure

## Proposed Monorepo
```text
AI-Powered_POC/
  apps/
    web/                         # Next.js App Router and Tailwind UI
    api/                         # Express HTTP service
    worker/                      # ingestion and agent workers
  packages/
    contracts/                   # shared API and event schemas
    domain/                      # policies and value objects
    ai/                          # model, prompt, and retrieval adapters
    config/                      # typed configuration
    observability/               # logging, metrics, tracing helpers
  db/
    migrations/
    seeds/
  infrastructure/
    terraform/
    docker/
  evals/
    datasets/
    runners/
    reports/
  tests/
    security/
    contract/
    e2e/
  project-docs/
  .github/
    workflows/
    pull_request_template.md
  package.json
  pnpm-workspace.yaml
  turbo.json
  README.md
```

## Dependency Direction
UI depends on contracts and API client types. API and worker depend on domain and contracts. Domain does not depend on Express, Next.js, PostgreSQL, or OpenAI. Infrastructure is consumed through interfaces. Evaluation fixtures may depend on contracts but must not import production secrets or customer data.

## Naming
Use kebab-case for folders and filenames, PascalCase for React components and classes, camelCase for functions and variables, and explicit names for providers such as `OpenAiChatProvider` or `PostgresChunkRepository`.

## Ownership
Each top-level application and package has a maintainer, README, test command, and dependency policy. A change that crosses package boundaries must document the contract impact. Keep generated files in clearly marked directories and avoid hand-editing generated clients.

## Common Mistakes
- Creating a `utils` package that becomes an unowned dumping ground.
- Importing infrastructure directly from domain code.
- Sharing database models with browser bundles.
- Mixing evaluation datasets with production fixtures.
- Hiding migration and operational files outside the repository structure.