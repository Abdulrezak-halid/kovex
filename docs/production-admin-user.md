# Kovex ERP Production Admin User

Use this after pushing the database schema to Supabase.

## Create Or Reset The Demo Admin

Run:

```bash
DATABASE_URL='postgresql://...' pnpm run db:seed-admin
```

Default login:

```text
manager@example.com
admin123
```

## Recommended Production Password

For a real public demo, set a stronger password:

```bash
DATABASE_URL='postgresql://...' \
ADMIN_EMAIL='manager@example.com' \
ADMIN_PASSWORD='replace-with-a-strong-password' \
pnpm run db:seed-admin
```

Do not commit the real password.
