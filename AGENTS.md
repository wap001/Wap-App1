# Base44 Development Notes — Wap Mobility

## Stack
Single-process dev server: **Express 4 + Vite middleware + Socket.IO** on port 3000.
- Frontend: React 19 + Vite 8 + Tailwind 4 (`@tailwindcss/vite`), entry `src/main.tsx`.
- Backend: `server.ts` mounts `src/server/routes.ts` (REST API) and `src/server/socket.ts` (real-time).
- `npm run dev` = `tsx server.ts`. In dev (`NODE_ENV !== 'production'`) it boots Vite in middleware mode and serves the SPA from source; in production it serves the prebuilt `dist/`.

## Database
**No external database is required to boot or develop.** `src/server/db.ts` is an in-memory
adapter seeded from code (regions, pricing, drivers) that mimics the pg-promise
`oneOrNone`/`manyOrNone` API and the PostGIS spatial queries. The production
`docker-compose.yml` + `deploy/init-db/` + PostGIS are for deployment only — not used here.

## Dependencies
The repo ships a `bun.lock` (no `package-lock.json`). `npm install` fails on Vite 8's
`esbuild` peer constraint, so the Base44 compose installs with
`npm install --legacy-peer-deps`, then runs `npx tsx server.ts`. Do not switch to a
plain `npm install`.

## Secrets
None required. `GEMINI_API_KEY`, `TWILIO_*`, `MAPBOX_ACCESS_TOKEN`, and
`PAYMENT_GATEWAY_KEYS` appear only as display strings in `DevOpsDeploymentView.tsx` —
they are not read by the running code. No `/run/base44/app.env` is wired.

## Verify it works
- `curl -s localhost:3000/api/health` → `{"status":"healthy",...}`
- `curl -s localhost:3000/` → HTML with `/@vite/client` (dev mode, live source).
- `curl -s localhost:3000/src/main.tsx` → Vite-transformed module (not a hashed asset).

## Compose
`docker compose -f docker-compose.base44.yml up -d` (bind-mounts source at `/app`,
isolates `node_modules` in an anonymous volume). Edits hot-reload via Vite HMR.
