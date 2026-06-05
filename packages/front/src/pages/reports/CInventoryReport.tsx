import { useGetInventoryReport, useListProducts } from "@sme-erp/api-client";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { FileSpreadsheet, FileText } from "lucide-react";
import { CPageHeader } from "@/components/CPageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  downloadReportExport,
  type ReportExportFormat,
} from "@/lib/report-export";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const fmt = (n: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);

const chartColors = [
  "hsl(var(--primary))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

export default function CInventoryReport() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [productId, setProductId] = useState("all");
  const [params, setParams] = useState<{ productId?: number }>({});
  const [exporting, setExporting] = useState<ReportExportFormat | null>(null);
  const { data, isLoading } = useGetInventoryReport(params);
  const { data: products } = useListProducts();
  const applyFilters = () => {
    setParams({
      productId:
        productId !== "all" && productId ? Number(productId) : undefined,
    });
    toast({
      title: "Filters applied",
      description: "The inventory report now uses the selected product filter.",
    });
  };
  const topStockValueRows =
    data?.rows
      ?.filter((row) => row.stockValue > 0)
      .sort((a, b) => b.stockValue - a.stockValue)
      .slice(0, 5)
      .map((row) => ({
        name: row.productName,
        value: row.stockValue,
      })) ?? [];
  const handleExport = async (format: ReportExportFormat) => {
    try {
      setExporting(format);
      await downloadReportExport("inventory", format, params);
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
        <CardContent className="pt-4">
          <div className="flex flex-wrap items-end gap-4">
            <div className="min-w-[240px]">
              <Label className="text-xs">{t("product")}</Label>
              <Select value={productId} onValueChange={setProductId}>
                <SelectTrigger className="mt-1 h-8 text-sm">
                  <SelectValue placeholder={t("selectProduct")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("allProducts")}</SelectItem>
                  {products?.map((product) => (
                    <SelectItem key={product.id} value={String(product.id)}>
                      {product.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button size="sm" onClick={applyFilters}>
              {t("apply")}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setProductId("all");
                setParams({});
                toast({
                  title: "Filters cleared",
                  description:
                    "The inventory report is showing all products again.",
                });
              }}
            >
              {t("clear")}
            </Button>
            <div className="ml-auto flex gap-2">
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
            </div>
          </div>
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

      {data?.rows && data.rows.length > 0 && (
        <div className="grid gap-4 lg:grid-cols-2 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">
                {t("stockLevels")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={data.rows.slice(0, 12)}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-50" />
                  <XAxis
                    dataKey="sku"
                    tick={{ fontSize: 11 }}
                    interval="preserveStartEnd"
                  />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip
                    formatter={(value, name) => [
                      Number(value),
                      name === "totalStock" ? t("stock") : t("minStock"),
                    ]}
                    labelFormatter={(label) => String(label)}
                  />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Line
                    type="monotone"
                    dataKey="totalStock"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2.5}
                    dot={{ r: 3, fill: "hsl(var(--primary))" }}
                    activeDot={{ r: 5 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="minimumStock"
                    stroke="hsl(var(--chart-4))"
                    strokeWidth={2}
                    strokeDasharray="4 4"
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          {topStockValueRows.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold">
                  {t("stockValue")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={240}>
                  <PieChart>
                    <Pie
                      data={topStockValueRows}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={54}
                      outerRadius={82}
                      paddingAngle={3}
                    >
                      {topStockValueRows.map((entry, index) => (
                        <Cell
                          key={entry.name}
                          fill={chartColors[index % chartColors.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v) => fmt(Number(v))} />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </div>
      )}

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
