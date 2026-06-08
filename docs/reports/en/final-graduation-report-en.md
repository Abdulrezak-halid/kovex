# Kovex ERP - Small Business Enterprise Resource Planning System

## Cover Page

**University Name:** [Add university name]

**Faculty / Department:** [Add faculty and department]

**Graduation Project Title:** Kovex ERP - Small Business Enterprise Resource Planning System

**Student Name(s):** [Add student name(s)]

**Student Number(s):** [Add student number(s)]

**Supervisor / Instructor:** [Add supervisor or instructor name]

**Academic Year:** [Add academic year]

---

## Abstract

Kovex ERP is a web-based enterprise resource planning system designed for small and medium-sized businesses. The project focuses on core business processes such as sales, purchasing, inventory, reporting, planning, user management, authentication, and authorization. The main purpose of the system is to reduce fragmented work performed through spreadsheets, paper records, messaging applications, and disconnected tools.

The system provides an integrated platform where customers, suppliers, products, quotations, sales orders, invoices, purchase orders, stock records, reports, projects, tasks, and users can be managed through one application. Kovex ERP was developed as a graduation project to demonstrate requirements analysis, system design, database modeling, backend development, frontend implementation, API documentation, testing, and project documentation.

The project uses modern technologies including React, TypeScript, Tailwind CSS, Node.js, Express, PostgreSQL, Drizzle ORM, OpenAPI, Swagger UI, Docker, Docker Compose, Render, and Supabase. The interface also supports dark and light mode, and the user interface design was prepared using Stitch before implementation.

---

## Table of Contents

1. Introduction
2. Problem Statement
3. Project Added Value
4. Requirements Analysis
5. Feasibility Study
6. Comparison With Existing Systems
7. System Design
8. Database Design
9. System Architecture
10. Main System Workflows
11. Implementation Details
12. Sprint Planning and Team Work
13. User Interface and Screenshots
14. Docker and Swagger UI
15. Deployment and Live Demo
16. Testing and Verification
17. Conclusion

---

## 1. Introduction

Kovex ERP is a simplified ERP system created for small business operations. Many small and medium-sized businesses need to manage sales, purchases, inventory, customers, suppliers, and reports, but they often use separate files or manual processes. This makes information harder to control and increases the risk of mistakes.

The project aims to provide a centralized system that connects the most important operational modules. Instead of building a very large enterprise system, Kovex ERP focuses on essential ERP functions that are suitable for an academic project and understandable for daily business use.

The project was developed with a modular software architecture. The frontend, backend, database schema, API contract, validation logic, and generated API client are separated into organized packages. This structure makes the system easier to maintain, test, and extend.

---

## 2. Problem Statement

Small and medium-sized businesses often manage daily operations through disconnected tools such as spreadsheets, paper documents, messaging applications, and basic accounting software. Because the data is stored in different places, businesses do not always have a single reliable source of information.

This fragmented workflow can create problems in stock tracking, order management, invoice follow-up, purchasing, and reporting. The same information may be entered more than once, records may become outdated, and important details may be missed. These issues can lead to wasted time, human error, delayed decisions, and reduced operational efficiency.

For SMEs, accurate and traceable business processes are important for growth. Incorrect stock data can cause overstocking or shortages. Poor sales and purchase tracking can make revenue, expense, and performance analysis more difficult. Kovex ERP addresses this problem by providing a centralized and user-friendly ERP model.

---

## 3. Project Added Value

Kovex ERP provides practical value by combining sales, purchases, inventory, reports, planning, and user management in one system. This reduces duplicate data entry and gives users a clearer view of business operations.

The project also has academic value because it demonstrates multiple software engineering stages. It includes requirements analysis, database design, system architecture, REST API development, frontend implementation, authentication, authorization, reporting, Docker-based setup, Swagger UI documentation, manual testing, and graduation documentation.

Compared with scattered tools, Kovex ERP improves data organization and process visibility. Compared with large ERP systems, it has a smaller and more understandable scope, which makes it suitable for SMEs and for a graduation project.

---

## 4. Requirements Analysis

