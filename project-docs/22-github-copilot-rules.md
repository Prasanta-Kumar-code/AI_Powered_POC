# GitHub Copilot Rules

## Repository Instructions
Copilot should treat `project-docs/` as the governing product and engineering context. Before making a change, locate the closest relevant design document, inspect existing code and tests, and preserve established interfaces unless the task explicitly changes them.

## Safety and Privacy
Never place credentials, tokens, private keys, customer document text, or production prompt content in source code, tests, comments, logs, or examples. Use synthetic fixtures. Assume uploaded documents and model output are untrusted. Preserve server-side authorization and tenant filters even when a request appears internal.

## Implementation Standards
Generate strict TypeScript with validated boundary inputs, typed errors, parameterized SQL, bounded retries, timeouts, correlation IDs, and tests for success and failure paths. Keep provider calls behind adapters. Use existing repository patterns and dependencies before adding new abstractions.

## AI Features
Prompts must be versioned. Retrieved context must be labeled as untrusted data. Answers must support citations or explicit abstention. Agent tools need schemas, permission declarations, limits, approval semantics, and audit events. Do not allow model output to directly execute code, SQL, shell commands, or external side effects.

## Validation Checklist
Before considering a change complete, run the narrowest relevant test, typecheck or lint; review authorization and error behavior; inspect telemetry; update migrations and docs; and state any unverified assumptions. For UI changes, check keyboard access, loading, empty, error, streamed, and narrow viewport states.

## Review Boundaries
Copilot may propose code, tests, documentation, and refactors. A human must approve production deployments, IAM policies, encryption and retention changes, database destruction, security exceptions, and autonomous agent capabilities.

## Common Mistakes
- Asking Copilot to create a complete security layer from a vague prompt.
- Copying generated code without checking dependency versions.
- Treating a passing typecheck as proof of authorization correctness.
- Omitting evaluation changes when modifying prompts or retrieval.