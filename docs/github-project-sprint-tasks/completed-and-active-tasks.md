# Kovex ERP - GitHub Project Sprint Tasks

## Purpose

This file is the planning source for GitHub Project tasks. Each item can be copied into GitHub Issues or GitHub Project cards. When a task is finished, update its checkbox from [ ] to [x], move its status to Completed, and add a short completion note.

Status values:
Completed
Ready
In Progress
Blocked
Future

Priority values:
P0 Critical
P1 High
P2 Medium
P3 Low

Recommended GitHub labels:
frontend
backend
database
api
documentation
testing
security
deployment
graduation
future

Completed Tasks

TASK-001 - Define project name and concept
Status: Completed
Priority: P0 Critical
Sprint: Completed
Labels: documentation, graduation
Checkbox: [x]
Goal: Define the project as Kovex ERP, a simplified ERP for small and medium businesses.
Acceptance Criteria:

- Project name is clear.
- Project idea is documented.
- Target users are identified as SMEs.
  Completion Note: Present in project summary and documentation.

TASK-002 - Select technology stack
Status: Completed
Priority: P0 Critical
Sprint: Completed
Labels: documentation
Checkbox: [x]
Goal: Select the main tools for frontend, backend, database, API contract, and package management.
Acceptance Criteria:

- React, Vite, TypeScript, Tailwind CSS, React Query are selected for frontend.
- Node.js, Express, TypeScript are selected for backend.
- PostgreSQL and Drizzle ORM are selected for database.
- OpenAPI and Orval are selected for API contract/code generation.
- pnpm workspace is selected for monorepo management.

TASK-003 - Create monorepo package structure
Status: Completed
Priority: P0 Critical
Sprint: Completed
Labels: architecture
Checkbox: [x]
Goal: Organize the project into packages.
Acceptance Criteria:

- packages/front exists.
- packages/back exists.
- packages/database exists.
- packages/api-contract exists.
- packages/api-client exists.
- packages/api-validation exists.
- docs exists.

TASK-004 - Move frontend and backend from apps to packages
Status: Completed
Priority: P0 Critical
Sprint: Completed
Labels: frontend, backend, architecture
Checkbox: [x]
Goal: Use packages/front and packages/back as the main app folders.
Acceptance Criteria:

- Frontend code is under packages/front.
- Backend code is under packages/back.
- Workspace configuration points to packages.
- Root scripts use the new package names.

TASK-005 - Install dependencies and verify local frontend
Status: Completed
Priority: P0 Critical
Sprint: Completed
Labels: frontend
Checkbox: [x]
Goal: Make sure the frontend runs locally.
Acceptance Criteria:

- Dependencies are installed.
- Frontend runs on http://localhost:8081/.
- Mock API mode works.

TASK-006 - Add npm run dev for frontend and backend
Status: Completed
Priority: P0 Critical
Sprint: Completed
Labels: frontend, backend
Checkbox: [x]
Goal: Start frontend and backend together with npm run dev.
Acceptance Criteria:

- npm run dev starts the frontend.
- npm run dev starts the backend.
- Frontend runs on port 8081.
- Backend runs on port 5000.

TASK-007 - Add Swagger UI for API documentation
Status: Completed
Priority: P1 High
Sprint: Completed
Labels: api, backend, documentation
Checkbox: [x]
Goal: Expose API documentation through Swagger UI.
Acceptance Criteria:

- Swagger UI opens at http://localhost:5000/api-docs/.
- OpenAPI YAML is served at http://localhost:5000/api/openapi.yaml.
- Swagger static assets load correctly.

TASK-008 - Create local PostgreSQL database and push schema
Status: Completed
Priority: P0 Critical
Sprint: Completed
Labels: database, backend
Checkbox: [x]
Goal: Create sme_erp database and apply Drizzle schema.
Acceptance Criteria:

- PostgreSQL container is running.
- sme_erp database exists.
- Drizzle schema is pushed.
- 17 public tables exist.

TASK-009 - Create database and API access guide
Status: Completed
Priority: P1 High
Sprint: Completed
Labels: database, api, documentation
Checkbox: [x]
Goal: Document how to access PostgreSQL and Swagger UI.
Acceptance Criteria:

- DataGrip connection settings are documented.
- JDBC URL is documented.
- API URLs are documented.
- Table list is documented.

TASK-010 - Add dashboard line graph
Status: Completed
Priority: P2 Medium
Sprint: Completed
Labels: frontend
Checkbox: [x]
Goal: Add a line graph to the dashboard.
Acceptance Criteria:

- Dashboard shows sales revenue trend.
- Mock API provides trend data.
- TypeScript typecheck passes.

TASK-011 - Fix planning mock endpoints
Status: Completed
Priority: P1 High
Sprint: Completed
Labels: frontend, api
Checkbox: [x]
Goal: Make projects and tasks work in mock mode.
Acceptance Criteria:

- GET /api/projects works.
- POST /api/projects works.
- GET /api/tasks works.
- GET /api/projects/:id/tasks works.
- POST /api/projects/:id/tasks works.
- Project task counts update in mock mode.

TASK-012 - Add API Docs sidebar button
Status: Completed
Priority: P2 Medium
Sprint: Completed
Labels: frontend, api
Checkbox: [x]
Goal: Add a sidebar button that opens Swagger UI.
Acceptance Criteria:

- API Docs button appears below Business Operations.
- Button opens http://localhost:5000/api-docs/ in a new tab.

