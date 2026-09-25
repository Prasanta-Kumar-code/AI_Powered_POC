# Coding Standards

## TypeScript and Node.js
Use strict TypeScript, explicit return types for public functions, discriminated unions for state machines, and `unknown` for untrusted input. Validate all external data at boundaries with a schema library. Prefer small pure functions and dependency injection over hidden global state. Use async/await and preserve error causes.

## Naming and Structure
Use descriptive names, nouns for data types, and verbs for operations. Keep modules cohesive and expose narrow interfaces. Separate domain policy from infrastructure. Avoid one-letter variables except conventional indices in tiny, obvious loops.

## Error Handling
Use typed application errors with stable codes. Do not catch and discard errors. Add context while preserving the cause. Map internal details to safe client messages at the HTTP boundary. Handle cancellation and timeouts explicitly.

## Database and APIs
Use parameterized queries and migration files. Require authorization checks in use cases, not just routes. Keep API DTOs separate from database models. Make mutation operations idempotent when retries are plausible.

## Testing and Review
Every behavior change includes focused unit or integration tests. Reviewers look for authorization, validation, failure behavior, observability, migrations, and rollback. Avoid snapshots for dynamic AI output; assert schema, grounding, and policy outcomes instead.

## Formatting and Tooling
Use repository-pinned Node and package-manager versions. Enforce formatting, linting, type checking, dependency scanning, and secret scanning in CI. Do not disable a rule globally to make one file pass; document justified exceptions locally.

## Example Result Type
```ts
type Result<T> =
  | { ok: true; value: T }
  | { ok: false; error: AppError };
```

## Common Mistakes
- Using `any` at an API boundary.
- Logging an error object that serializes request secrets.
- Coupling controllers directly to ORM details.
- Writing tests that mock away authorization and persistence together.
- Mixing formatting-only churn with behavior changes.