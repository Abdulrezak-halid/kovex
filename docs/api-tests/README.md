# Kovex ERP API Demo Tests

This folder contains a Postman collection prepared for the committee demonstration.

## Files

- `kovex-erp.postman_collection.json` - health, auth, CRUD, and reports endpoint tests.
- `kovex-local.postman_environment.json` - local demo environment variables.

## Demo Setup

1. Start the backend.

   PowerShell:

   ```powershell
   $env:DATABASE_URL = "postgres://postgres:postgres@localhost:5432/sme_erp"
   $env:PORT = "5000"
   pnpm --filter @sme-erp/back run dev
   ```

   Bash:

   ```sh
   DATABASE_URL=postgres://postgres:postgres@localhost:5432/sme_erp PORT=5000 pnpm --filter @sme-erp/back run dev
   ```

2. Import both JSON files into Postman.
3. Select the `Kovex ERP Local` environment.
4. Confirm `demoEmail` and `demoPassword` match a real admin or sysadmin user in the local database.
5. Run the full `Kovex ERP Committee Demo API Tests` collection.

The default local values are `manager@example.com` and `admin123`, matching the mock demo account. If the real database uses a different account, update the environment values before running the protected requests.

## Coverage

- Health: `/api/healthz`
- Auth: invalid login, login, current session, logout, unauthenticated session
- CRUD: customers, suppliers, products, warehouses, projects, and tasks
- Reports: sales, inventory, purchases, PDF export, and Excel-compatible export
