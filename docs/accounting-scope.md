Accounting module: Scope and basic entities

Goal
----
Add basic accounting capabilities to the system: record expenses, payments, and balances. Provide foundational data models and API skeletons so the rest of the application can integrate with accounting workflows.

Scope
-----
- Track `Accounts` (chart of accounts) with types (asset, liability, equity, income, expense).
- Record `Transactions` as ledger entries (debit/credit) attached to accounts.
- Record `Expenses` (bills/purchase expenses) with status (unpaid/paid).
- Record `Payments` (transfers between accounts / payments applied to expenses).
- Provide `Balances` snapshots for quick reads (can be derived from transactions).
- Expose simple CRUD and list endpoints for integration; complex features (reconciliation, multi-currency gains/losses, financial reports) are out of scope for this initial iteration.

Basic entities
--------------
- Account: id, name, type, currency, metadata, created_at
- Transaction: id, account_id, direction(debit|credit), amount, currency, reference, metadata, created_at
- Expense: id, account_id, amount, currency, description, incurred_at, status, reference, created_at
- Payment: id, from_account_id, to_account_id, amount, currency, method, reference, paid_at, created_at
- Balance: id, account_id, balance, as_of, created_at

Acceptance criteria mapping
---------------------------
- Accounting scope is defined above.
- Basic accounting entities are designed and stored in `database/src/schema/accounting.ts`.

Next steps
----------
- Wire the schema into migrations and the ORM config (drizzle config).
- Implement API endpoints and basic UI pages to manage accounts, expenses, and payments.

What I added
------------
- Drizzle schema: `packages/database/src/schema/accounting.ts`
- SQL migration: `packages/database/migrations/20260607_create_accounting.sql`
- Backend routes: `packages/back/src/routes/accounting.ts`
- Validations: `packages/api-validation/src/generated/api.ts` (accounting Zod schemas)
- Balance utility + unit test: `packages/back/src/lib/accounting-utils.js`, `packages/back/test/accounting-utils.test.js`

To apply DB schema to a running database, run:

```bash
DATABASE_URL=postgres://user:pass@host:5432/db pnpm --filter @sme-erp/database run push
```

