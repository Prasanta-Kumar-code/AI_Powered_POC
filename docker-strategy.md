# Docker Strategy

## Goals
Docker images must be reproducible, minimal, non-root, vulnerability-scannable, and suitable for ECS Fargate. Build separate runtime images or commands for the Next.js web application, Express API, and ingestion/agent worker so each can scale and receive only the permissions it needs.

## Image Standards
- Pin the base image by major/minor version and refresh it on a defined schedule.
- Use multi-stage builds and copy only production dependencies and compiled output.
- Run as a non-root UID/GID.
- Set a read-only root filesystem where the process permits it.
- Do not include shells, compilers, package managers, test fixtures, `.env` files, Git metadata, or source secrets in production images.
- Use a minimal init process or correct signal handling for Node.js.
- Define a health endpoint or command appropriate to the image.
- Set ECS CPU, memory, ephemeral storage, and ulimit requirements explicitly.
- Generate an SBOM and provenance attestation for every image.

## Multi-Stage API Dockerfile
```dockerfile
# syntax=docker/dockerfile:1.7
FROM node:22.14.0-bookworm-slim AS base
ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH
RUN corepack enable && corepack prepare pnpm@10.6.0 --activate
WORKDIR /workspace

FROM base AS dependencies
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json apps/api/package.json
COPY packages/contracts/package.json packages/contracts/package.json
COPY packages/domain/package.json packages/domain/package.json
COPY packages/config/package.json packages/config/package.json
RUN pnpm install --frozen-lockfile

FROM dependencies AS build
COPY . .
RUN pnpm --filter @atlasai/api build
RUN pnpm deploy --filter @atlasai/api --prod /runtime

FROM node:22.14.0-bookworm-slim AS runtime
ENV NODE_ENV=production
WORKDIR /app
RUN groupadd --system --gid 10001 app && useradd --system --uid 10001 --gid 10001 app
COPY --from=build --chown=app:app /runtime ./
USER 10001:10001
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 CMD node dist/healthcheck.js
ENTRYPOINT ["node", "dist/server.js"]
```

The actual package names and build output must match the repository package configuration. Build failures must stop the pipeline.

## Next.js and Worker Images
The Next.js image should use the correct standalone output configuration and include only required runtime files. The worker image should not expose an HTTP listener unless it has a deliberate health protocol. Worker tasks must use a separate ECS task role from API and web tasks.

## Local Development
Use Docker Compose for PostgreSQL with pgvector, local object storage, a queue emulator, and supporting telemetry. Local images may include debugging tools, but never reuse local images in staging or production without the release build process.

## Runtime Hardening
- Set `readOnlyRootFilesystem: true` when compatible.
- Mount only a temporary writable directory when parsing requires it, with size limits.
- Drop Linux capabilities and use `no-new-privileges` where supported.
- Do not expose the Docker socket to application containers.
- Configure stop timeout and graceful shutdown so streams and jobs finish or checkpoint.
- Use task-level secrets injection rather than environment values in image layers.
- Configure outbound network access through security groups and egress controls.

## Image Lifecycle
Push images to private ECR repositories. Tag with commit SHA and release ID, but deploy by immutable digest. Retain release images through the rollback window, scan on push and periodically, and delete unreferenced images according to a documented retention policy.

## Build Verification
```bash
# Local equivalents of required checks
pnpm install --frozen-lockfile
pnpm lint
docker build --file infrastructure/docker/api.Dockerfile --tag atlasai-api:local .
docker run --rm --read-only atlasai-api:local node --version
```

CI must additionally run image vulnerability scanning, SBOM generation, signature verification, and a smoke test against the built image.

## Rollback
ECS rollback deploys the previous image digest and task definition. Do not retag a new image as the old release. Preserve the prior image, configuration snapshot, and task definition until the observation period closes.

## Common Mistakes
- Using `latest` in ECS task definitions.
- Running as root because a parser or file permission is inconvenient.
- Copying the entire monorepo into the runtime image.
- Passing secrets as Docker build arguments.
- Using one image and one task role for web, API, and workers.
- Ignoring graceful shutdown for SSE streams and in-flight ingestion jobs.