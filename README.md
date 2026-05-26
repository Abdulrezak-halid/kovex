# SME ERP System

An ERP workspace for small and medium businesses, with a 
- React/Vite frontend, 
- Express API, 
- PostgreSQL/Drizzle data layer.

## Requirements

- Node.js 24 or newer
- pnpm
- Git
- PostgreSQL, only required when running the real API/database

Check versions:

```bash
node --version
pnpm --version
git --version
```

If pnpm is not installed, enable it with Corepack:

```bash
corepack enable
corepack prepare pnpm@11.3.0 --activate
```

## Clone And Run

```bash
git clone git@github.com:Abdulrezak-halid/sme-erp-system.git
cd sme-erp-system
pnpm install
pnpm run dev:web
```

Open:

```text
http://localhost:8081/
```

This starts the frontend with a local mock API. No database is needed for this mode, and it is the fastest way to view and edit the UI on a new laptop.

## Development Modes

### Frontend With Mock Data

```bash
pnpm run dev:web
```

The mock API is in-memory. Data you create in the UI will appear immediately, but it resets when the dev server restarts.

### Frontend With Real API

Start PostgreSQL and create a database, for example `sme_erp`.

Set your database URL:

```bash
export DATABASE_URL=postgres://user:password@localhost:5432/sme_erp
```

Push the schema:

```bash
pnpm --filter @sme-erp/database run push
```

Start the API:

```bash
PORT=5000 pnpm --filter @sme-erp/api run dev
```

In another terminal, start the frontend in real API mode:

```bash
MOCK_API=false PORT=8081 BASE_PATH=/ pnpm --filter @sme-erp/web run dev
```

Open:

```text
http://localhost:8081/
```

## Useful Commands

```bash
pnpm run typecheck
pnpm run build
pnpm run dev:web
pnpm run dev:api
pnpm --filter @sme-erp/api-contract run codegen
pnpm --filter @sme-erp/database run push
```

## Project Structure

- `apps/web` - React/Vite frontend
- `apps/api` - Express API server
- `packages/database` - Drizzle database schema/client
- `packages/api-contract` - OpenAPI specification
- `packages/api-client` - generated React Query API client
- `packages/api-validation` - generated API validation schemas
- `docs` - project documentation

## Troubleshooting

If `pnpm install` says to use pnpm, make sure you are not running `npm install`.

If port `8081` is already in use, run the frontend with another port:

```bash
PORT=8082 BASE_PATH=/ pnpm --filter @sme-erp/web run dev
```

If the browser shows API errors such as `ERR_CONNECTION_REFUSED`, either run the frontend in mock mode:

```bash
pnpm run dev:web
```

or start the real API on port `5000` and run the frontend with `MOCK_API=false`.

If the real API fails with `DATABASE_URL must be set`, export the variable before starting the API:

```bash
export DATABASE_URL=postgres://user:password@localhost:5432/sme_erp
```

If TypeScript complains about package outputs after deleting generated files, run the full workspace check:

```bash
pnpm run typecheck
```

## Git Notes

Do not commit generated or local files such as:

- `node_modules`
- `dist`
- `.local`
- `.env`

These are already covered by `.gitignore`.
