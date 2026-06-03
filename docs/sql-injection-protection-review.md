# SQL Injection Protection Review

## Summary

Database access is routed through Drizzle ORM/query builder APIs. User input is passed as values to query-builder predicates such as `eq`, `ilike`, `gte`, `lte`, `and`, and insert/update value objects.

No unsafe string-concatenated SQL was found in backend or database source files.

## Raw SQL Review

Raw `sql` template usage remains only for static aggregate expressions, static literals, or column-to-column comparisons in dashboard queries, for example `count(*)::int`, `sum(...)`, and stock low-water checks.

Reviewed rule:

- Safe: `sql` templates with static SQL fragments or Drizzle column references.
- Safe: `sql` templates with `${value}` placeholders because Drizzle parameterizes them.
- Avoided: direct string concatenation, interpolated SQL fragments, table/column names from request input, or `db.execute` with request-controlled SQL.

Recent hardening:

- Purchase receiving stock lookup now uses `and(eq(...), eq(...))` instead of a raw SQL predicate.
- Report date filters now use `gte` and `lte` query-builder predicates instead of raw SQL predicates.

## User Input Paths Reviewed

- Route params such as `:id` are converted to numbers and passed to `eq(table.id, id)`.
- Search fields use generated query validation and Drizzle `ilike(column, pattern)`.
- Create/update bodies are inserted through Drizzle `.values(...)` and `.set(...)`.
- Auth login email lookup uses `eq(usersTable.email, email)`.
- Report date filters use Drizzle comparison helpers.

## Malicious Input Test Cases

Run these against a seeded dev database or mock API equivalent. Expected result: no SQL error, no extra records returned/deleted/updated, and either a normal empty/single response or a validation error.

1. Search injection string

   Endpoint: `GET /api/customers?search=%27%20OR%201%3D1%20--`

   Expected: request succeeds as a literal search string; it must not return all customers unless a customer literally matches that text.

2. Numeric route injection string

   Endpoint: `GET /api/customers/1%20OR%201%3D1`

   Expected: validation/not-found behavior; it must not treat the input as SQL.

3. Login email injection

   Body:

   ```json
   {
     "email": "admin@example.com' OR '1'='1",
     "password": "anything"
   }
   ```

   Expected: `401 Invalid email or password`.

4. Create/update text payload injection

   Body field example:

   ```json
   {
     "name": "Robert'); DROP TABLE customers; --",
     "email": "robert@example.com"
   }
   ```

   Expected: value is stored or validated as plain text; no table is dropped.

5. Report date injection

   Endpoint: `GET /api/reports/sales?from=2026-01-01%27%3B%20DROP%20TABLE%20orders%3B%20--`

   Expected: invalid date handling or empty result; no SQL command execution.

6. Warehouse receive ID injection

   Body:

   ```json
   {
     "warehouseId": "1 OR 1=1"
   }
   ```

   Expected: numeric conversion/validation behavior; it must not update all warehouses or stock rows.

## Follow-Up Recommendation

Add integration tests that run the malicious payloads above against a disposable Postgres database and assert table counts before/after. The current review confirms query-builder use and documents the cases; automated DB-backed assertions would make this regression-proof.
