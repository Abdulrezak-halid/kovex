import { Router } from "express";
import type { Response } from "express";
import { db } from "@sme-erp/database";
import {
  ordersTable,
  customersTable,
  productsTable,
  stockTable,
  purchaseOrdersTable,
  suppliersTable,
} from "@sme-erp/database";
import { eq, gte, lte } from "drizzle-orm";

const router = Router();

type ReportType = "sales" | "inventory" | "purchases";
type ExportFormat = "pdf" | "excel";
type TableCell = string | number;
type ExportSection = {
  title: string;
  headers: string[];
  rows: TableCell[][];
};

const reportTypes = new Set<ReportType>(["sales", "inventory", "purchases"]);
const exportFormats = new Set<ExportFormat>(["pdf", "excel"]);

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

function queryDateRange(query: Record<string, unknown>) {
  const from = typeof query.from === "string" ? query.from : undefined;
  const to = typeof query.to === "string" ? query.to : undefined;
  return { from, to };
}

async function getSalesReport(query: Record<string, unknown>) {
  const { from, to } = queryDateRange(query);

  let ordersQuery = db.select().from(ordersTable).$dynamic();
  if (from)
    ordersQuery = ordersQuery.where(gte(ordersTable.createdAt, new Date(from)));
  if (to)
    ordersQuery = ordersQuery.where(lte(ordersTable.createdAt, new Date(to)));

  const orders = await ordersQuery;
  const totalRevenue = orders.reduce((s, o) => s + Number(o.totalAmount), 0);
  const totalOrders = orders.length;

  const byDate: Record<string, { ordersCount: number; revenue: number }> = {};
  for (const o of orders) {
    const d = new Date(o.createdAt).toISOString().split("T")[0];
    if (!byDate[d]) byDate[d] = { ordersCount: 0, revenue: 0 };
    byDate[d].ordersCount++;
    byDate[d].revenue += Number(o.totalAmount);
  }
  const rows = Object.entries(byDate)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, v]) => ({ date, ...v }));

  const customerSpend: Record<
    number,
    {
      customerId: number;
      customerName: string;
      totalSpent: number;
      ordersCount: number;
    }
  > = {};
  for (const o of orders) {
    if (!customerSpend[o.customerId]) {
      const [c] = await db
        .select()
        .from(customersTable)
        .where(eq(customersTable.id, o.customerId));
      customerSpend[o.customerId] = {
        customerId: o.customerId,
        customerName: c?.name ?? "",
        totalSpent: 0,
        ordersCount: 0,
      };
    }
    customerSpend[o.customerId].totalSpent += Number(o.totalAmount);
    customerSpend[o.customerId].ordersCount++;
  }
  const topCustomers = Object.values(customerSpend)
    .sort((a, b) => b.totalSpent - a.totalSpent)
    .slice(0, 10);

  return { totalRevenue, totalOrders, rows, topCustomers };
}

async function getInventoryReport() {
  const products = await db.select().from(productsTable);
  const stockRows = await db.select().from(stockTable);

  const reportRows = products.map((p) => {
    const totalStock = stockRows
      .filter((s) => s.productId === p.id)
      .reduce((sum, s) => sum + s.quantity, 0);
    const stockValue = totalStock * Number(p.price);
    return {
      productId: p.id,
      productName: p.name,
      sku: p.sku,
      totalStock,
      minimumStock: p.minimumStock,
      stockValue,
    };
  });

  const totalStockValue = reportRows.reduce((s, r) => s + r.stockValue, 0);
  const lowStockCount = reportRows.filter(
    (r) => r.totalStock <= r.minimumStock,
  ).length;

  return {
    totalProducts: products.length,
    totalStockValue,
    lowStockCount,
    rows: reportRows,
  };
}

