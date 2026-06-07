# Kovex ERP Deployment Strategy

This document completes Sprint 7 TASK-075: Choose deployment strategy.

## Selected Strategy

Use a simple managed deployment for the first production/demo release:

- Frontend hosting: serve the built Vite frontend from the same Render web
  service as the API.
- Backend hosting: Render Web Service for the Node.js/Express backend.
- Database hosting: Supabase managed PostgreSQL.
- Environment variables: store production values in the Render service
  environment and Supabase dashboard. Do not commit secrets.

This same-origin first deployment is the safest fit for the current app because
the frontend uses relative `/api` requests and the backend uses HTTP-only
session cookies.

## Why This Strategy

- Render supports deploying web services from a Git provider or Docker image,
  and web services can define build commands, start commands, environment
  variables, secrets, health checks, and custom domains:
  https://render.com/docs/web-services
- Render recommends binding web services to the `PORT` environment variable,
  which already matches `packages/back/src/index.ts`:
  https://render.com/docs/web-services#port-binding
- Supabase provides managed PostgreSQL connection strings that can be assigned
  to `DATABASE_URL`:
  https://supabase.com/docs/guides/database/connecting-to-postgres
- Vercel is a good future option for a split static frontend, but it should wait
  until production API base URL and cross-site cookie behavior are explicitly
  implemented:
  https://vercel.com/docs/frameworks/frontend/vite

## Deployment Shape

```text
User Browser
  -> Render Web Service
       -> serves frontend static files
       -> serves Express API under /api
       -> serves Swagger UI under /api-docs
       -> connects to Supabase PostgreSQL
```

## Render Web Service

Recommended service name:

```text
kovex-erp-web
```

Recommended runtime:

```text
Node.js 24
```

Recommended build command:

```bash
pnpm install --frozen-lockfile
pnpm run build
```

Recommended start command:

```bash
pnpm --filter @sme-erp/back run start
```

Recommended health check path:

```text
/api/healthz
```

Required follow-up before first real deploy:

- Confirm the backend serves `packages/front/dist/public` in the production
  container.
- Ensure the backend build can locate
  `packages/api-contract/openapi.yaml` for `/api/openapi.yaml`.
- Confirm the frontend is built with `MOCK_API=false` and `BASE_PATH=/`.

## Supabase PostgreSQL

Recommended database name:

```text
kovex_erp
```

Use the Supabase Postgres connection string as:

```text
DATABASE_URL=postgres://...
```

For a long-running Render web service, use the direct connection string when it
is reachable from the hosting environment. If IPv4 reachability is required,
use the Supabase session pooler connection string.

## Environment Variable Strategy

Production values must be stored in platform dashboards, not committed files.

Backend service environment variables:

```text
NODE_ENV=production
PORT=<provided by Render>
DATABASE_URL=<Supabase Postgres connection string>
AUTH_SECRET=<strong random secret>
LOG_LEVEL=info
```

Frontend build environment variables:

```text
BASE_PATH=/
MOCK_API=false
PORT=8081
```

Notes:

- `AUTH_SECRET` must be generated as a long random secret before production.
- `DATABASE_URL` must never be committed.
- Render environment variable values are strings, so numeric values such as
  `PORT` are parsed by the application.
- Keep separate values for production and preview/staging when preview
  deployment is added.

## Current Gaps Before Deployment

The deployment strategy is selected, but the app still needs implementation
work before the first public deploy:

1. Verify the production Docker image on Render.
2. Run `pnpm run db:push` against the Supabase database.
3. Create a production admin/user seed workflow or documented manual setup.
4. Lock down CORS once production domains are known.
5. Confirm session cookies work over HTTPS in production.

## Future Split Frontend Option

After the first same-origin deploy works, the frontend can move to Vercel or a
Render Static Site.

That later option requires:

- A production public API base URL in the frontend.
- `setBaseUrl` or equivalent initialization for generated API calls.
- Updated manual `fetch("/api/...")` calls in frontend auth/export helpers.
- Explicit CORS allowlist for the frontend domain.
- Cookie settings that support the selected domain model.

## Decision Summary

Selected first deployment:

- Frontend: built Vite app served by the Render web service.
- Backend: Render Web Service.
- Database: Supabase PostgreSQL.
- Environment variables: Render dashboard for app secrets and Supabase dashboard
  for database credentials.
