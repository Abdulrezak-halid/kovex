import type { IncomingMessage, ServerResponse } from "node:http";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";
import type { Plugin } from "vite";

type JsonValue =
  | null
  | string
  | number
  | boolean
  | JsonValue[]
  | { [key: string]: JsonValue };
type JsonObject = { [key: string]: JsonValue };
type ExportFormat = "pdf" | "excel";
type TableCell = string | number;
type ExportSection = {
  title: string;
  headers: string[];
  rows: TableCell[][];
};
type ChartPoint = { label: string; value: number; secondary?: number };
type ChartSlice = { label: string; value: number };
type PngImage = {
  width: number;
  height: number;
  rgb: Buffer;
  alpha: Buffer;
};

const now = () => new Date().toISOString();
const daysAgo = (days: number) =>
  new Date(Date.UTC(2026, 5, 1 - days, 9, 0, 0)).toISOString();
const dueIn = (days: number) =>
  new Date(Date.UTC(2026, 5, 1 + days, 9, 0, 0)).toISOString();
const money = (value: number) => Number(value.toFixed(2));
const brand = {
  name: "Kovex ERP",
  subtitle: "Smart Business Management for SMEs",
  navy: "#0f304f",
  teal: "#10b7a6",
  gold: "#f4b942",
  border: "#d8e1ea",
  soft: "#f4f8fb",
};
function publicAssetPath(relativePath: string) {
  const candidates = [
    path.resolve(process.cwd(), "packages/front/public", relativePath),
    path.resolve(process.cwd(), "public", relativePath),
    path.resolve(process.cwd(), "../front/public", relativePath),
    path.resolve(process.cwd(), "../../packages/front/public", relativePath),
  ];

  return (
    candidates.find((candidate) => fs.existsSync(candidate)) ?? candidates[0]
  );
}

const iconPath = publicAssetPath("assets/images/icons/project-icon.png");

function hashMockPassword(password: string) {
  const salt = crypto.randomBytes(12).toString("base64url");
  const hash = crypto
    .createHash("sha256")
    .update(`${salt}:${password}`)
    .digest("base64url");

  return `mock-sha256:${salt}:${hash}`;
}

function verifyMockPassword(password: string, storedHash: unknown) {
  if (typeof storedHash !== "string") return password === "admin123";

  const [algorithm, salt, expectedHash] = storedHash.split(":");
  if (algorithm !== "mock-sha256" || !salt || !expectedHash) return false;

  const actualHash = crypto
    .createHash("sha256")
    .update(`${salt}:${password}`)
    .digest("base64url");

  return actualHash === expectedHash;
}

function publicMockUser(user: JsonObject) {
  const { password, passwordHash, ...safeUser } = user;
  void password;
  void passwordHash;

  return safeUser;
}

function item(productId: number, quantity: number) {
  const product = mockProducts.find((row) => row.id === productId);
  const unitPrice = Number(product?.price ?? 0);

  return {
    productId,
    productName: String(product?.name ?? "Product"),
    quantity,
    unitPrice,
    unitCost: Number(product?.cost ?? 0),
    total: money(quantity * unitPrice),
  };
}

function purchaseItem(productId: number, quantity: number) {
  const product = mockProducts.find((row) => row.id === productId);
  const unitCost = Number(product?.cost ?? 0);

  return {
    productId,
    productName: String(product?.name ?? "Product"),
    quantity,
    unitCost,
    total: money(quantity * unitCost),
  };
}

const mockCustomers: JsonObject[] = [
  {
    id: 1,
    name: "Acme Manufacturing",
    email: "ops@acme.example",
    phone: "+1 555 0100",
    address: "120 Industrial Way, Chicago, IL",
    company: "Acme Manufacturing",
    createdAt: daysAgo(92),
  },
  {
    id: 2,
    name: "Bright Retail Group",
    email: "purchasing@bright.example",
    phone: "+1 555 0114",
    address: "88 Market Street, Denver, CO",
    company: "Bright Retail Group",
    createdAt: daysAgo(84),
  },
  {
    id: 3,
    name: "Crescent Foods",
    email: "supply@crescent.example",
    phone: "+1 555 0128",
    address: "42 Cold Chain Ave, Austin, TX",
    company: "Crescent Foods",
    createdAt: daysAgo(71),
  },
  {
    id: 4,
    name: "Delta Office Solutions",
    email: "orders@delta-office.example",
    phone: "+1 555 0133",
    address: "19 Commerce Plaza, Seattle, WA",
    company: "Delta Office Solutions",
    createdAt: daysAgo(63),
  },
  {
    id: 5,
    name: "Evergreen Contractors",
    email: "accounts@evergreen.example",
    phone: "+1 555 0147",
    address: "310 Builder Road, Phoenix, AZ",
    company: "Evergreen Contractors",
    createdAt: daysAgo(52),
  },
  {
    id: 6,
    name: "Harbor Medical",
    email: "procurement@harbor-med.example",
    phone: "+1 555 0155",
    address: "7 Clinic Park, Boston, MA",
    company: "Harbor Medical",
    createdAt: daysAgo(44),
  },
  {
    id: 7,
    name: "Summit Logistics",
    email: "ops@summit-log.example",
    phone: "+1 555 0169",
    address: "501 Freight Loop, Atlanta, GA",
    company: "Summit Logistics",
    createdAt: daysAgo(32),
  },
  {
    id: 8,
    name: "Urban Craft Studio",
    email: "hello@urbancraft.example",
    phone: "+1 555 0172",
    address: "64 Maker Lane, Portland, OR",
    company: "Urban Craft Studio",
    createdAt: daysAgo(19),
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
    unit: "pcs",
    minimumStock: 50,
    active: true,
    createdAt: daysAgo(88),
  },
  {
    id: 2,
    name: "Aluminum Rail Kit",
    sku: "ALU-RK-010",
    description: "Modular rail kit for light assembly",
    category: "Components",
    price: 68,
    cost: 34,
    unit: "kit",
    minimumStock: 35,
    active: true,
    createdAt: daysAgo(86),
  },
  {
    id: 3,
    name: "Control Panel Basic",
    sku: "CTL-PN-100",
    description: "Basic electrical control panel",
    category: "Electronics",
    price: 420,
    cost: 260,
    unit: "pcs",
    minimumStock: 8,
    active: true,
    createdAt: daysAgo(80),
  },
  {
    id: 4,
    name: "Thermal Label Roll",
    sku: "LBL-TR-055",
    description: "55mm thermal labels, 900 labels per roll",
    category: "Packaging",
    price: 14,
    cost: 6,
    unit: "roll",
    minimumStock: 120,
    active: true,
    createdAt: daysAgo(76),
  },
  {
    id: 5,
    name: "Safety Sensor",
    sku: "SNS-SF-220",
    description: "Industrial proximity safety sensor",
    category: "Electronics",
    price: 96,
    cost: 48,
    unit: "pcs",
    minimumStock: 25,
    active: true,
    createdAt: daysAgo(69),
  },
  {
    id: 6,
    name: "Packing Tape Case",
    sku: "PKG-TP-024",
    description: "Clear tape case, 24 rolls",
    category: "Packaging",
    price: 52,
    cost: 27,
    unit: "case",
    minimumStock: 40,
    active: true,
    createdAt: daysAgo(61),
  },
  {
    id: 7,
    name: "Ergo Workbench",
    sku: "WRK-BN-300",
    description: "Adjustable operations workbench",
    category: "Equipment",
    price: 780,
    cost: 520,
    unit: "pcs",
    minimumStock: 4,
    active: true,
    createdAt: daysAgo(54),
  },
  {
    id: 8,
    name: "Barcode Scanner",
    sku: "BAR-SC-040",
    description: "USB handheld barcode scanner",
    category: "Equipment",
    price: 155,
    cost: 92,
    unit: "pcs",
    minimumStock: 12,
    active: true,
    createdAt: daysAgo(47),
  },
  {
    id: 9,
    name: "Hydraulic Clamp",
    sku: "HYD-CL-070",
    description: "Medium-duty hydraulic clamp",
    category: "Components",
    price: 132,
    cost: 75,
    unit: "pcs",
    minimumStock: 18,
    active: true,
    createdAt: daysAgo(40),
  },
  {
    id: 10,
    name: "Office Chair Pro",
    sku: "OFF-CH-210",
    description: "Commercial ergonomic chair",
    category: "Furniture",
    price: 245,
    cost: 138,
    unit: "pcs",
    minimumStock: 10,
    active: true,
    createdAt: daysAgo(34),
  },
  {
    id: 11,
    name: "Sanitizer Dispenser",
    sku: "MED-SD-015",
    description: "Wall-mounted dispenser",
    category: "Medical",
    price: 39,
    cost: 18,
    unit: "pcs",
    minimumStock: 30,
    active: true,
    createdAt: daysAgo(25),
  },
  {
    id: 12,
    name: "Cold Storage Bin",
    sku: "CLD-BN-060",
    description: "Stackable insulated storage bin",
    category: "Logistics",
    price: 118,
    cost: 64,
    unit: "pcs",
    minimumStock: 16,
    active: true,
    createdAt: daysAgo(16),
  },
];

const mockSuppliers: JsonObject[] = [
  {
    id: 1,
    name: "Northline Supplies",
    email: "sales@northline.example",
    phone: "+1 555 0140",
    address: "48 Supply Road, Omaha, NE",
    company: "Northline Supplies",
    createdAt: daysAgo(90),
  },
  {
    id: 2,
    name: "Vector Components",
    email: "orders@vector.example",
    phone: "+1 555 0182",
    address: "220 Circuit Blvd, Raleigh, NC",
    company: "Vector Components",
    createdAt: daysAgo(74),
  },
  {
    id: 3,
    name: "Atlas Packaging",
    email: "service@atlas-pack.example",
    phone: "+1 555 0189",
    address: "12 Carton Court, Columbus, OH",
    company: "Atlas Packaging",
    createdAt: daysAgo(58),
  },
  {
    id: 4,
    name: "Prime Office Goods",
    email: "account@prime-office.example",
    phone: "+1 555 0194",
    address: "900 Desk Drive, Nashville, TN",
    company: "Prime Office Goods",
    createdAt: daysAgo(41),
  },
];

const mockWarehouses: JsonObject[] = [
  {
    id: 1,
    name: "Main Warehouse",
    location: "HQ",
    description: "Primary stock location",
    active: true,
    createdAt: daysAgo(96),
  },
  {
    id: 2,
    name: "East Fulfillment",
    location: "Raleigh",
    description: "Fast-moving customer stock",
    active: true,
    createdAt: daysAgo(64),
  },
  {
    id: 3,
    name: "Service Van Stock",
    location: "Mobile",
    description: "Field operations inventory",
    active: true,
    createdAt: daysAgo(37),
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
    createdAt: daysAgo(120),
  },
  {
    id: 2,
    name: "Abdulrezak Halit",
    email: "abdulrezak.halit@example.com",
    role: "sales",
    department: "Sales",
    active: true,
    createdAt: daysAgo(91),
  },
  {
    id: 3,
    name: "Ahmed Shablak",
    email: "ahmed.shablak@example.com",
    role: "purchasing",
    department: "Purchasing",
    active: true,
    createdAt: daysAgo(81),
  },
  {
    id: 4,
    name: "Ava Chen",
    email: "ava.chen@example.com",
    role: "inventory",
    department: "Warehouse",
    active: true,
    createdAt: daysAgo(70),
  },
  {
    id: 5,
    name: "Mina Hassan",
    email: "mina.hassan@example.com",
    role: "planner",
    department: "Planning",
    active: true,
    createdAt: daysAgo(52),
  },
  {
    id: 6,
    name: "Omar Yilmaz",
    email: "omar.yilmaz@example.com",
    role: "accountant",
    department: "Finance",
    active: true,
    createdAt: daysAgo(44),
  },
];

let mockSessionUserId: number | null = null;

function currentMockUser() {
  return mockUsers.find((row) => row.id === mockSessionUserId) ?? null;
}

type MockPermissionModule =
  | "dashboard"
  | "sales"
  | "inventory"
  | "purchases"
  | "accounting"
  | "reports"
  | "planning"
  | "settings";

