# API and Database Testing

Kovex backend integration tests run the real Express app against a dedicated
PostgreSQL database. The tests use Node's built-in test runner and `tsx`, so API
endpoints are exercised over HTTP instead of by calling route handlers directly.

## Test database strategy

Use a separate database for automated tests. Do not point `TEST_DATABASE_URL` at
the development or production database because tests reset tables with
`TRUNCATE ... RESTART IDENTITY CASCADE`.

Recommended local database:

```powershell
createdb sme_erp_test
$env:TEST_DATABASE_URL = "postgres://postgres:postgres@localhost:5432/sme_erp_test"
```

If PostgreSQL is running in Docker, create the same `sme_erp_test` database in
that container and use the matching connection string.

## Running tests

From the repository root:

```powershell
$env:TEST_DATABASE_URL = "postgres://postgres:postgres@localhost:5432/sme_erp_test"
pnpm --filter @sme-erp/back test
```

The `test` script first pushes the current Drizzle schema to the test database,
then runs the integration suite:

```text
pnpm --filter @sme-erp/back test:db:push
pnpm --filter @sme-erp/back test:integration
```

## Current coverage

The customer API integration test covers the main CRUD flow:

- login through `/api/auth/login`
- create a customer
- read the customer by id
- update the customer
- list/search customers
- delete the customer
- verify missing records return `404`
- verify invalid input returns a `400` validation response

Add future CRUD integration tests beside the route they cover using the
`*.integration.test.ts` suffix.
