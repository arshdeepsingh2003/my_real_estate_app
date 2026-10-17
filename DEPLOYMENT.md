# Deploying to Vercel

This repository is configured as a single Vercel project: Vercel builds the React app as static output and serves the Express API from a Node function. The browser uses same-origin `/api/...` requests, so production does not need a separately configured API URL or proxy.

## Vercel project settings

- Set the project root to the repository root (the folder containing `vercel.json`).
- Use the included Vercel build and route configuration; do not override the output directory or install/build commands in the dashboard.
- Deploy the production branch after adding the environment variables below.

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

After deployment, load a nested client route directly, verify `/api` calls, sign-in and sign-up, listing/image creation, and enquiry email delivery. The current image endpoint receives multipart uploads through a Vercel function; Vercel limits function request payloads, so large multi-image uploads may need a later switch to signed direct-to-Cloudinary uploads.
