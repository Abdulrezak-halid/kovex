import type { IncomingMessage, ServerResponse } from "node:http";
import type { Plugin } from "vite";

type JsonValue =
  | null
  | string
  | number
  | boolean
  | JsonValue[]
  | { [key: string]: JsonValue };

const now = () => new Date().toISOString();

const mockCustomers = [
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

const mockProducts = [
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

const mockSuppliers = [
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

const mockWarehouses = [
  {
    id: 1,
    name: "Main Warehouse",
    location: "HQ",
    description: "Primary stock location",
    active: true,
    createdAt: now(),
  },
];

const mockUsers = [
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

  if (path === "/api/reports/sales") return { totalRevenue: 42800, totalOrders: 12, rows: [], topCustomers: [] };
  if (path === "/api/reports/inventory") return { totalProducts: 1, totalStockValue: 576, lowStockCount: 1, rows: [] };
  if (path === "/api/reports/purchases") return { totalPurchases: 18500, totalOrders: 6, rows: [], topSuppliers: [] };

  if (
    path === "/api/quotations" ||
    path === "/api/orders" ||
    path === "/api/invoices" ||
    path === "/api/purchase-orders" ||
    path === "/api/purchase-invoices" ||
    path === "/api/projects" ||
    path === "/api/tasks"
  ) {
    return [];
  }

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

        if (req.method === "POST" || req.method === "PATCH") {
          const body = await readBody(req);
          return sendJson(res, { id: 1, createdAt: now(), ...body }, req.method === "POST" ? 201 : 200);
        }

        if (req.method === "DELETE") {
          res.statusCode = 204;
          return res.end();
        }

        return sendJson(res, { error: "Mock endpoint not found" }, 404);
      });
    },
  };
}