TASK-013 - Establish frontend naming convention
Status: Completed
Priority: P2 Medium
Sprint: Completed
Labels: frontend, architecture
Checkbox: [x]
Goal: Rename app-owned frontend pages/components to start with C and local interfaces/types to start with I.
Acceptance Criteria:

- App-owned page filenames start with C.
- App-owned component filenames start with C.
- App-owned component functions start with C.
- Local app-owned interfaces/types start with I.
- Hooks keep use prefix.
- UI primitives and generated types are documented exceptions.

---

Sprint 1 - Convert From Mock Demo To Real System

TASK-014 - Verify real backend startup with PostgreSQL
Status: Completed
Priority: P0 Critical
Sprint: Sprint 1
Labels: backend, database
Checkbox: [x]
Goal: Confirm the backend works with the real PostgreSQL database.
Acceptance Criteria:

- DATABASE_URL is configured.
- npm run dev:back starts without errors.
- /api/healthz returns status ok.
- Backend logs do not show database connection failures.
  Completion Note: Verified with DATABASE_URL=postgres://postgres:postgres@localhost:5432/sme_erp, backend on port 5000, and /api/healthz returning {"status":"ok"}.

TASK-015 - Run frontend in real API mode
Status: Completed
Priority: P0 Critical
Sprint: Sprint 1
Labels: frontend, backend, api
Checkbox: [x]
Goal: Connect frontend to the real backend instead of mock API.
Acceptance Criteria:

- Frontend starts with MOCK_API=false.
- Frontend calls backend on port 5000.
- Main pages load without mock endpoint errors.
- API network errors are resolved.
  Completion Note: Verified frontend real API mode with MOCK_API=false on http://localhost:8081/ and backend proxy calls reaching http://localhost:5000/api.

TASK-016 - Test all API endpoints with real data
Status: Completed
Priority: P0 Critical
Sprint: Sprint 1
Labels: api, backend, testing
Checkbox: [x]
Goal: Verify every OpenAPI endpoint against PostgreSQL.
Acceptance Criteria:

- Health endpoint tested.
- Customers endpoints tested.
- Suppliers endpoints tested.
- Products endpoints tested.
- Warehouses endpoints tested.
- Stock endpoints tested.
- Quotations endpoints tested.
- Orders endpoints tested.
- Invoices endpoints tested.
- Purchase orders endpoints tested.
- Purchase invoices endpoints tested.
- Projects/tasks endpoints tested.
- Reports endpoints tested.
- Results are documented in a testing table.
  Completion Note: 70/70 real API endpoint checks passed. Results are documented in docs/sprint-1-real-api-test-results.txt.

TASK-017 - Regenerate API client and validation files
Status: Completed
Priority: P1 High
Sprint: Sprint 1
Labels: api
Checkbox: [x]
Goal: Ensure OpenAPI, frontend client, and backend validation are synchronized.
Acceptance Criteria:

- npm run api:schema completes successfully.
- packages/api-client generated code is updated.
- packages/api-validation generated code is updated.
- npm run typecheck passes after regeneration.
  Completion Note: npm run api:schema completed successfully and npm run typecheck passed after regeneration.

TASK-018 - Review OpenAPI coverage
Status: Completed
Priority: P1 High
Sprint: Sprint 1
Labels: api, documentation
Checkbox: [x]
Goal: Confirm the OpenAPI contract covers all implemented endpoints.
Acceptance Criteria:

- Every backend route has an OpenAPI path.
- Request bodies are documented.
- Response schemas are documented.
- Error responses are documented where important.
  Completion Note: OpenAPI coverage was reviewed against backend routes and documented in docs/sprint-1-openapi-coverage-review.txt.

Sprint 2 - Core ERP CRUD And Business Flows

TASK-019 - Complete and test Customers CRUD with real backend
Status: Completed
Priority: P0 Critical
Sprint: Sprint 2
Labels: frontend, backend, database
Checkbox: [x]
Goal: Make customers fully usable with PostgreSQL.
Acceptance Criteria:

- Create customer works.
- List customers works.
- Update customer works.
- Delete customer works.
- Validation errors show clear messages.
  Completion Note: Verified in Sprint 2 real API sweep. See docs/sprint-2-real-api-test-results.txt.

TASK-020 - Complete and test Suppliers CRUD with real backend
Status: Completed
Priority: P0 Critical
Sprint: Sprint 2
Labels: frontend, backend, database
Checkbox: [x]
Goal: Make suppliers fully usable with PostgreSQL.
Acceptance Criteria:

- Create supplier works.
- List suppliers works.
- Update supplier works.
- Delete supplier works.
- Validation errors show clear messages.
  Completion Note: Verified in Sprint 2 real API sweep. See docs/sprint-2-real-api-test-results.txt.

TASK-021 - Complete and test Products CRUD with real backend
Status: Completed
Priority: P0 Critical
Sprint: Sprint 2
Labels: frontend, backend, database
Checkbox: [x]
Goal: Make products fully usable with PostgreSQL.
Acceptance Criteria:

- Create product works.
- List products works.
- Update product works.
- Delete product works.
- Price/cost/minimum stock fields persist correctly.
  Completion Note: Verified in Sprint 2 real API sweep. See docs/sprint-2-real-api-test-results.txt.

TASK-022 - Complete and test Warehouses CRUD with real backend
Status: Completed
Priority: P1 High
Sprint: Sprint 2
Labels: frontend, backend, database
Checkbox: [x]
Goal: Make warehouses fully usable with PostgreSQL.
Acceptance Criteria:

