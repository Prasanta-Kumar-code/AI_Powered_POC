# Technology Stack

## Frontend

- **React.js** for the interactive form, preview, and application state.
- **Tailwind CSS** for responsive styling.
- **Vite** for local development and production builds.

## AI Layer

- **Hugging Face models / Inference Providers** for text generation on an available free tier.
- Optional: **OpenAI API** when trial credits are available. Trial access is time-limited and is not a dependable zero-cost production requirement.
- Put private credentials in backend environment secrets. A static site cannot protect secrets embedded in browser code.

## Resume Export

- **jsPDF** for client-side PDF generation from the reviewed resume content.
- **docx** (often referred to as docx.js) is an optional library if Word export is added.
- Keep a plain-text output path for ATS compatibility and copy/paste.

## Hosting

- **GitHub Pages** for the static React frontend.
- **Hugging Face Spaces** for an optional small API backend when the model credential cannot safely be used in the browser.

Free tiers have quotas and service limits that can change. This stack avoids paid infrastructure by default, but users must check current provider terms and usage limits.