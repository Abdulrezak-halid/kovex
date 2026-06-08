# Kovex ERP Accounting Module Design

Status: Scope and entity design completed for future implementation.

## Goal

Add a basic accounting module for SME operations. The first version should track expenses, incoming customer payments, outgoing supplier payments, and balances connected to existing sales and purchase invoices.

## Accounting Scope

In scope:

- Record business expenses with categories, dates, amounts, notes, and optional supplier links.
- Record customer payments against sales invoices.
- Record supplier payments against purchase invoices.
- Track cash and bank accounts used by payments and expenses.
- Calculate customer receivable balances from invoices minus customer payments.
- Calculate supplier payable balances from purchase invoices minus supplier payments.
- Calculate account balances from opening balances, incoming payments, supplier payments, and expenses.
- Show basic accounting summaries for dashboard and reports.
- Use the existing `accounting` permission for accountants, admins, and sysadmins.

Out of scope for the first version:

- Full double-entry general ledger.
- Complete chart of accounts.
- Tax filing and payroll.
- Bank feed imports and bank reconciliation.
- Multi-currency accounting.
- Locked accounting periods and audit approvals.

## Existing System Links

The accounting module should extend current records:

- `invoices` are sales invoices and create customer receivables.
- `purchase_invoices` are supplier invoices and create supplier payables.
- `customers` are used for customer payment and balance summaries.
- `suppliers` are used for supplier payment, expense, and balance summaries.
- Sales invoice status currently supports `paid`; future payment posting must avoid duplicate stock reduction when updating payment-related status.

## Basic Accounting Entity Design

### accounting_accounts

Tracks cash, bank, card, or other money accounts.

Fields:

- `id`
- `name`
- `type`: `cash`, `bank`, `card`, `other`
- `currency`: default `USD`
- `opening_balance`
- `active`
- `notes`
- `created_at`

Relationships:

- Used by expenses, customer payments, and supplier payments.

### expense_categories

Groups expenses for filtering and reports.

Fields:

- `id`
- `name`
- `code`
- `description`
- `active`
- `created_at`

Relationships:

- One category can be used by many expenses.

### expenses

Tracks business costs not already represented by purchase invoices.

Fields:

- `id`
- `reference`
- `category_id`
- `supplier_id`: optional
- `account_id`
- `expense_date`
- `amount`
- `status`: `draft`, `approved`, `void`
- `payment_status`: `unpaid`, `paid`
- `payment_method`: `cash`, `bank_transfer`, `card`, `other`
- `notes`
- `attachment_url`
- `created_by`
- `created_at`

Relationships:

- Belongs to one expense category.
- Can optionally link to a supplier.
- Uses one accounting account when paid.

### customer_payments

Tracks money received from customers.

Fields:

- `id`
- `reference`
- `customer_id`
- `invoice_id`
- `account_id`
- `payment_date`
- `amount`
- `method`: `cash`, `bank_transfer`, `card`, `other`
- `external_reference`
- `notes`
- `created_by`
- `created_at`

Relationships:

- Belongs to one customer.
- Usually links to one sales invoice.
- Uses one accounting account.

Business rules:

- `amount` must be greater than zero.
- Payment total for an invoice should not exceed the unpaid invoice balance unless overpayments are explicitly supported later.
- Invoice status can become `partially_paid` or `paid` based on total payments.

### supplier_payments

Tracks money paid to suppliers.

Fields:

- `id`
- `reference`
- `supplier_id`
- `purchase_invoice_id`
- `account_id`
- `payment_date`
- `amount`
- `method`: `cash`, `bank_transfer`, `card`, `other`
- `external_reference`
- `notes`
- `created_by`
- `created_at`

Relationships:

- Belongs to one supplier.
- Usually links to one purchase invoice.
- Uses one accounting account.

Business rules:

- `amount` must be greater than zero.
- Payment total for a purchase invoice should not exceed the unpaid purchase invoice balance unless overpayments are explicitly supported later.
- Purchase invoice status can become `partially_paid` or `paid` based on total payments.

### payment_allocations

Optional second-step entity for payments that cover more than one invoice.

Fields:

- `id`
- `payment_type`: `customer`, `supplier`
- `payment_id`
- `invoice_type`: `sales`, `purchase`
- `invoice_id`
- `allocated_amount`
- `created_at`

Relationships:

- Allows one payment to be split across multiple invoices.

First version can skip this entity if every payment must belong to exactly one invoice.

### Balance Views

Balances should be calculated first instead of stored as mutable totals.

Customer balance:

- `customer_id`
- `total_invoiced`
- `total_paid`
- `balance_due`
- `overdue_amount`
- `last_payment_date`

Supplier balance:

- `supplier_id`
- `total_billed`
- `total_paid`
- `balance_due`
- `overdue_amount`
- `last_payment_date`

Account balance:

- `account_id`
- `opening_balance`
- `incoming_total`
- `outgoing_total`
- `expense_total`
- `current_balance`

## API Design Sketch

Planned endpoints:

- `GET /api/accounting/accounts`
- `POST /api/accounting/accounts`
- `PATCH /api/accounting/accounts/:id`
- `GET /api/accounting/expense-categories`
- `POST /api/accounting/expense-categories`
- `GET /api/accounting/expenses`
- `POST /api/accounting/expenses`
- `PATCH /api/accounting/expenses/:id`
- `GET /api/accounting/customer-payments`
- `POST /api/accounting/customer-payments`
- `GET /api/accounting/supplier-payments`
- `POST /api/accounting/supplier-payments`
- `GET /api/accounting/balances/customers`
- `GET /api/accounting/balances/suppliers`
- `GET /api/accounting/balances/accounts`
- `GET /api/accounting/summary`

## UI Scope

First accounting UI pages:

- Expenses list and expense form.
- Customer payments list and payment form.
- Supplier payments list and payment form.
- Balances page with customer, supplier, and account tabs.
- Accounting summary cards for unpaid invoices, unpaid purchase invoices, monthly expenses, and cash/bank balance.

## Implementation Order

1. Add Drizzle schema tables for accounts, categories, expenses, customer payments, and supplier payments.
2. Add validation schemas and API contract definitions.
3. Add backend accounting routes protected by `requireModulePermission("accounting")`.
4. Add frontend accounting navigation and pages.
5. Add report/dashboard summaries using calculated balances.
6. Add focused tests for payment totals, overpayment protection, and balance calculations.

## Acceptance Criteria Traceability

- Accounting scope is defined in the "Accounting Scope", "Existing System Links", and "UI Scope" sections.
- Basic accounting entities are designed in the "Basic Accounting Entity Design" and "Balance Views" sections.