- Create warehouse works.
- List warehouses works.
- Update warehouse works.
- Delete warehouse works.
  Completion Note: Verified in Sprint 2 real API sweep. See docs/sprint-2-real-api-test-results.txt.

TASK-023 - Complete and test Quotations CRUD
Status: Completed
Priority: P0 Critical
Sprint: Sprint 2
Labels: sales, frontend, backend
Checkbox: [x]
Goal: Make quotations fully usable.
Acceptance Criteria:

- Create quotation with items works.
- List quotations works.
- Update quotation works.
- Delete quotation works.
- Quotation totals calculate correctly.
  Completion Note: Verified in Sprint 2 real API sweep. See docs/sprint-2-real-api-test-results.txt.

TASK-024 - Implement Convert Quotation to Order
Status: Completed
Priority: P0 Critical
Sprint: Sprint 2
Labels: sales, backend, frontend
Checkbox: [x]
Goal: Convert accepted quotations into sales orders.
Acceptance Criteria:

- Convert button exists.
- Backend creates an order from quotation data.
- Quotation status updates correctly.
- New order appears in Orders page.
  Completion Note: Verified quotation conversion creates an order and marks quotation accepted.

TASK-025 - Complete and test Orders CRUD
Status: Completed
Priority: P0 Critical
Sprint: Sprint 2
Labels: sales, frontend, backend
Checkbox: [x]
Goal: Make sales orders fully usable.
Acceptance Criteria:

- Create order works.
- List orders works.
- Update order status works.
- Delete order works where allowed.
- Order totals persist correctly.
  Completion Note: Verified in Sprint 2 real API sweep. See docs/sprint-2-real-api-test-results.txt.

TASK-026 - Implement Convert Order to Invoice
Status: Completed
Priority: P0 Critical
Sprint: Sprint 2
Labels: sales, backend, frontend
Checkbox: [x]
Goal: Convert sales orders into invoices.
Acceptance Criteria:

- Convert button exists.
- Backend creates invoice from order data.
- Invoice appears in Invoices page.
- Order/invoice status updates correctly.
  Completion Note: Verified order conversion creates an invoice and updates order status to delivered.

TASK-027 - Complete and test Invoices CRUD
Status: Completed
Priority: P0 Critical
Sprint: Sprint 2
Labels: sales, frontend, backend
Checkbox: [x]
Goal: Make invoices fully usable.
Acceptance Criteria:

- Create invoice works.
- List invoices works.
- Update invoice status works.
- Delete invoice works where allowed.
- Invoice totals persist correctly.
  Completion Note: Verified create/list/update flows and invoice totals. Delete is not exposed for invoices.

TASK-028 - Complete Purchase Orders CRUD
Status: Completed
Priority: P0 Critical
Sprint: Sprint 2
Labels: purchases, frontend, backend
Checkbox: [x]
Goal: Make purchase orders fully usable.
Acceptance Criteria:

- Create purchase order works.
- List purchase orders works.
- Update purchase order works.
- Delete purchase order works where allowed.
- Purchase order totals calculate correctly.
  Completion Note: Verified purchase order CRUD and totals in Sprint 2 real API sweep.

TASK-029 - Complete Purchase Invoices CRUD
Status: Completed
Priority: P0 Critical
Sprint: Sprint 2
Labels: purchases, frontend, backend
Checkbox: [x]
Goal: Make purchase invoices fully usable.
Acceptance Criteria:

- Create purchase invoice works.
- List purchase invoices works.
- Update purchase invoice status works.
- Delete purchase invoice works where allowed.
  Completion Note: Verified create/list/update flow. Delete is not exposed for purchase invoices.

TASK-030 - Implement stock decrease after sale
Status: Completed
Priority: P0 Critical
Sprint: Sprint 2
Labels: inventory, sales, backend, database
Checkbox: [x]
Goal: Reduce stock when a sale/invoice is completed.
Acceptance Criteria:

- Sales transaction reduces correct product stock.
- Stock cannot become invalid without clear rule.
- Stock page reflects updated quantity.
- Inventory report updates.
  Completion Note: Stock now decreases when an invoice is marked paid and does not decrease twice for already paid invoices.

TASK-031 - Implement stock increase after purchase
Status: Completed
Priority: P0 Critical
Sprint: Sprint 2
Labels: inventory, purchases, backend, database
Checkbox: [x]
Goal: Increase stock when purchased goods are received.
Acceptance Criteria:

- Purchase transaction increases correct product stock.
- Stock page reflects updated quantity.
- Low stock alerts update.
- Inventory report updates.
  Completion Note: Purchase receiving increases product stock in the selected warehouse.

TASK-032 - Complete Planning projects/tasks with real backend
Status: Completed
Priority: P1 High
Sprint: Sprint 2
Labels: planning, frontend, backend
Checkbox: [x]
Goal: Make projects, tasks, and progress tracking work with PostgreSQL.
Acceptance Criteria:

- Projects CRUD works.
- Tasks CRUD works.
- Tasks link to projects.
- Project task count and completed count update.
- Task filters work.
  Completion Note: Verified projects, tasks, counts, completed counts, and filters against PostgreSQL.

TASK-033 - Link tasks to real users
Status: Completed
Priority: P2 Medium
Sprint: Sprint 2
Labels: planning, users
Checkbox: [x]
Goal: Assign tasks to users stored in the database.
Acceptance Criteria:

- Assignee selector uses real users.
- Task stores assigned user.
- Task list shows assignee name.
  Completion Note: Verified task assignment stores real user id and returns assigneeName.

