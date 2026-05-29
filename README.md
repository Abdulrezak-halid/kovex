# SME ERP System

SME ERP System is a TypeScript monorepo for small and medium businesses. It combines a React frontend, an Express REST API, generated API client/validation packages, and a PostgreSQL database layer built with Drizzle.

The project is organized so the main application code is easy to understand:

- `packages/front` - the frontend application.
- `packages/back` - the backend server and REST API.
- `packages/database` - database connection, Drizzle schema, and migrations/push config.
- `packages/api-contract` - OpenAPI contract that describes the API.
- `packages/api-client` - generated frontend API client.
- `packages/api-validation` - generated backend validation schemas and types.
- `docs` - project explanation and diagram-ready documentation.

## Requirements

- Node.js 24 or newer
- pnpm
- Git
- PostgreSQL, only required when running the real backend/database

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

## Install And Run

Install all workspace dependencies:

```bash
pnpm install
```

Run the frontend with the local mock API:

```bash
pnpm run dev:front
```

Open:

```text
http://localhost:8081/
```

This is the fastest mode for UI development because it does not require PostgreSQL or the real backend.

## Run With Real Backend

Start PostgreSQL and create a database, for example `sme_erp`.

Set your database URL:

```bash
export DATABASE_URL=postgres://user:password@localhost:5432/sme_erp
```

Push the database schema:

```bash
pnpm --filter @sme-erp/database run push
```

Start the backend API:

```bash
PORT=5000 pnpm --filter @sme-erp/back run dev
```

In another terminal, start the frontend in real API mode:

```bash
MOCK_API=false PORT=8081 BASE_PATH=/ pnpm --filter @sme-erp/front run dev
```

Open:

```text
http://localhost:8081/
```

## Useful Commands

```bash
pnpm run typecheck
pnpm run build
pnpm run dev:front
pnpm run dev:back
pnpm --filter @sme-erp/api-contract run codegen
pnpm --filter @sme-erp/database run push
```

Legacy aliases are still available:

```bash
pnpm run dev:web
pnpm run dev:api
```

## Project Explanation

The system has three main runtime layers:

1. The user works in `packages/front`, a React/Vite application. The frontend contains pages for dashboard, sales, purchases, inventory, planning, reports, and settings.
2. The frontend calls `/api` endpoints using the generated client from `packages/api-client`. In mock mode, Vite serves an in-memory mock API. In real mode, requests are proxied to the backend.
3. The backend in `packages/back` receives REST requests, validates inputs using `packages/api-validation`, executes business logic inside route modules, and reads/writes PostgreSQL through `packages/database`.

The API contract is the center of the project flow. `packages/api-contract/openapi.yaml` describes the available endpoints and schemas. Code generation uses that contract to create the frontend API client and backend validation types. This keeps the frontend, backend, and documentation aligned.

The database package contains the business entities: customers, suppliers, products, warehouses, stock, quotations, orders, invoices, purchase orders, purchase invoices, users, projects, and tasks. The backend route modules map business workflows onto these entities.

## Logical Flowchart Text

Use this flow when creating a diagram:

```text
User
  -> Frontend Application (packages/front)
    -> Navigation and UI Pages
      -> Dashboard
      -> Sales: Customers, Quotations, Orders, Invoices
      -> Purchases: Suppliers, Purchase Orders, Purchase Invoices
      -> Inventory: Products, Warehouses, Stock
      -> Planning: Projects, Tasks
      -> Reports: Sales, Purchases, Inventory
      -> Settings: Users
    -> API Client (packages/api-client)
      -> Mock API in development mode
      OR
      -> Real REST API over /api
        -> Backend Server (packages/back)
          -> Express App
          -> Route Modules
            -> Dashboard Routes
            -> Sales Routes
            -> Purchase Routes
            -> Inventory Routes
            -> Planning Routes
            -> Report Routes
            -> User Routes
          -> API Validation (packages/api-validation)
          -> Database Layer (packages/database)
            -> Drizzle ORM
            -> PostgreSQL Database
```

Main business flow:

```text
Customer
  -> Quotation
    -> Sales Order
      -> Invoice
        -> Stock decreases
        -> Sales reports update

Supplier
  -> Purchase Order
    -> Purchase Invoice
      -> Stock increases
      -> Purchase reports update

Products and Warehouses
  -> Stock Levels
    -> Inventory Report
    -> Low Stock Alerts

Users
  -> Access the system
  -> Manage operational records
  -> Support audit and ownership of data
```

## Troubleshooting

If `pnpm install` says to use pnpm, make sure you are not running `npm install`.

If port `8081` is already in use, run the frontend with another port:

```bash
PORT=8082 BASE_PATH=/ pnpm --filter @sme-erp/front run dev
```

If the browser shows API errors such as `ERR_CONNECTION_REFUSED`, either run the frontend in mock mode:

```bash
pnpm run dev:front
```

or start the real backend on port `5000` and run the frontend with `MOCK_API=false`.

If the backend fails with `DATABASE_URL must be set`, export the variable before starting the backend:

```bash
export DATABASE_URL=postgres://user:password@localhost:5432/sme_erp
```

## Git Notes

Do not commit generated or local files such as:

- `node_modules`
- `dist`
- `.local`
- `.env`

These are already covered by `.gitignore`.
