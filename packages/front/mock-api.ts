import type { IncomingMessage, ServerResponse } from "node:http";
import type { Plugin } from "vite";

type JsonValue =
  | null
  | string
  | number
  | boolean
  | JsonValue[]
  | { [key: string]: JsonValue };
type JsonObject = { [key: string]: JsonValue };

const now = () => new Date().toISOString();

const mockCustomers: JsonObject[] = [
  {
    id: 1,
    name: "Acme Manufacturing",
    email: "ops@acme.example",
    phone: "+1 555 0100",
    address: "120 Industrial Way",
    company: "Acme Manufacturing",
    createdAt: now(),
  },
];

const mockProducts: JsonObject[] = [
  {
    id: 1,
    name: "Steel Bracket",
    sku: "STL-BR-001",
    description: "Standard production bracket",
    category: "Components",
    price: 24,
    cost: 12,
    minimumStock: 50,
    active: true,
    createdAt: now(),
  },
];

const mockSuppliers: JsonObject[] = [
  {
    id: 1,
    name: "Northline Supplies",
    email: "sales@northline.example",
    phone: "+1 555 0140",
    address: "48 Supply Road",
    company: "Northline Supplies",
    createdAt: now(),
  },
];

const mockWarehouses: JsonObject[] = [
  {
    id: 1,
    name: "Main Warehouse",
    location: "HQ",
    description: "Primary stock location",
    active: true,
    createdAt: now(),
  },
];

const mockUsers: JsonObject[] = [
  {
    id: 1,
    name: "Operations Manager",
    email: "manager@example.com",
    role: "admin",
    department: "Operations",
    active: true,
    createdAt: now(),
  },
];

const mockQuotations: JsonObject[] = [];
const mockOrders: JsonObject[] = [];
const mockInvoices: JsonObject[] = [];
const mockPurchaseOrders: JsonObject[] = [];
const mockPurchaseInvoices: JsonObject[] = [];
const mockProjects: JsonObject[] = [];
const mockTasks: JsonObject[] = [];

const collections: Record<string, JsonObject[]> = {
  "/api/customers": mockCustomers,
  "/api/products": mockProducts,
  "/api/suppliers": mockSuppliers,
  "/api/warehouses": mockWarehouses,
  "/api/users": mockUsers,
  "/api/quotations": mockQuotations,
  "/api/orders": mockOrders,
  "/api/invoices": mockInvoices,
  "/api/purchase-orders": mockPurchaseOrders,
  "/api/purchase-invoices": mockPurchaseInvoices,
  "/api/projects": mockProjects,
  "/api/tasks": mockTasks,
};

function nextId(rows: JsonObject[]) {
  return rows.reduce((max, row) => Math.max(max, Number(row.id) || 0), 0) + 1;
}

function collectionPath(path: string) {
  if (collections[path]) return path;

  for (const key of Object.keys(collections)) {
    if (path.startsWith(`${key}/`)) return key;
  }

  return null;
}

function rowId(path: string, basePath: string) {
  const raw = path.slice(basePath.length + 1).split("/", 1)[0];
  const id = Number(raw);
  return Number.isFinite(id) ? id : null;
}

function withDefaults(basePath: string, body: Record<string, unknown>, id: number): JsonObject {
  const created: JsonObject = {
    id,
    createdAt: now(),
    ...(body as JsonObject),
  };

  if (basePath === "/api/quotations" || basePath === "/api/orders") {
    created.reference ??= `${basePath === "/api/quotations" ? "QUO" : "ORD"}-${String(id).padStart(4, "0")}`;
    created.customerName ??= mockCustomers.find((customer) => customer.id === created.customerId)?.name ?? "Customer";
    created.status ??= "pending";
    created.totalAmount ??= 0;
    created.items ??= [];
  }

  if (basePath === "/api/invoices") {
    created.reference ??= `INV-${String(id).padStart(4, "0")}`;
    created.customerName ??= mockCustomers.find((customer) => customer.id === created.customerId)?.name ?? "Customer";
    created.status ??= "draft";
    created.totalAmount ??= 0;
    created.items ??= [];
  }

  if (basePath === "/api/purchase-orders" || basePath === "/api/purchase-invoices") {
    created.reference ??= `${basePath === "/api/purchase-orders" ? "PO" : "PI"}-${String(id).padStart(4, "0")}`;
    created.supplierName ??= mockSuppliers.find((supplier) => supplier.id === created.supplierId)?.name ?? "Supplier";
    created.status ??= "pending";
    created.totalAmount ??= 0;
    created.items ??= [];
  }

  if (basePath === "/api/projects") {
    created.status ??= "planning";
    created.priority ??= "medium";
    created.taskCount ??= 0;
    created.completedTaskCount ??= 0;
  }

  if (basePath === "/api/tasks") {
    created.status ??= "todo";
    created.priority ??= "medium";
  }

  return created;
}

function sendJson(res: ServerResponse, data: JsonValue, status = 200) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(data));
}

