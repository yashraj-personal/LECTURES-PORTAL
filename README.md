# Lecture Hub

A lightweight static lecture portal built with HTML, CSS, and vanilla JavaScript. It is ready for GitHub Pages or Vercel: deploy this folder as a static site with no build step.

## API

The site uses the configured Google Apps Script web app in `api.js`. Lecture records are never hard-coded. The helper requests `lectures`, `allLectures`, `settings`, `stats`, and `logs`; it posts `login`, `adminLogin`, `visit`, `log`, and `updateSettings` requests when the backend supports them.

The Apps Script endpoint should return JSON, preferably `{ success: true, data: ... }`, although the client also accepts a direct object/array and common `result` payloads. Login responses may use `success`, `authenticated`, `valid`, or `status: "success"`.

## Deploy

- **GitHub Pages:** push these files to a repository and select the main branch/root in Pages settings.
- **Vercel:** import the repository and choose the default static deployment. No framework preset or build command is needed.

The visitor password is `NOTES` (case-insensitive) and access is session-only; no password is stored in localStorage. It is validated in the static site so visitors can enter even if the Apps Script service is unavailable. This is a convenience gate only: a password embedded in a static website cannot secure private material. Admin authentication remains controlled by the backend.

## Chatbot: deployment-safe free AI

The old chatbot relied on WebGPU and MP4 video playback. Both are unreliable across phones, Safari, Brave, older laptops, and browser privacy settings. The rebuilt chatbot uses a CSS avatar (so there are no black video frames), sounds only after a user gesture, and a built-in study tutor that works even with no network AI service.

For broad AI answers, this project includes a secure **Cloudflare Worker** in `cloudflare-worker/`. It uses the Cloudflare Workers AI binding and the `@cf/meta/llama-3.1-8b-instruct` model. The binding keeps the AI credential out of GitHub Pages; there is no API key in the frontend. Cloudflare Workers AI has a free daily allocation, but all free services have quotas and availability limits.

### One-time free AI setup

1. Create a free Cloudflare account and install Wrangler (`npm install -g wrangler`).
2. In a terminal, open `cloudflare-worker`, run `wrangler login`, then run `wrangler deploy`.
3. The current Worker URL is already configured in `ai-config.json`. After changing `cloudflare-worker/src/index.js`, deploy the Worker with `npx wrangler deploy` from the `cloudflare-worker` folder. The live Worker must be redeployed whenever its model or server code changes.
4. In `cloudflare-worker/wrangler.toml`, set `ALLOWED_ORIGINS` to your GitHub Pages origin. The included value is `https://yashraj-personal.github.io`.
5. Commit and publish the root website folder to GitHub Pages. Do not publish the `cloudflare-worker` folder as the Pages site.

The chatbot immediately uses the local tutor when the Worker URL is blank, the network is down, or the free daily quota is exhausted. Do not send passwords or private information to any chatbot.

## Audio behavior

The chatbot uses only the supplied looping MP4s: `assets/chatbot-animations/minimized.mp4` when minimized and `assets/chatbot-animations/expanded.mp4` when expanded. It has no CSS-generated avatar or chatbot animation; the supplied PNG is used only as the video poster while the media loads. Chatbot click sounds play after a user click/tap, as required by modern browser autoplay rules. The emotion effects are selected for appreciation, laughter, sadness, surprise, and insults. The admin-panel loop starts from the Admin link and continues through the confirmation screen. A wrong admin password plays the separate `assets/admin-alert.mp3`; the loop stops on **NO**, successful admin login, or return to the portal.
