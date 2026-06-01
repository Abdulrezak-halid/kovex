import {
  useGetDashboardSummary,
  useGetTopProducts,
  useGetRecentOrders,
  useGetLowStockAlerts,
  useGetSalesReport,
} from "@sme-erp/api-client";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CStatusBadge } from "@/components/CStatusBadge";
import {
  TrendingUp,
  ShoppingCart,
  Users,
  Package,
  AlertTriangle,
  FileText,
  DollarSign,
  Clock,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

function CMetricCard({
  title,
  value,
  icon: Icon,
  description,
  loading,
}: {
  title: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  description?: string;
  loading?: boolean;
}) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              {title}
            </p>
            {loading ? (
              <Skeleton className="h-7 w-24 mt-1.5" />
            ) : (
              <p className="text-2xl font-semibold mt-1">{value}</p>
            )}
            {description && (
              <p className="text-xs text-muted-foreground mt-1">
                {description}
              </p>
            )}
          </div>
          <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
            <Icon className="h-4.5 w-4.5 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function CDashboard() {
  const { t } = useTranslation();
  const { data: summary, isLoading: loadingSummary } = useGetDashboardSummary();
  const { data: topProducts, isLoading: loadingProducts } = useGetTopProducts();
  const { data: recentOrders, isLoading: loadingOrders } = useGetRecentOrders();
  const { data: lowStock, isLoading: loadingStock } = useGetLowStockAlerts();
  const { data: salesReport, isLoading: loadingSalesReport } =
    useGetSalesReport({});

  const topProductRows = Array.isArray(topProducts) ? topProducts : [];
  const recentOrderRows = Array.isArray(recentOrders) ? recentOrders : [];
  const lowStockRows = Array.isArray(lowStock) ? lowStock : [];
  const salesTrendRows = salesReport?.rows ?? [];
  const topProductChartRows = topProductRows.slice(0, 6).map((product) => ({
    name:
      product.productName.length > 18
        ? `${product.productName.slice(0, 18)}...`
        : product.productName,
    revenue: product.totalRevenue,
    quantity: product.quantitySold,
  }));

  const fmt = (n: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(n);

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-xl font-semibold">{t("dashboard")}</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          {t("businessOverview")}
        </p>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <CMetricCard
          title={t("salesThisMonth")}
          value={summary ? fmt(summary.totalSalesThisMonth) : "—"}
          icon={DollarSign}
          loading={loadingSummary}
        />
        <CMetricCard
          title={t("ordersThisMonth")}
          value={summary?.totalOrdersThisMonth ?? "—"}
          icon={ShoppingCart}
          loading={loadingSummary}
        />
        <CMetricCard
          title={t("totalCustomers")}
          value={summary?.totalCustomers ?? "—"}
          icon={Users}
          loading={loadingSummary}
        />
        <CMetricCard
          title={t("totalProducts")}
          value={summary?.totalProducts ?? "—"}
          icon={Package}
          loading={loadingSummary}
        />
        <CMetricCard
          title={t("pendingOrders")}
          value={summary?.pendingOrders ?? "—"}
          icon={Clock}
          loading={loadingSummary}
        />
        <CMetricCard
          title={t("lowStockAlerts")}
          value={summary?.lowStockCount ?? "—"}
          icon={AlertTriangle}
          loading={loadingSummary}
        />
        <CMetricCard
          title={t("revenueThisYear")}
          value={summary ? fmt(summary.totalRevenueThisYear) : "—"}
          icon={TrendingUp}
          loading={loadingSummary}
        />
        <CMetricCard
          title={t("pendingInvoices")}
          value={summary?.pendingInvoicesCount ?? "—"}
          icon={FileText}
          loading={loadingSummary}
        />
      </div>

      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">
            {t("salesRevenueTrend")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loadingSalesReport ? (
            <Skeleton className="h-65 w-full" />
          ) : !salesTrendRows.length ? (
            <div className="flex h-65 items-center justify-center">
              <p className="text-sm text-muted-foreground">
                {t("noSalesTrendDataYet")}
              </p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <LineChart
                data={salesTrendRows}
                margin={{ top: 8, right: 16, left: 4, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  className="stroke-border/60"
                />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `$${Number(value) / 1000}k`}
                />
                <Tooltip
                  formatter={(value, name) =>
                    name === "revenue"
                      ? [fmt(Number(value)), t("revenue")]
                      : [value, t("orders")]
                  }
                  labelClassName="font-medium"
                  contentStyle={{
                    borderRadius: 8,
                    border: "1px solid hsl(var(--border))",
                    boxShadow: "0 10px 30px hsl(var(--foreground) / 0.08)",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: "hsl(var(--primary))" }}
                  activeDot={{ r: 5 }}
                />
                <Line
                  type="monotone"
                  dataKey="ordersCount"
                  stroke="hsl(var(--muted-foreground))"
                  strokeDasharray="4 4"
                  strokeWidth={1.5}
                  dot={false}
                  yAxisId={0}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">
            {t("topProductRevenue")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loadingProducts ? (
            <Skeleton className="h-65 w-full" />
          ) : !topProductChartRows.length ? (
            <div className="flex h-65 items-center justify-center">
              <p className="text-sm text-muted-foreground">
                {t("noProductRevenueDataYet")}
              </p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart
                data={topProductChartRows}
                margin={{ top: 8, right: 12, left: 4, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  className="stroke-border/60"
                />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  interval={0}
                />
                <YAxis
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `$${Number(value) / 1000}k`}
                />
                <Tooltip
                  formatter={(value, name) =>
                    name === "revenue"
                      ? [fmt(Number(value)), t("revenue")]
                      : [value, t("qtySold")]
                  }
                  labelClassName="font-medium"
                  contentStyle={{
                    borderRadius: 8,
                    border: "1px solid hsl(var(--border))",
                    boxShadow: "0 10px 30px hsl(var(--foreground) / 0.08)",
                  }}
                />
                <Bar
                  dataKey="revenue"
                  fill="hsl(var(--primary))"
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Recent Orders */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">
              {t("recentOrders")}
            </CardTitle>
          </CardHeader>
          <CardContent className="px-0">
            {loadingOrders ? (
              <div className="space-y-3 px-6">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : !recentOrderRows.length ? (
              <p className="text-sm text-muted-foreground px-6 py-4">
                {t("noRecentOrders")}
              </p>
            ) : (
              <div className="divide-y divide-border">
                {recentOrderRows.slice(0, 6).map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between px-6 py-2.5"
                  >
                    <div>
                      <p className="text-sm font-medium">{order.reference}</p>
                      <p className="text-xs text-muted-foreground">
                        {order.customerName}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium">
                        {fmt(order.totalAmount)}
                      </span>
                      <CStatusBadge status={order.status} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Low Stock */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-orange-500" />
              {t("lowStockAlerts")}
            </CardTitle>
          </CardHeader>
          <CardContent className="px-0">
            {loadingStock ? (
              <div className="space-y-3 px-6">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : !lowStockRows.length ? (
              <p className="text-sm text-muted-foreground px-6 py-4">
                {t("allStockLevelsOk")}
              </p>
            ) : (
              <div className="divide-y divide-border">
                {lowStockRows.slice(0, 6).map((item) => (
                  <div key={item.productId} className="px-6 py-2.5">
                    <div className="flex justify-between">
                      <p className="text-sm font-medium">{item.productName}</p>
                      <span className="text-xs font-semibold text-red-600">
                        {t("leftCount", { count: item.currentStock })}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {t("minStockInline", {
                        count: item.minimumStock,
                        warehouseName: item.warehouseName,
                      })}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Products */}
        <Card className="lg:col-span-3">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">
              {t("topSellingProducts")}
            </CardTitle>
          </CardHeader>
          <CardContent className="px-0">
            {loadingProducts ? (
              <div className="space-y-3 px-6">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : !topProductRows.length ? (
              <p className="text-sm text-muted-foreground px-6 py-4">
                {t("noDataYet")}
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="px-6 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        {t("product")}
                      </th>
                      <th className="px-6 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        {t("sku")}
                      </th>
                      <th className="px-6 py-2 text-right text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        {t("qtySold")}
                      </th>
                      <th className="px-6 py-2 text-right text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        {t("revenue")}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {topProductRows.map((p) => (
                      <tr key={p.productId} className="hover:bg-muted/20">
                        <td className="px-6 py-2.5 font-medium">
                          {p.productName}
                        </td>
                        <td className="px-6 py-2.5 text-muted-foreground">
                          {p.sku}
                        </td>
                        <td className="px-6 py-2.5 text-right">
                          {p.quantitySold}
                        </td>
                        <td className="px-6 py-2.5 text-right font-medium">
                          {fmt(p.totalRevenue)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
