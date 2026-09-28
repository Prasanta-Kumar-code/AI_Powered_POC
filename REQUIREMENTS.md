# Requirements

## Functional Requirements

- Provide a form for contact details, work history, education, skills, achievements, and target role.
- Validate required fields and let users review or edit information before generation.
- Send relevant form data to a configured AI service and generate professional resume sections.
- Offer ATS-friendly plain text that uses clear headings and avoids layout-dependent meaning.
- Preview and edit the result, then export it as a PDF.
- Explain generation errors, rate limits, or unavailable AI service without losing the user's current form data.
- Avoid storing personal data on a server or in a database; keep it in the browser for the current session unless the user explicitly chooses otherwise.

## Non-Functional Requirements

- **Cost:** use free development tools and free hosting/API tiers only; do not imply that third-party free quotas are unlimited or permanent.
- **Responsive:** support usable layouts on mobile, tablet, and desktop.
- **Lightweight:** keep dependencies and initial page payload small; call AI only when requested.
- **Privacy:** disclose what is sent to the AI provider; do not log or persist resume data by default.
- **Accessibility:** support keyboard navigation, labeled inputs, visible focus, and readable contrast.
- **Reliability:** handle network failures, provider limits, and invalid responses gracefully.

## User Stories

- As a job seeker, I can enter my experience once and generate a first resume draft in under five minutes.
- As an applicant, I can tailor the resume to a target role while keeping the content truthful and editable.
- As a job seeker, I can copy ATS-friendly text or download a PDF without creating an account.
- As a privacy-conscious user, I know which information is sent to the AI provider and can clear my session data.
- As a contributor, I can run and test the app locally with free, documented tools.