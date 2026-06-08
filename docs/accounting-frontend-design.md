# Kovex ERP Accounting Frontend Design

Status: Frontend scope and entity design completed for future implementation.

## Goal

Add the frontend planning for the accounting module. The UI should let accountant users manage expenses, payments, and balances while reusing the existing invoice and purchase invoice flows already protected by the `accounting` permission.

## Existing Frontend Anchors

- `PermissionModule` already includes `accounting`.
- The `accountant` role can access `dashboard`, `accounting`, and `reports`.
- Sales invoices at `/sales/invoices` already use the `accounting` permission.
- Purchase invoices at `/purchases/invoices` already use the `accounting` permission.
- Existing list pages use `CPageHeader`, `CListQueryControls`, `CDataTable`, dialogs, status badges, and toast feedback.

## Frontend Accounting Scope

In scope for the first frontend version:

- Add an Accounting navigation group protected by the `accounting` permission.
- Add accounting pages for summary, expenses, payments, balances, accounts, and expense categories.
- Support list, filter, sort, create, and edit flows for expenses.
- Support recording customer payments against sales invoices.
- Support recording supplier payments against purchase invoices.
- Show calculated balances for customers, suppliers, and cash or bank accounts.
- Show payment status and balance-due fields on invoice-focused accounting screens.
- Reuse existing customer, supplier, invoice, and purchase invoice selectors.
- Keep accounting labels available in English and Turkish locale files.

Out of scope for the first frontend version:

- Full general ledger UI.
- Chart of accounts management beyond simple cash or bank accounts.
- Bank reconciliation screens.
- Payroll, taxes, and tax filing screens.
- Multi-currency workflows.
- Complex approval workflows and locked accounting periods.

## Planned Routes

- `/accounting` or `/accounting/summary`: accounting summary page.
- `/accounting/expenses`: expense list and expense dialog.
- `/accounting/customer-payments`: customer payment list and payment dialog.
- `/accounting/supplier-payments`: supplier payment list and payment dialog.
- `/accounting/balances`: tabbed balances page.
- `/accounting/accounts`: cash and bank account setup.
- `/accounting/expense-categories`: expense category setup.

All routes should map to the `accounting` permission in `permissionModuleForPath`.

## Page Design

### Accounting Summary

Purpose:

- Give accountants a quick financial snapshot.

Primary UI:

- Summary cards for cash or bank balance, monthly expenses, unpaid customer invoices, and unpaid supplier invoices.
- Small tables for overdue receivables and overdue payables.
- Optional trend charts for expense totals and payment totals.

### Expenses

Purpose:

- Track business costs that are not already purchase invoices.

List columns:

- Reference
- Expense date
- Category
- Supplier
- Account
- Amount
- Payment status
- Status
- Actions

Filters:

- Search
- Date range
- Category
- Supplier
- Payment status
- Status

Form fields:

- Category
- Supplier, optional
- Account
- Expense date
- Amount
- Payment method
- Status
- Notes
- Attachment URL, optional

### Customer Payments

Purpose:

- Record money received from customers.

List columns:

- Reference
- Payment date
- Customer
- Invoice
- Account
- Method
- Amount
- Actions

Filters:

- Search
- Date range
- Customer
- Account
- Method

Form fields:

- Customer
- Sales invoice
- Account
- Payment date
- Amount
- Method
- External reference
- Notes

Frontend rules:

- Amount must be greater than zero.
- Selected invoice must belong to the selected customer.
- Payment amount must not exceed the displayed remaining invoice balance unless backend overpayment support is added.

### Supplier Payments

Purpose:

- Record money paid to suppliers.

List columns:

- Reference
- Payment date
- Supplier
- Purchase invoice
- Account
- Method
- Amount
- Actions

Filters:

- Search
- Date range
- Supplier
- Account
- Method

Form fields:

- Supplier
- Purchase invoice
- Account
- Payment date
- Amount
- Method
- External reference
- Notes

Frontend rules:

- Amount must be greater than zero.
- Selected purchase invoice must belong to the selected supplier.
- Payment amount must not exceed the displayed remaining purchase invoice balance unless backend overpayment support is added.

### Balances

Purpose:

- Show receivables, payables, and money account balances.

Tabs:

- Customer balances
- Supplier balances
- Account balances