async function getPurchasesReport(query: Record<string, unknown>) {
  const { from, to } = queryDateRange(query);

  let posQuery = db.select().from(purchaseOrdersTable).$dynamic();
  if (from)
    posQuery = posQuery.where(
      gte(purchaseOrdersTable.createdAt, new Date(from)),
    );
  if (to)
    posQuery = posQuery.where(lte(purchaseOrdersTable.createdAt, new Date(to)));

  const pos = await posQuery;
  const totalSpent = pos.reduce((s, o) => s + Number(o.totalAmount), 0);
  const totalPurchaseOrders = pos.length;

  const byDate: Record<
    string,
    { purchaseOrdersCount: number; totalSpent: number }
  > = {};
  for (const po of pos) {
    const d = new Date(po.createdAt).toISOString().split("T")[0];
    if (!byDate[d]) byDate[d] = { purchaseOrdersCount: 0, totalSpent: 0 };
    byDate[d].purchaseOrdersCount++;
    byDate[d].totalSpent += Number(po.totalAmount);
  }
  const rows = Object.entries(byDate)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, v]) => ({ date, ...v }));

  const supplierSpend: Record<
    number,
    {
      supplierId: number;
      supplierName: string;
      totalPurchased: number;
      ordersCount: number;
    }
  > = {};
  for (const po of pos) {
    if (!supplierSpend[po.supplierId]) {
      const [s] = await db
        .select()
        .from(suppliersTable)
        .where(eq(suppliersTable.id, po.supplierId));
      supplierSpend[po.supplierId] = {
        supplierId: po.supplierId,
        supplierName: s?.name ?? "",
        totalPurchased: 0,
        ordersCount: 0,
      };
    }
    supplierSpend[po.supplierId].totalPurchased += Number(po.totalAmount);
    supplierSpend[po.supplierId].ordersCount++;
  }
  const topSuppliers = Object.values(supplierSpend)
    .sort((a, b) => b.totalPurchased - a.totalPurchased)
    .slice(0, 10);

  return { totalSpent, totalPurchaseOrders, rows, topSuppliers };
}

function reportExportData(
  type: ReportType,
  report:
    | Awaited<ReturnType<typeof getSalesReport>>
    | Awaited<ReturnType<typeof getInventoryReport>>
    | Awaited<ReturnType<typeof getPurchasesReport>>,
) {
  if (type === "sales") {
    const data = report as Awaited<ReturnType<typeof getSalesReport>>;
    return {
      title: "Sales Report",
      summary: {
        title: "Summary",
        headers: ["Metric", "Value"],
        rows: [
          ["Total Revenue", currency.format(data.totalRevenue)],
          ["Total Orders", data.totalOrders],
        ],
      },
      sections: [
        {
          title: "Revenue Over Time",
          headers: ["Date", "Orders", "Revenue"],
          rows: data.rows.map((row) => [
            row.date,
            row.ordersCount,
            currency.format(row.revenue),
          ]),
        },
        {
          title: "Top Customers",
          headers: ["Customer", "Orders", "Total Spent"],
          rows: data.topCustomers.map((row) => [
            row.customerName,
            row.ordersCount,
            currency.format(row.totalSpent),
          ]),
        },
      ],
    };
  }

  if (type === "inventory") {
    const data = report as Awaited<ReturnType<typeof getInventoryReport>>;
    return {
      title: "Inventory Report",
      summary: {
        title: "Summary",
        headers: ["Metric", "Value"],
        rows: [
          ["Total Products", data.totalProducts],
          ["Low Stock Items", data.lowStockCount],
          ["Total Stock Value", currency.format(data.totalStockValue)],
        ],
      },
      sections: [
        {
          title: "Products",
          headers: ["Product", "SKU", "Stock", "Min Stock", "Stock Value"],
          rows: data.rows.map((row) => [
            row.productName,
            row.sku,
            row.totalStock,
            row.minimumStock,
            currency.format(row.stockValue),
          ]),
        },
      ],
    };
  }

  const data = report as Awaited<ReturnType<typeof getPurchasesReport>>;
  return {
    title: "Purchases Report",
    summary: {
      title: "Summary",
      headers: ["Metric", "Value"],
      rows: [
        ["Total Spent", currency.format(data.totalSpent)],
        ["Purchase Orders", data.totalPurchaseOrders],
      ],
    },
    sections: [
      {
        title: "Purchases Over Time",
        headers: ["Date", "Purchase Orders", "Total Spent"],
        rows: data.rows.map((row) => [
          row.date,
          row.purchaseOrdersCount,
          currency.format(row.totalSpent),
        ]),
      },
      {
        title: "Top Suppliers",
        headers: ["Supplier", "Orders", "Total Purchased"],
        rows: data.topSuppliers.map((row) => [
          row.supplierName,
          row.ordersCount,
          currency.format(row.totalPurchased),
        ]),
      },
    ],
  };
}

