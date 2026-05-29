import {
  useGetDashboardSummary,
  useGetTopProducts,
  useGetRecentOrders,
  useGetLowStockAlerts,
} from "@sme-erp/api-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/StatusBadge";
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

function MetricCard({
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
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{title}</p>
            {loading ? (
              <Skeleton className="h-7 w-24 mt-1.5" />
            ) : (
              <p className="text-2xl font-semibold mt-1">{value}</p>
            )}
            {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
          </div>
          <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
            <Icon className="h-4.5 w-4.5 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Dashboard() {
  const { data: summary, isLoading: loadingSummary } = useGetDashboardSummary();
  const { data: topProducts, isLoading: loadingProducts } = useGetTopProducts();
  const { data: recentOrders, isLoading: loadingOrders } = useGetRecentOrders();
  const { data: lowStock, isLoading: loadingStock } = useGetLowStockAlerts();

  const topProductRows = Array.isArray(topProducts) ? topProducts : [];
  const recentOrderRows = Array.isArray(recentOrders) ? recentOrders : [];
  const lowStockRows = Array.isArray(lowStock) ? lowStock : [];

  const fmt = (n: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-xl font-semibold">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Business overview</p>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <MetricCard
          title="Sales This Month"
          value={summary ? fmt(summary.totalSalesThisMonth) : "—"}
          icon={DollarSign}
          loading={loadingSummary}
        />
        <MetricCard
          title="Orders This Month"
          value={summary?.totalOrdersThisMonth ?? "—"}
          icon={ShoppingCart}
          loading={loadingSummary}
        />
        <MetricCard
          title="Total Customers"
          value={summary?.totalCustomers ?? "—"}
          icon={Users}
          loading={loadingSummary}
        />
        <MetricCard
          title="Total Products"
          value={summary?.totalProducts ?? "—"}
          icon={Package}
          loading={loadingSummary}
        />
        <MetricCard
          title="Pending Orders"
          value={summary?.pendingOrders ?? "—"}
          icon={Clock}
          loading={loadingSummary}
        />
        <MetricCard
          title="Low Stock Alerts"
          value={summary?.lowStockCount ?? "—"}
          icon={AlertTriangle}
          loading={loadingSummary}
        />
        <MetricCard
          title="Revenue This Year"
          value={summary ? fmt(summary.totalRevenueThisYear) : "—"}
          icon={TrendingUp}
          loading={loadingSummary}
        />
        <MetricCard
          title="Pending Invoices"
          value={summary?.pendingInvoicesCount ?? "—"}
          icon={FileText}
          loading={loadingSummary}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Recent Orders */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">Recent Orders</CardTitle>
          </CardHeader>
          <CardContent className="px-0">
            {loadingOrders ? (
              <div className="space-y-3 px-6">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : !recentOrderRows.length ? (
              <p className="text-sm text-muted-foreground px-6 py-4">No recent orders.</p>
            ) : (
              <div className="divide-y divide-border">
                {recentOrderRows.slice(0, 6).map((order) => (
                  <div key={order.id} className="flex items-center justify-between px-6 py-2.5">
                    <div>
                      <p className="text-sm font-medium">{order.reference}</p>
                      <p className="text-xs text-muted-foreground">{order.customerName}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium">
                        {fmt(order.totalAmount)}
                      </span>
                      <StatusBadge status={order.status} />
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
              Low Stock Alerts
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
              <p className="text-sm text-muted-foreground px-6 py-4">All stock levels OK.</p>
            ) : (
              <div className="divide-y divide-border">
                {lowStockRows.slice(0, 6).map((item) => (
                  <div key={item.productId} className="px-6 py-2.5">
                    <div className="flex justify-between">
                      <p className="text-sm font-medium">{item.productName}</p>
                      <span className="text-xs font-semibold text-red-600">{item.currentStock} left</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Min: {item.minimumStock} · {item.warehouseName}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Products */}
        <Card className="lg:col-span-3">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">Top Selling Products</CardTitle>
          </CardHeader>
          <CardContent className="px-0">
            {loadingProducts ? (
              <div className="space-y-3 px-6">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : !topProductRows.length ? (
              <p className="text-sm text-muted-foreground px-6 py-4">No data yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="px-6 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">Product</th>
                      <th className="px-6 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">SKU</th>
                      <th className="px-6 py-2 text-right text-xs font-medium text-muted-foreground uppercase tracking-wide">Qty Sold</th>
                      <th className="px-6 py-2 text-right text-xs font-medium text-muted-foreground uppercase tracking-wide">Revenue</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {topProductRows.map((p) => (
                      <tr key={p.productId} className="hover:bg-muted/20">
                        <td className="px-6 py-2.5 font-medium">{p.productName}</td>
                        <td className="px-6 py-2.5 text-muted-foreground">{p.sku}</td>
                        <td className="px-6 py-2.5 text-right">{p.quantitySold}</td>
                        <td className="px-6 py-2.5 text-right font-medium">{fmt(p.totalRevenue)}</td>
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
