# New Developer Setup Guide

Use this guide when a new developer needs to fork, clone, and run Kovex ERP on their laptop.

This guide is written for Windows first because many setup errors happen when Linux-style commands are copied into PowerShell or Command Prompt.

## Windows Quick Start

After cloning the project, run these commands from PowerShell in the project root:

```powershell
corepack enable
corepack prepare pnpm@11.3.0 --activate
pnpm install
pnpm run dev:front
```

Open:

```text
http://localhost:8081/
```

This starts the frontend with the mock API. You do not need PostgreSQL or the backend for this mode.

## 1. Install Required Tools

Install these tools before cloning the project:

- Git
- Node.js 24 or newer
- pnpm
- Docker Desktop, optional but useful for a quick mock frontend run
- PostgreSQL, only if you need to run the real backend/database

Recommended Windows terminal:

- PowerShell
- Windows Terminal with PowerShell
- Git Bash also works for Git commands, but the examples below use PowerShell

Check versions:

```powershell
git --version
node --version
pnpm --version
```

If pnpm is not installed, enable it with Corepack:

```powershell
corepack enable
corepack prepare pnpm@11.3.0 --activate
```

Close and reopen the terminal after installing Node.js or enabling Corepack.

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

```powershell
git clone https://github.com/YOUR_GITHUB_USERNAME/kovex-erp.git
cd kovex-erp
```

Add the original repository as `upstream` so you can pull future changes from the main project:

```powershell
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

```powershell
pnpm install
```

Do not use `npm install` or `yarn install` in this repository. The project uses pnpm workspaces.

If you cloned the project before the Windows setup fix was added, pull the latest changes first:

```powershell
git pull upstream main
pnpm install
```

## 5. Run The Frontend With Mock API

This is the fastest setup for frontend work. It does not require PostgreSQL or the backend.

Use this command on Windows, Linux, or macOS:

```powershell
pnpm run dev:front
```

Open the app:

```text
http://localhost:8081/
```

If port `8081` is already used:

Windows PowerShell:

```powershell
$env:PORT="8082"
pnpm run dev:front
```

Linux/macOS:

```bash
PORT=8082 BASE_PATH=/ pnpm --filter @sme-erp/front run dev
```

Then open:

```text
http://localhost:8082/
```

If PowerShell still has the old port value later, clear it:

```powershell
Remove-Item Env:PORT
```

## 6. Run The Mock Frontend With Docker

Use Docker if you want a quick setup on Windows without installing all project tools directly.

Install Docker Desktop, open it, wait until Docker is running, then run this from the project root:

```powershell
pnpm run dev:docker
```

Open:

```text
http://localhost:8081/
```

This Docker service runs the frontend with the mock API only. It does not start PostgreSQL or the real backend.

Stop Docker when finished:

1. Press `Ctrl+C` in the terminal running Docker.
2. Then run:

```powershell
pnpm run docker:down
```

If port `8081` is already used, change the left side of the port mapping in
`docker/compose.dev.yml`:

```yaml
ports:
  - "8082:8081"
```

Then open:

```text
http://localhost:8082/
```

## 7. Run With Real Backend And Database

Use this mode when you need to test the real API and PostgreSQL database.

Create a PostgreSQL database, for example:

```text
sme_erp
```

Set the database connection string.

Windows PowerShell:

```powershell
$env:DATABASE_URL="postgres://postgres:postgres@localhost:5432/sme_erp"
```

Linux/macOS:

```bash
export DATABASE_URL=postgres://postgres:postgres@localhost:5432/sme_erp
```

Push the database schema:

```powershell
pnpm run db:push
```

Start the backend API:

```powershell
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

In another terminal, start the frontend in real API mode.

Windows PowerShell:

```powershell
$env:MOCK_API="false"
pnpm run dev:front
```

Linux/macOS:

```bash
MOCK_API=false PORT=8081 BASE_PATH=/ pnpm --filter @sme-erp/front run dev
```

Open:

```text
http://localhost:8081/
```

If the backend is not running on port `5000`, set `API_URL`.

Windows PowerShell:

```powershell
$env:MOCK_API="false"
$env:API_URL="http://localhost:5001"
pnpm run dev:front
```

Linux/macOS:

```bash
MOCK_API=false API_URL=http://localhost:5001 PORT=8081 BASE_PATH=/ pnpm --filter @sme-erp/front run dev
```

## 8. Common Development Commands

Run type checks:

```powershell
pnpm run typecheck
```

Build the project:

```powershell
pnpm run build
```

Generate API client and validation code after changing the OpenAPI contract:

```powershell
pnpm run api:schema
```

Push database schema changes:

```powershell
pnpm run db:push
```

## 9. Daily Git Workflow

Before starting new work, update your local main branch:

```powershell
git checkout main
git fetch upstream
git pull upstream main
git push origin main
```

Create a feature branch:

```powershell
git checkout -b feature/short-task-name
```

Check your changes:

```powershell
git status
```

Commit your work:

```powershell
git add .
git commit -m "Describe the change"
```

Push your branch to your fork:

```powershell
git push origin feature/short-task-name
```

Open a pull request from your fork branch to the original repository.

## 10. Troubleshooting

If `pnpm install` fails and says to use pnpm, make sure you are not running `npm install`.

If `pnpm run dev:front` fails on Windows, pull the latest project changes and run `pnpm install` again. The root `dev:front` script is designed to work on Windows, Linux, and macOS.

```powershell
git pull upstream main
pnpm install
pnpm run dev:front
```

If Windows says `pnpm` is not recognized, enable Corepack and reopen the terminal:

```powershell
corepack enable
corepack prepare pnpm@11.3.0 --activate
```

If PowerShell blocks commands because of execution policy, run PowerShell as the current user and allow local scripts:

```powershell
Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
```

If the frontend shows `ERR_CONNECTION_REFUSED`, either run mock mode:

```powershell
pnpm run dev:front
```

or start the backend and run the frontend with:

```powershell
$env:MOCK_API="false"
pnpm run dev:front
```

If the backend fails with `DATABASE_URL must be set`, export the database URL:

```powershell
$env:DATABASE_URL="postgres://postgres:postgres@localhost:5432/sme_erp"
```

Linux/macOS:

```bash
export DATABASE_URL=postgres://postgres:postgres@localhost:5432/sme_erp
```

If `git remote add upstream` says the remote already exists, update it:

```powershell
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