Sprint 3 - Authentication, Authorization, And Security

TASK-034 - Implement user login
Status: Completed
Priority: P0 Critical
Sprint: Sprint 3
Labels: security, backend, frontend
Checkbox: [x]
Goal: Add login capability.
Acceptance Criteria:

- Login page exists.
- Backend verifies credentials.
- Invalid login shows safe error message.
- Successful login stores session/token safely.
  Completion Note: Login page, backend credential verification, safe invalid-login feedback, and session cookie handling are implemented.

TASK-035 - Implement user logout
Status: Completed
Priority: P1 High
Sprint: Sprint 3
Labels: security, frontend, backend
Checkbox: [x]
Goal: Allow authenticated users to log out.
Acceptance Criteria:

- Logout button exists.
- Session/token is cleared.
- User is redirected to login.
  Completion Note: Logout flow clears the session and returns the user to the unauthenticated state.

TASK-036 - Implement admin user creation or registration
Status: Completed
Priority: P1 High
Sprint: Sprint 3
Labels: security, users
Checkbox: [x]
Goal: Allow admin to create system users or support controlled registration.
Acceptance Criteria:

- Admin can create user.
- Required user fields are validated.
- User appears in Users page.
  Completion Note: Admin user management is available with validated user creation and Users page integration.

TASK-037 - Add password hashing
Status: Completed
Priority: P0 Critical
Sprint: Sprint 3
Labels: security, backend, database
Checkbox: [x]
Goal: Never store passwords in plain text.
Acceptance Criteria:

- Passwords are hashed before saving.
- Login compares password using secure hash verification.
- Existing plain-text password storage is removed.
  Completion Note: Passwords are hashed before storage and login verifies against stored hashes.

TASK-038 - Implement JWT or session authentication
Status: Completed
Priority: P0 Critical
Sprint: Sprint 3
Labels: security, backend
Checkbox: [x]
Goal: Protect API requests using a session or token strategy.
Acceptance Criteria:

- Auth middleware exists.
- Protected endpoints reject unauthenticated requests.
- Token/session expiry is handled.
  Completion Note: Session authentication middleware protects API access and handles authenticated user context.

TASK-039 - Implement roles and permissions
Status: Completed
Priority: P0 Critical
Sprint: Sprint 3
Labels: security, backend, frontend
Checkbox: [x]
Goal: Support Admin and User roles at minimum.
Acceptance Criteria:

- Admin role can manage users and data.
- User role has limited access.
- Backend enforces permissions.
- Frontend hides unavailable actions.
  Completion Note: Admin/user role checks are enforced by backend routes and reflected in frontend controls.

TASK-040 - Add protected frontend routes
Status: Completed
Priority: P1 High
Sprint: Sprint 3
Labels: security, frontend
Checkbox: [x]
Goal: Prevent unauthenticated users from opening application pages.
Acceptance Criteria:

- Unauthenticated users redirect to login.
- Authenticated users can access allowed pages.
- Unauthorized role access is blocked.
  Completion Note: Frontend auth state gates application pages and blocks unauthorized access.

TASK-041 - Strengthen input validation
Status: Completed
Priority: P1 High
Sprint: Sprint 3
Labels: security, api, backend
Checkbox: [x]
Goal: Validate all user input consistently.
Acceptance Criteria:

- Request bodies are validated with generated schemas.
- Invalid data returns useful API errors.
- Frontend displays validation messages.
  Completion Note: Generated validation schemas and safe validation error responses are integrated across key API routes.

TASK-042 - Verify SQL injection protection
Status: Completed
Priority: P1 High
Sprint: Sprint 3
Labels: security, database
Checkbox: [x]
Goal: Confirm database access is protected from SQL injection.
Acceptance Criteria:

- ORM/query builder is used for user input.
- No unsafe raw SQL accepts direct input.
- Test cases for malicious input are documented.
  Completion Note: SQL injection review is documented and confirms user input flows through Drizzle query builder patterns.

TASK-043 - Add XSS and CSRF protection review
Status: Completed
Priority: P2 Medium
Sprint: Sprint 3
Labels: security
Checkbox: [x]
Goal: Review browser-side and request security.
Acceptance Criteria:

- XSS risk points are reviewed.
- CSRF approach is documented if using cookies/sessions.
- Unsafe HTML rendering is avoided.
  Completion Note: Browser security review is documented, covering XSS risks, cookie session considerations, and unsafe rendering checks.

Sprint 4 - Reports, Dashboard, UX, And Performance

TASK-044 - Make dashboard summary use real database data
Status: Completed
Priority: P0 Critical
Sprint: Sprint 4
Labels: reports, dashboard, backend
Checkbox: [x]
Goal: Dashboard should reflect real business data.
Acceptance Criteria:

- Sales summary uses database.
- Inventory alerts use database.
- General counters use database.
- Dashboard updates after transactions.
  Completion Note: Dashboard summary now calculates sales, orders, counters, pending items, and product-level low-stock alerts from live database tables.

TASK-045 - Implement real sales report
Status: Completed
Priority: P0 Critical
Sprint: Sprint 4
Labels: reports, sales, backend
Checkbox: [x]
Goal: Sales report should be calculated from real orders/invoices.
Acceptance Criteria:

- Total revenue is correct.
- Total orders is correct.
- Date range filter works.
- Top customers are calculated correctly.
- Chart displays real rows.
  Completion Note: Sales report now calculates invoice-aware revenue, order counts, date-filtered trend rows, and top customers from database sales records.