const mockRolePermissions: Record<string, MockPermissionModule[]> = {
  admin: [
    "dashboard",
    "sales",
    "inventory",
    "purchases",
    "accounting",
    "reports",
    "planning",
    "settings",
  ],
  sysadmin: [
    "dashboard",
    "sales",
    "inventory",
    "purchases",
    "accounting",
    "reports",
    "planning",
    "settings",
  ],
  sales: ["dashboard", "sales"],
  inventory: ["dashboard", "inventory"],
  purchasing: ["dashboard", "purchases"],
  accountant: ["dashboard", "accounting", "reports"],
  planner: ["dashboard", "planning"],
  user: ["dashboard"],
};

function mockPermissionModuleForPath(path: string): MockPermissionModule {
  if (path.startsWith("/api/dashboard")) return "dashboard";
  if (path.startsWith("/api/customers")) return "sales";
  if (path.startsWith("/api/quotations")) return "sales";
  if (path.startsWith("/api/orders")) return "sales";
  if (path.startsWith("/api/invoices")) return "accounting";
  if (path.startsWith("/api/products")) return "inventory";
  if (path.startsWith("/api/stock")) return "inventory";
  if (path.startsWith("/api/warehouses")) return "inventory";
  if (path.startsWith("/api/suppliers")) return "purchases";
  if (path.startsWith("/api/purchase-orders")) return "purchases";
  if (path.startsWith("/api/purchase-invoices")) return "accounting";
  if (path.startsWith("/api/reports")) return "reports";
  if (path.startsWith("/api/projects")) return "planning";
  if (path.startsWith("/api/tasks")) return "planning";
  if (path.startsWith("/api/users")) return "settings";
  return "dashboard";
}

function canMockAccessPath(path: string) {
  const role = String(currentMockUser()?.role ?? "");
  const module = mockPermissionModuleForPath(path);
  return mockRolePermissions[role]?.includes(module) ?? false;
}

function canMockWritePath(path: string) {
  const module = mockPermissionModuleForPath(path);
  return module !== "dashboard" && canMockAccessPath(path);
}

const mockQuotations: JsonObject[] = [
  {
    id: 1,
    reference: "QUO-1001",
    customerId: 1,
    customerName: "Acme Manufacturing",
    status: "accepted",
    totalAmount: 8640,
    validUntil: dueIn(11),
    notes: "Line upgrade phase 1",
    items: [item(1, 180), item(2, 48), item(5, 14)],
    createdAt: daysAgo(27),
  },
  {
    id: 2,
    reference: "QUO-1002",
    customerId: 2,
    customerName: "Bright Retail Group",
    status: "sent",
    totalAmount: 4120,
    validUntil: dueIn(8),
    notes: "New retail store opening",
    items: [item(4, 140), item(6, 22), item(8, 6)],
    createdAt: daysAgo(18),
  },
  {
    id: 3,
    reference: "QUO-1003",
    customerId: 6,
    customerName: "Harbor Medical",
    status: "draft",
    totalAmount: 2595,
    validUntil: dueIn(14),
    notes: "Clinic supply refresh",
    items: [item(11, 45), item(8, 4), item(10, 1)],
    createdAt: daysAgo(9),
  },
  {
    id: 4,
    reference: "QUO-1004",
    customerId: 7,
    customerName: "Summit Logistics",
    status: "sent",
    totalAmount: 7256,
    validUntil: dueIn(21),
    notes: "Cold-chain pilot",
    items: [item(12, 44), item(4, 64), item(8, 8)],
    createdAt: daysAgo(4),
  },
];
const mockOrders: JsonObject[] = [
  {
    id: 1,
    reference: "ORD-1001",
    customerId: 1,
    customerName: "Acme Manufacturing",
    status: "confirmed",
    totalAmount: 8640,
    quotationId: 1,
    notes: "Production line upgrade",
    items: [item(1, 180), item(2, 48), item(5, 14)],
    createdAt: daysAgo(24),
  },
  {
    id: 2,
    reference: "ORD-1002",
    customerId: 3,
    customerName: "Crescent Foods",
    status: "shipped",
    totalAmount: 6192,
    quotationId: null,
    notes: "Warehouse replenishment",
    items: [item(12, 36), item(4, 96), item(6, 12)],
    createdAt: daysAgo(20),
  },
  {
    id: 3,
    reference: "ORD-1003",
    customerId: 4,
    customerName: "Delta Office Solutions",
    status: "pending",
    totalAmount: 8840,
    quotationId: null,
    notes: "Office refresh bundle",
    items: [item(10, 24), item(8, 8), item(6, 34)],
    createdAt: daysAgo(15),
  },
  {
    id: 4,
    reference: "ORD-1004",
    customerId: 5,
    customerName: "Evergreen Contractors",
    status: "confirmed",
    totalAmount: 11796,
    quotationId: null,
    notes: "Field service inventory",
    items: [item(9, 42), item(1, 210), item(7, 2)],
    createdAt: daysAgo(10),
  },
  {
    id: 5,
    reference: "ORD-1005",
    customerId: 6,
    customerName: "Harbor Medical",
    status: "pending",
    totalAmount: 3582,
    quotationId: null,
    notes: "Medical station supplies",
    items: [item(11, 62), item(8, 5), item(4, 28)],
    createdAt: daysAgo(6),
  },
  {
    id: 6,
    reference: "ORD-1006",
    customerId: 8,
    customerName: "Urban Craft Studio",
    status: "completed",
    totalAmount: 3150,
    quotationId: null,
    notes: "Workshop setup",
    items: [item(7, 1), item(10, 6), item(4, 64)],
    createdAt: daysAgo(2),
  },
];
const mockInvoices: JsonObject[] = [
  {
    id: 1,
    reference: "INV-1001",
    customerId: 1,
    customerName: "Acme Manufacturing",
    orderId: 1,
    status: "sent",
    totalAmount: 8640,
    dueDate: dueIn(14),
    notes: "Net 14",
    items: [item(1, 180), item(2, 48), item(5, 14)],
    createdAt: daysAgo(22),
  },
  {
    id: 2,
    reference: "INV-1002",
    customerId: 3,
    customerName: "Crescent Foods",
    orderId: 2,
    status: "paid",
    totalAmount: 6192,
    dueDate: daysAgo(3),
    notes: "Paid by ACH",
    items: [item(12, 36), item(4, 96), item(6, 12)],
    createdAt: daysAgo(19),
  },
  {
    id: 3,
    reference: "INV-1003",
    customerId: 4,
    customerName: "Delta Office Solutions",
    orderId: 3,
    status: "overdue",
    totalAmount: 8840,
    dueDate: daysAgo(2),
    notes: "Follow up this week",
    items: [item(10, 24), item(8, 8), item(6, 34)],
    createdAt: daysAgo(13),
  },
  {
    id: 4,
    reference: "INV-1004",
    customerId: 8,
    customerName: "Urban Craft Studio",
    orderId: 6,
    status: "draft",
    totalAmount: 3150,
    dueDate: dueIn(28),
    notes: "Draft pending review",
    items: [item(7, 1), item(10, 6), item(4, 64)],
    createdAt: daysAgo(1),
  },
];
const mockPurchaseOrders: JsonObject[] = [
  {
    id: 1,
    reference: "PO-1001",
    supplierId: 1,
    supplierName: "Northline Supplies",
    status: "received",
    totalAmount: 7360,
    expectedDate: daysAgo(16),
    notes: "Monthly component buy",
    items: [purchaseItem(1, 260), purchaseItem(2, 80), purchaseItem(9, 20)],
    createdAt: daysAgo(33),
  },
  {
    id: 2,
    reference: "PO-1002",
    supplierId: 2,
    supplierName: "Vector Components",
    status: "sent",
    totalAmount: 8288,
    expectedDate: dueIn(5),
    notes: "Electronics reorder",
    items: [purchaseItem(3, 18), purchaseItem(5, 55), purchaseItem(8, 8)],
    createdAt: daysAgo(12),
  },
  {
    id: 3,
    reference: "PO-1003",
    supplierId: 3,
    supplierName: "Atlas Packaging",
    status: "draft",
    totalAmount: 3060,
    expectedDate: dueIn(12),
    notes: "Packaging safety stock",
    items: [purchaseItem(4, 230), purchaseItem(6, 60)],
    createdAt: daysAgo(5),
  },
  {
    id: 4,
    reference: "PO-1004",
    supplierId: 4,
    supplierName: "Prime Office Goods",
    status: "sent",
    totalAmount: 4836,
    expectedDate: dueIn(18),
    notes: "Office and clinic supplies",
    items: [purchaseItem(10, 22), purchaseItem(11, 100)],
    createdAt: daysAgo(3),
  },
];
const mockPurchaseInvoices: JsonObject[] = [
  {
    id: 1,
    reference: "PI-1001",
    supplierId: 1,
    supplierName: "Northline Supplies",
    purchaseOrderId: 1,
    status: "paid",
    totalAmount: 7360,
    dueDate: daysAgo(1),
    notes: "Paid on receipt",
    createdAt: daysAgo(15),
  },
  {
    id: 2,
    reference: "PI-1002",
    supplierId: 2,
    supplierName: "Vector Components",
    purchaseOrderId: 2,
    status: "pending",
    totalAmount: 8288,
    dueDate: dueIn(20),
    notes: "Awaiting goods receipt",
    createdAt: daysAgo(7),
  },
  {
    id: 3,
    reference: "PI-1003",
    supplierId: 3,
    supplierName: "Atlas Packaging",
    purchaseOrderId: null,
    status: "pending",
    totalAmount: 1290,
    dueDate: dueIn(9),
    notes: "Spot purchase labels",
    createdAt: daysAgo(4),
  },
];
const mockProjects: JsonObject[] = [
  {
    id: 1,
    name: "Warehouse Barcode Rollout",
    description: "Add scan stations and product barcode flow",
    status: "active",
    priority: "high",
    startDate: "2026-05-01",
    endDate: "2026-06-28",
    budget: 18500,
    customerId: 7,
    taskCount: 4,
    completedTaskCount: 1,
    createdAt: daysAgo(31),
  },
  {
    id: 2,
    name: "Acme Line Upgrade",
    description: "Phase 1 production upgrade delivery",
    status: "active",
    priority: "high",
    startDate: "2026-05-10",
    endDate: "2026-07-15",
    budget: 42000,
    customerId: 1,
    taskCount: 4,
    completedTaskCount: 2,
    createdAt: daysAgo(23),
  },
  {
    id: 3,
    name: "Retail Launch Kit",
    description: "Opening kit for new Bright Retail branch",
    status: "planning",
    priority: "medium",
    startDate: "2026-06-05",
    endDate: "2026-07-03",
    budget: 9800,
    customerId: 2,
    taskCount: 3,
    completedTaskCount: 0,
    createdAt: daysAgo(10),
  },
];
const mockTasks: JsonObject[] = [
  {
    id: 1,
    projectId: 1,
    projectName: "Warehouse Barcode Rollout",
    title: "Audit product SKU labels",
    description: "Check SKU and label coverage for all active products",
    status: "done",
    priority: "high",
    assignedTo: 4,
    assigneeName: "Ava Chen",
    dueDate: "2026-05-24",
    createdAt: daysAgo(30),
  },
  {
    id: 2,
    projectId: 1,
    projectName: "Warehouse Barcode Rollout",
    title: "Install scanner workstations",
    description: "Set up receiving and dispatch scanner stations",
    status: "in_progress",
    priority: "high",
    assignedTo: 4,
    assigneeName: "Ava Chen",
    dueDate: "2026-06-07",
    createdAt: daysAgo(26),
  },
  {
    id: 3,
    projectId: 1,
    projectName: "Warehouse Barcode Rollout",
    title: "Train warehouse team",
    description: "Short training for receiving and cycle count flow",
    status: "todo",
    priority: "medium",
    assignedTo: 5,
    assigneeName: "Mina Hassan",
    dueDate: "2026-06-14",
    createdAt: daysAgo(20),
  },
  {
    id: 4,
    projectId: 1,
    projectName: "Warehouse Barcode Rollout",
    title: "Go-live stock reconciliation",
    description: "Compare physical count to ERP stock",
    status: "todo",
    priority: "high",
    assignedTo: 1,
    assigneeName: "Operations Manager",
    dueDate: "2026-06-24",
    createdAt: daysAgo(14),
  },
  {
    id: 5,
    projectId: 2,
    projectName: "Acme Line Upgrade",
    title: "Confirm rail kit BOM",
    description: "Validate rail and sensor quantities",
    status: "done",
    priority: "high",
    assignedTo: 2,
    assigneeName: "Nora Patel",
    dueDate: "2026-05-22",
    createdAt: daysAgo(22),
  },
  {
    id: 6,
    projectId: 2,
    projectName: "Acme Line Upgrade",
    title: "Ship first component batch",
    description: "Pick and ship bracket, rail, and sensor package",
    status: "done",
    priority: "high",
    assignedTo: 4,
    assigneeName: "Ava Chen",
    dueDate: "2026-05-29",
    createdAt: daysAgo(19),
  },
  {
    id: 7,
    projectId: 2,
    projectName: "Acme Line Upgrade",
    title: "Schedule installation support",
    description: "Coordinate technical support window",
    status: "in_progress",
    priority: "medium",
    assignedTo: 5,
    assigneeName: "Mina Hassan",
    dueDate: "2026-06-12",
    createdAt: daysAgo(11),
  },
  {
    id: 8,
    projectId: 2,
    projectName: "Acme Line Upgrade",
    title: "Issue final invoice",
    description: "Invoice after delivery confirmation",
    status: "todo",
    priority: "medium",
    assignedTo: 2,
    assigneeName: "Nora Patel",
    dueDate: "2026-06-30",
    createdAt: daysAgo(7),
  },
  {
    id: 9,
    projectId: 3,
    projectName: "Retail Launch Kit",
    title: "Approve opening kit quotation",
    description: "Confirm quantities for packaging and scanners",
    status: "todo",
    priority: "medium",
    assignedTo: 2,
    assigneeName: "Nora Patel",
    dueDate: "2026-06-06",
    createdAt: daysAgo(8),
  },
  {
    id: 10,
    projectId: 3,
    projectName: "Retail Launch Kit",
    title: "Reserve label roll stock",
    description: "Allocate enough labels for the launch shipment",
    status: "todo",
    priority: "low",
    assignedTo: 4,
    assigneeName: "Ava Chen",
    dueDate: "2026-06-10",
    createdAt: daysAgo(6),
  },
  {
    id: 11,
    projectId: 3,
    projectName: "Retail Launch Kit",
    title: "Prepare launch invoice draft",
    description: "Draft after quotation acceptance",
    status: "todo",
    priority: "medium",
    assignedTo: 2,
    assigneeName: "Nora Patel",
    dueDate: "2026-06-18",
    createdAt: daysAgo(5),
  },
];
const mockStock: JsonObject[] = [
  {
    productId: 1,
    productName: "Steel Bracket",
    sku: "STL-BR-001",
    warehouseId: 1,
    warehouseName: "Main Warehouse",
    quantity: 42,
    minimumStock: 50,
  },
  {
    productId: 2,
    productName: "Aluminum Rail Kit",
    sku: "ALU-RK-010",
    warehouseId: 1,
    warehouseName: "Main Warehouse",
    quantity: 84,
    minimumStock: 35,
  },
  {
    productId: 3,
    productName: "Control Panel Basic",
    sku: "CTL-PN-100",
    warehouseId: 1,
    warehouseName: "Main Warehouse",
    quantity: 11,
    minimumStock: 8,
  },
  {
    productId: 4,
    productName: "Thermal Label Roll",
    sku: "LBL-TR-055",
    warehouseId: 2,
    warehouseName: "East Fulfillment",
    quantity: 96,
    minimumStock: 120,
  },
  {
    productId: 5,
    productName: "Safety Sensor",
    sku: "SNS-SF-220",
    warehouseId: 1,
    warehouseName: "Main Warehouse",
    quantity: 22,
    minimumStock: 25,
  },
  {
    productId: 6,
    productName: "Packing Tape Case",
    sku: "PKG-TP-024",
    warehouseId: 2,
    warehouseName: "East Fulfillment",
    quantity: 58,
    minimumStock: 40,
  },
  {
    productId: 7,
    productName: "Ergo Workbench",
    sku: "WRK-BN-300",
    warehouseId: 1,
    warehouseName: "Main Warehouse",
    quantity: 6,
    minimumStock: 4,
  },
  {
    productId: 8,
    productName: "Barcode Scanner",
    sku: "BAR-SC-040",
    warehouseId: 3,
    warehouseName: "Service Van Stock",
    quantity: 9,
    minimumStock: 12,
  },
  {
    productId: 9,
    productName: "Hydraulic Clamp",
    sku: "HYD-CL-070",
    warehouseId: 1,
    warehouseName: "Main Warehouse",
    quantity: 30,
    minimumStock: 18,
  },
  {
    productId: 10,
    productName: "Office Chair Pro",
    sku: "OFF-CH-210",
    warehouseId: 2,
    warehouseName: "East Fulfillment",
    quantity: 13,
    minimumStock: 10,
  },
  {
    productId: 11,
    productName: "Sanitizer Dispenser",
    sku: "MED-SD-015",
    warehouseId: 2,
    warehouseName: "East Fulfillment",
    quantity: 28,
    minimumStock: 30,
  },
  {
    productId: 12,
    productName: "Cold Storage Bin",
    sku: "CLD-BN-060",
    warehouseId: 2,
    warehouseName: "East Fulfillment",
    quantity: 18,
    minimumStock: 16,
  },
];

