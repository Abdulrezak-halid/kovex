import { Router } from "express";
import type { Response } from "express";
import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";
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
type ChartPoint = { label: string; value: number; secondary?: number };
type ChartSlice = { label: string; value: number };
type PngImage = {
  width: number;
  height: number;
  rgb: Buffer;
  alpha: Buffer;
};

const reportTypes = new Set<ReportType>(["sales", "inventory", "purchases"]);
const exportFormats = new Set<ExportFormat>(["pdf", "excel"]);

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});
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
        ? `${textValue.slice(0, maxLength - 1)}…`
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