TASK-046 - Implement real purchase report
Status: Completed
Priority: P0 Critical
Sprint: Sprint 4
Labels: reports, purchases, backend
Checkbox: [x]
Goal: Purchase report should be calculated from real purchase orders/invoices.
Acceptance Criteria:

- Total purchases is correct.
- Supplier totals are correct.
- Date range filter works.
- Chart displays real rows.
  Completion Note: Purchase report now calculates invoice-aware spend, purchase order counts, supplier totals, and date-filtered chart rows from database purchase records.

TASK-047 - Implement real inventory report
Status: Completed
Priority: P0 Critical
Sprint: Sprint 4
Labels: reports, inventory, backend
Checkbox: [x]
Goal: Inventory report should use real stock/product data.
Acceptance Criteria:

- Total product count is correct.
- Total stock value is correct.
- Low stock count is correct.
- Rows show product, stock, minimum stock, and value.
  Completion Note: Inventory report now uses database products and stock totals, cost-based valuation, low-stock counts, and product-level stock rows.

TASK-048 - Add advanced report filters
Status: Completed
Priority: P2 Medium
Sprint: Sprint 4
Labels: reports, frontend, backend
Checkbox: [x]
Goal: Add useful report filters.
Acceptance Criteria:

- Filter by date exists.
- Filter by customer exists where relevant.
- Filter by supplier exists where relevant.
- Filter by product exists where relevant.
  Completion Note: Report filters now include date ranges for sales and purchases, customer filtering for sales, supplier filtering for purchases, and product filtering for inventory, with exports using the active filters.

TASK-049 - Verify responsive design
Status: In Progress
Priority: P1 High
Sprint: Sprint 4
Labels: frontend, testing
Checkbox: [x]
Goal: Confirm the app works on desktop, tablet, and mobile.
Acceptance Criteria:

- Dashboard is usable on mobile.
- Sales pages are usable on mobile.
- Inventory pages are usable on mobile.
- Planning pages are usable on mobile.
- Tables do not break layout.

TASK-050 - Improve UI error and empty states
Status: In Progress
Priority: P1 High
Sprint: Sprint 4
Labels: frontend, ux
Checkbox: [x]
Goal: Display professional messages for loading, errors, and empty data.
Acceptance Criteria:

- Loading states exist.
- Empty states explain next action.
- API errors show safe user-friendly messages.
- No raw technical errors are shown to users.

TASK-051 - Add pagination/search/sorting where needed
Status: Completed
Priority: P2 Medium
Sprint: Sprint 4
Labels: frontend, backend, performance
Checkbox: [x]
Goal: Improve data-table usability and performance.
Acceptance Criteria:

- Large lists support pagination or reasonable limits.
- Search exists on important list pages.
- Sorting exists where useful.
- Backend supports query parameters as needed.
  Completion Note: Important list pages now use backend query params for search, sort direction, sort field, and capped result limits, with shared frontend controls across master data and sales/purchase document lists.

TASK-052 - Optimize performance
Status: In Progress
Priority: P2 Medium
Sprint: Sprint 4
Labels: performance
Checkbox: [ ]
Goal: Improve loading and data performance.
Acceptance Criteria:

- Unnecessary data fetching is reduced.
- Images are compressed.
- Large records are paginated.
- Slow queries are identified.

Sprint 5 - Testing, Error Handling, Logging, And Quality

TASK-053 - Add backend error handling standard
Status: Ready
Priority: P1 High
Sprint: Sprint 5
Labels: backend, quality
Checkbox: [x]
Goal: Handle backend errors professionally.
Acceptance Criteria:

- Central error handler exists.
- Validation errors are consistent.
- Unexpected errors return safe messages.
- Technical details are logged, not exposed.

TASK-054 - Add logging for important backend events
Status: Ready
Priority: P1 High
Sprint: Sprint 5
Labels: backend, logging
Checkbox: [x]
Goal: Track important system events and errors.
Acceptance Criteria:

- Request logging works.
- Error logging works.
- Important business operations are logged where needed.

TASK-055 - Add unit tests
Status: Ready
Priority: P1 High
Sprint: Sprint 5
Labels: testing
Checkbox: [ ]
Goal: Test important isolated logic.
Acceptance Criteria:

- Test framework is selected.
- At least core utility/business functions have tests.
- Tests run with one command.

TASK-056 - Add integration tests
Status: Ready
Priority: P1 High
Sprint: Sprint 5
Labels: testing, backend, database
Checkbox: [ ]
Goal: Test API/database behavior.
Acceptance Criteria:

- API endpoints can be tested automatically.
- Test database strategy is documented.
- CRUD flows have integration tests.

TASK-057 - Add API testing collection
Status: Ready
Priority: P2 Medium
Sprint: Sprint 5
Labels: testing, api
Checkbox: [ ]
Goal: Prepare Postman or Thunder Client tests for committee demonstration.
Acceptance Criteria:

- Health test exists.
- Auth tests exist after auth implementation.
- CRUD endpoint tests exist.
- Reports endpoint tests exist.

TASK-058 - Verify production build
Status: Completed
Priority: P1 High
Sprint: Sprint 5
Labels: build, testing
Checkbox: [x]
Goal: Confirm production build works.
Acceptance Criteria:

- npm run build passes.
- Frontend build succeeds.
- Backend build succeeds.
  Completion Note: Build was verified successfully.

TASK-059 - Create manual testing table for report
Status: Done
Priority: P1 High
Sprint: Sprint 5
Labels: testing, graduation
Checkbox: [x]
Goal: Document manual test cases for the final report.
Acceptance Criteria:

