# Security Guidelines

## Threat Model
Protect tenant data, credentials, source documents, prompts, model outputs, and audit records. Threats include broken object-level authorization, cross-tenant retrieval, malicious uploads, prompt injection, SSRF through connectors, credential theft, denial of service, supply-chain compromise, and sensitive data in logs.

## Identity and Authorization
Use OIDC for authentication and short-lived access tokens. Enforce workspace membership and resource permissions server-side on every request and retrieval query. Use least-privilege roles: member, source-manager, administrator, security-reviewer, and operator. Recheck authorization before every agent side effect.

## Data Protection
Encrypt data in transit and at rest. Store secrets in AWS Secrets Manager or an equivalent vault. Use KMS-managed keys with rotation and separate production keys. Redact tokens, credentials, document bodies, and unnecessary personal data from logs and traces. Define retention and deletion behavior for content, embeddings, conversations, and audit records.

## Input and Content Security
Validate file type by content signature, enforce size and decompression limits, scan uploads, and isolate parsers. Sanitize rendered HTML and markdown. Restrict connector egress with allowlists, DNS/IP checks, timeouts, and SSRF protections. Treat all retrieved content as untrusted prompt data.

## Web and API Controls
Use secure cookies where applicable, CSRF protection for cookie-authenticated mutations, strict CORS, security headers, rate limits, request size limits, and safe error messages. Use parameterized SQL and dependency lockfiles. Protect administrative actions with step-up authentication where risk warrants it.

## Incident Response
Alert on authentication anomalies, authorization failures, provider key misuse, unusual export volume, and cross-tenant test failures. Maintain severity definitions, on-call ownership, containment steps, evidence preservation, customer communication, and post-incident review. Test credential rotation and restore procedures.

## Common Mistakes
- Relying on frontend route guards for security.
- Logging full prompts to debug one production issue.
- Allowing user-supplied URLs without SSRF controls.
- Assuming a vector index cannot leak restricted content.
- Treating a successful penetration test as permanent evidence of safety.