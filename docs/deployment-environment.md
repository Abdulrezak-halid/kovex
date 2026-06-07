# Kovex ERP Production Environment Variables

This document completes Sprint 7 TASK-077: Configure production environment
variables.

## Storage Rule

Production secrets must be stored in platform dashboards, not committed files.
Use `.env.production.example` only as a safe template.

## Render Web Service Variables

Set these in the Render service environment:

```text
NODE_ENV=production
LOG_LEVEL=info
DATABASE_URL=<Supabase Postgres connection string>
AUTH_SECRET=<strong random secret>
```

Render provides `PORT` automatically for web services. The backend reads
`PORT`, so do not hardcode a production port unless Render explicitly requires
an override.

## Frontend Build Variables

The selected first deployment serves the built frontend from the same Express
service. Build with:

```text
BASE_PATH=/
MOCK_API=false
PORT=8081
```

`PORT` is only needed because the Vite config validates it during build and
preview.

## Supabase Database Variable

Use the Supabase connection string as:

```text
DATABASE_URL=postgres://...
```

Recommended choice:

- Direct connection for migrations and long-running backend when the host can
  reach the database.
- Session pooler connection for persistent backends on IPv4-only networks.
- Transaction pooler only for serverless/short-lived functions.

## Secret Generation

Generate `AUTH_SECRET` locally and paste it into Render:

```bash
openssl rand -base64 48
```

Never commit the generated value.

## Validation Checklist

- `DATABASE_URL` is set in Render.
- `AUTH_SECRET` is set in Render and is not the development fallback.
- `NODE_ENV=production`.
- `LOG_LEVEL=info`.
- No real secret appears in `.env`, docs, screenshots, or Git history.

