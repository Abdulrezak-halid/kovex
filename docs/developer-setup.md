# New Developer Setup Guide

Use this guide when a new developer needs to fork, clone, and run Kovex ERP on their laptop.

## 1. Install Required Tools

Install these tools before cloning the project:

- Git
- Node.js 24 or newer
- pnpm
- PostgreSQL, only if you need to run the real backend/database

Check versions:

```bash
git --version
node --version
pnpm --version
```

If pnpm is not installed, enable it with Corepack:

```bash
corepack enable
corepack prepare pnpm@11.3.0 --activate
```

## 2. Fork The Repository

1. Open the Kovex ERP repository on GitHub.
2. Click **Fork**.
3. Create the fork under your own GitHub account.
4. Copy the URL of your fork.

Example fork URL:

```text
https://github.com/YOUR_GITHUB_USERNAME/kovex-erp.git
```

## 3. Clone Your Fork

Clone the fork to your laptop:

```bash
git clone https://github.com/YOUR_GITHUB_USERNAME/kovex-erp.git
cd kovex-erp
```

Add the original repository as `upstream` so you can pull future changes from the main project:

```bash
git remote add upstream https://github.com/ORIGINAL_OWNER/kovex-erp.git
git remote -v
```

You should see:

```text
origin    https://github.com/YOUR_GITHUB_USERNAME/kovex-erp.git
upstream  https://github.com/ORIGINAL_OWNER/kovex-erp.git
```

## 4. Install Dependencies

Install all workspace dependencies from the project root:

```bash
pnpm install
```

Do not use `npm install` or `yarn install` in this repository. The project uses pnpm workspaces.

## 5. Run The Frontend With Mock API

This is the fastest setup for frontend work. It does not require PostgreSQL or the backend.

```bash
pnpm run dev:front
```

Open the app:

```text
http://localhost:8081/
```

If port `8081` is already used:

Linux/macOS:

```bash
PORT=8082 BASE_PATH=/ pnpm --filter @sme-erp/front run dev
```

Windows PowerShell:

```powershell
$env:PORT="8082"
$env:BASE_PATH="/"
pnpm run dev:front
```

Then open:

```text
http://localhost:8082/
```

## 6. Run The Mock Frontend With Docker

Use Docker if you want a quick setup on a laptop without installing all project tools directly.

Install Docker Desktop, then run:

```bash
docker compose up --build front-mock
```

Open:

```text
http://localhost:8081/
```

This Docker service runs the frontend with the mock API only. It does not start PostgreSQL or the real backend.

## 7. Run With Real Backend And Database

Use this mode when you need to test the real API and PostgreSQL database.

Create a PostgreSQL database, for example:

```text
sme_erp
```

Set the database connection string:

```bash
export DATABASE_URL=postgres://postgres:postgres@localhost:5432/sme_erp
```

Push the database schema:

```bash
pnpm run db:push
```

Start the backend API:

```bash
pnpm run dev:back
```

The backend runs on:

```text
http://localhost:5000/
```

The API documentation is available at:

```text
http://localhost:5000/api-docs/
```

In another terminal, start the frontend in real API mode:

```bash
MOCK_API=false PORT=8081 BASE_PATH=/ pnpm --filter @sme-erp/front run dev
```

Open:

```text
http://localhost:8081/
```

If the backend is not running on port `5000`, set `API_URL`:

```bash
MOCK_API=false API_URL=http://localhost:5001 PORT=8081 BASE_PATH=/ pnpm --filter @sme-erp/front run dev
```

## 8. Common Development Commands

Run type checks:

```bash
pnpm run typecheck
```

Build the project:

```bash
pnpm run build
```

Generate API client and validation code after changing the OpenAPI contract:

```bash
pnpm run api:schema
```

Push database schema changes:

```bash
pnpm run db:push
```

## 9. Daily Git Workflow

Before starting new work, update your local main branch:

```bash
git checkout main
git fetch upstream
git pull upstream main
git push origin main
```

Create a feature branch:

```bash
git checkout -b feature/short-task-name
```

Check your changes:

```bash
git status
```

Commit your work:

```bash
git add .
git commit -m "Describe the change"
```

Push your branch to your fork:

```bash
git push origin feature/short-task-name
```

Open a pull request from your fork branch to the original repository.

## 10. Troubleshooting

If `pnpm install` fails and says to use pnpm, make sure you are not running `npm install`.

If `pnpm run dev:front` fails on Windows, pull the latest project changes and run `pnpm install` again. The root `dev:front` script is designed to work on Windows, Linux, and macOS.

If the frontend shows `ERR_CONNECTION_REFUSED`, either run mock mode:

```bash
pnpm run dev:front
```

or start the backend and run the frontend with:

```bash
MOCK_API=false PORT=8081 BASE_PATH=/ pnpm --filter @sme-erp/front run dev
```

If the backend fails with `DATABASE_URL must be set`, export the database URL:

```bash
export DATABASE_URL=postgres://postgres:postgres@localhost:5432/sme_erp
```

If `git remote add upstream` says the remote already exists, update it:

```bash
git remote set-url upstream https://github.com/ORIGINAL_OWNER/kovex-erp.git
```

## 11. Project Structure

Main folders:

- `packages/front` - React and Vite frontend
- `packages/back` - Express backend API
- `packages/database` - Drizzle and PostgreSQL schema
- `packages/api-contract` - OpenAPI contract
- `packages/api-client` - generated frontend API client
- `packages/api-validation` - generated backend validation schemas and types
- `docs` - project documentation

Local files and generated folders should not be committed:

- `node_modules`
- `dist`
- local environment files
