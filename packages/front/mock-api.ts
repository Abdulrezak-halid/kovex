import type { IncomingMessage, ServerResponse } from "node:http";
import crypto from "node:crypto";
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
const daysAgo = (days: number) =>
  new Date(Date.UTC(2026, 5, 1 - days, 9, 0, 0)).toISOString();
const dueIn = (days: number) =>
  new Date(Date.UTC(2026, 5, 1 + days, 9, 0, 0)).toISOString();
const money = (value: number) => Number(value.toFixed(2));

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
];

let mockSessionUserId: number | null = null;

function currentMockUser() {
  return mockUsers.find((row) => row.id === mockSessionUserId) ?? null;
}

function canMockManageData() {
  const role = String(currentMockUser()?.role ?? "");
  return role === "admin" || role === "sysadmin";
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

function salesReport() {
  const byMonth = new Map<
    string,
    { date: string; ordersCount: number; revenue: number }
  >();
  const byCustomer = new Map<number, JsonObject>();

  for (const order of mockOrders) {
    const date = String(order.createdAt).slice(0, 7);
    const month = byMonth.get(date) ?? { date, ordersCount: 0, revenue: 0 };
    month.ordersCount += 1;
    month.revenue += Number(order.totalAmount ?? 0);
    byMonth.set(date, month);

    const customerId = Number(order.customerId);
    const customer = byCustomer.get(customerId) ?? {
      customerId,
      customerName: order.customerName,
      totalSpent: 0,
      ordersCount: 0,
    };
    customer.totalSpent = money(
      Number(customer.totalSpent) + Number(order.totalAmount ?? 0),
    );
    customer.ordersCount = Number(customer.ordersCount) + 1;
    byCustomer.set(customerId, customer);
  }

  return {
    totalRevenue: money(total(mockOrders, "totalAmount")),
    totalOrders: mockOrders.length,
    rows: [...byMonth.values()].map((row) => ({
      ...row,
      revenue: money(row.revenue),
    })),
    topCustomers: [...byCustomer.values()].sort(
      (a, b) => Number(b.totalSpent) - Number(a.totalSpent),
    ),
  };
}

function inventoryReport() {
  const rows = mockProducts.map((product) => {
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
      totalValue: money(totalStock * unitCost),
    };
  });

  return {
    totalProducts: mockProducts.length,
    totalStockValue: money(total(rows, "totalValue")),
    lowStockCount: rows.filter(
      (row) => Number(row.totalStock) <= Number(row.minimumStock),
    ).length,
    rows,
  };
}

function purchasesReport() {
  const byMonth = new Map<
    string,
    { date: string; ordersCount: number; purchases: number }
  >();
  const bySupplier = new Map<number, JsonObject>();

  for (const order of mockPurchaseOrders) {
    const date = String(order.createdAt).slice(0, 7);
    const month = byMonth.get(date) ?? { date, ordersCount: 0, purchases: 0 };
    month.ordersCount += 1;
    month.purchases += Number(order.totalAmount ?? 0);
    byMonth.set(date, month);

    const supplierId = Number(order.supplierId);
    const supplier = bySupplier.get(supplierId) ?? {
      supplierId,
      supplierName: order.supplierName,
      totalPurchased: 0,
      ordersCount: 0,
    };
    supplier.totalPurchased = money(
      Number(supplier.totalPurchased) + Number(order.totalAmount ?? 0),
    );
    supplier.ordersCount = Number(supplier.ordersCount) + 1;
    bySupplier.set(supplierId, supplier);
  }

  return {
    totalPurchases: money(total(mockPurchaseOrders, "totalAmount")),
    totalOrders: mockPurchaseOrders.length,
    rows: [...byMonth.values()].map((row) => ({
      ...row,
      purchases: money(row.purchases),
    })),
    topSuppliers: [...bySupplier.values()].sort(
      (a, b) => Number(b.totalPurchased) - Number(a.totalPurchased),
    ),
  };
}

function mockGet(path: string): JsonValue | undefined {
  if (path === "/api/healthz") return { status: "ok" };

  if (path === "/api/dashboard/summary") {
    const currentMonthOrders = mockOrders.filter((order) =>
      String(order.createdAt).startsWith("2026-06"),
    );
    const pendingInvoices = mockInvoices.filter((invoice) =>
      ["draft", "sent", "overdue"].includes(String(invoice.status)),
    );
    const lowStock = mockStock.filter(
      (stock) => Number(stock.quantity) <= Number(stock.minimumStock),
    );

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
    return mockStock
      .filter((stock) => Number(stock.quantity) <= Number(stock.minimumStock))
      .map((stock) => ({ ...stock, currentStock: stock.quantity }));
  }

  if (path === "/api/auth/me") {
    const user = mockUsers.find((row) => row.id === mockSessionUserId);
    return user ? { user: publicMockUser(user) } : undefined;
  }

  if (path === "/api/customers") return mockCustomers;
  if (path === "/api/products") return mockProducts;
  if (path === "/api/suppliers") return mockSuppliers;
  if (path === "/api/warehouses") return mockWarehouses;
  if (path === "/api/users") return mockUsers.map(publicMockUser);
  if (path === "/api/projects") return mockProjects;
  if (path === "/api/tasks") return mockTasks;
  if (path === "/api/quotations") return mockQuotations;
  if (path === "/api/orders") return mockOrders;
  if (path === "/api/invoices") return mockInvoices;
  if (path === "/api/purchase-orders") return mockPurchaseOrders;
  if (path === "/api/purchase-invoices") return mockPurchaseInvoices;

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
    return salesReport();
  }
  if (path === "/api/reports/inventory") return inventoryReport();
  if (path === "/api/reports/purchases") return purchasesReport();

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
          url.pathname === "/api/healthz" || url.pathname.startsWith("/api/auth/");
        if (!publicPath && mockSessionUserId == null) {
          return sendJson(res, { error: "Unauthenticated" }, 401);
        }

        if (
          !publicPath &&
          !["GET", "HEAD", "OPTIONS"].includes(req.method ?? "GET") &&
          !canMockManageData()
        ) {
          return sendJson(res, { error: "Forbidden" }, 403);
        }

        if (req.method === "GET") {
          const data = mockGet(url.pathname);
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
            basePath === "/api/users" ? publicMockUser(rows[index]) : rows[index],
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
