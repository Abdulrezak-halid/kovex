# SME ERP System

An ERP workspace for small and medium businesses, with a React/Vite frontend, Express API, and PostgreSQL/Drizzle data layer.

## Requirements

- Node.js 24+
- pnpm
- PostgreSQL

## Setup

```bash
pnpm install
```

Create a local environment file for the API:

```bash
DATABASE_URL=postgres://user:password@localhost:5432/sme_erp
```

## Development

Run the API server:

```bash
PORT=5000 DATABASE_URL=postgres://user:password@localhost:5432/sme_erp pnpm --filter @sme-erp/api run dev
```

Run the frontend:

```bash
pnpm run dev:web
```

Open `http://localhost:8081/`.

The frontend uses a local mock API by default so the UI can run without a database. To use the real API server instead:

```bash
MOCK_API=false PORT=8081 BASE_PATH=/ pnpm --filter @sme-erp/web run dev
```

## Useful Commands

```bash
pnpm run typecheck
pnpm run build
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