### 4.1 Functional Requirements

| No | Requirement | Related Module |
| --- | --- | --- |
| FR-01 | Users must be able to log in. | Authentication |
| FR-02 | Users must access pages according to their role. | Authentication, Authorization, Settings |
| FR-03 | Administrators must manage users. | Settings |
| FR-04 | Customers must be created, listed, updated, and deleted. | Sales, Customers |
| FR-05 | Suppliers must be created, listed, updated, and deleted. | Purchases, Suppliers |
| FR-06 | Products and product details must be managed. | Inventory, Products |
| FR-07 | Warehouses must be managed. | Inventory, Warehouses |
| FR-08 | Quotations must be created and converted to orders. | Sales |
| FR-09 | Orders must be created, updated, and converted to invoices. | Sales, Invoices |
| FR-10 | Sales operations must decrease stock. | Sales, Inventory |
| FR-11 | Purchase receiving must increase stock. | Purchases, Inventory |
| FR-12 | Purchase invoices must be recorded and tracked. | Purchases |
| FR-13 | Sales, purchases, and inventory reports must be displayed. | Reports |
| FR-14 | Reports must support filters. | Reports |
| FR-15 | Reports must be exportable as PDF or Excel. | Reports |
| FR-16 | Projects and tasks must be created and tracked. | Planning |
| FR-17 | Lists must support search, sorting, and limit controls. | Shared Components |
| FR-18 | User actions must show success or error feedback. | Frontend |

### 4.2 Non-Functional Requirements

| No | Requirement | Description |
| --- | --- | --- |
| NFR-01 | Usability | The interface should be clear and suitable for daily business workflows. |
| NFR-02 | Security | Login, role-based access, and password protection should be supported. |
| NFR-03 | Data Integrity | Sales, purchases, and stock operations should remain consistent. |
| NFR-04 | Maintainability | The codebase should separate frontend, backend, database, API, and validation layers. |
| NFR-05 | Extensibility | Future modules should be possible to add. |
| NFR-06 | Performance | Lists, filters, and reports should respond efficiently. |
| NFR-07 | Compatibility | The system should work in modern browsers. |
| NFR-08 | Testability | Main workflows should be verifiable through manual and API tests. |
| NFR-09 | Documentation | Setup, API, diagrams, and final report documentation should be available. |

---

## 5. Feasibility Study

### 5.1 Technical Feasibility

Kovex ERP is technically feasible because it uses modern and widely adopted technologies. React, Vite, TypeScript, Tailwind CSS, Node.js, Express, PostgreSQL, Drizzle ORM, OpenAPI, and pnpm workspace provide a suitable foundation for developing a web-based ERP system.

The monorepo structure separates the frontend, backend, database, API contract, API client, and validation layers. PostgreSQL provides a relational database model suitable for ERP data such as customers, suppliers, products, orders, invoices, stock records, projects, and tasks.

### 5.2 Economic Feasibility

The project is economically feasible because it uses open-source or freely available technologies. This reduces licensing costs and makes the system suitable for academic development and SME-oriented evaluation.

### 5.3 Time Feasibility

The project was organized through sprint-based planning. Earlier sprints focused on project setup, backend integration, CRUD operations, security, reports, testing, and final documentation. This approach made the work manageable and trackable.

### 5.4 Practical Feasibility

The project is practical because it matches common SME workflows. Users can manage customers, suppliers, products, quotations, orders, invoices, stock, purchases, reports, projects, and tasks through one system.

---

## 6. Comparison With Existing Systems

Kovex ERP was compared with existing business systems such as Odoo, Zoho One, and Microsoft Dynamics 365 Business Central.

| Criteria | Odoo | Zoho One | Business Central | Kovex ERP |
| --- | --- | --- | --- | --- |
| Target Users | SMEs and larger businesses | Growing businesses | SMEs | SME-focused graduation project |
| Scope | Very broad and modular | Many cloud applications | Comprehensive ERP | Essential ERP modules |
| Cost | Depends on usage | Subscription-based | License/subscription-based | Low development cost |
| Learning Curve | Medium/high | Medium | Medium/high | Simpler |
| Academic Visibility | End-user product | End-user product | End-user product | Code, architecture, and database are visible |

