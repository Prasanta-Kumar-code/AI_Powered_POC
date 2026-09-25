# GitHub Actions

## Operating Model
Use GitHub Actions as the controlled automation plane. Workflows live in `.github/workflows/`, are reviewed like application code, use pinned third-party actions, and authenticate to AWS with GitHub OIDC and narrowly scoped IAM roles. Production deployment is available only from protected `main` or a signed release tag.

## Workflow Layout
```text
.github/workflows/
  pull-request.yml       # fast checks and security gates
  build.yml              # immutable images, SBOM, signatures
  deploy-staging.yml     # staging promotion and smoke tests
  deploy-production.yml  # approval and canary/blue-green deployment
  infrastructure.yml     # Terraform plan/apply
  dependency-update.yml  # controlled update proposals
  disaster-recovery.yml  # scheduled restore verification
```

## Pull Request Workflow
```yaml
name: pull-request

on:
  pull_request:
    branches: [main]
  merge_group:

permissions:
  contents: read
  pull-requests: read

concurrency:
  group: pr-${{ github.event.pull_request.number || github.run_id }}
  cancel-in-progress: true

jobs:
  quality:
    runs-on: ubuntu-24.04
    timeout-minutes: 15
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
      - uses: pnpm/action-setup@v4
        with:
          version: 10.6.0
      - uses: actions/setup-node@v4
        with:
          node-version-file: .nvmrc
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - run: pnpm format:check
      - run: pnpm lint
      - run: pnpm typecheck
      - run: pnpm test:unit

  security:
    needs: quality
    runs-on: ubuntu-24.04
    permissions:
      contents: read
      security-events: write
    steps:
      - uses: actions/checkout@v4
      - name: Run repository security checks
        run: pnpm security:ci

  integration:
    needs: quality
    runs-on: ubuntu-24.04
    services:
      postgres:
        image: pgvector/pgvector:pg17
        env:
          POSTGRES_PASSWORD: local-test-password
          POSTGRES_DB: atlasai_test
        ports: ["5432:5432"]
        options: >-
          --health-cmd "pg_isready -U postgres -d atlasai_test"
          --health-interval 10s --health-timeout 5s --health-retries 5
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with:
          version: 10.6.0
      - uses: actions/setup-node@v4
        with:
          node-version-file: .nvmrc
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - run: pnpm db:migrate:test
      - run: pnpm test:integration
      - run: pnpm test:authorization
```

## AWS OIDC Trust
The GitHub OIDC provider must trust only the repository, branch, or environment that needs the role. A production role should require the `production` environment subject and should not be assumable by arbitrary pull requests.

```yaml
permissions:
  id-token: write
  contents: read

steps:
  - uses: aws-actions/configure-aws-credentials@v4
    with:
      role-to-assume: arn:aws:iam::123456789012:role/atlasai-github-production
      aws-region: us-east-1
      role-session-name: gha-${{ github.run_id }}
```

## Image Build and Attestation
Use BuildKit or Docker Buildx to build immutable images. Push to ECR by digest, generate an SBOM, sign the image with Cosign or an AWS-supported signing workflow, and attach provenance. Deployment consumes the digest rather than a mutable tag.

```yaml
- uses: docker/setup-buildx-action@v3
- uses: aws-actions/amazon-ecr-login@v2
- uses: docker/build-push-action@v6
  with:
    context: .
    file: infrastructure/docker/api.Dockerfile
    push: true
    tags: ${{ env.ECR_REPOSITORY }}:${{ github.sha }}
    platforms: linux/amd64
    cache-from: type=gha
    cache-to: type=gha,mode=max
    provenance: mode=max
    sbom: true
```

## Deployment Workflow Shape
A deploy workflow should:
1. Verify the commit is from protected `main` or a signed tag.
2. Download the approved image digest and release manifest.
3. Assume the environment-specific AWS role.
4. Run a migration preflight and compatibility check.
5. Deploy the ECS task definition with the digest.
6. Wait for service stability and run smoke tests.
7. Shift traffic gradually.
8. Publish deployment metadata and notify the owner.
9. Stop and roll back when alarms breach thresholds.

## GitHub Environment Controls
Configure `staging` and `production` environments with required reviewers, branch restrictions, environment-specific variables, deployment concurrency, and no secrets available to untrusted pull requests. Use reusable workflows for repeated build and deploy logic, but keep production approval visible at the caller workflow.

## Action and Runner Security
- Pin third-party actions to reviewed commit SHAs where organizational policy requires it.
- Use GitHub-hosted runners for untrusted code; use isolated self-hosted runners only for controlled workloads.
- Do not allow pull-request code to execute with production credentials.
- Set `contents: read` by default and grant only required permissions.
- Mask sensitive values and avoid printing full environment variables.
- Retain test, scan, and deployment artifacts according to the audit policy.

## Common Mistakes
- Giving `id-token: write` to every job.
- Using a single AWS role for development and production.
- Allowing a tag from a fork to deploy.
- Caching secrets or generated `.env` files.
- Letting a failed smoke test still mark deployment success.
- Using `latest` instead of an image digest in ECS task definitions.