Customer balance columns:

- Customer
- Total invoiced
- Total paid
- Balance due
- Overdue amount
- Last payment date

Supplier balance columns:

- Supplier
- Total billed
- Total paid
- Balance due
- Overdue amount
- Last payment date

Account balance columns:

- Account
- Type
- Opening balance
- Incoming total
- Outgoing total
- Expense total
- Current balance

### Accounts

Purpose:

- Manage cash, bank, card, or other money accounts used in accounting records.

List columns:

- Name
- Type
- Currency
- Opening balance
- Active
- Actions

Form fields:

- Name
- Type
- Currency
- Opening balance
- Notes
- Active

### Expense Categories

Purpose:

- Manage reusable categories for expense reporting.

List columns:

- Name
- Code
- Description
- Active
- Actions

Form fields:

- Name
- Code
- Description
- Active

## Frontend Entity Design

### AccountingAccountView

Fields:

- `id`
- `name`
- `type`: `cash`, `bank`, `card`, `other`
- `currency`
- `openingBalance`
- `active`
- `notes`
- `createdAt`

### ExpenseCategoryView

Fields:

- `id`
- `name`
- `code`
- `description`
- `active`
- `createdAt`

### ExpenseRow

Fields:

- `id`
- `reference`
- `categoryId`
- `categoryName`
- `supplierId`
- `supplierName`
- `accountId`
- `accountName`
- `expenseDate`
- `amount`
- `status`: `draft`, `approved`, `void`
- `paymentStatus`: `unpaid`, `paid`
- `paymentMethod`: `cash`, `bank_transfer`, `card`, `other`
- `notes`
- `attachmentUrl`
- `createdAt`

### ExpenseFormState

Fields:

- `categoryId`
- `supplierId`
- `accountId`
- `expenseDate`
- `amount`
- `status`
- `paymentStatus`
- `paymentMethod`
- `notes`
- `attachmentUrl`

### CustomerPaymentRow

Fields:

- `id`
- `reference`
- `customerId`
- `customerName`
- `invoiceId`
- `invoiceReference`
- `accountId`
- `accountName`
- `paymentDate`
- `amount`
- `method`
- `externalReference`
- `notes`
- `createdAt`

### CustomerPaymentFormState

Fields:

- `customerId`
- `invoiceId`
- `accountId`
- `paymentDate`
- `amount`
- `method`
- `externalReference`
- `notes`

### SupplierPaymentRow

Fields:

- `id`
- `reference`
- `supplierId`
- `supplierName`
- `purchaseInvoiceId`
- `purchaseInvoiceReference`
- `accountId`
- `accountName`
- `paymentDate`
- `amount`
- `method`
- `externalReference`
- `notes`
- `createdAt`

### SupplierPaymentFormState

Fields:

- `supplierId`
- `purchaseInvoiceId`
- `accountId`
- `paymentDate`
- `amount`
- `method`
- `externalReference`
- `notes`

### Balance Rows

Customer balance row:

- `customerId`
- `customerName`
- `totalInvoiced`
- `totalPaid`
- `balanceDue`
- `overdueAmount`
- `lastPaymentDate`

Supplier balance row:

- `supplierId`
- `supplierName`
- `totalBilled`
- `totalPaid`
- `balanceDue`
- `overdueAmount`
- `lastPaymentDate`

Account balance row:

- `accountId`
- `accountName`
- `accountType`
- `openingBalance`
- `incomingTotal`
- `outgoingTotal`
- `expenseTotal`
- `currentBalance`

### AccountingSummaryView

Fields:

- `cashAndBankBalance`
- `monthlyExpenses`
- `unpaidCustomerInvoices`
- `unpaidSupplierInvoices`
- `overdueReceivables`
- `overduePayables`

## API Client Expectations

The frontend should use generated API client hooks after the OpenAPI contract is updated. Expected hook groups:

- Accounting accounts list, create, and update.
- Expense categories list, create, and update.
- Expenses list, create, update, and void.
- Customer payments list and create.
- Supplier payments list and create.
- Accounting balances query.
- Accounting summary query.

## Acceptance Criteria Traceability

- Accounting scope is defined in the "Frontend Accounting Scope", "Planned Routes", and "Page Design" sections.
- Basic accounting entities are designed in the "Frontend Entity Design" section.
