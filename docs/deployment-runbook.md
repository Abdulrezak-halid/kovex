# Kovex ERP Deployment Runbook

This runbook supports Sprint 7 TASK-078 and TASK-079.

The selected first deployment is a same-origin Render web service:

- Express API under `/api`
- Swagger UI under `/api-docs`
- Built Vite frontend served by Express
- Supabase PostgreSQL via `DATABASE_URL`

## 1. Prepare Supabase

1. Create the Supabase project.
2. Copy the database connection string.
3. Set `DATABASE_URL` locally.
4. Push the schema:

```bash
DATABASE_URL="postgres://..." pnpm run db:push
```

## 2. Prepare Render

1. Connect the GitHub repository to Render.
2. Create a Blueprint from `render.yaml`, or create a Docker web service
   manually.
3. Use `docker/Dockerfile.prod`.
4. Set health check path:

```text
/api/healthz
```

5. Add environment variables from `docs/deployment-environment.md`.

## 3. Deploy Backend

Render builds the production Docker image and starts:

```bash
node --enable-source-maps packages/back/dist/index.mjs
```

Verify:

```text
https://<render-service-host>/api/healthz
https://<render-service-host>/api-docs/
https://<render-service-host>/api/openapi.yaml
```

## 4. Deploy Frontend

The frontend is built inside `docker/Dockerfile.prod` with:

```text
BASE_PATH=/
MOCK_API=false
```

Verify:

```text
https://<render-service-host>/
https://<render-service-host>/login
```

Browser API requests should use same-origin `/api` URLs.

## 5. Post-Deploy Checks

- Health endpoint returns `{"status":"ok"}`.
- Swagger UI loads.
- Frontend loads without mock API.
- Login flow reaches the deployed API.
- Session cookie is marked secure over HTTPS.
- No secret values appear in deploy logs.

## Current Deployment Status

The repository now includes the deployment configuration, but TASK-078 and
TASK-079 can only be marked completed after a real Render URL exists and the
verification checks pass.