The purpose of Kovex ERP is not to compete directly with professional ERP platforms. Its value is to demonstrate core ERP logic in a feasible, inspectable, and extendable academic project.

---

## 7. System Design

The system is organized around the following main modules:

- Dashboard
- Authentication and authorization
- Customers
- Suppliers
- Products
- Warehouses
- Stock
- Quotations
- Sales orders
- Sales invoices
- Purchase orders
- Purchase invoices
- Reports
- Planning projects and tasks
- Users and permissions

The supported roles are:

| Role | Description |
| --- | --- |
| Admin | Full system access and management permissions. |
| SysAdmin | System administration and configuration permissions. |
| Sales | Access to sales-related operations. |
| Purchasing | Access to supplier and purchase operations. |
| Inventory | Access to products, warehouses, and stock operations. |
| Accountant | Access to invoices and financial/reporting areas. |
| Planner | Access to projects and tasks. |
| User | Basic access according to assigned permissions. |

---

## 8. Database Design

The database was designed using an entity relationship model. The main entities include users, customers, suppliers, products, warehouses, stock, quotations, quotation items, orders, order items, invoices, invoice items, purchase orders, purchase order items, purchase invoices, projects, and tasks.

The ERD shows how business records are connected. For example, quotations are linked to customers, orders can be created from quotations, invoices can be created from orders, purchase orders are linked to suppliers, and stock records connect products with warehouses.

**Figure 1. ERD Database Diagram**

![ERD Database Diagram](../../diagrams/Kovex%20ERP%20-%20ERD%20Diagram.png)

---

## 9. System Architecture

Kovex ERP uses a layered web application architecture:

| Layer | Technologies / Components |
| --- | --- |
| Presentation Layer | React, Vite, TypeScript, Tailwind CSS |
| API Client Layer | Generated API client, typed hooks, custom fetch wrapper |
| Backend Layer | Node.js, Express REST API |
| Contract and Validation Layer | OpenAPI YAML, Orval, API validation package |
| Data Access Layer | Drizzle ORM |
| Database Layer | PostgreSQL |
| Deployment Layer | Render Web Service, Supabase PostgreSQL |
| Development Tools | Docker, Docker Compose, Swagger UI, pnpm workspace |

**Figure 2. System Architecture Diagram**

![System Architecture Diagram](../../diagrams/Kovex%20ERP%20-%20System%20Architecture.png)

---

## 10. Main System Workflows

### 10.1 Data Flow

The data flow diagram shows how information moves between sales, purchases, inventory, and reports. Sales operations create quotations, orders, and invoices. Purchase operations create purchase orders and receiving records. Inventory is updated by sales and purchasing actions. Reports collect summarized data from these modules.

**Figure 3. Data Flow Diagram**

![Data Flow Diagram](../../diagrams/Kovex%20ERP%20-%20Data%20Flow%20Diagram.png)

### 10.2 Use Case Diagram

The use case diagram shows the main actors and system functions. Admin users have full access, while employees access modules according to their assigned permissions.

**Figure 4. Use Case Diagram**

![Use Case Diagram](../../diagrams/Kovex%20ERP%20-%20Use%20Case%20Diagram.png)

### 10.3 Sequence and Activity Diagrams

The project includes sequence and activity diagrams for important workflows:

| Workflow | Diagram Files |
| --- | --- |
| Quotation to Order | `Kovex ERP - Quotation to Order Sequence Diagram.png`, `Kovex ERP - Quotation to Order Activity Diagram.png` |
| Order to Invoice | `Kovex ERP - Order to Invoice Sequence Diagram.png`, `Kovex ERP - Order to Invoice Activity Diagram.png` |
| Purchase to Stock | `Kovex ERP - Purchase to Stock Sequence Diagram.png`, `Kovex ERP - Purchase to Stock Activity Diagram.png` |
| Login | `Kovex ERP - Login Sequence Diagram.png`, `Kovex ERP - Login Activity Diagram.png` |

