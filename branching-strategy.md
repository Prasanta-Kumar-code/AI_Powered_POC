# Branching Strategy

## Model
Use trunk-based development with short-lived branches and protected `main`. The goal is frequent integration, small reviewable changes, and a single source of release truth. Long-lived feature branches are prohibited except for an approved migration or regulatory program with an expiry date.

## Branch Types
- `feature/<issue>-<short-name>` for a user-facing or internal capability.
- `fix/<issue>-<short-name>` for a non-urgent defect.
- `security/<issue>-<short-name>` for security remediation with restricted details as appropriate.
- `chore/<issue>-<short-name>` for tooling or maintenance.
- `release/<version>` only when a release train needs a short stabilization window.
- `hotfix/<issue>-<short-name>` from the production tag or protected main for urgent fixes.

Use lowercase names, issue references, and short descriptive suffixes. Never commit directly to `main`.

## Pull Request Rules
Every pull request must have an issue, clear scope, tests, risk classification, and reviewer assignment. Required checks include formatting, lint, strict typecheck, unit tests, integration tests for affected boundaries, security scans, and relevant AI evaluations. Changes to infrastructure, migrations, authentication, data retention, prompts, models, or agent tools require specialist review.

## Branch Protection
Configure GitHub branch protection with:
- Pull request required before merge.
- At least two reviewers for production-sensitive changes.
- CODEOWNERS review for platform, security, database, AI, and infrastructure paths.
- Required status checks from the same commit.
- Conversation resolution before merge.
- No force pushes or branch deletion on `main`.
- Linear history through squash merge or approved rebase policy.
- Signed commits or verified commits where organizational policy requires it.

## CODEOWNERS Example
```text
# Platform and deployment
/infrastructure/ @atlasai/platform
/.github/ @atlasai/platform
/*Dockerfile @atlasai/platform

# Security-sensitive code
/apps/api/src/auth/ @atlasai/security @atlasai/backend
/apps/api/src/authorization/ @atlasai/security @atlasai/backend
/db/migrations/ @atlasai/data @atlasai/platform

# AI behavior and evaluations
/packages/ai/ @atlasai/ai-quality @atlasai/backend
/evals/ @atlasai/ai-quality

# User experience
/apps/web/ @atlasai/frontend
```

## Commit and Review Practices
Use commits that explain intent and avoid mixing formatting-only changes with behavior. A pull request should be small enough for a reviewer to understand authorization, error paths, telemetry, migrations, and rollback impact. Update documentation and tests in the same change.

## Merge Queue
Use GitHub merge queue or an equivalent serialized validation process for protected main. Re-run required checks against the merge result to avoid integrating a pull request that passed tests only against an outdated base.

## Release Tags
Create signed tags such as `v1.4.0` only from protected main after staging verification. Tags point to the exact commit whose image digest and release record are promoted. Do not create tags from a developer workstation for production.

## Hotfix Process
1. Declare severity and create an incident or security issue.
2. Branch from the production tag or current protected release.
3. Make the smallest fix with a regression test.
4. Run required security and targeted checks.
5. Obtain emergency approvals and deploy through the same controlled workflow.
6. Merge the hotfix back into main and any active release branch.
7. Record impact, rollback state, and follow-up work.

## AI and Migration Branching Rules
- Prompt, model, retrieval, embedding, and evaluator changes require a versioned change and evaluation report.
- Database migrations must be backward-compatible with the current production release.
- Do not hide schema or prompt changes inside a broad refactor.
- Feature flags protect incomplete capabilities; they do not replace authorization or testing.

## Versioning
Use semantic versioning for externally meaningful API or package contracts. Release notes must describe user-visible changes, migration impact, security fixes, AI quality changes, operational changes, and rollback considerations.

## Common Mistakes
- Keeping a feature branch alive until the entire project is complete.
- Merging green code that was never tested against the current main branch.
- Bypassing CODEOWNERS for migrations or IAM changes.
- Creating release tags before staging validation.
- Treating prompts and model configuration as unreviewed content rather than production behavior.