function htmlEscape(value: TableCell) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function renderExcelHtml(title: string, sections: ExportSection[]) {
  const tables = sections
    .map(
      (section) => `
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
        </table>`,
    )
    .join("");

  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <style>
    body { font-family: Arial, sans-serif; }
    h1 { font-size: 20px; }
    h2 { font-size: 15px; margin-top: 22px; }
    table { border-collapse: collapse; margin-bottom: 18px; }
    th, td { border: 1px solid #999; padding: 6px 8px; text-align: left; }
    th { background: #e8eef7; font-weight: 700; }
  </style>
</head>
<body>
  <h1>${htmlEscape(title)}</h1>
  ${tables}
</body>
</html>`;
}

function pdfText(value: TableCell) {
  const text = String(value);
  const hex = ["feff"];

  for (const char of text) {
    const code = char.codePointAt(0) ?? 0;
    if (code <= 0xffff) {
      hex.push(code.toString(16).padStart(4, "0"));
      continue;
    }

    const adjusted = code - 0x10000;
    hex.push(((adjusted >> 10) + 0xd800).toString(16).padStart(4, "0"));
    hex.push(((adjusted & 0x3ff) + 0xdc00).toString(16).padStart(4, "0"));
  }

  return `<${hex.join("")}>`;
}

function wrapLine(line: string, maxLength = 95) {
  if (line.length <= maxLength) return [line];

  const words = line.split(" ");
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    if (`${current} ${word}`.trim().length > maxLength) {
      if (current) lines.push(current);
      current = word;
    } else {
      current = `${current} ${word}`.trim();
    }
  }

  if (current) lines.push(current);
  return lines;
}

function pdfLines(title: string, sections: ExportSection[]) {
  const lines = [
    title,
    `Generated: ${new Date().toISOString().slice(0, 10)}`,
    "",
  ];

  for (const section of sections) {
    lines.push(section.title);
    lines.push(section.headers.join(" | "));
    for (const row of section.rows) {
      lines.push(...wrapLine(row.map(String).join(" | ")));
    }
    lines.push("");
  }

  return lines;
}

function renderPdf(title: string, sections: ExportSection[]) {
  const lines = pdfLines(title, sections);
  const pageLines = 44;
  const pages: string[][] = [];
  for (let i = 0; i < lines.length; i += pageLines) {
    pages.push(lines.slice(i, i + pageLines));
  }

  const objects: string[] = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    `<< /Type /Pages /Kids [${pages.map((_, i) => `${4 + i * 2} 0 R`).join(" ")}] /Count ${pages.length} >>`,
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
  ];

  pages.forEach((page, index) => {
    const pageObjectNumber = 4 + index * 2;
    const contentObjectNumber = pageObjectNumber + 1;
    const content = [
      "BT",
      "/F1 10 Tf",
      "50 790 Td",
      "14 TL",
      ...page.map((line, lineIndex) =>
        lineIndex === 0 ? `${pdfText(line)} Tj` : `T* ${pdfText(line)} Tj`,
      ),
      "ET",
    ].join("\n");

    objects.push(
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 3 0 R >> >> /Contents ${contentObjectNumber} 0 R >>`,
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

function sendExport(
  res: Response,
  reportType: ReportType,
  format: ExportFormat,
  title: string,
  sections: ExportSection[],
) {
  const fileBase = `${reportType}-report-${new Date().toISOString().slice(0, 10)}`;

  if (format === "pdf") {
    res
      .type("application/pdf")
      .setHeader(
        "Content-Disposition",
        `attachment; filename="${fileBase}.pdf"`,
      )
      .send(renderPdf(title, sections));
    return;
  }

  res
    .type("application/vnd.ms-excel")
    .setHeader("Content-Disposition", `attachment; filename="${fileBase}.xls"`)
    .send(renderExcelHtml(title, sections));
}

async function getReport(
  reportType: ReportType,
  query: Record<string, unknown>,
) {
  if (reportType === "sales") return getSalesReport(query);
  if (reportType === "inventory") return getInventoryReport();
  return getPurchasesReport(query);
}

router.get("/reports/sales", async (req, res) => {
  try {
    res.json(await getSalesReport(req.query));
  } catch (err) {
    req.log.error({ err });
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/reports/inventory", async (req, res) => {
  try {
    res.json(await getInventoryReport());
  } catch (err) {
    req.log.error({ err });
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/reports/purchases", async (req, res) => {
  try {
    res.json(await getPurchasesReport(req.query));
  } catch (err) {
    req.log.error({ err });
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/reports/:reportType/export", async (req, res) => {
  try {
    const reportType = req.params.reportType;
    const format = req.query.format;

    if (!reportTypes.has(reportType as ReportType)) {
      res.status(404).json({ error: "Unknown report" });
      return;
    }

    if (
      typeof format !== "string" ||
      !exportFormats.has(format as ExportFormat)
    ) {
      res.status(400).json({ error: "format must be pdf or excel" });
      return;
    }

    const type = reportType as ReportType;
    const data = await getReport(type, req.query);
    const exportData = reportExportData(type, data as never);
    sendExport(res, type, format as ExportFormat, exportData.title, [
      exportData.summary,
      ...exportData.sections,
    ]);
  } catch (err) {
    req.log.error({ err });
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