**Figure 5. Quotation to Order Sequence Diagram**

![Quotation to Order Sequence Diagram](../../diagrams/Kovex%20ERP%20-%20Quotation%20to%20Order%20Sequence%20Diagram.png)

**Figure 6. Order to Invoice Sequence Diagram**

![Order to Invoice Sequence Diagram](../../diagrams/Kovex%20ERP%20-%20Order%20to%20Invoice%20Sequence%20Diagram.png)

**Figure 7. Purchase to Stock Sequence Diagram**

![Purchase to Stock Sequence Diagram](../../diagrams/Kovex%20ERP%20-%20Purchase%20to%20Stock%20Sequence%20Diagram.png)

**Figure 8. Login Sequence Diagram**

![Login Sequence Diagram](../../diagrams/Kovex%20ERP%20-%20Login%20Sequence%20Diagram.png)

**Figure 9. Quotation to Order Activity Diagram**

![Quotation to Order Activity Diagram](../../diagrams/Kovex%20ERP%20-%20Quotation%20to%20Order%20Activity%20Diagram.png)

**Figure 10. Order to Invoice Activity Diagram**

![Order to Invoice Activity Diagram](../../diagrams/Kovex%20ERP%20-%20Order%20to%20Invoice%20Activity%20Diagram.png)

**Figure 11. Purchase to Stock Activity Diagram**

![Purchase to Stock Activity Diagram](../../diagrams/Kovex%20ERP%20-%20Purchase%20to%20Stock%20Activity%20Diagram.png)

**Figure 12. Login Activity Diagram**

![Login Activity Diagram](../../diagrams/Kovex%20ERP%20-%20Login%20Activity%20Diagram.png)

---

## 11. Implementation Details

### 11.1 Technology Stack

| Area | Technology |
| --- | --- |
| Frontend | React, TypeScript, Vite |
| Styling | Tailwind CSS, UI components |
| Backend | Node.js, Express |
| Database | PostgreSQL |
| ORM | Drizzle ORM |
| API Contract | OpenAPI |
| API Documentation | Swagger UI |
| API Client Generation | Orval |
| Development Workspace | pnpm workspace |
| Containerization | Docker, Docker Compose |
| Deployment Hosting | Render Web Service |
| Cloud Database | Supabase PostgreSQL |

### 11.2 Frontend Implementation

The frontend was implemented using React and TypeScript. The interface includes a sidebar, header, page layouts, reusable data tables, list controls, forms, dialogs, status badges, and toast notifications. The system supports both dark and light mode to improve visual accessibility and user preference support.

The user interface design was prepared in Stitch as full UI screens before implementation. This helped define the visual direction, page structure, spacing, and general user experience of the system.

### 11.3 Backend Implementation

The backend was implemented using Node.js and Express. The API is divided into route modules such as authentication, dashboard, customers, suppliers, products, sales, purchases, warehouses, stock, reports, planning, and users.

### 11.4 API Contract and Validation

The project uses OpenAPI to document the API contract. Swagger UI is available for viewing and testing API endpoints. Generated API client code and validation types help maintain consistency between frontend and backend.

---

## 12. Sprint Planning and Team Work

The development process of Kovex ERP was organized using sprint-based planning. The project tasks were divided into clear sprint sections such as documentation, analysis, diagrams, implementation, testing, and graduation material. This approach helped the team follow progress in a structured way and made the work easier to review.

Using sprint tasks also supported professional project management. Each task had a specific goal and acceptance criteria, which helped define what needed to be completed before moving to the next stage. This method reflects an organized software engineering process rather than an unplanned development approach.

The sprint task board can be included in the report as evidence of teamwork, planning, and continuous progress during the project.

**Figure 13. Sprint Task Board / Team Work Evidence**

> [IMAGE PLACEHOLDER - Add screenshot of the sprint tasks or task board here.]

---

## 13. User Interface and Screenshots

The following screenshots should be inserted into the final Word/PDF version of the report.

### 13.1 Login Page

> [IMAGE PLACEHOLDER - Add screenshot of the Login page here.]