function demoDate(date: string) {
  return new Date(`${date}T09:00:00.000Z`).toISOString();
}

function demoOrderItem(productId: number, quantity: number) {
  const product = mockProducts.find((row) => row.id === productId);
  const unitPrice = Number(product?.price ?? 0);

  return {
    productId,
    productName: String(product?.name ?? "Product"),
    quantity,
    unitPrice,
    unitCost: Number(product?.cost ?? 0),
    total: money(quantity * unitPrice),
  };
}

function demoPurchaseItem(productId: number, quantity: number) {
  const product = mockProducts.find((row) => row.id === productId);
  const unitCost = Number(product?.cost ?? 0);

  return {
    productId,
    productName: String(product?.name ?? "Product"),
    quantity,
    unitCost,
    total: money(quantity * unitCost),
  };
}

function demoTotal(items: JsonObject[]) {
  return money(items.reduce((sum, item) => sum + Number(item.total ?? 0), 0));
}

function seedRichDemoData() {
  if (mockCustomers.some((row) => row.name === "Metro Hardware")) return;

  mockCustomers.push(
    {
      id: 9,
      name: "Metro Hardware",
      email: "procurement@metro-hardware.example",
      phone: "+1 555 0109",
      company: "Metro Hardware",
      createdAt: demoDate("2026-01-08"),
    },
    {
      id: 10,
      name: "Nova Clinic Group",
      email: "ops@nova-clinic.example",
      phone: "+1 555 0110",
      company: "Nova Clinic Group",
      createdAt: demoDate("2026-01-18"),
    },
    {
      id: 11,
      name: "Pioneer Printworks",
      email: "orders@pioneer-print.example",
      phone: "+1 555 0111",
      company: "Pioneer Printworks",
      createdAt: demoDate("2026-02-02"),
    },
    {
      id: 12,
      name: "Riverfront Cafe Supplies",
      email: "supply@riverfront-cafe.example",
      phone: "+1 555 0112",
      company: "Riverfront Cafe Supplies",
      createdAt: demoDate("2026-02-21"),
    },
    {
      id: 13,
      name: "Skyline Fitout",
      email: "admin@skyline-fitout.example",
      phone: "+1 555 0113",
      company: "Skyline Fitout",
      createdAt: demoDate("2026-03-04"),
    },
    {
      id: 14,
      name: "Luma Education",
      email: "facilities@luma-education.example",
      phone: "+1 555 0114",
      company: "Luma Education",
      createdAt: demoDate("2026-03-17"),
    },
    {
      id: 15,
      name: "Orion Repair Services",
      email: "parts@orion-repair.example",
      phone: "+1 555 0115",
      company: "Orion Repair Services",
      createdAt: demoDate("2026-04-11"),
    },
    {
      id: 16,
      name: "Beacon Distribution",
      email: "sales@beacon-distribution.example",
      phone: "+1 555 0116",
      company: "Beacon Distribution",
      createdAt: demoDate("2026-05-06"),
    },
  );

  mockSuppliers.push(
    {
      id: 5,
      name: "Vertex Industrial",
      email: "sales@vertex-industrial.example",
      phone: "+1 555 0205",
      company: "Vertex Industrial",
      createdAt: demoDate("2026-01-05"),
    },
    {
      id: 6,
      name: "Mediline Supply",
      email: "orders@mediline.example",
      phone: "+1 555 0206",
      company: "Mediline Supply",
      createdAt: demoDate("2026-01-26"),
    },
    {
      id: 7,
      name: "LabelPro Materials",
      email: "team@labelpro.example",
      phone: "+1 555 0207",
      company: "LabelPro Materials",
      createdAt: demoDate("2026-02-13"),
    },
    {
      id: 8,
      name: "Workspace Direct",
      email: "accounts@workspace-direct.example",
      phone: "+1 555 0208",
      company: "Workspace Direct",
      createdAt: demoDate("2026-03-02"),
    },
    {
      id: 9,
      name: "ScanEdge Technologies",
      email: "supply@scanedge.example",
      phone: "+1 555 0209",
      company: "ScanEdge Technologies",
      createdAt: demoDate("2026-03-18"),
    },
  );

  mockProducts.push(
    {
      id: 13,
      name: "Industrial Fastener Kit",
      sku: "IND-FK-130",
      description: "Assorted fastener kit for field installations",
      price: 38,
      cost: 17,
      unit: "kit",
      minimumStock: 90,
      createdAt: demoDate("2026-01-10"),
    },
    {
      id: 14,
      name: "Compact POS Terminal",
      sku: "POS-CT-140",
      description: "Compact counter terminal for small retail branches",
      price: 420,
      cost: 255,
      unit: "pcs",
      minimumStock: 10,
      createdAt: demoDate("2026-01-22"),
    },
    {
      id: 15,
      name: "Medical Storage Tray",
      sku: "MED-ST-150",
      description: "Stackable storage tray for clinic supplies",
      price: 32,
      cost: 14,
      unit: "pcs",
      minimumStock: 70,
      createdAt: demoDate("2026-02-14"),
    },
    {
      id: 16,
      name: "Thermal Printer Pro",
      sku: "PRN-TP-160",
      description: "Thermal printer for shipping and barcode labels",
      price: 560,
      cost: 330,
      unit: "pcs",
      minimumStock: 8,
      createdAt: demoDate("2026-02-20"),
    },
    {
      id: 17,
      name: "Warehouse Safety Vest",
      sku: "SAF-VS-170",
      description: "High visibility safety vest",
      price: 24,
      cost: 9,
      unit: "pcs",
      minimumStock: 120,
      createdAt: demoDate("2026-03-09"),
    },
    {
      id: 18,
      name: "Portable Tool Cart",
      sku: "TLS-TC-180",
      description: "Mobile tool cart for repair teams",
      price: 690,
      cost: 410,
      unit: "pcs",
      minimumStock: 5,
      createdAt: demoDate("2026-03-29"),
    },
  );

  const demoOrders = [
    {
      id: 7,
      reference: "ORD-1007",
      customerId: 9,
      customerName: "Metro Hardware",
      status: "delivered",
      notes: "January branch replenishment",
      createdAt: demoDate("2026-01-12"),
      items: [
        demoOrderItem(13, 160),
        demoOrderItem(1, 120),
        demoOrderItem(17, 75),
      ],
    },
    {
      id: 8,
      reference: "ORD-1008",
      customerId: 10,
      customerName: "Nova Clinic Group",
      status: "confirmed",
      notes: "Clinic storage setup",
      createdAt: demoDate("2026-01-28"),
      items: [
        demoOrderItem(15, 95),
        demoOrderItem(11, 80),
        demoOrderItem(8, 5),
      ],
    },
    {
      id: 9,
      reference: "ORD-1009",
      customerId: 11,
      customerName: "Pioneer Printworks",
      status: "shipped",
      notes: "Print room barcode refresh",
      createdAt: demoDate("2026-02-09"),
      items: [
        demoOrderItem(16, 4),
        demoOrderItem(4, 240),
        demoOrderItem(8, 10),
      ],
    },
    {
      id: 10,
      reference: "ORD-1010",
      customerId: 12,
      customerName: "Riverfront Cafe Supplies",
      status: "delivered",
      notes: "Fulfillment shelf labels",
      createdAt: demoDate("2026-02-23"),
      items: [
        demoOrderItem(4, 320),
        demoOrderItem(6, 42),
        demoOrderItem(13, 80),
      ],
    },
    {
      id: 11,
      reference: "ORD-1011",
      customerId: 13,
      customerName: "Skyline Fitout",
      status: "confirmed",
      notes: "Office fitout wave one",
      createdAt: demoDate("2026-03-08"),
      items: [demoOrderItem(10, 36), demoOrderItem(7, 4), demoOrderItem(18, 2)],
    },
    {
      id: 12,
      reference: "ORD-1012",
      customerId: 14,
      customerName: "Luma Education",
      status: "pending",
      notes: "Campus resource room setup",
      createdAt: demoDate("2026-03-21"),
      items: [
        demoOrderItem(14, 6),
        demoOrderItem(16, 2),
        demoOrderItem(17, 160),
      ],
    },
    {
      id: 13,
      reference: "ORD-1013",
      customerId: 15,
      customerName: "Orion Repair Services",
      status: "confirmed",
      notes: "Repair van equipment",
      createdAt: demoDate("2026-04-04"),
      items: [
        demoOrderItem(18, 3),
        demoOrderItem(9, 38),
        demoOrderItem(13, 140),
      ],
    },
    {
      id: 14,
      reference: "ORD-1014",
      customerId: 16,
      customerName: "Beacon Distribution",
      status: "shipped",
      notes: "Distribution starter package",
      createdAt: demoDate("2026-04-17"),
      items: [demoOrderItem(3, 8), demoOrderItem(8, 12), demoOrderItem(4, 360)],
    },
    {
      id: 15,
      reference: "ORD-1015",
      customerId: 2,
      customerName: "Bright Retail Group",
      status: "delivered",
      notes: "Retail POS expansion",
      createdAt: demoDate("2026-05-03"),
      items: [demoOrderItem(14, 9), demoOrderItem(8, 9), demoOrderItem(16, 3)],
    },
    {
      id: 16,
      reference: "ORD-1016",
      customerId: 7,
      customerName: "Summit Logistics",
      status: "pending",
      notes: "Cold-chain scanner reserve",
      createdAt: demoDate("2026-05-12"),
      items: [
        demoOrderItem(12, 58),
        demoOrderItem(8, 14),
        demoOrderItem(5, 25),
      ],
    },
    {
      id: 17,
      reference: "ORD-1017",
      customerId: 9,
      customerName: "Metro Hardware",
      status: "confirmed",
      notes: "June fastener promotion stock",
      createdAt: demoDate("2026-06-02"),
      items: [
        demoOrderItem(13, 260),
        demoOrderItem(1, 170),
        demoOrderItem(17, 220),
      ],
    },
    {
      id: 18,
      reference: "ORD-1018",
      customerId: 10,
      customerName: "Nova Clinic Group",
      status: "pending",
      notes: "June clinic replenishment",
      createdAt: demoDate("2026-06-05"),
      items: [
        demoOrderItem(15, 130),
        demoOrderItem(11, 115),
        demoOrderItem(10, 8),
      ],
    },
  ].map((order) => ({
    ...order,
    quotationId: null,
    totalAmount: demoTotal(order.items),
  }));

  mockOrders.push(...demoOrders);

  mockInvoices.push(
    ...demoOrders
      .filter((order) => !["pending"].includes(String(order.status)))
      .slice(0, 9)
      .map((order, index) => ({
        id: 5 + index,
        reference: `INV-${String(1005 + index)}`,
        customerId: order.customerId,
        customerName: order.customerName,
        orderId: order.id,
        status: index % 4 === 0 ? "sent" : index % 5 === 0 ? "overdue" : "paid",
        totalAmount: order.totalAmount,
        dueDate: demoDate(`2026-0${Math.min(index + 2, 6)}-24`),
        notes: order.notes,
        items: cloneJsonValue(order.items),
        createdAt: order.createdAt,
      })),
  );

  mockPurchaseOrders.push(
    {
      id: 5,
      reference: "PO-1005",
      supplierId: 5,
      supplierName: "Vertex Industrial",
      status: "received",
      expectedDate: demoDate("2026-01-20"),
      notes: "Fastener and clamps restock",
      createdAt: demoDate("2026-01-09"),
      items: [
        demoPurchaseItem(13, 420),
        demoPurchaseItem(9, 90),
        demoPurchaseItem(1, 340),
      ],
    },
    {
      id: 6,
      reference: "PO-1006",
      supplierId: 6,
      supplierName: "Mediline Supply",
      status: "received",
      expectedDate: demoDate("2026-02-12"),
      notes: "Clinic storage supplies",
      createdAt: demoDate("2026-01-30"),
      items: [demoPurchaseItem(15, 300), demoPurchaseItem(11, 260)],
    },
    {
      id: 7,
      reference: "PO-1007",
      supplierId: 7,
      supplierName: "LabelPro Materials",
      status: "received",
      expectedDate: demoDate("2026-03-08"),
      notes: "Label and tape stock",
      createdAt: demoDate("2026-02-19"),
      items: [demoPurchaseItem(4, 900), demoPurchaseItem(6, 180)],
    },
    {
      id: 8,
      reference: "PO-1008",
      supplierId: 8,
      supplierName: "Workspace Direct",
      status: "sent",
      expectedDate: demoDate("2026-06-14"),
      notes: "Office furniture replenishment",
      createdAt: demoDate("2026-05-22"),
      items: [
        demoPurchaseItem(10, 90),
        demoPurchaseItem(7, 12),
        demoPurchaseItem(18, 8),
      ],
    },
    {
      id: 9,
      reference: "PO-1009",
      supplierId: 9,
      supplierName: "ScanEdge Technologies",
      status: "sent",
      expectedDate: demoDate("2026-06-18"),
      notes: "Scanner and POS pipeline",
      createdAt: demoDate("2026-06-01"),
      items: [
        demoPurchaseItem(8, 45),
        demoPurchaseItem(14, 20),
        demoPurchaseItem(16, 12),
      ],
    },
  );

  for (const order of mockPurchaseOrders.slice(4)) {
    const items = order.items as JsonObject[];
    order.totalAmount = demoTotal(items);
  }

  mockPurchaseInvoices.push(
    {
      id: 4,
      reference: "PI-1004",
      supplierId: 5,
      supplierName: "Vertex Industrial",
      purchaseOrderId: 5,
      status: "paid",
      totalAmount:
        mockPurchaseOrders.find((order) => order.id === 5)?.totalAmount ?? 0,
      dueDate: demoDate("2026-02-05"),
      notes: "Paid after January receipt",
      createdAt: demoDate("2026-01-21"),
    },
    {
      id: 5,
      reference: "PI-1005",
      supplierId: 7,
      supplierName: "LabelPro Materials",
      purchaseOrderId: 7,
      status: "paid",
      totalAmount:
        mockPurchaseOrders.find((order) => order.id === 7)?.totalAmount ?? 0,
      dueDate: demoDate("2026-03-21"),
      notes: "March label stock invoice",
      createdAt: demoDate("2026-03-09"),
    },
    {
      id: 6,
      reference: "PI-1006",
      supplierId: 9,
      supplierName: "ScanEdge Technologies",
      purchaseOrderId: 9,
      status: "pending",
      totalAmount:
        mockPurchaseOrders.find((order) => order.id === 9)?.totalAmount ?? 0,
      dueDate: demoDate("2026-06-28"),
      notes: "Pending receipt verification",
      createdAt: demoDate("2026-06-02"),
    },
  );

  mockStock.push(
    {
      productId: 13,
      productName: "Industrial Fastener Kit",
      sku: "IND-FK-130",
      warehouseId: 1,
      warehouseName: "Main Warehouse",
      quantity: 64,
      minimumStock: 90,
    },
    {
      productId: 14,
      productName: "Compact POS Terminal",
      sku: "POS-CT-140",
      warehouseId: 2,
      warehouseName: "East Fulfillment",
      quantity: 7,
      minimumStock: 10,
    },
    {
      productId: 15,
      productName: "Medical Storage Tray",
      sku: "MED-ST-150",
      warehouseId: 2,
      warehouseName: "East Fulfillment",
      quantity: 210,
      minimumStock: 70,
    },
    {
      productId: 16,
      productName: "Thermal Printer Pro",
      sku: "PRN-TP-160",
      warehouseId: 1,
      warehouseName: "Main Warehouse",
      quantity: 6,
      minimumStock: 8,
    },
    {
      productId: 17,
      productName: "Warehouse Safety Vest",
      sku: "SAF-VS-170",
      warehouseId: 1,
      warehouseName: "Main Warehouse",
      quantity: 92,
      minimumStock: 120,
    },
    {
      productId: 18,
      productName: "Portable Tool Cart",
      sku: "TLS-TC-180",
      warehouseId: 3,
      warehouseName: "Service Van Stock",
      quantity: 4,
      minimumStock: 5,
    },
  );

  mockProjects.push({
    id: 4,
    name: "June Demo Data Readiness",
    description:
      "Prepare dashboard, reports, and screenshots for committee review",
    status: "active",
    priority: "high",
    startDate: "2026-06-01",
    endDate: "2026-06-12",
    budget: 6200,
    customerId: 1,
    taskCount: 3,
    completedTaskCount: 1,
    createdAt: demoDate("2026-06-01"),
  });

  mockTasks.push(
    {
      id: 12,
      projectId: 4,
      projectName: "June Demo Data Readiness",
      title: "Capture dashboard screenshots",
      description: "Capture full dashboard in light and dark mode",
      status: "in_progress",
      priority: "high",
      assignedTo: 1,
      assigneeName: "Operations Manager",
      dueDate: "2026-06-07",
      createdAt: demoDate("2026-06-02"),
    },
    {
      id: 13,
      projectId: 4,
      projectName: "June Demo Data Readiness",
      title: "Verify reports export",
      description: "Generate sales, purchases, and inventory report files",
      status: "done",
      priority: "medium",
      assignedTo: 6,
      assigneeName: "Omar Yilmaz",
      dueDate: "2026-06-08",
      createdAt: demoDate("2026-06-02"),
    },
    {
      id: 14,
      projectId: 4,
      projectName: "June Demo Data Readiness",
      title: "Review Swagger API examples",
      description: "Open Swagger UI and prepare API demonstration endpoints",
      status: "todo",
      priority: "medium",
      assignedTo: 3,
      assigneeName: "Ahmed Shablak",
      dueDate: "2026-06-10",
      createdAt: demoDate("2026-06-03"),
    },
  );
}