- Table includes test name.
- Table includes input.
- Table includes expected result.
- Table includes actual result.
- Table includes status.
  Completion Note: Manual test cases were documented in docs/final-report-manual-test-cases.md.

Sprint 6 - Documentation And Graduation Material

TASK-060 - Strengthen academic problem statement
Status: Completed
Priority: P0 Critical
Sprint: Sprint 6
Labels: documentation, graduation
Checkbox: [x]
Goal: Explain the real business problem in academic language.
Acceptance Criteria:

- Problem is specific.
- Importance is explained.
- Users/beneficiaries are explained.
- Current alternatives are discussed.

TASK-061 - Clarify project added value
Status: Completed
Priority: P0 Critical
Sprint: Sprint 6
Labels: documentation, graduation
Checkbox: [x]
Goal: Explain why this ERP project is valuable compared with scattered tools or generic systems.
Acceptance Criteria:

- Practical value is stated.
- Academic value is stated.
- Difference from existing solutions is stated.
  Completion Note: Project added value was documented in Turkish and English under docs/reports/.

TASK-062 - Write requirements analysis
Status: Completed
Priority: P0 Critical
Sprint: Sprint 6
Labels: documentation, graduation
Checkbox: [x]
Goal: Document functional and non-functional requirements.
Acceptance Criteria:

- Functional requirements are listed.
- Non-functional requirements are listed.
- Requirements are linked to implemented modules.
  Completion Note: Requirements analysis was documented in Turkish and English under docs/reports/.

TASK-063 - Write feasibility study
Status: Completed
Priority: P1 High
Sprint: Sprint 6
Labels: documentation, graduation
Checkbox: [x]
Goal: Explain project feasibility.
Acceptance Criteria:

- Technical feasibility is documented.
- Economic feasibility is documented.
- Time feasibility is documented.
- Practical feasibility is documented.
  Completion Note: Feasibility study was documented in Turkish and English under docs/reports/.

TASK-064 - Write comparison with existing systems
Status: Completed
Priority: P1 High
Sprint: Sprint 6
Labels: documentation, graduation
Checkbox: [x]
Goal: Compare Kovex ERP to similar ERP or business management systems.
Acceptance Criteria:

- At least two existing solutions are described.
- Strengths/weaknesses are compared.
- Project unique value is explained.
  Completion Note: Existing system comparison was documented in Turkish and English under docs/reports/.

TASK-065 - Create ERD database diagram
Status: Ready
Priority: P0 Critical
Sprint: Sprint 6
Labels: database, documentation, graduation
Checkbox: [x]
Goal: Document database tables and relationships.
Acceptance Criteria:

- Main tables are shown.
- Primary keys are shown.
- Foreign keys are shown.
- Relationships are clear.

TASK-066 - Create system architecture diagram
Status: Ready
Priority: P0 Critical
Sprint: Sprint 6
Labels: documentation, architecture
Checkbox: [x]
Goal: Show frontend, backend, API contract, validation, database, and external tools.
Acceptance Criteria:

- Presentation layer is shown.
- API/backend layer is shown.
- Data access layer is shown.
- Database layer is shown.

TASK-067 - Create data flow diagram
Status: Ready
Priority: P1 High
Sprint: Sprint 6
Labels: documentation, graduation
Checkbox: [x]
Goal: Show how data moves through sales, purchases, inventory, and reports.
Acceptance Criteria:

- Sales flow is shown.
- Purchase flow is shown.
- Inventory update flow is shown.
- Reports flow is shown.

TASK-068 - Create use case diagram
Status: Ready
Priority: P1 High
Sprint: Sprint 6
Labels: documentation, graduation
Checkbox: [x]
Goal: Show actors and system use cases.
Acceptance Criteria:

- Admin actor exists.
- User/employee actor exists.
- Main use cases are listed.
- Permissions are reflected.

TASK-069 - Create sequence/activity diagrams
Status: Ready
Priority: P2 Medium
Sprint: Sprint 6
Labels: documentation, graduation
Checkbox: [x]
Goal: Add diagrams for important workflows.
Acceptance Criteria:

- Quotation to order sequence exists.
- Order to invoice sequence exists.
- Purchase to stock sequence exists.
- Login sequence exists after auth.

TASK-070 - Prepare final graduation report
Status: Ready
Priority: P0 Critical
Sprint: Sprint 6
Labels: documentation, graduation
Checkbox: [x]
Goal: Write the final academic report.
Acceptance Criteria:

- Title page exists.
- Abstract exists.
- Introduction exists.
- Problem/objectives/significance exist.
- Requirements analysis exists.
- System design exists.
- Tools and technologies section exists.
- Implementation section exists.
- Database section exists.
- Testing/results section exists.
- Challenges section exists.
- Conclusion/future work exists.
- References and appendix exist.

TASK-071 - Prepare presentation slides
Status: Ready
Priority: P0 Critical
Sprint: Sprint 6
Labels: presentation, graduation
Checkbox: [x]
Goal: Create a concise presentation for the committee.
Acceptance Criteria:

- Problem is explained.
- Objective is explained.
- Solution is explained.
- Technologies are explained.
- Diagrams are included.
- Screenshots are included.
- Database/API are explained.
- Test results are included.
- Future work is included.

TASK-072 - Prepare demo video
Status: Ready
Priority: P1 High
Sprint: Sprint 6
Labels: demo, graduation
Checkbox: [x]
Goal: Record a clear practical demo.
Acceptance Criteria:

