# Kovex ERP - Restructuring and Cleanup Sprint Tasks

These tasks professionalize the Kovex ERP project structure incrementally. Each
task should be implemented in a focused branch and reviewed against
`PROJECT_RULES.md`.

## TASK-RC-001 - Add ESLint and Formatting Governance

Status: Ready
Priority: P0 Critical
Sprint: Cleanup
Labels: tooling, cleanup, frontend, backend
Checkbox: [ ]

Goal: Add ESLint configuration and standardize formatting rules across the
monorepo.

Reason: The project currently has TypeScript and Prettier dependencies, but no
visible ESLint configuration.

Scope:

- Add root ESLint config.
- Add package-specific overrides for frontend, backend, generated code, and
  config files.
- Add lint scripts to root and relevant packages.
- Add or document Prettier config.
- Ignore generated files and build output where appropriate.

Acceptance Criteria:

- `pnpm run lint` exists.
- `pnpm run lint` can be run from the root.
- Rules cover TypeScript, React, hooks, accessibility, and import hygiene.
- Generated files and `dist` folders are excluded.

Quality Checks:

```bash
pnpm run lint
pnpm run typecheck
```

## TASK-RC-002 - Define Clean Folder Ownership

Status: Ready
Priority: P0 Critical
Sprint: Cleanup
Labels: architecture, cleanup, documentation
Checkbox: [ ]

Goal: Document and enforce where each kind of code belongs.

Reason: The project has clear packages but needs stricter ownership rules to
prevent logic from drifting into the wrong folders.

Scope:

- Define ownership for frontend pages/components/hooks/lib.
- Define ownership for backend routes/lib/domain helpers.
- Define ownership for database schema.
- Define ownership for API contract and generated output.
- Update documentation if the agreed structure changes.

Acceptance Criteria:

- Folder responsibility is documented.
- New work has an obvious destination.
- No package depends on code it should not own.

Quality Checks:

```bash
pnpm run typecheck
pnpm run build
```

## TASK-RC-003 - Frontend Shared Code Audit

Status: Ready
Priority: P1 High
Sprint: Cleanup
Labels: frontend, cleanup, architecture
Checkbox: [ ]

Goal: Identify duplicated frontend components, hooks, utilities, and page
patterns.

Reason: Reusability is critical. Shared UI and logic should be centralized
before more features are added.

Scope:

- Audit `packages/front/src/pages`.
- Audit `packages/front/src/components`.
- Audit `packages/front/src/lib`.
- Audit `packages/front/src/hooks`.
- Identify repeated table, form, filter, export, loading, empty, and error
  patterns.

Acceptance Criteria:

- Duplicate patterns are listed.
- Reusable candidates are prioritized.
- Follow-up implementation tasks are created.

Quality Checks:

```bash
pnpm run typecheck
```

## TASK-RC-004 - Introduce Frontend Loader and Async Patterns

Status: Future
Priority: P1 High
Sprint: Cleanup
Labels: frontend, architecture
Checkbox: [ ]

Goal: Create or standardize reusable async loading patterns for pages and
components.

Reason: Repeated loading/error/data-fetching logic increases inconsistency and
makes rendering harder to maintain.

Scope:

- Review existing API/query usage.
- Decide whether to introduce `useLoader`, `useLoaderMiddleware`, and/or
  `CAsyncLoader`, or equivalent project-native names.
- Apply the pattern to one or two representative pages first.
- Document when to use the pattern.

Acceptance Criteria:

- A reusable async pattern exists or the existing pattern is documented.
- Representative pages use the pattern.
- Follow-up pages are listed for migration.

Quality Checks:

```bash
pnpm run typecheck
pnpm run build
```

## TASK-RC-005 - API Contract Hygiene

Status: Ready
Priority: P1 High
Sprint: Cleanup
Labels: api, cleanup, documentation
Checkbox: [ ]

Goal: Ensure OpenAPI contract, generated client, and validation output are
maintained as a single contract pipeline.

Reason: Manual drift between backend routes, validation types, and frontend API
usage creates runtime bugs.

Scope:

- Review `packages/api-contract/openapi.yaml`.
- Review Orval output configuration.
- Confirm generated folders are documented and excluded from manual edits.
- Add checks or docs for regenerating API output.

Acceptance Criteria:

- API generation flow is documented.
- Generated output is reproducible.
- Manual generated-code edits are removed or justified.

Quality Checks:

```bash
pnpm run api:schema
pnpm run typecheck
```

## TASK-RC-006 - Backend Route and Domain Logic Cleanup

Status: Future
Priority: P1 High
Sprint: Cleanup
Labels: backend, architecture, cleanup
Checkbox: [ ]

Goal: Separate backend routing concerns from business/domain logic.

Reason: Route files should stay focused and readable. Business rules should be
reusable and testable.

Scope:

- Audit `packages/back/src/routes`.
- Identify repeated route validation and response patterns.
- Move reusable backend helpers into `packages/back/src/lib` or a documented
  domain structure.
