# Kovex ERP Project Rules

This file is the required rules reference before creating, modifying, deleting,
or restructuring anything in Kovex ERP.

Project cleanup and restructuring tasks belong in:

```text
docs/github-project-sprint-tasks/
```

Review this file before writing code or opening a cleanup task.

## 1. Non-Negotiable Workflow

Before any code change:

1. Understand the task and the affected package.
2. Review this rules file.
3. Check the existing project structure for reusable code.
4. Check existing components, utilities, hooks, and package helpers before
   creating anything new.
5. Plan the implementation and decide where the change belongs.
6. Keep the change scoped to the task.
7. Run the relevant quality checks before delivery.

If a change needs project restructuring, create or update a sprint task in
`docs/github-project-sprint-tasks/` before implementation.

## 2. Role and Mindset

- Act as a senior frontend/backend TypeScript developer at all times.
- Prioritize clean architecture, scalability, maintainability, and readability.
- Avoid quick hacks that create hidden future work.
- Prefer boring, understandable code over clever code.
- Follow the existing project structure unless a documented restructuring task
  says otherwise.

## 3. Current Project Shape

Kovex ERP is a pnpm TypeScript monorepo.

```text
kovex-erp/
  packages/
    front/            React + Vite frontend
    back/             Express API
    database/         Drizzle schema and database access
    api-contract/     OpenAPI source contract and Orval config
    api-client/       Generated/client API helpers
    api-validation/   Generated validation/types
  docs/               project documentation, diagrams, reports, sprint tasks
  scripts/            local development scripts
```

Root-level important files:

- `README.md`: project overview, setup, commands, documentation links.
- `package.json`: workspace scripts and quality commands.
- `pnpm-workspace.yaml`: workspace packages, dependency catalog, pnpm security
  settings.
- `task.json`: local run metadata for project services.
- `tsconfig.json` and `tsconfig.base.json`: TypeScript configuration.
- `docker/`: Docker and Docker Compose development setup.
- `PROJECT_RULES.md`: required project rules reference.

## 4. Code Standards

- Strictly follow ESLint rules once ESLint is added. No exceptions.
- TypeScript errors are not acceptable in delivered code.
- Write clean, readable, well-structured code.
- Use clear and consistent naming conventions.
- Avoid unnecessary comments. Add comments only for complex logic, business
  rules, or non-obvious constraints.
- Do not duplicate logic that already exists.
- Keep generated files generated. Do not manually edit generated API or
  validation output.
- Use structured APIs and typed helpers instead of ad hoc string manipulation.

## 5. Reusability First

Before creating any new component, utility, hook, type, or abstraction:

1. Check existing shared frontend code:
   - `packages/front/src/components`
   - `packages/front/src/components/ui`
   - `packages/front/src/lib`
   - `packages/front/src/hooks`
2. Check package-level shared code:
   - `packages/api-client`
   - `packages/api-validation`
   - `packages/database`
3. Reuse existing:
   - Components
   - Utilities
   - Hooks
   - API client helpers
   - Form validation helpers
   - Layout primitives

Do not duplicate logic that already exists. Duplicate code is technical debt and
must be removed during cleanup tasks.

## 6. Hooks and Abstractions

- Always check for an existing hook before writing manual state or async logic.
- Current known hooks include:
  - `useToast`
  - `useIsMobile`
  - generated API/query hooks from API client output, where applicable
- If loader hooks such as `useLoader`, `useLoaderMiddleware`, or
  `CAsyncLoader` are introduced in future restructuring, prefer them over
  repeated manual loading/error boilerplate.
- Use `useMemo` only for expensive computations or stable derived values that
  materially reduce work.
- Use `useCallback` when stable function identity matters, such as memoized
  children, effect dependencies, or reusable handlers.
- Do not add abstractions unless they remove real duplication or clarify a
  repeated pattern.

## 7. Performance and Rendering

- Be mindful of unnecessary re-renders.
- Keep components small, focused, and easy to reason about.
- Memoize only where needed.
- Avoid expensive computations during render.
- Keep list rendering stable with meaningful keys.
- Avoid passing new object/function literals into deeply memoized children when
  it causes avoidable updates.
- Prefer server/API filtering and pagination for large datasets.

## 8. Architecture and Structure

- Maintain separation of concerns.
- Keep UI, data fetching, validation, business logic, and persistence separate.
- Frontend pages should compose workflows, not hold unrelated domain logic.
- Backend routes should validate requests and delegate business logic to focused
  functions.
