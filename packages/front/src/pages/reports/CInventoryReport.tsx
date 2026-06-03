import { useGetInventoryReport } from "@sme-erp/api-client";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { FileSpreadsheet, FileText } from "lucide-react";
import { CPageHeader } from "@/components/CPageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  downloadReportExport,
  type ReportExportFormat,
} from "@/lib/report-export";

const fmt = (n: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);

export default function CInventoryReport() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [exporting, setExporting] = useState<ReportExportFormat | null>(null);
  const { data, isLoading } = useGetInventoryReport();
  const handleExport = async (format: ReportExportFormat) => {
    try {
      setExporting(format);
      await downloadReportExport("inventory", format);
    } catch {
      toast({ title: t("exportFailed"), variant: "destructive" });
    } finally {
      setExporting(null);
    }
  };

  return (
    <div className="p-6">
      <CPageHeader
        title={t("inventoryReport")}
        description={t("stockLevelsAndValuation")}
      />

      <Card className="mb-6">
        <CardContent className="flex justify-end gap-2 pt-4">
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleExport("pdf")}
            disabled={exporting !== null}
          >
            <FileText className="h-4 w-4" />
            {exporting === "pdf" ? t("exporting") : t("exportPdf")}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleExport("excel")}
            disabled={exporting !== null}
          >
            <FileSpreadsheet className="h-4 w-4" />
            {exporting === "excel" ? t("exporting") : t("exportExcel")}
          </Button>
        </CardContent>
      </Card>

      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: t("totalProducts"), value: data?.totalProducts },
          { label: t("lowStockItems"), value: data?.lowStockCount },
          {
            label: t("totalStockValue"),
            value: data ? fmt(data.totalStockValue) : undefined,
          },
        ].map(({ label, value }) => (
          <Card key={label}>
            <CardContent className="p-5">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                {label}
              </p>
              {isLoading ? (
                <Skeleton className="h-7 w-20 mt-1.5" />
              ) : (
                <p className="text-2xl font-semibold mt-1">{value ?? "—"}</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">
            {t("products")}
          </CardTitle>
        </CardHeader>
        <CardContent className="px-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                {[
                  t("product"),
                  t("sku"),
                  t("stock"),
                  t("minStock"),
                  t("stockValue"),
                  t("status"),
                ].map((h) => (
                  <th
                    key={h}
                    className="px-6 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      {Array.from({ length: 6 }).map((_, j) => (
                        <td key={j} className="px-6 py-3">
                          <Skeleton className="h-4 w-full" />
                        </td>
                      ))}
                    </tr>
                  ))
                : data?.rows?.map((r) => (
                    <tr key={r.productId} className="hover:bg-muted/20">
                      <td className="px-6 py-2.5 font-medium">
                        {r.productName}
                      </td>
                      <td className="px-6 py-2.5 font-mono text-sm text-muted-foreground">
                        {r.sku}
                      </td>
                      <td className="px-6 py-2.5">{r.totalStock}</td>
                      <td className="px-6 py-2.5">{r.minimumStock}</td>
                      <td className="px-6 py-2.5">{fmt(r.stockValue)}</td>
                      <td className="px-6 py-2.5">
                        {r.totalStock <= r.minimumStock ? (
                          <Badge variant="destructive" className="text-xs">
                            {t("lowStock")}
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="text-xs">
                            {t("ok")}
                          </Badge>
                        )}
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
