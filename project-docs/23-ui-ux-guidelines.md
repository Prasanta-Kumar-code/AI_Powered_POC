# UI and UX Guidelines

## Experience Direction
AtlasAI should feel calm, evidence-led, and work-focused. Prioritize scanning, source verification, and predictable controls over decorative chat theatrics. Use a restrained neutral base with one clear accent and semantic colors for status; preserve contrast in light and dark themes.

## Information Hierarchy
The question and answer are primary. Citations sit adjacent to the claims they support, not in a hidden footer. Source title, version date, and access state are visible. Workspace and security context remain available without consuming the main reading area.

## Interaction States
Every workflow defines idle, loading, streaming, success, empty, validation error, authorization error, provider degradation, and retry states. Uploads expose progress and processing stages. Long answers can be copied, shared according to permission, and reported with a reason.

## Accessibility
Target WCAG 2.2 AA. Use semantic HTML, keyboard navigation, visible focus, sufficient contrast, labels, live regions for streaming status, reduced motion, and screen-reader-friendly citation links. Test at 200% zoom and with touch targets large enough for mobile use.

## Responsive Layout
Use a content-first responsive layout: compact navigation on small screens, persistent source context where space allows, and no horizontal scrolling for ordinary workflows. Keep input and submit controls stable while streamed content grows. Avoid putting critical actions behind hover-only behavior.

## Content Design
Use direct labels such as “Sources,” “Access,” “Processing,” and “Needs review.” Explain abstention without blaming the user. Prefer “I could not find enough evidence in your accessible sources” to an unexplained generic failure.

## Common Mistakes
- Hiding citations behind a secondary screen.
- Showing a spinner while silently losing streamed content.
- Using color alone for ingestion or security state.
- Filling the interface with oversized decorative cards.
- Designing desktop chat and shrinking it without a mobile interaction model.