- Database schema belongs in `packages/database`.
- API contracts belong in `packages/api-contract/openapi.yaml`.
- Generated API and validation outputs must come from the OpenAPI contract.
- Do not invent a new folder pattern without documenting it in a sprint task and
  updating this rules file after approval.

## 9. Frontend Rules

Naming rules:

- App-owned React components and pages must start with `C`.
- Page filenames must start with `C`.
- App-owned interfaces and type aliases must start with `I`.
- Hooks must start with `use`.
- Shared shadcn/Radix-style UI primitives in
  `packages/front/src/components/ui` keep their original primitive names.
- Generated code names must not be manually renamed.

UI/UX and accessibility:

- Build with good UX practices.
- Use semantic HTML where possible.
- Provide proper labels for form controls.
- Support keyboard navigation for interactive UI.
- Preserve focus visibility.
- Use accessible names for icon-only buttons.
- Keep loading, empty, and error states clear and consistent.
- Do not rely on color alone to communicate status.

Frontend structure rules:

- Reusable application components belong in `packages/front/src/components`.
- Low-level UI primitives belong in `packages/front/src/components/ui`.
- Reusable hooks belong in `packages/front/src/hooks`.
- Shared frontend utilities belong in `packages/front/src/lib`.
- Route/page components belong in `packages/front/src/pages`.
- Assets belong under `packages/front/public/assets` unless they need to be
  imported directly by Vite.

## 10. Backend Rules

- Keep route files focused on routing, request validation, response handling,
  and calling domain logic.
- Keep reusable backend helpers in `packages/back/src/lib`.
- Keep validation reusable and consistent through `packages/back/src/routes`
  validation helpers and generated validation types.
- Use typed request/response contracts from the OpenAPI/validation layer where
  available.
- Keep database definitions and schema changes in `packages/database`.
- Do not mix persistence logic into frontend or API-client packages.
- Do not expose sensitive environment values to logs or frontend code.

## 11. API Contract and Generated Code

- `packages/api-contract/openapi.yaml` is the source of truth for API contracts.
- After changing the OpenAPI contract, run:

```bash
pnpm run api:schema
```

- Do not manually edit generated files in:
  - `packages/api-client/src/generated`
  - `packages/api-validation/src/generated`
- Generated output should be reviewed for correctness, but fixes should happen
  at the source contract or generator config.

## 12. Quality Gates

Before delivery:

- Run TypeScript checks:

```bash
pnpm run typecheck
```

- Run the build when the change affects runtime behavior:

```bash
pnpm run build
```

- After ESLint is added, run the lint command before every delivery.
- After tests are added, run the relevant unit/integration tests.
- No duplicated logic.
- No avoidable TypeScript `any`.
- No unrelated refactors.
- No manual edits to generated files.

## 13. Git, Branching, and Commit Rules

Branching:

- Use short, descriptive branch names.
- Recommended branch prefixes:
  - `feature/`
  - `fix/`
  - `refactor/`
  - `chore/`
  - `docs/`
  - `test/`
- Keep branches focused on one topic.
- Do not mix cleanup, feature work, and bug fixes in one branch unless the task
  explicitly requires it.

Conventional commits:

- Follow Conventional Commits.
- Recommended types:
  - `feat`
  - `fix`
  - `refactor`
  - `chore`
  - `docs`
  - `test`
  - `build`
  - `ci`
- Format:

```text
type(scope): summary
```

Examples:

```text
chore(front): add eslint configuration
refactor(front): move shared table logic into reusable hook
docs(project): add restructuring task reference
```

## 14. Documentation Rules

- Update docs when project behavior, setup, structure, or commands change.
- Keep `README.md` high-level and onboarding-focused.
- Put deeper process, architecture, and task documentation in `docs/`.
- Keep GitHub Project tasks in `docs/github-project-sprint-tasks/`.
- Keep this file for rules only.
- Keep task descriptions actionable, scoped, and reviewable.

## 15. Restructuring Task Rules

Every restructuring task must include:

- Goal
- Reason
- Scope
- Files/folders likely affected
- Rules to follow
- Acceptance criteria
- Quality checks

Tasks should be implemented in small pull requests/branches. Do not restructure
the whole project at once.

## 16. Delivery Checklist

Before finishing any implementation:

- Reviewed this file.
- Planned before writing code.
- Followed project structure.
- Checked existing code for reuse.
- Used existing hooks/components/utilities where possible.
- Kept logic, UI, and data handling separated.
- Followed naming conventions.
- Followed clean code and readability rules.
- Considered accessibility.
- Considered UI/UX.
- Considered performance and rendering.
- Avoided duplicated logic.
- Updated documentation if needed.
- Ran relevant quality checks.
- Used Conventional Commits if committing.
