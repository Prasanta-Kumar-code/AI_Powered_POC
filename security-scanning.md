# Security Scanning

## Security Gate
Security scanning is continuous and risk-based. No critical vulnerability, secret exposure, exploitable high vulnerability, cross-tenant authorization failure, or unreviewed infrastructure policy violation may pass a production release. Exceptions require a documented owner, compensating control, expiry date, and security approval.

## Scan Layers
| Layer | Tooling example | Trigger | Blocking policy |
|---|---|---|---|
| Secrets | Gitleaks, GitHub secret scanning | PR and push | Any verified secret |
| Dependencies | pnpm audit, OSV, Dependabot | PR, daily | Critical/high by exploitability |
| SAST | CodeQL, Semgrep | PR and main | High-confidence critical/high |
| IaC | Checkov, tfsec, OPA | Terraform PR | Critical network/IAM/encryption issues |
| Containers | Trivy, ECR scanning | Image build and daily | Critical/high with fix available |
| Licenses | Syft/approved license scanner | PR and release | Prohibited or unknown license |
| DAST | OWASP ZAP or equivalent | Staging | Confirmed exploitable findings |
| API authorization | Dedicated tests | Every PR | Any cross-tenant access |
| AI safety | Injection and exfiltration suites | AI change | Any forbidden tool/data outcome |

## GitHub Actions Security Job
```yaml
name: security

on:
  pull_request:
  push:
    branches: [main]
  schedule:
    - cron: "17 3 * * *"

permissions:
  contents: read
  security-events: write
  actions: read

jobs:
  secrets:
    runs-on: ubuntu-24.04
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
      - uses: gitleaks/gitleaks-action@v2
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}

  codeql:
    runs-on: ubuntu-24.04
    steps:
      - uses: actions/checkout@v4
      - uses: github/codeql-action/init@v3
        with:
          languages: javascript-typescript
      - uses: github/codeql-action/autobuild@v3
      - uses: github/codeql-action/analyze@v3

  dependencies:
    runs-on: ubuntu-24.04
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
      - run: pnpm audit --audit-level high

  iac:
    runs-on: ubuntu-24.04
    steps:
      - uses: actions/checkout@v4
      - uses: bridgecrewio/checkov-action@v12
        with:
          directory: infrastructure/terraform
          framework: terraform
          soft_fail: false

  container:
    runs-on: ubuntu-24.04
    needs: [secrets, codeql, dependencies, iac]
    steps:
      - uses: actions/checkout@v4
      - run: docker build --file infrastructure/docker/api.Dockerfile --tag atlasai-api:scan .
      - uses: aquasecurity/trivy-action@master
        with:
          image-ref: atlasai-api:scan
          format: sarif
          output: trivy-results.sarif
          severity: CRITICAL,HIGH
          ignore-unfixed: true
      - uses: github/codeql-action/upload-sarif@v3
        with:
          sarif_file: trivy-results.sarif
```

The example action references must be pinned to reviewed commit SHAs in the production repository if organizational policy requires immutable action references. Do not use `soft_fail: true` for release-blocking checks.

## Dynamic and Authorization Testing
DAST runs against an isolated staging deployment using synthetic data. It must cover authentication, object-level authorization, CORS/CSRF, SSRF defenses, upload limits, rate limits, error redaction, SSE access, and admin endpoints. Add a dedicated test matrix for every role and workspace combination.

## AI Security Testing
Maintain adversarial fixtures for:
- Retrieved text that attempts to override system policy.
- Documents requesting secret disclosure or unauthorized tool use.
- Questions that combine allowed and restricted sources.
- Prompt exfiltration and system-message probing.
- Long inputs designed to exhaust context or cost budgets.
- Citation spoofing and malformed structured output.

AI tests must assert tool calls, data access, citations, and side effects, not just generated wording.

## Vulnerability Triage
For each finding record component, CVE/advisory, exploitability, affected environments, data exposure, available fix, owner, due date, compensating control, and verification. Patch critical findings immediately, high findings within the security SLA, and remove unsupported dependencies rather than indefinitely suppressing them.

## Supply-Chain Controls
- Commit lockfiles and use frozen installs.
- Generate SBOMs for application images.
- Verify package provenance when available.
- Pin GitHub Actions and base image digests where practical.
- Sign images and verify signatures before ECS deployment.
- Restrict CI token permissions and third-party action access.
- Scan Terraform providers, modules, and container base images.
- Review licenses before introducing dependencies.

## Common Mistakes
- Running scans but not blocking releases on verified findings.
- Ignoring unfixed vulnerabilities without compensating controls.
- Testing DAST with production data.
- Treating a model safety benchmark as an authorization test.
- Allowing a CI scan job to read deployment secrets.
- Suppressing the same finding indefinitely without an expiry.