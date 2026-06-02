# Kovex ERP - GitHub Releases

This file defines the planned GitHub Releases for Kovex ERP. Each release can be copied into GitHub Releases with its tag, title, description, and checklist.

## Release Order

1. `v1.0.0-beta` - Beta Release
2. `v1.0.0` - First Stable Release
3. `v1.1.0` - Improved Stable Release
4. `v1.1.0-final` - Final Graduation Version

---

## v1.0.0-beta - Beta Release

Tag:
`v1.0.0-beta`

Release type:
Pre-release

Title:
Kovex ERP v1.0.0 Beta Release

Description:
This beta release introduces the first complete working version of Kovex ERP, a smart business management system for SMEs. It includes the main frontend layout, backend API, PostgreSQL database integration, Swagger API documentation, generated API client/validation files, and the core ERP modules.

Included features:
- Kovex ERP branding and layout.
- Frontend application under `packages/front`.
- Backend API under `packages/back`.
- PostgreSQL database schema with Drizzle ORM.
- Swagger UI API documentation.
- Customers, suppliers, products, warehouses, users, sales, purchases, inventory, reports, projects, and tasks modules.
- Real backend mode with PostgreSQL.
- Global header with search, notifications, information, login/logout icon, and language dropdown.
- English and Turkish language support.

Known limitations:
- Authentication is not fully implemented yet.
- Login/logout icon is UI-only at this stage.
- Deployment is not finalized.

Release checklist:
- [ ] `npm run typecheck` passes.
- [ ] `npm run dev` starts frontend and backend.
- [ ] Swagger UI opens at `http://localhost:5000/api-docs/`.
- [ ] Core pages load without API errors.
- [ ] GitHub release is marked as pre-release.

---

## v1.0.0 - First Stable Release

Tag:
`v1.0.0`

Release type:
Stable release

Title:
Kovex ERP v1.0.0

Description:
This release is the first stable version of Kovex ERP. It confirms that the system can run as a real ERP application using the React frontend, Express backend, PostgreSQL database, OpenAPI contract, generated API client, and generated backend validation.

Included features:
- Stable monorepo structure.
- Real PostgreSQL backend connection.
- Completed Sprint 1 real-system verification.
- Completed Sprint 2 core ERP CRUD and business-flow verification.
- Customers CRUD.
- Suppliers CRUD.
- Products CRUD.
- Warehouses CRUD.
- Quotations and conversion to orders.
- Orders and conversion to invoices.
- Invoices status management.
- Purchase orders and purchase receiving.
- Purchase invoices.
- Stock increase after purchase receiving.
- Stock decrease after paid sales invoice.
- Projects and tasks with user assignment.
- Reports and dashboard data.

Verification evidence:
- Sprint 1 test results: `docs/sprint-1-real-api-test-results.txt`
- Sprint 2 test results: `docs/sprint-2-real-api-test-results.txt`

Release checklist:
- [ ] `npm run typecheck` passes.
- [ ] Sprint 1 verification is complete.
- [ ] Sprint 2 verification is complete.
- [ ] Database tables are visible in DataGrip.
- [ ] API docs are accessible.
- [ ] GitHub release is not marked as pre-release.

---

## v1.1.0 - Improved Stable Release

Tag:
`v1.1.0`

Release type:
Stable release

Title:
Kovex ERP v1.1.0

Description:
This release improves the stable Kovex ERP version with UI polish, clearer project structure, better release documentation, and stronger presentation readiness for the graduation project.

Planned improvements:
- Cleaner UI components and separated layout components.
- Global header improvements.
- Improved language dropdown with flags.
- Better design consistency with Kovex ERP colors and fonts.
- Improved documentation for project presentation.
- More complete release notes and GitHub project organization.
- Additional testing where needed.

Release checklist:
- [ ] UI layout is clear and responsive.
- [ ] Language dropdown works in the global header.
- [ ] Sidebar and header components are separated into clean files.
- [ ] Search, notifications, information, and login/logout icons appear in the global header.
- [ ] Documentation is updated.
- [ ] `npm run typecheck` passes.

---

## v1.1.0-final - Final Version

Tag:
`v1.1.0-final`

Release type:
Final release

Title:
Kovex ERP Final Version

Description:
This final version is intended for the graduation project submission and committee presentation. It represents the completed official version of Kovex ERP, including project documentation, real backend integration, database access, API documentation, core ERP workflows, and presentation-ready UI.

Final version requirements:
- The application runs with `npm run dev`.
- Frontend opens correctly on `http://localhost:8081/`.
- Backend opens correctly on `http://localhost:5000/`.
- API documentation opens at `http://localhost:5000/api-docs/`.
- PostgreSQL database is accessible in DataGrip.
- Core ERP modules are complete enough for demonstration.
- Project documentation explains the architecture, database, API, and business flows.
- GitHub project tasks are updated.
- Release notes are complete.

Final release checklist:
- [ ] All required sprint tasks are updated.
- [ ] `npm run typecheck` passes.
- [ ] `npm run dev` works.
- [ ] Demo data exists for dashboard, reports, and workflows.
- [ ] README is updated.
- [ ] Project summary status is updated.
- [ ] Flowchart documentation is updated.
- [ ] GitHub release is published as the final version.

---

## GitHub Release Commands

Use these commands after committing all project changes.

```bash
git tag v1.0.0-beta
git push origin v1.0.0-beta

git tag v1.0.0
git push origin v1.0.0

git tag v1.1.0
git push origin v1.1.0

git tag v1.1.0-final
git push origin v1.1.0-final
```

After pushing each tag:

1. Open the GitHub repository.
2. Go to Releases.
3. Click Draft a new release.
4. Select the tag.
5. Copy the matching release title and description from this file.
6. Mark `v1.0.0-beta` as a pre-release.
7. Publish the release.
