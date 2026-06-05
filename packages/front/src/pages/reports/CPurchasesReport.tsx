import { useState } from "react";
import { useGetPurchasesReport, useListSuppliers } from "@sme-erp/api-client";
import { useTranslation } from "react-i18next";
import { FileSpreadsheet, FileText } from "lucide-react";
import { CPageHeader } from "@/components/CPageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  downloadReportExport,
  type ReportExportFormat,
} from "@/lib/report-export";
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

export default function CPurchasesReport() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [supplierId, setSupplierId] = useState("all");
  const [params, setParams] = useState<{
    from?: string;
    to?: string;
    supplierId?: number;
  }>({});
  const [exporting, setExporting] = useState<ReportExportFormat | null>(null);

  const { data, isLoading } = useGetPurchasesReport(params);
  const { data: suppliers } = useListSuppliers();
  const applyFilters = () => {
    setParams({
      from: from || undefined,
      to: to || undefined,
      supplierId:
        supplierId !== "all" && supplierId ? Number(supplierId) : undefined,
    });
    toast({
      title: "Filters applied",
      description:
        "The purchases report now uses the selected date and supplier filters.",
    });
  };
  const handleExport = async (format: ReportExportFormat) => {
    try {
      setExporting(format);
      await downloadReportExport("purchases", format, params);
    } catch {
      toast({ title: t("exportFailed"), variant: "destructive" });
    } finally {
      setExporting(null);
    }
  };
  const topSupplierChartRows =
    data?.topSuppliers?.slice(0, 5).map((supplier) => ({
      name: supplier.supplierName,
      value: supplier.totalPurchased,
    })) ?? [];

  return (
    <div className="p-6">
      <CPageHeader
        title={t("purchasesReport")}
        description={t("supplierSpendingAnalytics")}
      />

      <Card className="mb-6">
        <CardContent className="pt-4">
          <div className="flex flex-wrap items-end gap-4">
            <div>
              <Label className="text-xs">{t("from")}</Label>
              <Input
                type="date"
                className="mt-1 h-8 text-sm"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
              />
            </div>
            <div>
              <Label className="text-xs">{t("to")}</Label>
              <Input
                type="date"
                className="mt-1 h-8 text-sm"
                value={to}
                onChange={(e) => setTo(e.target.value)}
              />
            </div>
            <div className="min-w-55">
              <Label className="text-xs">{t("supplier")}</Label>
              <Select value={supplierId} onValueChange={setSupplierId}>
                <SelectTrigger className="mt-1 h-8 text-sm">
                  <SelectValue placeholder={t("selectSupplier")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("allSuppliers")}</SelectItem>
                  {suppliers?.map((supplier) => (
                    <SelectItem key={supplier.id} value={String(supplier.id)}>
                      {supplier.name}
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
                setFrom("");
                setTo("");
                setSupplierId("all");
                setParams({});
                toast({
                  title: "Filters cleared",
                  description:
                    "The purchases report is showing all suppliers and dates again.",
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

      <div className="grid grid-cols-2 gap-4 mb-6">
        <Card>
          <CardContent className="p-5">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              {t("totalSpent")}
            </p>
            {isLoading ? (
              <Skeleton className="h-7 w-32 mt-1.5" />
            ) : (
              <p className="text-2xl font-semibold mt-1">
                {fmt(data?.totalSpent ?? 0)}
              </p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              {t("purchaseOrders")}
            </p>
            {isLoading ? (
              <Skeleton className="h-7 w-20 mt-1.5" />
            ) : (
              <p className="text-2xl font-semibold mt-1">
                {data?.totalPurchaseOrders ?? 0}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {(data?.rows?.length || topSupplierChartRows.length) && (
        <div className="grid gap-4 lg:grid-cols-2 mb-6">
          {data?.rows && data.rows.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold">
                  {t("totalSpent")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={240}>
                  <LineChart data={data.rows}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      className="opacity-50"
                    />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                    <YAxis
                      tick={{ fontSize: 11 }}
                      tickFormatter={(v) =>
                        `$${(Number(v) / 1000).toFixed(0)}k`
                      }
                    />
                    <Tooltip formatter={(v) => fmt(Number(v))} />
                    <Line
                      type="monotone"
                      dataKey="totalSpent"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2.5}
                      dot={{ r: 3, fill: "hsl(var(--primary))" }}
                      activeDot={{ r: 5 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
          {topSupplierChartRows.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold">
                  {t("topSuppliers")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={240}>
                  <PieChart>
                    <Pie
                      data={topSupplierChartRows}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={54}
                      outerRadius={82}
                      paddingAngle={3}
                    >
                      {topSupplierChartRows.map((entry, index) => (
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

      {data?.topSuppliers && data.topSuppliers.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">
              {t("topSuppliers")}
            </CardTitle>
          </CardHeader>
          <CardContent className="px-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-6 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    {t("supplier")}
                  </th>
                  <th className="px-6 py-2 text-right text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    {t("orders")}
                  </th>
                  <th className="px-6 py-2 text-right text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    {t("totalPurchased")}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {data.topSuppliers.map((s) => (
                  <tr key={s.supplierId} className="hover:bg-muted/20">
                    <td className="px-6 py-2.5 font-medium">
                      {s.supplierName}
                    </td>
                    <td className="px-6 py-2.5 text-right">{s.ordersCount}</td>
                    <td className="px-6 py-2.5 text-right font-medium">
                      {fmt(s.totalPurchased)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
