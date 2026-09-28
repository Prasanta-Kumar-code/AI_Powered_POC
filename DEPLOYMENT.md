# Deployment

This guide uses GitHub Pages for the frontend and optionally Hugging Face Spaces as a small AI proxy. Free-tier terms and quotas can change; check current provider documentation before publishing.

## Deploy the Frontend to GitHub Pages

1. Create a GitHub repository and push the Vite app to its default branch.
2. Install the GitHub Pages deploy helper if the project uses it:

   ```bash
   npm install --save-dev gh-pages
   ```

3. Set Vite's `base` option to `/<repository-name>/` in `vite.config.js` (use `/` for a user or organization site). Add deploy scripts to `package.json`:

   ```json
   {
     "scripts": {
       "predeploy": "npm run build",
       "deploy": "gh-pages -d dist"
     }
   }
   ```

4. Run `npm run deploy`, then in the repository settings open **Pages** and select the `gh-pages` branch as the publishing source if it is not selected automatically.
5. Open the Pages URL and test the app on mobile and desktop. Alternatively, configure GitHub Actions to build and publish `dist` on each push.

## Connect Hugging Face

1. Choose a model and inference route that is currently available on the Hugging Face free tier. Verify model access, provider support, rate limits, and terms.
2. If authentication uses a token, create a small backend (for example, a FastAPI app) and deploy it as a Hugging Face Space. Add the token as a Space secret in the Space settings.
3. Have the backend accept only the fields it needs, call the model API, return validated text, and avoid logging personal resume details. Configure CORS to allow only the published Pages origin.
4. Set the frontend's API base URL to the Space endpoint using a build-time public setting. This URL is not secret. Keep the token exclusively in the Space secret/environment.
5. Handle provider errors, quotas, and timeouts in the UI. Do not silently fall back to a paid service.

For local development, keep local settings out of version control and use a local backend environment file or secret store. Never put an API token in React source, committed `.env` files, or GitHub Pages build variables that become part of the client bundle.

## Free-Tier Only

- Use GitHub Pages and the free Hugging Face hosting/API tier within their current limits.
- Do not enable paid plans, paid inference, or billing-dependent services.
- OpenAI free trial credit is optional only; it may expire or be unavailable. Check usage and billing settings before testing.
- If the free API quota is exhausted, show a useful notice and let the user retry later; do not incur charges automatically.