- Problem introduction is included.
- Project overview is included.
- Technologies are mentioned.
- Core functions are demonstrated.
- Database/API are demonstrated.
- Conclusion is included.

TASK-073 - Prepare user manual
Status: Ready
Priority: P2 Medium
Sprint: Sprint 6
Labels: documentation
Checkbox: [x]
Goal: Explain how a user operates the system.
Acceptance Criteria:

- Login/use steps are documented.
- Main pages are explained.
- Sales/purchase/inventory workflows are explained.
- Screenshots are included.

TASK-074 - Prepare developer setup guide
Status: Ready
Priority: P2 Medium
Sprint: Sprint 6
Labels: documentation
Checkbox: [x]
Goal: Organize setup instructions for developers.
Acceptance Criteria:

- Install steps are clear.
- Environment variables are clear.
- Database setup is clear.
- Common commands are clear.
- Troubleshooting is included.

Sprint 7 - Deployment And Project Management

TASK-075 - Choose deployment strategy
Status: Completed
Priority: P1 High
Sprint: Sprint 7
Labels: deployment
Checkbox: [x]
Goal: Decide where and how to deploy the system.
Acceptance Criteria:

- Frontend hosting option selected.
- Backend hosting option selected.
- Database hosting option selected.
- Environment variable strategy selected.

Completion Note: Selected first deployment strategy in
`docs/deployment-strategy.md`: built Vite frontend served by the Render web
service, Express backend hosted as a Render Web Service, Supabase managed
PostgreSQL, and production secrets stored in platform environment variables.

TASK-076 - Add Docker workflow
Status: Completed
Priority: P2 Medium
Sprint: Sprint 7
Labels: deployment, docker
Checkbox: [x]
Goal: Make local deployment easier with Docker.
Acceptance Criteria:

- Dockerfile or compose workflow exists.
- PostgreSQL service is documented.
- App can be started predictably.

Completion Note: Added `docker/Dockerfile.prod`, expanded
`docker/compose.dev.yml` with a PostgreSQL service, and documented Docker usage
through the deployment runbook and existing developer setup.

TASK-077 - Configure production environment variables
Status: Completed
Priority: P1 High
Sprint: Sprint 7
Labels: deployment, security
Checkbox: [x]
Goal: Prepare safe production configuration.
Acceptance Criteria:

- Required env vars are documented.
- Sensitive values are not committed.
- Example env file exists if appropriate.

Completion Note: Added `.env.production.example` and
`docs/deployment-environment.md`. Production secrets are documented for Render
and Supabase dashboards, not committed values.

TASK-078 - Deploy frontend
Status: In Progress
Priority: P2 Medium
Sprint: Sprint 7
Labels: deployment, frontend
Checkbox: [x]
Goal: Deploy frontend to a public or demo-accessible environment.
Acceptance Criteria:

- Frontend deployment URL exists.
- Build works in deployment environment.
- API URL is configured.

Progress Note: Added same-origin production static serving in the Express app,
`docker/Dockerfile.prod`, `render.yaml`, and `docs/deployment-runbook.md`.
Completion still requires a real Render deployment URL.

TASK-079 - Deploy backend
Status: In Progress
Priority: P2 Medium
Sprint: Sprint 7
Labels: deployment, backend
Checkbox: [x]
Goal: Deploy backend API to a public or demo-accessible environment.
Acceptance Criteria:

- Backend deployment URL exists.
- Health endpoint works.
- Swagger UI works.

Progress Note: Added Render Blueprint configuration in `render.yaml`,
production Docker startup, and deployment verification steps in
`docs/deployment-runbook.md`. Completion still requires a real Render backend
URL and successful `/api/healthz` plus `/api-docs/` checks.

TASK-080 - Prepare PostgreSQL cloud database
Status: In Progress
Priority: P2 Medium
Sprint: Sprint 7
Labels: deployment, database
Checkbox: [x]
Goal: Prepare cloud database for deployed demo.
Acceptance Criteria:

- Cloud database exists.
- Schema is pushed.
- Backend connects successfully.

Progress Note: Added Supabase setup guidance in `docs/cloud-postgresql.md` and
documented `DATABASE_URL` handling. Completion still requires creating the
Supabase project and pushing schema to the real database.

TASK-081 - Add CI/CD pipeline
Status: Completed
Priority: P3 Low
Sprint: Sprint 7
Labels: deployment, testing
Checkbox: [x]
Goal: Add automated checks on GitHub.
Acceptance Criteria:

- GitHub Action runs typecheck.
- GitHub Action runs build.
- Workflow status is visible in repository.

Completion Note: Added `.github/workflows/ci.yml` with pnpm install,
typecheck, and build checks. Workflow status will appear in GitHub after this
change is pushed.

TASK-082 - Maintain GitHub Project board
Status: Ready
Priority: P0 Critical
Sprint: Every Sprint
Labels: project-management
Checkbox: [x]
Goal: Track work systematically.
Acceptance Criteria:

- Every task is added to GitHub Project.
- Tasks have status.
- Tasks have priority.
- Completed tasks are checked in this file.
- Sprint progress is reviewed weekly.

Optional / Future Work - 16 Suggestions

TASK-083 - Add accounting module
Status: Future
Priority: P3 Low
Sprint: Future
Labels: future, accounting
Checkbox: [ ]
Goal: Add accounting features such as expenses, payments, and balances.
Acceptance Criteria:

- Accounting scope is defined.
- Basic accounting entities are designed.

