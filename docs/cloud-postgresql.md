# Kovex ERP Cloud PostgreSQL Setup

This document supports Sprint 7 TASK-080: Prepare PostgreSQL cloud database.

## Selected Provider

Use Supabase managed PostgreSQL for the first production/demo deployment.

## Create The Database

1. Create a Supabase project.
2. Choose a region close to the Render service region.
3. Save the database password securely.
4. Open the Supabase project dashboard.
5. Click **Connect** and copy the Postgres connection string.

## Choose The Connection String

Use one of these:

- Direct connection for migrations and persistent backend traffic when the host
  can reach the database endpoint.
- Session pooler connection when Render or your network requires IPv4.

Avoid the transaction pooler for this Express backend unless the database client
is explicitly configured for transaction-pooler limitations.

## Push Schema

Run this locally or in a trusted deployment shell after setting `DATABASE_URL`:

```bash
DATABASE_URL="postgres://..." pnpm run db:push
```

## Verify Backend Connectivity

After Render is deployed, open:

```text
https://<render-service-host>/api/healthz
```

Then verify authenticated/data routes after the admin/user setup workflow is
ready.

## Operational Notes

- Keep the Supabase project password out of Git.
- Prefer a dedicated production database, not a shared local/demo database.
- Store the runtime database URL in Render environment variables.
- Store migration/admin access separately from app runtime secrets where
  possible.