- Keep database code in `packages/database` where possible.

Acceptance Criteria:

- Repeated backend route logic is identified.
- At least one repeated pattern is extracted safely.
- Route files become easier to scan.

Quality Checks:

```bash
pnpm run typecheck
pnpm run build
```

## TASK-RC-007 - Database Schema Organization Review

Status: Future
Priority: P1 High
Sprint: Cleanup
Labels: database, architecture, cleanup
Checkbox: [ ]

Goal: Review database schema organization, naming, relations, indexes, and
migration workflow.

Reason: A professional ERP needs clear database ownership and predictable schema
maintenance.

Scope:

- Audit `packages/database/src/schema`.
- Check table naming consistency.
- Check primary keys, relations, indexes, nullable fields, and domain grouping.
- Document migration/push workflow.

Acceptance Criteria:

- Schema organization findings are documented.
- Unsafe or unclear schema areas have follow-up tasks.
- Database workflow is clear to future contributors.

Quality Checks:

```bash
pnpm run db:push
pnpm run typecheck
```

## TASK-RC-008 - Documentation Cleanup and Deduplication

Status: Ready
Priority: P2 Medium
Sprint: Cleanup
Labels: documentation, cleanup
Checkbox: [ ]

Goal: Clean duplicated, outdated, misspelled, or unclear documentation.

Reason: Documentation should help contributors understand the project quickly.
Duplicate or outdated files make the project look less professional.

Scope:

- Review all files under `docs`.
- Identify duplicates and outdated files.
- Fix obvious naming issues, such as misspelled filenames.
- Keep reports, diagrams, setup docs, and project management docs clearly
  separated.

Acceptance Criteria:

- Documentation inventory is created.
- Duplicate/outdated docs are removed, renamed, or archived.
- README links remain valid.

Quality Checks:

```bash
pnpm run typecheck
```

## TASK-RC-009 - Remove Build Output and Unnecessary Files from Source Control

Status: Ready
Priority: P0 Critical
Sprint: Cleanup
Labels: cleanup, tooling
Checkbox: [ ]

Goal: Ensure generated build output, dependencies, local stores, and temporary
files are not tracked.

Reason: Professional repositories should not commit `dist`, `node_modules`,
local package stores, logs, or temporary files.

Scope:

- Review `.gitignore`.
- Check package `dist` folders.
- Check `node_modules` folders.
- Check local pnpm store folders.
- Check temporary files and generated artifacts.

Acceptance Criteria:

- Ignore rules are complete.
- Unnecessary tracked artifacts are identified.
- Cleanup is split into safe commits.

Quality Checks:

```bash
git status --short
pnpm run typecheck
```

## TASK-RC-010 - Add Testing Strategy

Status: Future
Priority: P1 High
Sprint: Cleanup
Labels: testing, architecture
Checkbox: [ ]

Goal: Define and introduce a testing strategy for frontend, backend, database,
and API contract behavior.

Reason: Restructuring without tests increases regression risk.

Scope:

- Decide test tools for frontend and backend.
- Add minimal test scripts.
- Start with high-value tests for reusable utilities and critical flows.
- Document when to add tests.

Acceptance Criteria:

- Root test command exists or planned exceptions are documented.
- First representative tests exist.
- Testing expectations are documented.

Quality Checks:

```bash
pnpm run test
pnpm run typecheck
```

## TASK-RC-011 - Add CI Quality Workflow

Status: Future
Priority: P1 High
Sprint: Cleanup
Labels: tooling, deployment, testing
Checkbox: [ ]

Goal: Add automated checks for install, lint, typecheck, build, code
generation, and tests when available.

Reason: Project rules need automation to stay reliable.

Scope:

- Add CI workflow after lint/test commands exist.
- Validate pnpm version and Node version.
- Cache pnpm dependencies safely.
- Run quality gates in the correct order.

Acceptance Criteria:

- CI runs on pull requests.
- CI fails on lint/type/build/test regressions.
- Workflow is documented.

Quality Checks:

```bash
pnpm run lint
pnpm run typecheck
pnpm run build
pnpm run test
```

## TASK-RC-012 - Future Module Restructure Evaluation

Status: Future
Priority: P2 Medium
Sprint: Cleanup
Labels: architecture, frontend, backend
Checkbox: [ ]

Goal: Evaluate whether frontend and backend should move from flat page/route
organization to domain modules.

Reason: A domain-module structure may help Kovex ERP as it grows, but the move
should be deliberate and incremental.

Scope:

- Compare current flat structure with a module-based structure.
- Identify domains: dashboard, sales, purchases, inventory, planning, reports,
  settings, auth.
- Pilot one domain only if the benefit is clear.
- Document import and routing effects.

Acceptance Criteria:

- A recommendation exists: keep flat structure, adopt modules, or hybrid.
- Migration risk is documented.
- Pilot task is created if approved.

Quality Checks:

```bash
pnpm run typecheck
pnpm run build
```