seedRichDemoData();

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

function projectTasksPath(path: string) {
  const match = path.match(/^\/api\/projects\/(\d+)\/tasks$/);
  if (!match) return null;

  const projectId = Number(match[1]);
  return Number.isFinite(projectId) ? projectId : null;
}

function refreshProjectTaskCounts(projectId: number) {
  const project = mockProjects.find((row) => row.id === projectId);
  if (!project) return;

  const projectTasks = mockTasks.filter((task) => task.projectId === projectId);
  project.taskCount = projectTasks.length;
  project.completedTaskCount = projectTasks.filter(
    (task) => task.status === "done",
  ).length;
}

function withDefaults(
  basePath: string,
  body: Record<string, unknown>,
  id: number,
): JsonObject {
  const created: JsonObject = {
    id,
    createdAt: now(),
    ...(body as JsonObject),
  };

  if (basePath === "/api/quotations" || basePath === "/api/orders") {
    created.reference ??= `${basePath === "/api/quotations" ? "QUO" : "ORD"}-${String(id).padStart(4, "0")}`;
    created.customerName ??=
      mockCustomers.find((customer) => customer.id === created.customerId)
        ?.name ?? "Customer";
    created.status ??= "pending";
    created.totalAmount ??= 0;
    created.items ??= [];
  }

  if (basePath === "/api/invoices") {
    created.reference ??= `INV-${String(id).padStart(4, "0")}`;
    created.customerName ??=
      mockCustomers.find((customer) => customer.id === created.customerId)
        ?.name ?? "Customer";
    created.status ??= "draft";
    created.totalAmount ??= 0;
    created.items ??= [];
  }

  if (
    basePath === "/api/purchase-orders" ||
    basePath === "/api/purchase-invoices"
  ) {
    created.reference ??= `${basePath === "/api/purchase-orders" ? "PO" : "PI"}-${String(id).padStart(4, "0")}`;
    created.supplierName ??=
      mockSuppliers.find((supplier) => supplier.id === created.supplierId)
        ?.name ?? "Supplier";
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
    created.projectName ??=
      mockProjects.find((project) => project.id === created.projectId)?.name ??
      "Project";
    created.assigneeName ??=
      mockUsers.find((user) => user.id === created.assignedTo)?.name ?? null;
  }

  if (basePath === "/api/users") {
    const password = String(created.password ?? "");
    if (password) created.passwordHash = hashMockPassword(password);
    delete created.password;
  }

  return created;
}

