# Contributing

Contributions are welcome. Keep changes beginner-friendly, accessible, privacy-conscious, and compatible with the project's free and open-source goal.

## Workflow

1. Fork the repository and clone your fork.
2. Create a focused branch, for example `feat/resume-preview` or `fix/mobile-form`.
3. Install dependencies with `npm install` and run the app with `npm run dev`.
4. Make a small, focused change. Do not commit API keys, personal resume examples, generated secrets, or build output.
5. Run available checks (at minimum, `npm run build`) and test the affected flow in a browser.
6. Push your branch and open a pull request against the upstream default branch. Explain the change and include screenshots for visible UI changes.

## Project Principles

- Keep hosting and required services on free tiers; do not add a paid dependency as a requirement.
- Never expose AI API secrets in frontend code or logs.
- Do not store or transmit more personal information than generation requires.
- Use verified user facts in AI-generated content; do not present invented credentials or achievements.
- Prefer accessible controls, responsive layouts, and lightweight dependencies.

By contributing, you agree that your contributions are distributed under the MIT License in [LICENSE.md](LICENSE.md).