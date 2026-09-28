# AI Resume Generator

A lightweight React app that turns a job seeker's supplied experience and target role into a clean, ATS-friendly resume draft. Users can edit the draft, copy plain text, and export a PDF. The current app works locally without an AI API; its draft builder only arranges facts supplied in the form.

## Features

- Generate resume sections from a guided form using an AI model.
- Export the finished resume to PDF; keep a plain-text version for ATS systems.
- Use a responsive React and Tailwind CSS interface.
- Generate on demand without a user account or database.

## Free Hosting Strategy

- Host the static frontend on GitHub Pages.
- Use a Hugging Face free-tier model/API. If the provider requires a private token, send requests through a small backend hosted on Hugging Face Spaces; never put a secret token in frontend code.
- Free API availability, quotas, model access, and free hosting limits can change. Check provider terms and limits before deployment. OpenAI trial credits are optional and are not guaranteed to be available or renewable.

## Quick Start

Run the app from this repository:

```bash
npm install
npm run dev
```

To create a local production build, run `npm run build`. AI-provider integration is not connected yet. Keep any future private API token on a backend; never commit tokens or embed them in the frontend.

## Documentation

- [Requirements](REQUIREMENTS.md)
- [Technology stack](TECH_STACK.md)
- [Architecture](ARCHITECTURE.md)
- [Example prompts](PROMPTS.md)
- [Deployment](DEPLOYMENT.md)
- [Contributing](CONTRIBUTING.md)
- [User guide](USER_GUIDE.md)
- [Future enhancements](FUTURE_ENHANCEMENTS.md)
- [MIT License](LICENSE.md)