function cloneJsonValue(value: JsonValue): JsonValue {
  return JSON.parse(JSON.stringify(value)) as JsonValue;
}

function convertMockQuotationToOrder(id: number) {
  const quotation = mockQuotations.find((row) => row.id === id);
  if (!quotation) return null;

  const orderId = nextId(mockOrders);
  const order: JsonObject = {
    id: orderId,
    reference: `ORD-${String(orderId).padStart(4, "0")}`,
    customerId: quotation.customerId,
    customerName: quotation.customerName,
    status: "confirmed",
    totalAmount: quotation.totalAmount,
    quotationId: quotation.id,
    notes: quotation.notes,
    items: cloneJsonValue(quotation.items),
    createdAt: now(),
  };

  quotation.status = "accepted";
  mockOrders.unshift(order);
  return order;
}

function createMockInvoiceFromOrder(id: number) {
  const order = mockOrders.find((row) => row.id === id);
  if (!order) return null;

  const invoiceId = nextId(mockInvoices);
  const invoice: JsonObject = {
    id: invoiceId,
    reference: `INV-${String(invoiceId).padStart(4, "0")}`,
    customerId: order.customerId,
    customerName: order.customerName,
    orderId: order.id,
    status: "draft",
    totalAmount: order.totalAmount,
    dueDate: dueIn(28),
    notes: order.notes,
    items: cloneJsonValue(order.items),
    createdAt: now(),
  };

  order.status = "delivered";
  mockInvoices.unshift(invoice);
  return invoice;
}

function receiveMockPurchaseOrder(id: number) {
  const purchaseOrder = mockPurchaseOrders.find((row) => row.id === id);
  if (!purchaseOrder) return null;

  const items = Array.isArray(purchaseOrder.items) ? purchaseOrder.items : [];

  for (const rawItem of items) {
    const item = rawItem as JsonObject;
    const productId = Number(item.productId);
    const quantity = Number(item.quantity);
    const existingStock = mockStock.find((row) => row.productId === productId);

    if (existingStock) {
      existingStock.quantity = Number(existingStock.quantity) + quantity;
      continue;
    }

    const product = mockProducts.find((row) => row.id === productId);
    mockStock.push({
      productId,
      productName: String(item.productName ?? product?.name ?? "Product"),
      sku: String(product?.sku ?? ""),
      warehouseId: 1,
      warehouseName: "Main Warehouse",
      quantity,
      minimumStock: Number(product?.minimumStock ?? 0),
    });
  }

  purchaseOrder.status = "received";
  return purchaseOrder;
}

function sendJson(res: ServerResponse, data: JsonValue, status = 200) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(data));
}

function htmlEscape(value: TableCell) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function assetDataUri(filePath: string) {
  try {
    const data = fs.readFileSync(filePath);
    return `data:image/png;base64,${data.toString("base64")}`;
  } catch {
    return "";
  }
}

function paethPredictor(left: number, above: number, upperLeft: number) {
  const estimate = left + above - upperLeft;
  const leftDistance = Math.abs(estimate - left);
  const aboveDistance = Math.abs(estimate - above);
  const upperLeftDistance = Math.abs(estimate - upperLeft);

  if (leftDistance <= aboveDistance && leftDistance <= upperLeftDistance) {
    return left;
  }

  return aboveDistance <= upperLeftDistance ? above : upperLeft;
}

function readPngImage(filePath: string): PngImage | null {
  try {
    const file = fs.readFileSync(filePath);
    let offset = 8;
    let width = 0;
    let height = 0;
    let colorType = 0;
    const idatChunks: Buffer[] = [];

    while (offset < file.length) {
      const length = file.readUInt32BE(offset);
      const type = file.subarray(offset + 4, offset + 8).toString("ascii");
      const data = file.subarray(offset + 8, offset + 8 + length);
      offset += length + 12;

      if (type === "IHDR") {
        width = data.readUInt32BE(0);
        height = data.readUInt32BE(4);
        colorType = data[9];
      } else if (type === "IDAT") {
        idatChunks.push(data);
      } else if (type === "IEND") {
        break;
      }
    }

    if (!width || !height || colorType !== 6) return null;

    const inflated = zlib.inflateSync(Buffer.concat(idatChunks));
    const bytesPerPixel = 4;
    const stride = width * bytesPerPixel;
    const rgba = Buffer.alloc(height * stride);
    let inputOffset = 0;

    for (let y = 0; y < height; y++) {
      const filter = inflated[inputOffset++];
      const rowStart = y * stride;

      for (let x = 0; x < stride; x++) {
        const raw = inflated[inputOffset++];
        const left =
          x >= bytesPerPixel ? rgba[rowStart + x - bytesPerPixel] : 0;
        const above = y > 0 ? rgba[rowStart + x - stride] : 0;
        const upperLeft =
          y > 0 && x >= bytesPerPixel
            ? rgba[rowStart + x - stride - bytesPerPixel]
            : 0;

        let value = raw;
        if (filter === 1) value = raw + left;
        if (filter === 2) value = raw + above;
        if (filter === 3) value = raw + Math.floor((left + above) / 2);
        if (filter === 4) value = raw + paethPredictor(left, above, upperLeft);
        rgba[rowStart + x] = value & 0xff;
      }
    }

    const rgb = Buffer.alloc(width * height * 3);
    const alpha = Buffer.alloc(width * height);
    for (let i = 0, rgbIndex = 0, alphaIndex = 0; i < rgba.length; i += 4) {
      rgb[rgbIndex++] = rgba[i];
      rgb[rgbIndex++] = rgba[i + 1];
      rgb[rgbIndex++] = rgba[i + 2];
      alpha[alphaIndex++] = rgba[i + 3];
    }

    return { width, height, rgb, alpha };
  } catch {
    return null;
  }
}

