# Cursor Rules

This document defines repository guidance for teams using Cursor or another AI coding editor. The rules complement, but do not replace, security review and human code ownership.

## Required Behavior
- Read relevant project-docs files before changing architecture or public contracts.
- Identify the owning module and make the smallest coherent change.
- Preserve tenant authorization in every data path and add a negative test for restricted access.
- Validate all external input at the boundary and avoid `any`.
- Never invent provider SDK behavior; consult the pinned dependency types and existing adapters.
- Add or update tests, telemetry, migration notes, and documentation for behavior changes.
- Do not expose secrets, customer content, or raw prompts in generated code or logs.
- Ask for clarification when requirements conflict with security or data retention policy.

## Preferred Workflow
1. Inspect the nearest implementation, test, and contract.
2. State a falsifiable hypothesis about the change.
3. Make a focused edit.
4. Run the narrowest relevant test or typecheck immediately.
5. Review the diff for authorization, observability, and rollback impact.

## Forbidden Shortcuts
Do not disable lint rules, bypass authorization for demos, replace real tests with snapshots of generated text, or introduce a new dependency without checking license, maintenance, bundle, and security impact.

## AI Output Review
Treat generated code as untrusted. Verify SQL, authentication, cryptography, prompt construction, retry behavior, and destructive operations line by line. Require human approval for migrations, IAM changes, production workflows, and agent tools.

## Common Mistakes
- Asking an editor to “refactor everything” without a bounded acceptance criterion.
- Accepting plausible code that imports an unpinned or nonexistent API.
- Allowing editor context to include secrets or customer exports.
- Skipping focused validation because the generated diff looks small.