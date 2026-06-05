# TASK-063 - Feasibility Study

## Purpose

This document evaluates the feasibility of Kovex ERP from technical, economic, time, and practical perspectives.

## Technical Feasibility

Kovex ERP is technically feasible. The project uses modern and widely adopted technologies such as React, Vite, TypeScript, Tailwind CSS, Node.js, Express, PostgreSQL, Drizzle ORM, OpenAPI, and pnpm workspace. These tools provide a suitable foundation for developing a web-based ERP system.

The monorepo structure separates the frontend, backend, database, API contract, API client, and validation layers into organized packages. This improves maintainability and makes future development easier. PostgreSQL provides a relational data model suitable for ERP data such as customers, suppliers, products, orders, invoices, and stock records.

The main technical risks are database connectivity, role-based authorization, stock consistency, and report accuracy. These risks are reduced through API testing, manual test cases, validation rules, and structured documentation.

## Economic Feasibility

The project is economically feasible because it uses open-source or freely available technologies. React, Node.js, Express, PostgreSQL, TypeScript, and Tailwind CSS can be used without licensing costs, which keeps development cost low for a graduation project.

Cost is an important factor for SMEs. Large ERP platforms may require licensing, setup, training, and consulting costs that can be difficult for small businesses. Kovex ERP focuses on essential business workflows and can be evaluated as a lower-cost alternative for basic ERP needs.

## Time Feasibility

The project is manageable in terms of time because it is organized through sprint-based planning. Earlier sprints covered project structure, real backend integration, CRUD operations, security, reports, and testing. Sprint 6 focuses on documentation and graduation material.

This phased approach divides the project into smaller and trackable tasks instead of treating it as one large deliverable. Each sprint produces concrete output, and remaining work can be followed through the task list.

## Practical Feasibility

Kovex ERP is practical because it matches common SME workflows. Small and medium-sized businesses need to manage sales, purchases, inventory, and reports in a structured way. Users can track customers, suppliers, products, orders, and invoices through the system.

The modular design helps users focus on the sections they need. Reports, filters, export options, and user feedback messages support daily business tracking and decision-making.

As a result, Kovex ERP is a feasible graduation project because it uses suitable technologies, keeps development cost low, follows sprint-based planning, and addresses real SME needs.
