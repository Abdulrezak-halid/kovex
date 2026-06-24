<p align="center">
  <img src="packages/front/public/assets/images/logos/project-logo-horizontal.png" alt="Kovex ERP logo" width="360" />
</p>

<p align="center">
  <strong>Smart Business Management for SMEs</strong>
</p>

<p align="center">
  <a href="LICENSE"><img alt="License" src="https://img.shields.io/badge/license-Noncommercial-blue.svg" /></a>
  <img alt="Node.js" src="https://img.shields.io/badge/node-%3E%3D24-339933.svg" />
  <img alt="pnpm" src="https://img.shields.io/badge/pnpm-11.3.0-F69220.svg" />
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-5.9-3178C6.svg" />
  <img alt="PostgreSQL" src="https://img.shields.io/badge/database-PostgreSQL-4169E1.svg" />
</p>

![Kovex ERP cover](packages/front/public/assets/images/screenshots/Kovex-ERP-couver.png)

## Overview

Kovex ERP is a TypeScript monorepo for small and medium-sized businesses. It brings together a React frontend, an Express REST API, generated API client and validation packages, and a PostgreSQL database layer built with Drizzle.

The name combines `KO`, referring to KOBI and SMEs, with `VEX`, giving the product a modern, technical, and scalable identity.

## Features

- Dashboard summaries for sales, purchases, inventory, and low-stock alerts.
- Sales workflows for customers, quotations, orders, and invoices.
- Purchase workflows for suppliers, purchase orders, and purchase invoices.
- Inventory management for products, warehouses, and stock levels.
- Planning pages for projects and tasks.
- Reports with export support for sales, purchases, and inventory.
- Generated API client and validation types from one OpenAPI contract.

## Tech Stack

- **Frontend:** React, Vite, TypeScript
- **Backend:** Node.js, Express, TypeScript
- **Database:** PostgreSQL, Drizzle ORM
- **API contract:** OpenAPI with generated client and validation packages
- **Package manager:** pnpm workspaces

## Architecture

The frontend can run against a local mock API for fast UI development, or against the real Express API backed by PostgreSQL. The OpenAPI contract keeps the frontend client and backend validation types aligned.

![Kovex ERP system architecture](docs/diagrams/Kovex%20ERP%20-%20System%20Architecture.png)

## Data Flow

This diagram shows how user actions move through the frontend, API client, backend routes, validation layer, database package, and PostgreSQL.

![Kovex ERP data flow diagram](docs/diagrams/Kovex%20ERP%20-%20Data%20Flow%20Diagram.png)

## Database Model

The ERD covers the core business entities for customers, suppliers, products, warehouses, stock, sales, purchases, users, projects, and tasks.

![Kovex ERP ERD diagram](docs/diagrams/Kovex%20ERP%20-%20ERD%20Diagram.png)

## Requirements

- Node.js 24 or newer
- pnpm 11.3.0
- Git
- PostgreSQL, only when running the real backend/database

Enable pnpm with Corepack if it is not installed:

```bash
corepack enable
corepack prepare pnpm@11.3.0 --activate
```

## Quick Start

Install dependencies:

```bash
pnpm install
```

Run the frontend with the local mock API:

```bash
pnpm run dev:front
```

Open:

```text
http://localhost:8081/
```

This is the fastest development mode. It does not require PostgreSQL or the backend.

For full onboarding, Windows setup, Docker notes, and real backend/database setup, see the [Developer Setup Guide](docs/developer-setup.md).

## Real Backend Mode

Create a PostgreSQL database, then set `DATABASE_URL`:

```bash
export DATABASE_URL=postgres://user:password@localhost:5432/sme_erp
```

Push the schema and start the backend:

```bash
pnpm run db:push
pnpm run dev:back
```

In another terminal, start the frontend against the real API:

```bash
MOCK_API=false PORT=8081 BASE_PATH=/ pnpm --filter @sme-erp/front run dev
```

The API documentation is available when the backend is running:

```text
http://localhost:5000/api-docs/
```

## Useful Commands

| Command                | Purpose                                       |
| ---------------------- | --------------------------------------------- |
| `pnpm run dev:front`   | Start the frontend with the mock API          |
| `pnpm run dev:back`    | Start the backend API                         |
| `pnpm run dev:docker`  | Start the mock frontend with Docker Compose   |
| `pnpm run docker:down` | Stop the Docker Compose development service   |
| `pnpm run typecheck`   | Run TypeScript checks                         |
| `pnpm run build`       | Typecheck and build workspace packages        |
| `pnpm run api:schema`  | Regenerate API client and validation packages |
| `pnpm run db:push`     | Push the Drizzle schema to PostgreSQL         |

Legacy aliases are still available: `pnpm run dev:web` and `pnpm run dev:api`.

## Documentation

- [Developer Setup Guide](docs/developer-setup.md)
- [Deployment Strategy](docs/deployment-strategy.md)
- [Cloud PostgreSQL Setup](docs/cloud-postgresql.md)
- [System Architecture](docs/diagrams/system-architecture.md)
- [Project Flowchart](docs/project-flowchart.txt)
- [Database and API Access](docs/database-and-api-access.txt)
- [GitHub Releases Guide](docs/github-releases.md)
- [Final Graduation Report - English](docs/reports/final-graduation-report-en.md)
- [Final Graduation Report - Turkish](docs/reports/final-graduation-report-tr.md)

## Diagrams

The most important diagrams are embedded above. Additional workflow diagrams are available for deeper review:

- [ERD Diagram](docs/diagrams/Kovex%20ERP%20-%20ERD%20Diagram.png)
- [Use Case Diagram](docs/diagrams/Kovex%20ERP%20-%20Use%20Case%20Diagram.png)
- [Data Flow Diagram](docs/diagrams/Kovex%20ERP%20-%20Use%20Case%20Diagram.png)
- [System Architecture ](docs/diagrams/Kovex%20ERP%20-%20System%20Architecture.png)
- [Quotation to Order Sequence Diagram](docs/diagrams/Kovex%20ERP%20-%20Quotation%20to%20Order%20Sequence%20Diagram.png)
- [Order to Invoice Sequence Diagram](docs/diagrams/Kovex%20ERP%20-%20Order%20to%20Invoice%20Sequence%20Diagram.png)
- [Purchase to Stock Sequence Diagram](docs/diagrams/Kovex%20ERP%20-%20Purchase%20to%20Stock%20Sequence%20Diagram.png)

## Development Notes

The OpenAPI contract in `packages/api-contract/openapi.yaml` is the source of truth for REST endpoints and schemas. After contract changes, run `pnpm run api:schema` to regenerate the frontend client and backend validation types.

Generated files, build output, dependencies, local environment files, and `.env` files should not be committed

## License

Kovex ERP is available for personal, educational, and research use under the [Kovex ERP Educational Use License](LICENSE). Commercial use, resale, hosted services, rebranding, redistribution, or productization requires prior written permission from the copyright holder.