function parseNumber(value: TableCell) {
  if (typeof value === "number") return value;
  const parsed = Number(String(value).replace(/[^0-9.-]/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
}

function chartData(sections: ExportSection[]) {
  const detailSections = sections.filter(
    (section) => section.title !== "Summary",
  );
  const trendSource =
    detailSections.find((section) => section.title.includes("Over Time")) ??
    detailSections[0];
  const breakdownSource =
    detailSections.find((section) => section.title.startsWith("Top")) ??
    detailSections[detailSections.length - 1];

  const trend: ChartPoint[] =
    trendSource?.rows.slice(0, 12).map((row) => ({
      label: String(row[0] ?? ""),
      value: parseNumber(row[row.length - 1] ?? 0),
      secondary:
        row.length > 3 ? parseNumber(row[row.length - 2] ?? 0) : undefined,
    })) ?? [];

  const breakdown: ChartSlice[] =
    breakdownSource?.rows
      .slice(0, 6)
      .map((row) => ({
        label: String(row[0] ?? ""),
        value: parseNumber(row[row.length - 1] ?? 0),
      }))
      .filter((row) => row.value > 0) ?? [];

  return { trend, breakdown };
}

function metricRows(sections: ExportSection[]) {
  return sections.find((section) => section.title === "Summary")?.rows ?? [];
}

function renderLineSvg(points: ChartPoint[]) {
  if (!points.length) return "";

  const width = 720;
  const height = 260;
  const left = 52;
  const top = 24;
  const chartWidth = width - 86;
  const chartHeight = height - 74;
  const max = Math.max(...points.map((point) => point.value), 1);
  const step =
    points.length > 1 ? chartWidth / (points.length - 1) : chartWidth;
  const coords = points.map((point, index) => {
    const x = left + index * step;
    const y = top + chartHeight - (point.value / max) * chartHeight;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });

  return `<svg width="720" height="260" viewBox="0 0 720 260" xmlns="http://www.w3.org/2000/svg">
    <rect width="720" height="260" rx="14" fill="${brand.soft}" />
    <line x1="${left}" y1="${top + chartHeight}" x2="${left + chartWidth}" y2="${top + chartHeight}" stroke="${brand.border}" />
    <line x1="${left}" y1="${top}" x2="${left}" y2="${top + chartHeight}" stroke="${brand.border}" />
    ${[0.25, 0.5, 0.75, 1]
      .map((ratio) => {
        const y = top + chartHeight - ratio * chartHeight;
        return `<line x1="${left}" y1="${y}" x2="${left + chartWidth}" y2="${y}" stroke="${brand.border}" stroke-dasharray="4 5" opacity="0.8" />`;
      })
      .join("")}
    <polyline points="${coords.join(" ")}" fill="none" stroke="${brand.teal}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" />
    ${points
      .map((point, index) => {
        const [x, y] = coords[index].split(",");
        return `<circle cx="${x}" cy="${y}" r="5" fill="${brand.navy}" /><text x="${x}" y="${height - 24}" font-size="11" text-anchor="middle" fill="#52616f">${htmlEscape(point.label)}</text>`;
      })
      .join("")}
  </svg>`;
}

function renderDistributionSvg(rows: ChartSlice[]) {
  if (!rows.length) return "";

  const total = rows.reduce((sum, row) => sum + row.value, 0) || 1;
  const colors = [
    brand.navy,
    brand.teal,
    brand.gold,
    "#6d8db3",
    "#9ad9cf",
    "#d97f59",
  ];
  let offset = 25;
  const radius = 15.9155;
  const bars = rows
    .map((row, index) => {
      const percentage = (row.value / total) * 100;
      const segment = `<circle r="${radius}" cx="90" cy="90" fill="transparent" stroke="${colors[index % colors.length]}" stroke-width="32" stroke-dasharray="${percentage} ${100 - percentage}" stroke-dashoffset="${offset}" transform="rotate(-90 90 90)" />`;
      offset -= percentage;
      const y = 28 + index * 28;
      return `${segment}<rect x="230" y="${y - 10}" width="12" height="12" fill="${colors[index % colors.length]}" rx="2" /><text x="250" y="${y}" font-size="13" fill="#263746">${htmlEscape(row.label)} (${percentage.toFixed(1)}%)</text>`;
    })
    .join("");

  return `<svg width="720" height="230" viewBox="0 0 720 230" xmlns="http://www.w3.org/2000/svg">
    <rect width="720" height="230" rx="14" fill="${brand.soft}" />
    <circle r="46" cx="90" cy="90" fill="none" stroke="${brand.border}" stroke-width="32" />
    ${bars}
    <text x="90" y="98" font-size="17" text-anchor="middle" font-weight="700" fill="${brand.navy}">Mix</text>
  </svg>`;
}

function renderExcelHtml(title: string, sections: ExportSection[]) {
  const icon = assetDataUri(iconPath);
  const metrics = metricRows(sections);
  const { trend, breakdown } = chartData(sections);
  const generatedAt = new Date().toLocaleDateString("en-US");
  const tables = sections
    .map(
      (section) => `
        <section class="report-section">
          <h2>${htmlEscape(section.title)}</h2>
          <table>
          <thead>
            <tr>${section.headers.map((h) => `<th>${htmlEscape(h)}</th>`).join("")}</tr>
          </thead>
          <tbody>
            ${section.rows
              .map(
                (row) =>
                  `<tr>${row.map((cell) => `<td>${htmlEscape(cell)}</td>`).join("")}</tr>`,
              )
              .join("")}
          </tbody>
          </table>
        </section>`,
    )
    .join("");

  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <style>
    body { margin: 0; background: #eef3f7; color: #263746; font-family: Arial, sans-serif; }
    .page { width: 980px; margin: 0 auto; background: #ffffff; padding: 32px; }
    .header { background: ${brand.navy}; color: #ffffff; padding: 24px 28px; border-radius: 16px; display: flex; align-items: center; justify-content: space-between; }
    .brand { display: flex; gap: 14px; align-items: center; }
    .brand img { width: 52px; height: 52px; border-radius: 12px; background: #ffffff; }
    .brand-mark { width: 52px; height: 52px; border-radius: 12px; background: ${brand.teal}; color: #ffffff; display: inline-flex; align-items: center; justify-content: center; font-weight: 700; font-size: 24px; }
    h1 { font-size: 26px; margin: 0; }
    .subtitle { margin: 4px 0 0; color: #d8e7f2; font-size: 13px; }
    .generated { font-size: 12px; color: #d8e7f2; text-align: right; }
    .metrics { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; margin: 24px 0; }
    .metric { background: ${brand.soft}; border: 1px solid ${brand.border}; border-radius: 14px; padding: 16px; }
    .metric-label { color: #667789; font-size: 11px; text-transform: uppercase; letter-spacing: .04em; }
    .metric-value { margin-top: 7px; color: ${brand.navy}; font-size: 24px; font-weight: 700; }
    .charts { display: grid; grid-template-columns: 1fr; gap: 18px; margin-bottom: 24px; }
    .chart-card { border: 1px solid ${brand.border}; border-radius: 16px; padding: 18px; }
    h2 { font-size: 16px; margin: 0 0 12px; color: ${brand.navy}; }
    table { width: 100%; border-collapse: separate; border-spacing: 0; margin-bottom: 20px; border: 1px solid ${brand.border}; border-radius: 12px; overflow: hidden; }
    th, td { padding: 10px 12px; text-align: left; border-bottom: 1px solid ${brand.border}; }
    th { background: ${brand.navy}; color: #ffffff; font-size: 11px; text-transform: uppercase; letter-spacing: .04em; }
    td { font-size: 13px; }
    tr:nth-child(even) td { background: #f9fbfd; }
  </style>
</head>
<body>
  <main class="page">
    <header class="header">
      <div class="brand">
        ${icon ? `<img src="${icon}" alt="${brand.name}" />` : `<span class="brand-mark">K</span>`}
        <div>
          <h1>${htmlEscape(title)}</h1>
          <p class="subtitle">${brand.name} - ${brand.subtitle}</p>
        </div>
      </div>
      <div class="generated">Generated<br />${generatedAt}</div>
    </header>
    <section class="metrics">
      ${metrics
        .map(
          (row) =>
            `<div class="metric"><div class="metric-label">${htmlEscape(row[0])}</div><div class="metric-value">${htmlEscape(row[1])}</div></div>`,
        )
        .join("")}
    </section>
    <section class="charts">
      ${trend.length ? `<div class="chart-card"><h2>Trend Graph</h2>${renderLineSvg(trend)}</div>` : ""}
      ${breakdown.length ? `<div class="chart-card"><h2>Distribution Graph</h2>${renderDistributionSvg(breakdown)}</div>` : ""}
    </section>
    ${tables}
  </main>
</body>
</html>`;
}

function pdfSafeText(value: TableCell) {
  return String(value)
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\x20-\x7e]/g, "?");
}

function pdfText(value: TableCell) {
  return `(${pdfSafeText(value).replace(/[\\()]/g, "\\$&")})`;
}

function renderPdf(title: string, sections: ExportSection[]) {
  const metrics = metricRows(sections);
  const { trend, breakdown } = chartData(sections);
  const iconImage = readPngImage(iconPath);
  const imageObjectNumber = iconImage ? 5 : null;
  const alphaObjectNumber = iconImage ? 6 : null;
  const firstPageObjectNumber = iconImage ? 7 : 5;
  const pages = [sections];

  const objects: string[] = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    `<< /Type /Pages /Kids [${pages.map((_, i) => `${firstPageObjectNumber + i * 2} 0 R`).join(" ")}] /Count ${pages.length} >>`,
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>",
  ];

  if (iconImage && imageObjectNumber && alphaObjectNumber) {
    const rgb = zlib.deflateSync(iconImage.rgb).toString("hex");
    const alpha = zlib.deflateSync(iconImage.alpha).toString("hex");
    objects.push(
      `<< /Type /XObject /Subtype /Image /Width ${iconImage.width} /Height ${iconImage.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /SMask ${alphaObjectNumber} 0 R /Filter [/ASCIIHexDecode /FlateDecode] /Length ${rgb.length + 1} >>\nstream\n${rgb}>\nendstream`,
    );
    objects.push(
      `<< /Type /XObject /Subtype /Image /Width ${iconImage.width} /Height ${iconImage.height} /ColorSpace /DeviceGray /BitsPerComponent 8 /Filter [/ASCIIHexDecode /FlateDecode] /Length ${alpha.length + 1} >>\nstream\n${alpha}>\nendstream`,
    );
  }

  pages.forEach((pageSections, index) => {
    const pageObjectNumber = firstPageObjectNumber + index * 2;
    const contentObjectNumber = pageObjectNumber + 1;
    const imageResources = imageObjectNumber
      ? `/XObject << /ImLogo ${imageObjectNumber} 0 R >>`
      : "";
    const commands: string[] = [];
    const text = (
      value: TableCell,
      x: number,
      y: number,
      size = 10,
      bold = false,
      color = "#263746",
    ) => {
      fill(color);
      commands.push(
        `BT /${bold ? "F2" : "F1"} ${size} Tf ${x} ${y} Td ${pdfText(value)} Tj ET`,
      );
    };
    const fill = (hex: string) => {
      const color = hex
        .replace("#", "")
        .match(/.{1,2}/g)
        ?.map((part) => parseInt(part, 16) / 255) ?? [0, 0, 0];
      commands.push(`${color.map((v) => v.toFixed(3)).join(" ")} rg`);
    };
    const stroke = (hex: string) => {
      const color = hex
        .replace("#", "")
        .match(/.{1,2}/g)
        ?.map((part) => parseInt(part, 16) / 255) ?? [0, 0, 0];
      commands.push(`${color.map((v) => v.toFixed(3)).join(" ")} RG`);
    };
    const rect = (x: number, y: number, w: number, h: number, hex: string) => {
      fill(hex);
      commands.push(`${x} ${y} ${w} ${h} re f`);
    };

    if (index === 0) {
      rect(38, 704, 536, 58, brand.navy);
      if (imageObjectNumber) {
        rect(50, 714, 54, 40, "#ffffff");
        commands.push("q 49 0 0 40 53 714 cm /ImLogo Do Q");
      } else {
        rect(50, 714, 54, 40, "#ffffff");
        rect(59, 720, 32, 28, brand.teal);
        text("K", 70, 729, 18, true, "#ffffff");
      }
      text(title, 118, 737, 20, true, "#ffffff");
      text(`${brand.name} - ${brand.subtitle}`, 118, 718, 9, false, "#d8e7f2");
      text(
        `Generated ${new Date().toISOString().slice(0, 10)}`,
        452,
        727,
        9,
        false,
        "#d8e7f2",
      );

      const metricWidth = 168;
      metrics.slice(0, 3).forEach((row, metricIndex) => {
        const x = 38 + metricIndex * (metricWidth + 16);
        rect(x, 650, metricWidth, 40, brand.soft);
        stroke(brand.border);
        commands.push(`${x} 650 ${metricWidth} 40 re S`);
        text(row[0], x + 10, 674, 8);
        text(row[1], x + 10, 657, 15, true);
      });

      if (trend.length) {
        text("Detailed Trend Graph", 38, 620, 12, true);
        rect(38, 455, 250, 150, "#ffffff");
        stroke(brand.border);
        commands.push("38 455 250 150 re S");
        const max = Math.max(...trend.map((point) => point.value), 1);
        const coords = trend.map((point, pointIndex) => {
          const x = 56 + pointIndex * (210 / Math.max(trend.length - 1, 1));
          const y = 475 + (point.value / max) * 108;
          return { x, y, label: point.label };
        });
        stroke(brand.teal);
        commands.push("2.2 w");
        coords.forEach((point, pointIndex) => {
          commands.push(
            `${point.x.toFixed(1)} ${point.y.toFixed(1)} ${pointIndex === 0 ? "m" : "l"}`,
          );
        });
        commands.push("S");
        fill(brand.navy);
        coords.forEach((point) =>
          commands.push(`${point.x - 2} ${point.y - 2} 4 4 re f`),
        );
        coords
          .slice(0, 6)
          .forEach((point) => text(point.label, point.x - 10, 462, 6));
      }

      if (breakdown.length) {
        text("Distribution Graph", 322, 620, 12, true);
        const max = Math.max(...breakdown.map((row) => row.value), 1);
        breakdown.forEach((row, rowIndex) => {
          const y = 582 - rowIndex * 22;
          text(row.label.slice(0, 26), 322, y + 4, 8);
          rect(
            430,
            y,
            (row.value / max) * 120,
            10,
            rowIndex % 2 ? brand.gold : brand.teal,
          );
          text(String(row.value), 555, y + 2, 7);
        });
      }
    }

    const truncate = (value: TableCell, maxLength: number) => {
      const textValue = String(value);
      return textValue.length > maxLength
        ? `${textValue.slice(0, maxLength - 3)}...`
        : textValue;
    };
    const drawTable = (section: ExportSection, startY: number) => {
      const tableX = 38;
      const tableWidth = 536;
      const columnWidth = tableWidth / section.headers.length;
      const rowHeight = 18;
      let rowY = startY;

      text(section.title, tableX, rowY, 11, true, brand.navy);
      rowY -= 22;
      rect(tableX, rowY, tableWidth, rowHeight, brand.navy);
      section.headers.forEach((header, headerIndex) => {
        text(
          truncate(header, 18),
          tableX + headerIndex * columnWidth + 6,
          rowY + 5,
          7,
          true,
          "#ffffff",
        );
      });
      rowY -= rowHeight;

      section.rows.slice(0, 12).forEach((row, rowIndex) => {
        rect(
          tableX,
          rowY,
          tableWidth,
          rowHeight,
          rowIndex % 2 === 0 ? "#ffffff" : brand.soft,
        );
        stroke(brand.border);
        commands.push(`${tableX} ${rowY} ${tableWidth} ${rowHeight} re S`);
        row.forEach((cell, cellIndex) => {
          text(
            truncate(cell, cellIndex === 0 ? 24 : 16),
            tableX + cellIndex * columnWidth + 6,
            rowY + 5,
            7,
          );
        });
        rowY -= rowHeight;
      });

      return rowY - 16;
    };

    let y = index === 0 ? 420 : 742;
    pageSections.forEach((section) => {
      if (y > 90) y = drawTable(section, y);
    });

    const content = commands.join("\n");

    objects.push(
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> ${imageResources} >> /Contents ${contentObjectNumber} 0 R >>`,
    );
    objects.push(
      `<< /Length ${Buffer.byteLength(content)} >>\nstream\n${content}\nendstream`,
    );
  });

  let pdf = "%PDF-1.4\n";
  const offsets = [0];
  objects.forEach((object, index) => {
    offsets.push(Buffer.byteLength(pdf));
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });

  const xrefOffset = Buffer.byteLength(pdf);
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  pdf += offsets
    .slice(1)
    .map((offset) => `${offset.toString().padStart(10, "0")} 00000 n \n`)
    .join("");
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  return Buffer.from(pdf);
}

function sendReportExport(
  res: ServerResponse,
  reportType: "sales" | "inventory" | "purchases",
  format: ExportFormat,
  title: string,
  sections: ExportSection[],
) {
  const fileBase = `${reportType}-report-${new Date().toISOString().slice(0, 10)}`;

  if (format === "pdf") {
    res.statusCode = 200;
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${fileBase}.pdf"`,
    );
    res.end(renderPdf(title, sections));
    return;
  }

  res.statusCode = 200;
  res.setHeader("Content-Type", "application/vnd.ms-excel");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="${fileBase}.xls"`,
  );
  res.end(renderExcelHtml(title, sections));
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

function total(rows: JsonObject[], key: string) {
  return rows.reduce((sum, row) => sum + Number(row[key] ?? 0), 0);
}

function productSales() {
  const rows = new Map<number, JsonObject>();

  for (const order of mockOrders) {
    for (const rawItem of (order.items as JsonObject[] | undefined) ?? []) {
      const productId = Number(rawItem.productId);
      const existing = rows.get(productId);
      rows.set(productId, {
        productId,
        productName: rawItem.productName,
        sku:
          mockProducts.find((product) => product.id === productId)?.sku ??
          "SKU",
        quantitySold:
          Number(existing?.quantitySold ?? 0) + Number(rawItem.quantity ?? 0),
        totalRevenue:
          Number(existing?.totalRevenue ?? 0) + Number(rawItem.total ?? 0),
      });
    }
  }

  return [...rows.values()]
    .sort((a, b) => Number(b.totalRevenue) - Number(a.totalRevenue))
    .slice(0, 6);
}

function parseMockDateBoundary(
  value: string | null,
  boundary: "start" | "end",
) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    if (boundary === "start") date.setHours(0, 0, 0, 0);
    else date.setHours(23, 59, 59, 999);
  }

  return date;
}

function inMockDateRange(
  value: JsonValue | undefined,
  from: Date | null,
  to: Date | null,
) {
  const time = new Date(String(value)).getTime();
  if (Number.isNaN(time)) return false;
  if (from && time < from.getTime()) return false;
  if (to && time > to.getTime()) return false;
  return true;
}

function mockNumberParam(
  searchParams: URLSearchParams | undefined,
  key: string,
) {
  const value = searchParams?.get(key);
  const numberValue = value ? Number(value) : null;
  return numberValue != null && Number.isFinite(numberValue) && numberValue > 0
    ? numberValue
    : null;
}

function applyMockListQuery(
  rows: JsonObject[],
  searchParams: URLSearchParams,
  searchFields: string[],
  sortFields: Record<string, string>,
) {
  const search = searchParams.get("search")?.trim().toLowerCase();
  const status = searchParams.get("status");
  const customerId = mockNumberParam(searchParams, "customerId");
  const supplierId = mockNumberParam(searchParams, "supplierId");
  const requestedLimit = Number(searchParams.get("limit") ?? 100);
  const limit = Number.isFinite(requestedLimit)
    ? Math.min(Math.max(Math.floor(requestedLimit), 1), 500)
    : 100;
  const sortBy = searchParams.get("sortBy") ?? "createdAt";
  const sortOrder = searchParams.get("sortOrder") === "asc" ? 1 : -1;

  let next = rows;
  if (status) next = next.filter((row) => row.status === status);
  if (customerId)
    next = next.filter((row) => Number(row.customerId) === customerId);
  if (supplierId)
    next = next.filter((row) => Number(row.supplierId) === supplierId);
  if (search) {
    next = next.filter((row) =>
      searchFields.some((field) =>
        String(row[field] ?? "")
          .toLowerCase()
          .includes(search),
      ),
    );
  }

  const field = sortFields[sortBy] ?? sortFields.createdAt ?? sortFields.name;
  if (field) {
    next = [...next].sort((a, b) => {
      const left = a[field] ?? "";
      const right = b[field] ?? "";
      const leftTime = new Date(String(left)).getTime();
      const rightTime = new Date(String(right)).getTime();
      if (!Number.isNaN(leftTime) && !Number.isNaN(rightTime)) {
        return (leftTime - rightTime) * sortOrder;
      }
      if (typeof left === "number" && typeof right === "number") {
        return (left - right) * sortOrder;
      }
      return String(left).localeCompare(String(right)) * sortOrder;
    });
  }

  return next.slice(0, limit);
}

function salesReport(searchParams?: URLSearchParams) {
  const from = parseMockDateBoundary(
    searchParams?.get("from") ?? null,
    "start",
  );
  const to = parseMockDateBoundary(searchParams?.get("to") ?? null, "end");
  const customerId = mockNumberParam(searchParams, "customerId");
  const orders = mockOrders.filter(
    (order) =>
      inMockDateRange(order.createdAt, from, to) &&
      (!customerId || Number(order.customerId) === customerId),
  );
  const invoices = mockInvoices.filter(
    (invoice) =>
      inMockDateRange(invoice.createdAt, from, to) &&
      (!customerId || Number(invoice.customerId) === customerId),
  );
  const invoicedOrderIds = new Set(
    invoices
      .map((invoice) => Number(invoice.orderId))
      .filter((orderId) => Number.isFinite(orderId) && orderId > 0),
  );
  const salesDocuments = [
    ...invoices.map((invoice) => ({
      customerId: Number(invoice.customerId),
      createdAt: invoice.createdAt,
      totalAmount: Number(invoice.totalAmount ?? 0),
    })),
    ...orders
      .filter((order) => !invoicedOrderIds.has(Number(order.id)))
      .map((order) => ({
        customerId: Number(order.customerId),
        createdAt: order.createdAt,
        totalAmount: Number(order.totalAmount ?? 0),
      })),
  ];
  const byMonth = new Map<
    string,
    { date: string; ordersCount: number; revenue: number }
  >();
  const byCustomer = new Map<number, JsonObject>();

  for (const order of orders) {
    const date = String(order.createdAt).slice(0, 7);
    const month = byMonth.get(date) ?? { date, ordersCount: 0, revenue: 0 };
    month.ordersCount += 1;
    byMonth.set(date, month);
  }

  for (const document of salesDocuments) {
    const date = String(document.createdAt).slice(0, 7);
    const month = byMonth.get(date) ?? { date, ordersCount: 0, revenue: 0 };
    month.revenue += document.totalAmount;
    byMonth.set(date, month);

    const customerId = Number(document.customerId);
    const customer = byCustomer.get(customerId) ?? {
      customerId,
      customerName:
        mockCustomers.find((row) => row.id === customerId)?.name ?? "Customer",
      totalSpent: 0,
      ordersCount: 0,
    };
    customer.totalSpent = money(
      Number(customer.totalSpent) + document.totalAmount,
    );
    byCustomer.set(customerId, customer);
  }

  for (const order of orders) {
    const customerId = Number(order.customerId);
    const customer = byCustomer.get(customerId);
    if (!customer) continue;
    customer.ordersCount = Number(customer.ordersCount) + 1;
    byCustomer.set(customerId, customer);
  }

  return {
    totalRevenue: money(
      salesDocuments.reduce((sum, document) => sum + document.totalAmount, 0),
    ),
    totalOrders: orders.length,
    rows: [...byMonth.values()]
      .sort((a, b) => a.date.localeCompare(b.date))
      .map((row) => ({
        ...row,
        revenue: money(row.revenue),
      })),
    topCustomers: [...byCustomer.values()].sort(
      (a, b) => Number(b.totalSpent) - Number(a.totalSpent),
    ),
  };
}

function inventoryReport(searchParams?: URLSearchParams) {
  const productId = mockNumberParam(searchParams, "productId");
  const products = productId
    ? mockProducts.filter((product) => product.id === productId)
    : mockProducts;
  const rows = products.map((product) => {
    const productStock = mockStock.filter(
      (stock) => stock.productId === product.id,
    );
    const totalStock = productStock.reduce(
      (sum, stock) => sum + Number(stock.quantity ?? 0),
      0,
    );
    const unitCost = Number(product.cost ?? 0);

    return {
      productId: product.id,
      productName: product.name,
      sku: product.sku,
      totalStock,
      minimumStock: product.minimumStock,
      unitCost,
      stockValue: money(totalStock * unitCost),
    };
  });

  return {
    totalProducts: products.length,
    totalStockValue: money(total(rows, "stockValue")),
    lowStockCount: rows.filter(
      (row) => Number(row.totalStock) <= Number(row.minimumStock),
    ).length,
    rows,
  };
}

function purchasesReport(searchParams?: URLSearchParams) {
  const from = parseMockDateBoundary(
    searchParams?.get("from") ?? null,
    "start",
  );
  const to = parseMockDateBoundary(searchParams?.get("to") ?? null, "end");
  const supplierId = mockNumberParam(searchParams, "supplierId");
  const purchaseOrders = mockPurchaseOrders.filter(
    (order) =>
      inMockDateRange(order.createdAt, from, to) &&
      (!supplierId || Number(order.supplierId) === supplierId),
  );
  const purchaseInvoices = mockPurchaseInvoices.filter(
    (invoice) =>
      inMockDateRange(invoice.createdAt, from, to) &&
      (!supplierId || Number(invoice.supplierId) === supplierId),
  );
  const invoicedPurchaseOrderIds = new Set(
    purchaseInvoices
      .map((invoice) => Number(invoice.purchaseOrderId))
      .filter(
        (purchaseOrderId) =>
          Number.isFinite(purchaseOrderId) && purchaseOrderId > 0,
      ),
  );
  const purchaseDocuments = [
    ...purchaseInvoices.map((invoice) => ({
      supplierId: Number(invoice.supplierId),
      createdAt: invoice.createdAt,
      totalAmount: Number(invoice.totalAmount ?? 0),
    })),
    ...purchaseOrders
      .filter((order) => !invoicedPurchaseOrderIds.has(Number(order.id)))
      .map((order) => ({
        supplierId: Number(order.supplierId),
        createdAt: order.createdAt,
        totalAmount: Number(order.totalAmount ?? 0),
      })),
  ];
  const byMonth = new Map<
    string,
    { date: string; purchaseOrdersCount: number; totalSpent: number }
  >();
  const bySupplier = new Map<number, JsonObject>();

  for (const order of purchaseOrders) {
    const date = String(order.createdAt).slice(0, 7);
    const month = byMonth.get(date) ?? {
      date,
      purchaseOrdersCount: 0,
      totalSpent: 0,
    };
    month.purchaseOrdersCount += 1;
    byMonth.set(date, month);
  }

  for (const document of purchaseDocuments) {
    const date = String(document.createdAt).slice(0, 7);
    const month = byMonth.get(date) ?? {
      date,
      purchaseOrdersCount: 0,
      totalSpent: 0,
    };
    month.totalSpent += document.totalAmount;
    byMonth.set(date, month);

    const supplierId = Number(document.supplierId);
    const supplier = bySupplier.get(supplierId) ?? {
      supplierId,
      supplierName:
        mockSuppliers.find((row) => row.id === supplierId)?.name ?? "Supplier",
      totalPurchased: 0,
      ordersCount: 0,
    };
    supplier.totalPurchased = money(
      Number(supplier.totalPurchased) + document.totalAmount,
    );
    bySupplier.set(supplierId, supplier);
  }

  for (const order of purchaseOrders) {
    const supplierId = Number(order.supplierId);
    const supplier = bySupplier.get(supplierId);
    if (!supplier) continue;
    supplier.ordersCount = Number(supplier.ordersCount) + 1;
    bySupplier.set(supplierId, supplier);
  }

  return {
    totalSpent: money(
      purchaseDocuments.reduce(
        (sum, document) => sum + document.totalAmount,
        0,
      ),
    ),
    totalPurchaseOrders: purchaseOrders.length,
    rows: [...byMonth.values()]
      .sort((a, b) => a.date.localeCompare(b.date))
      .map((row) => ({
        ...row,
        totalSpent: money(row.totalSpent),
      })),
    topSuppliers: [...bySupplier.values()].sort(
      (a, b) => Number(b.totalPurchased) - Number(a.totalPurchased),
    ),
  };
}

function lowStockProducts() {
  return mockProducts
    .map((product) => {
      const currentStock = mockStock
        .filter((stock) => stock.productId === product.id)
        .reduce((sum, stock) => sum + Number(stock.quantity ?? 0), 0);

      return {
        productId: Number(product.id),
        productName: String(product.name),
        sku: String(product.sku),
        minimumStock: Number(product.minimumStock ?? 0),
        currentStock,
        warehouseName: "All warehouses",
      };
    })
    .filter((product) => product.currentStock <= product.minimumStock)
    .sort((a, b) => a.currentStock - b.currentStock);
}

function reportExportSections(path: string, searchParams?: URLSearchParams) {
  if (path === "/api/reports/sales/export") {
    const report = salesReport(searchParams);
    return {
      reportType: "sales" as const,
      title: "Sales Report",
      sections: [
        {
          title: "Summary",
          headers: ["Metric", "Value"],
          rows: [
            ["Total Revenue", report.totalRevenue],
            ["Total Orders", report.totalOrders],
          ],
        },
        {
          title: "Revenue Over Time",
          headers: ["Date", "Orders", "Revenue"],
          rows: report.rows.map((row) => [
            String(row.date),
            Number(row.ordersCount),
            Number(row.revenue),
          ]),
        },
        {
          title: "Top Customers",
          headers: ["Customer", "Orders", "Total Spent"],
          rows: report.topCustomers.map((row) => [
            String(row.customerName),
            Number(row.ordersCount),
            Number(row.totalSpent),
          ]),
        },
      ],
    };
  }

  if (path === "/api/reports/inventory/export") {
    const report = inventoryReport(searchParams);
    return {
      reportType: "inventory" as const,
      title: "Inventory Report",
      sections: [
        {
          title: "Summary",
          headers: ["Metric", "Value"],
          rows: [
            ["Total Products", report.totalProducts],
            ["Low Stock Items", report.lowStockCount],
            ["Total Stock Value", report.totalStockValue],
          ],
        },
        {
          title: "Products",
          headers: ["Product", "SKU", "Stock", "Min Stock", "Stock Value"],
          rows: report.rows.map((row) => [
            String(row.productName),
            String(row.sku),
            Number(row.totalStock),
            Number(row.minimumStock),
            Number(row.stockValue),
          ]),
        },
      ],
    };
  }

  if (path === "/api/reports/purchases/export") {
    const report = purchasesReport(searchParams);
    return {
      reportType: "purchases" as const,
      title: "Purchases Report",
      sections: [
        {
          title: "Summary",
          headers: ["Metric", "Value"],
          rows: [
            ["Total Purchases", report.totalSpent],
            ["Purchase Orders", report.totalPurchaseOrders],
          ],
        },
        {
          title: "Purchases Over Time",
          headers: ["Date", "Purchase Orders", "Total Spent"],
          rows: report.rows.map((row) => [
            String(row.date),
            Number(row.purchaseOrdersCount),
            Number(row.totalSpent),
          ]),
        },
        {
          title: "Top Suppliers",
          headers: ["Supplier", "Orders", "Total Purchased"],
          rows: report.topSuppliers.map((row) => [
            String(row.supplierName),
            Number(row.ordersCount),
            Number(row.totalPurchased),
          ]),
        },
      ],
    };
  }

  return null;
}

function mockGet(
  path: string,
  searchParams = new URLSearchParams(),
): JsonValue | undefined {
  if (path === "/api/healthz") return { status: "ok" };

  if (path === "/api/dashboard/summary") {
    const currentMonthOrders = mockOrders.filter((order) =>
      String(order.createdAt).startsWith("2026-06"),
    );
    const pendingInvoices = mockInvoices.filter((invoice) =>
      ["draft", "sent", "overdue"].includes(String(invoice.status)),
    );
    const lowStock = lowStockProducts();

    return {
      totalSalesThisMonth: money(total(currentMonthOrders, "totalAmount")),
      totalOrdersThisMonth: currentMonthOrders.length,
      totalCustomers: mockCustomers.length,
      totalProducts: mockProducts.length,
      pendingOrders: mockOrders.filter((order) => order.status === "pending")
        .length,
      lowStockCount: lowStock.length,
      totalRevenueThisYear: money(total(mockOrders, "totalAmount")),
      pendingInvoicesCount: pendingInvoices.length,
    };
  }

  if (path === "/api/dashboard/top-products") {
    return productSales();
  }

  if (path === "/api/dashboard/recent-orders") {
    return [...mockOrders]
      .sort(
        (a, b) =>
          new Date(String(b.createdAt)).getTime() -
          new Date(String(a.createdAt)).getTime(),
      )
      .slice(0, 5);
  }

  if (path === "/api/dashboard/low-stock") {
    return lowStockProducts().slice(0, 20);
  }

  if (path === "/api/auth/me") {
    const user = mockUsers.find((row) => row.id === mockSessionUserId);
    return user ? { user: publicMockUser(user) } : undefined;
  }

  if (path === "/api/customers")
    return applyMockListQuery(
      mockCustomers,
      searchParams,
      ["name", "company", "email", "phone"],
      { name: "name", company: "company", createdAt: "createdAt" },
    );
  if (path === "/api/products")
    return applyMockListQuery(
      mockProducts,
      searchParams,
      ["name", "sku", "description", "unit"],
      { name: "name", sku: "sku", price: "price", createdAt: "createdAt" },
    );
  if (path === "/api/suppliers")
    return applyMockListQuery(
      mockSuppliers,
      searchParams,
      ["name", "company", "email", "phone"],
      { name: "name", company: "company", createdAt: "createdAt" },
    );
  if (path === "/api/warehouses") return mockWarehouses;
  if (path === "/api/users") return mockUsers.map(publicMockUser);
  if (path === "/api/projects") return mockProjects;
  if (path === "/api/tasks") return mockTasks;
  if (path === "/api/quotations")
    return applyMockListQuery(
      mockQuotations,
      searchParams,
      ["reference", "customerName", "status"],
      {
        reference: "reference",
        customerName: "customerName",
        status: "status",
        totalAmount: "totalAmount",
        createdAt: "createdAt",
      },
    );
  if (path === "/api/orders")
    return applyMockListQuery(
      mockOrders,
      searchParams,
      ["reference", "customerName", "status"],
      {
        reference: "reference",
        customerName: "customerName",
        status: "status",
        totalAmount: "totalAmount",
        createdAt: "createdAt",
      },
    );
  if (path === "/api/invoices")
    return applyMockListQuery(
      mockInvoices,
      searchParams,
      ["reference", "customerName", "status"],
      {
        reference: "reference",
        customerName: "customerName",
        status: "status",
        totalAmount: "totalAmount",
        dueDate: "dueDate",
        createdAt: "createdAt",
      },
    );
  if (path === "/api/purchase-orders")
    return applyMockListQuery(
      mockPurchaseOrders,
      searchParams,
      ["reference", "supplierName", "status"],
      {
        reference: "reference",
        supplierName: "supplierName",
        status: "status",
        totalAmount: "totalAmount",
        expectedDate: "expectedDate",
        createdAt: "createdAt",
      },
    );
  if (path === "/api/purchase-invoices")
    return applyMockListQuery(
      mockPurchaseInvoices,
      searchParams,
      ["reference", "supplierName", "status"],
      {
        reference: "reference",
        supplierName: "supplierName",
        status: "status",
        totalAmount: "totalAmount",
        dueDate: "dueDate",
        createdAt: "createdAt",
      },
    );

  const projectIdForTasks = projectTasksPath(path);
  if (projectIdForTasks != null) {
    return mockTasks.filter((task) => task.projectId === projectIdForTasks);
  }

  const basePath = collectionPath(path);
  if (basePath) {
    const rows = collections[basePath];
    const id = rowId(path, basePath);
    if (basePath === "/api/users") {
      if (id == null) return rows.map(publicMockUser);

      const row = rows.find((item) => item.id === id);
      return row ? publicMockUser(row) : undefined;
    }
    return id == null ? rows : rows.find((row) => row.id === id);
  }

  if (path === "/api/stock") {
    return mockStock;
  }

  if (path === "/api/reports/sales") {
    return salesReport(searchParams);
  }
  if (path === "/api/reports/inventory") return inventoryReport(searchParams);
  if (path === "/api/reports/purchases") return purchasesReport(searchParams);

  return undefined;
}

export function mockApiPlugin(): Plugin {
  return {
    name: "mock-api",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = new URL(req.url ?? "/", "http://localhost");
        if (!url.pathname.startsWith("/api")) return next();

        const publicPath =
          url.pathname === "/api/healthz" ||
          url.pathname.startsWith("/api/auth/");
        if (!publicPath && mockSessionUserId == null) {
          return sendJson(res, { error: "Unauthenticated" }, 401);
        }

        if (!publicPath && !canMockAccessPath(url.pathname)) {
          return sendJson(res, { error: "Forbidden" }, 403);
        }

        if (
          !publicPath &&
          !["GET", "HEAD", "OPTIONS"].includes(req.method ?? "GET") &&
          !canMockWritePath(url.pathname)
        ) {
          return sendJson(res, { error: "Forbidden" }, 403);
        }

        if (req.method === "GET") {
          const reportExport = reportExportSections(
            url.pathname,
            url.searchParams,
          );
          const format = url.searchParams.get("format");
          if (reportExport) {
            if (format !== "pdf" && format !== "excel") {
              return sendJson(
                res,
                { error: "format must be pdf or excel" },
                400,
              );
            }

            return sendReportExport(
              res,
              reportExport.reportType,
              format,
              reportExport.title,
              reportExport.sections,
            );
          }

          const data = mockGet(url.pathname, url.searchParams);
          if (data !== undefined) return sendJson(res, data);
          if (url.pathname === "/api/auth/me")
            return sendJson(res, { error: "Unauthenticated" }, 401);
        }

        if (req.method === "POST") {
          const body = await readBody(req);

          if (url.pathname === "/api/auth/login") {
            const email = String(body.email ?? "").toLowerCase();
            const password = String(body.password ?? "");
            const user = mockUsers.find(
              (row) => String(row.email).toLowerCase() === email && row.active,
            );

            if (!user || !verifyMockPassword(password, user.passwordHash)) {
              return sendJson(res, { error: "Invalid email or password" }, 401);
            }

            mockSessionUserId = Number(user.id);
            return sendJson(res, { user: publicMockUser(user) });
          }

          if (url.pathname === "/api/auth/logout") {
            mockSessionUserId = null;
            res.statusCode = 204;
            return res.end();
          }

          const quotationConvertMatch = url.pathname.match(
            /^\/api\/quotations\/(\d+)\/convert$/,
          );
          if (quotationConvertMatch) {
            const order = convertMockQuotationToOrder(
              Number(quotationConvertMatch[1]),
            );
            return order
              ? sendJson(res, order, 201)
              : sendJson(res, { error: "Mock quotation not found" }, 404);
          }

          const orderInvoiceMatch = url.pathname.match(
            /^\/api\/orders\/(\d+)\/invoice$/,
          );
          if (orderInvoiceMatch) {
            const invoice = createMockInvoiceFromOrder(
              Number(orderInvoiceMatch[1]),
            );
            return invoice
              ? sendJson(res, invoice, 201)
              : sendJson(res, { error: "Mock order not found" }, 404);
          }

          const purchaseReceiveMatch = url.pathname.match(
            /^\/api\/purchase-orders\/(\d+)\/receive$/,
          );
          if (purchaseReceiveMatch) {
            const purchaseOrder = receiveMockPurchaseOrder(
              Number(purchaseReceiveMatch[1]),
            );
            return purchaseOrder
              ? sendJson(res, purchaseOrder)
              : sendJson(res, { error: "Mock purchase order not found" }, 404);
          }

          const projectIdForTasks = projectTasksPath(url.pathname);
          if (projectIdForTasks != null) {
            const rows = collections["/api/tasks"];
            const created = withDefaults(
              "/api/tasks",
              { ...body, projectId: projectIdForTasks },
              nextId(rows),
            );
            rows.unshift(created);
            refreshProjectTaskCounts(projectIdForTasks);
            return sendJson(res, created, 201);
          }

          const basePath = collectionPath(url.pathname);
          if (!basePath)
            return sendJson(res, { id: 1, createdAt: now(), ...body }, 201);

          const rows = collections[basePath];
          const created = withDefaults(basePath, body, nextId(rows));
          rows.unshift(created);
          return sendJson(
            res,
            basePath === "/api/users" ? publicMockUser(created) : created,
            201,
          );
        }

        if (req.method === "PATCH") {
          const body = await readBody(req);
          const basePath = collectionPath(url.pathname);
          if (!basePath)
            return sendJson(res, { id: 1, createdAt: now(), ...body });

          const rows = collections[basePath];
          const id = rowId(url.pathname, basePath);
          const index = rows.findIndex((row) => row.id === id);
          if (index === -1)
            return sendJson(res, { error: "Mock record not found" }, 404);

          const oldProjectId = Number(rows[index].projectId);
          if (basePath === "/api/users" && body.password) {
            body.passwordHash = hashMockPassword(String(body.password));
            delete body.password;
          }
          rows[index] = { ...rows[index], ...(body as JsonObject) };
          if (basePath === "/api/tasks") {
            rows[index].projectName ??=
              mockProjects.find(
                (project) => project.id === rows[index].projectId,
              )?.name ?? "Project";
            rows[index].assigneeName =
              mockUsers.find((user) => user.id === rows[index].assignedTo)
                ?.name ?? null;
            refreshProjectTaskCounts(oldProjectId);
            refreshProjectTaskCounts(Number(rows[index].projectId));
          }
          return sendJson(
            res,
            basePath === "/api/users"
              ? publicMockUser(rows[index])
              : rows[index],
          );
        }

        if (req.method === "DELETE") {
          const basePath = collectionPath(url.pathname);
          if (basePath) {
            const id = rowId(url.pathname, basePath);
            const rows = collections[basePath];
            const index = rows.findIndex((row) => row.id === id);
            if (index !== -1) {
              const projectId = Number(rows[index].projectId);
              rows.splice(index, 1);
              if (basePath === "/api/tasks")
                refreshProjectTaskCounts(projectId);
            }
          }

          res.statusCode = 204;
          return res.end();
        }

        return sendJson(
          res,
          { error: "Mock endpoint not found", path: url.pathname },
          404,
        );
      });
    },
  };
}
