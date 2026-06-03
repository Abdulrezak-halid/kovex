export type ReportExportType = "sales" | "inventory" | "purchases";
export type ReportExportFormat = "pdf" | "excel";

type ReportExportParams = {
  from?: string;
  to?: string;
  customerId?: number;
  supplierId?: number;
  productId?: number;
};

function filenameFromDisposition(disposition: string | null) {
  const match = disposition?.match(/filename="?([^"]+)"?/i);
  return match?.[1];
}

export async function downloadReportExport(
  type: ReportExportType,
  format: ReportExportFormat,
  params: ReportExportParams = {},
) {
  const search = new URLSearchParams({ format });
  if (params.from) search.set("from", params.from);
  if (params.to) search.set("to", params.to);
  if (params.customerId) search.set("customerId", String(params.customerId));
  if (params.supplierId) search.set("supplierId", String(params.supplierId));
  if (params.productId) search.set("productId", String(params.productId));

  const response = await fetch(`/api/reports/${type}/export?${search}`, {
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Report export failed");
  }

  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const fallbackExtension = format === "pdf" ? "pdf" : "xls";
  const filename =
    filenameFromDisposition(response.headers.get("content-disposition")) ??
    `${type}-report.${fallbackExtension}`;

  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
