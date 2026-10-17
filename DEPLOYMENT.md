# Deploying to Vercel

This repository is configured as a single Vercel project: Vercel builds the React app as static output and serves the Express API from a Node function. The browser uses same-origin `/api/...` requests, so production does not need a separately configured API URL or proxy.

## Vercel project settings

Use these values so Vercel builds from the repository root and publishes the nested Vite output:

- **Root Directory:** `.` (the repository root containing `vercel.json`; do not select `client/`).
- **Framework Preset:** `Other` (the Vercel JSON specifies the client build and nested output directory).
- **Build Command:** `npm install --prefix client && npm run build --prefix client`.
- **Output Directory:** `client/dist`.

These values match `vercel.json`. The build runs Vite with `client/` as its working directory, so Vite's `outDir: "dist"` produces `client/dist/`; it does not produce a repository-root `dist/`. `vercel.json` explicitly selects the `Other` framework preset and publishes `client/dist`.

If Vercel still reports **No Output Directory named `dist` found**, it is not applying this repository-root configuration as intended: check that the connected Vercel project points at this repository and that **Root Directory** is `.` (not `client/` or a nested directory). With the root set to `.`, set any enabled Output Directory override to `client/dist` exactly, not `dist`; likewise use the build command above or disable its override. Do not change the root to `client/`, because the API function and `vercel.json` are at the repository root. Do not use Vite's default root-level `dist` output. Deploy the production branch after adding the environment variables below.

## Environment variables

Add these in Vercel Project Settings → Environment Variables. Set them for Production and Preview as appropriate. Keep secret values server-side; only `VITE_CLERK_PUBLISHABLE_KEY` is intended to be exposed to the browser.

- `MONGO` — MongoDB connection string. Allow Vercel deployments through the MongoDB provider's network-access settings.
- `JWT_SECRET` — a long, random server-side secret.
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` — Cloudinary credentials.
- `CLERK_SECRET_KEY` — Clerk production secret key.
- `VITE_CLERK_PUBLISHABLE_KEY` — Clerk production publishable key. This is read during the client build, so set it before deploying.
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM` — SMTP service settings used to send listing enquiries.

Set the production and preview domains in Clerk's allowed origins/redirect URL configuration. Configure a separate Clerk development instance/key for local development where needed.

## Local development proxy (optional)

All frontend requests use relative `/api` paths. Vite only configures a development proxy when `API_PROXY_TARGET` is set in the client environment; the setting is not embedded in production builds. Without it, run the app through Vercel's local development workflow or configure your own development API target.

## Deployment checks

After deployment, open `/api/health` on the deployed domain; it should return JSON containing `success: true`. Then test sign-up, sign-in, listing/image creation, and enquiry email delivery. If `/api/health` returns the app's HTML page or a Vercel 404, verify the Vercel project root is the repository root and redeploy this version. If the health endpoint works but account validation fails, check Vercel function logs and confirm `MONGO` is configured and reachable from Vercel.

The current image endpoint receives multipart uploads through a Vercel function; Vercel limits function request payloads, so large multi-image uploads may need a later switch to signed direct-to-Cloudinary uploads.