function readBody(req: IncomingMessage): Promise<Record<string, unknown>> {
  return new Promise((resolve) => {
    const chunks: Buffer[] = [];
    req.on("data", (chunk: Buffer) => chunks.push(chunk));
    req.on("end", () => {
      const raw = Buffer.concat(chunks).toString("utf8");
      if (!raw) return resolve({});
      try {
        resolve(JSON.parse(raw));
      } catch {
        resolve({});
      }
    });
  });
}

function mockGet(path: string): JsonValue | undefined {
  if (path === "/api/healthz") return { status: "ok" };

  if (path === "/api/dashboard/summary") {
    return {
      totalSalesThisMonth: 42800,
      totalOrdersThisMonth: 12,
      totalCustomers: mockCustomers.length,
      totalProducts: mockProducts.length,
      pendingOrders: 3,
      lowStockCount: 1,
      totalRevenueThisYear: 284500,
      pendingInvoicesCount: 4,
    };
  }

  if (path === "/api/dashboard/top-products") {
    return [
      {
        productId: 1,
        productName: "Steel Bracket",
        sku: "STL-BR-001",
        quantitySold: 320,
        totalRevenue: 7680,
      },
    ];
  }

  if (path === "/api/dashboard/recent-orders") {
    return [
      {
        id: 1,
        reference: "ORD-1001",
        customerId: 1,
        customerName: "Acme Manufacturing",
        status: "pending",
        totalAmount: 7680,
        notes: null,
        quotationId: null,
        items: [],
        createdAt: now(),
      },
    ];
  }

  if (path === "/api/dashboard/low-stock") {
    return [
      {
        productId: 1,
        productName: "Steel Bracket",
        sku: "STL-BR-001",
        currentStock: 24,
        minimumStock: 50,
        warehouseName: "Main Warehouse",
      },
    ];
  }

  if (path === "/api/customers") return mockCustomers;
  if (path === "/api/products") return mockProducts;
  if (path === "/api/suppliers") return mockSuppliers;
  if (path === "/api/warehouses") return mockWarehouses;
  if (path === "/api/users") return mockUsers;

  const basePath = collectionPath(path);
  if (basePath) {
    const rows = collections[basePath];
    const id = rowId(path, basePath);
    return id == null ? rows : rows.find((row) => row.id === id);
  }

  if (path === "/api/stock") {
    return [
      {
        productId: 1,
        productName: "Steel Bracket",
        sku: "STL-BR-001",
        warehouseId: 1,
        warehouseName: "Main Warehouse",
        quantity: 24,
        minimumStock: 50,
      },
    ];
  }

  if (path === "/api/reports/sales") {
    return {
      totalRevenue: 42800,
      totalOrders: 12,
      rows: [
        { date: "2026-01", ordersCount: 5, revenue: 9200 },
        { date: "2026-02", ordersCount: 7, revenue: 12800 },
        { date: "2026-03", ordersCount: 6, revenue: 11400 },
        { date: "2026-04", ordersCount: 9, revenue: 16800 },
        { date: "2026-05", ordersCount: 12, revenue: 21400 },
        { date: "2026-06", ordersCount: 10, revenue: 18800 },
      ],
      topCustomers: [],
    };
  }
  if (path === "/api/reports/inventory") return { totalProducts: 1, totalStockValue: 576, lowStockCount: 1, rows: [] };
  if (path === "/api/reports/purchases") return { totalPurchases: 18500, totalOrders: 6, rows: [], topSuppliers: [] };

  return undefined;
}

export function mockApiPlugin(): Plugin {
  return {
    name: "mock-api",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = new URL(req.url ?? "/", "http://localhost");
        if (!url.pathname.startsWith("/api")) return next();

        if (req.method === "GET") {
          const data = mockGet(url.pathname);
          if (data !== undefined) return sendJson(res, data);
        }

        if (req.method === "POST") {
          const body = await readBody(req);
          const basePath = collectionPath(url.pathname);
          if (!basePath) return sendJson(res, { id: 1, createdAt: now(), ...body }, 201);

          const rows = collections[basePath];
          const created = withDefaults(basePath, body, nextId(rows));
          rows.unshift(created);
          return sendJson(res, created, 201);
        }

        if (req.method === "PATCH") {
          const body = await readBody(req);
          const basePath = collectionPath(url.pathname);
          if (!basePath) return sendJson(res, { id: 1, createdAt: now(), ...body });

          const rows = collections[basePath];
          const id = rowId(url.pathname, basePath);
          const index = rows.findIndex((row) => row.id === id);
          if (index === -1) return sendJson(res, { error: "Mock record not found" }, 404);

          rows[index] = { ...rows[index], ...(body as JsonObject) };
          return sendJson(res, rows[index]);
        }

        if (req.method === "DELETE") {
          const basePath = collectionPath(url.pathname);
          if (basePath) {
            const id = rowId(url.pathname, basePath);
            const rows = collections[basePath];
            const index = rows.findIndex((row) => row.id === id);
            if (index !== -1) rows.splice(index, 1);
          }

          res.statusCode = 204;
          return res.end();
        }

        return sendJson(res, { error: "Mock endpoint not found", path: url.pathname }, 404);
      });
    },
  };
}
