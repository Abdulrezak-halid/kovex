import { useState } from "react";
import { useGetSalesReport } from "@sme-erp/api-client";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const fmt = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);

export default function SalesReport() {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [params, setParams] = useState<{ from?: string; to?: string }>({});

  const { data, isLoading } = useGetSalesReport(params);

  return (
    <div className="p-6">
      <PageHeader title="Sales Report" description="Revenue and order analytics" />

      <Card className="mb-6">
        <CardContent className="pt-4">
          <div className="flex items-end gap-4">
            <div>
              <Label className="text-xs">From</Label>
              <Input type="date" className="mt-1 h-8 text-sm" value={from} onChange={(e) => setFrom(e.target.value)} />
            </div>
            <div>
              <Label className="text-xs">To</Label>
              <Input type="date" className="mt-1 h-8 text-sm" value={to} onChange={(e) => setTo(e.target.value)} />
            </div>
            <Button size="sm" onClick={() => setParams({ from: from || undefined, to: to || undefined })}>Apply</Button>
            <Button size="sm" variant="outline" onClick={() => { setFrom(""); setTo(""); setParams({}); }}>Clear</Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <Card>
          <CardContent className="p-5">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Total Revenue</p>
            {isLoading ? <Skeleton className="h-7 w-32 mt-1.5" /> : <p className="text-2xl font-semibold mt-1">{fmt(data?.totalRevenue ?? 0)}</p>}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Total Orders</p>
            {isLoading ? <Skeleton className="h-7 w-20 mt-1.5" /> : <p className="text-2xl font-semibold mt-1">{data?.totalOrders ?? 0}</p>}
          </CardContent>
        </Card>
      </div>

      {data?.rows && data.rows.length > 0 && (
        <Card className="mb-6">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">Revenue Over Time</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={data.rows}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-50" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(v) => fmt(Number(v))} />
                <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {data?.topCustomers && data.topCustomers.length > 0 && (
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">Top Customers</CardTitle></CardHeader>
          <CardContent className="px-0">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-border">
                <th className="px-6 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">Customer</th>
                <th className="px-6 py-2 text-right text-xs font-medium text-muted-foreground uppercase tracking-wide">Orders</th>
                <th className="px-6 py-2 text-right text-xs font-medium text-muted-foreground uppercase tracking-wide">Total Spent</th>
              </tr></thead>
              <tbody className="divide-y divide-border">
                {data.topCustomers.map((c) => (
                  <tr key={c.customerId} className="hover:bg-muted/20">
                    <td className="px-6 py-2.5 font-medium">{c.customerName}</td>
                    <td className="px-6 py-2.5 text-right">{c.ordersCount}</td>
                    <td className="px-6 py-2.5 text-right font-medium">{fmt(c.totalSpent)}</td>
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