TASK-084 - Add notification system
Status: Future
Priority: P2 Medium
Sprint: Future
Labels: future, notifications
Checkbox: [ ]
Goal: Notify users about low stock, overdue invoices, and task deadlines.
Acceptance Criteria:

- Notification types are defined.
- UI notification area exists.
- Backend creates notifications from events.

TASK-085 - Add mobile support or mobile app
Status: Future
Priority: P3 Low
Sprint: Future
Labels: future, mobile
Checkbox: [ ]
Goal: Improve mobile usage or create a mobile companion app.
Acceptance Criteria:

- Mobile needs are defined.
- Responsive UI is improved or mobile app plan is documented.

TASK-086 - Add more dashboard charts
Status: Future
Priority: P2 Medium
Sprint: Future
Labels: future, dashboard, reports
Checkbox: [ ]
Goal: Add richer charts for sales, purchases, stock, and planning.
Acceptance Criteria:

- Additional chart types are selected.
- Charts use real data.

TASK-087 - Add advanced reports
Status: Future
Priority: P2 Medium
Sprint: Future
Labels: future, reports
Checkbox: [ ]
Goal: Add deeper reporting and analytics.
Acceptance Criteria:

- Advanced report requirements are documented.
- Reports support useful filters and summaries.

TASK-088 - Add PDF/Excel export
Status: Completed
Priority: P1 High
Sprint: Sprint 4
Labels: reports, export, graduation
Checkbox: [x]
Goal: Export reports and documents.
Acceptance Criteria:

- PDF export works for selected reports.
- Excel export works for selected reports.
  Completion Note: PDF and Excel-compatible export endpoints and report page download controls were added for selected reports.

TASK-089 - Add multi-language support
Status: In Progress
Priority: P2 Medium
Sprint: Sprint 4
Labels: frontend, i18n, graduation
Checkbox: [ ]
Goal: Support multiple languages in the UI.
Acceptance Criteria:

- i18n library/strategy is selected.
- Main navigation and pages are translatable.

TASK-090 - Add audit logs
Status: Future
Priority: P2 Medium
Sprint: Future
Labels: future, security, audit
Checkbox: [ ]
Goal: Track important user actions for accountability.
Acceptance Criteria:

- Audit log table exists.
- Create/update/delete actions are recorded.
- Admin can view audit history.

TASK-091 - Add activity history
Status: Future
Priority: P3 Low
Sprint: Future
Labels: future, ux
Checkbox: [ ]
Goal: Show activity history for records such as customers, projects, and invoices.
Acceptance Criteria:

- Activity events are stored.
- Activity timeline is visible in relevant pages.

TASK-092 - Add barcode/QR code for products
Status: Future
Priority: P3 Low
Sprint: Future
Labels: future, inventory
Checkbox: [ ]
Goal: Support product barcode or QR code generation.
Acceptance Criteria:

- Products can have barcode/QR value.
- QR/barcode can be displayed or printed.

TASK-093 - Add internal chat
Status: Future
Priority: P3 Low
Sprint: Future
Labels: future, collaboration
Checkbox: [ ]
Goal: Add internal communication for ERP users.
Acceptance Criteria:

- Chat scope is defined.
- Basic user-to-user messaging plan exists.

TASK-094 - Add external API integrations
Status: Future
Priority: P3 Low
Sprint: Future
Labels: future, integration
Checkbox: [ ]
Goal: Integrate with external services where useful.
Acceptance Criteria:

- Candidate integrations are listed.
- API keys and security plan are documented.

TASK-095 - Add email or SMS integration
Status: Future
Priority: P3 Low
Sprint: Future
Labels: future, notifications, integration
Checkbox: [ ]
Goal: Send emails or SMS for invoices, alerts, or task deadlines.
Acceptance Criteria:

- Provider is selected.
- Message templates are defined.
- Sensitive credentials are protected.

TASK-096 - Add advanced permissions system
Status: Future
Priority: P2 Medium
Sprint: Future
Labels: future, security
Checkbox: [ ]
Goal: Go beyond Admin/User roles with fine-grained permissions.
Acceptance Criteria:

- Permission model is designed.
- Role-permission mapping exists.
- Backend enforces fine-grained permissions.

TASK-097 - Add AI or recommendation feature
Status: Future
Priority: P3 Low
Sprint: Future
Labels: future, ai
Checkbox: [ ]
Goal: Add a unique intelligent feature.
Acceptance Criteria:

- Use case is defined, such as stock recommendations or sales insights.
- Data requirements are documented.

TASK-098 - Add cloud/multi-tenant version plan
Status: Future
Priority: P3 Low
Sprint: Future
Labels: future, architecture
Checkbox: [ ]
Goal: Show how the ERP can scale to multiple companies.
Acceptance Criteria:

- Multi-tenant model is described.
- Tenant data isolation strategy is documented.

Weekly Update Template

Use this section when updating the GitHub project.

Week:
Sprint:
Completed Tasks:

- TASK-\_\_\_:

In Progress:

- TASK-\_\_\_:

Blocked:

- TASK-\_\_\_:

Next Tasks:

- TASK-\_\_\_:

Notes:

How To Use This File

1. Copy each TASK item into GitHub Issues or GitHub Project cards.
2. Use the Status, Priority, Sprint, and Labels fields as GitHub Project fields.
3. Start with P0 Critical tasks in Sprint 1.
4. When a task is finished, change Checkbox from [ ] to [x].
5. Move the task status to Completed.
6. Add a short Completion Note.
7. Keep optional tasks in Future until the core graduation project is strong.