### 13.2 Dashboard

> [IMAGE PLACEHOLDER - Add screenshot of the Dashboard page here.]

### 13.3 Customers Page

> [IMAGE PLACEHOLDER - Add screenshot of the Customers page here.]

### 13.4 Reports Page

> [IMAGE PLACEHOLDER - Add screenshot of the Reports page here.]

### 13.5 Swagger UI

> [IMAGE PLACEHOLDER - Add screenshot of Swagger UI here.]

### 13.6 Docker Running / Containers

> [IMAGE PLACEHOLDER - Add screenshot of Docker running containers here.]

---

## 14. Docker and Swagger UI

Docker and Docker Compose were included to support a structured development environment. Docker can be used to run supporting services such as PostgreSQL in a consistent way. This helps reduce setup differences between machines and makes the project easier to demonstrate.

Swagger UI was included to document and inspect REST API endpoints. It allows developers, reviewers, and committee members to view available endpoints, request parameters, response schemas, and API behavior.

---

## 15. Deployment and Live Demo

Kovex ERP was deployed as a live web application to demonstrate that the system can run outside the local development environment. The selected deployment strategy uses Render for hosting the web service and Supabase for the cloud PostgreSQL database.

The deployed application is available at:

```text
https://kovex-erp-web.onrender.com/
```

The deployment architecture uses a same-origin approach. The React frontend is built as static files and served by the Express backend. The backend exposes the REST API under `/api`, serves Swagger UI under `/api-docs`, and connects to the Supabase PostgreSQL database using a secure production database connection string.

| Deployment Area | Technology / Service |
| --- | --- |
| Web Application Hosting | Render Web Service |
| Backend Runtime | Node.js and Express inside a Docker-based deployment |
| Frontend Delivery | Built Vite frontend served by the Express application |
| Cloud Database | Supabase PostgreSQL |
| Database Access | Drizzle ORM with PostgreSQL connection |
| API Documentation | Swagger UI available from the deployed backend |
| Environment Management | Render environment variables for production secrets |

The deployment uses environment variables for sensitive values such as the database connection string and authentication secret. These values are stored in the hosting platform and are not committed to the source code repository. This approach improves security and follows common deployment best practices.

This live deployment is important for the graduation project because it shows that Kovex ERP is not only a local prototype. It can be built, deployed, connected to a cloud database, and accessed through a public URL for demonstration and review.

---

## 16. Testing and Verification

Manual test cases were prepared to verify the main workflows and quality checks.

| Test Name | Expected Result | Status |
| --- | --- | --- |
| Login with valid user | User reaches dashboard successfully. | PASS |
| Dashboard summary loads | Dashboard summary content is displayed. | PASS |
| Customer list search and filter | Customer table responds to search text. | PASS |
| Product creation validation | Required field validation is shown. | PASS |
| Sales report date filter | Report updates for selected filters. | PASS |
| Inventory report export | Export action produces the requested report file. | PASS |
| Language switch | Interface labels change language. | PASS |
| Theme toggle | Light/dark mode changes without losing page state. | PASS |
| Unauthorized route protection | Restricted access is prevented. | PASS |
| Production build verification | Build verification completes successfully. | PASS |

Testing covered authentication, dashboard visibility, list controls, form validation, reports, exports, localization, theme behavior, authorization, and build readiness.

---

## 17. Conclusion

Kovex ERP successfully demonstrates a small business ERP system with integrated sales, purchasing, inventory, reporting, planning, authentication, authorization, and user management modules. The project addresses a real problem faced by SMEs: fragmented business data and disconnected daily workflows.

The system includes academic documentation, requirements analysis, feasibility study, comparison with existing systems, ERD diagram, system architecture diagram, data flow diagram, use case diagram, sequence diagrams, activity diagrams, Docker support, Swagger UI, Render deployment, Supabase cloud database integration, dark/light mode, and UI design prepared in Stitch.

As a graduation project, Kovex ERP shows the ability to analyze a business problem, design a suitable software solution, implement a full-stack system, document the architecture, and verify the main workflows through testing.
