# User Personas

## 1. Maya, Knowledge Worker
Maya is a product manager who works across specifications, research, and policies. She needs a fast answer but must verify claims before sharing them. She values concise responses, source previews, conversation continuity, and clear uncertainty.

**Jobs:** locate authoritative information, compare versions, summarize a decision, identify an owner.  
**Pain points:** duplicate documents, stale pages, unclear access errors, long search sessions.  
**Success:** answers in under a minute with sources she can open and share.

## 2. Andre, Workspace Administrator
Andre configures workspaces, members, source connectors, budgets, and retention. He is accountable for safe adoption without becoming a full-time prompt operator.

**Jobs:** provision access, monitor ingestion, set model limits, investigate feedback, export audit records.  
**Pain points:** invisible failures, unclear cost attribution, settings spread across tools.  
**Success:** policy changes are predictable, reversible, and visible.

## 3. Priya, Security Reviewer
Priya assesses data flows, authorization, vendor risk, logging, and incident response. She needs evidence that retrieval never bypasses source permissions.

**Jobs:** review threat models, inspect audit events, test isolation, approve connectors.  
**Pain points:** logs that contain too much sensitive content, missing provenance, untestable claims.  
**Success:** she can verify controls and reconstruct material events.

## 4. Rafael, Platform Engineer
Rafael owns reliability, deployments, queues, cost, and provider integrations. He needs deterministic jobs, safe retries, and actionable telemetry.

**Jobs:** operate workers, tune retrieval, respond to incidents, roll back releases, manage migrations.  
**Pain points:** provider-specific behavior, poison messages, expensive unbounded prompts.  
**Success:** failures are isolated, observable, and recoverable.

## Accessibility and Inclusion
The experience must support keyboard navigation, screen readers, high contrast, reduced motion, readable source previews, and localization-ready date and number formatting. Avoid assuming that users can rely on color, rapid animation, or perfect vision.

## Persona-to-Control Mapping
| Need | Product response |
|---|---|
| Verify an answer | Citation spans, source version, retrieval timestamp |
| Protect restricted content | Server-side authorization filters and tenant keys |
| Operate ingestion | Job status, retry policy, dead-letter queue |
| Control cost | Per-workspace budgets, token telemetry, rate limits |
| Investigate behavior | Correlation IDs, audit events, prompt/model versions |

## Mistakes to Avoid
- Designing only for a technical administrator and ignoring the daily knowledge worker.
- Treating security review as a late approval instead of a product requirement.
- Making citations technically available but difficult to read or open.
- Assuming every user wants a long conversational answer.