import { useState } from "react";
import { useGetPurchasesReport } from "@sme-erp/api-client";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

const fmt = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);

export default function PurchasesReport() {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [params, setParams] = useState<{ from?: string; to?: string }>({});

  const { data, isLoading } = useGetPurchasesReport(params);

  return (
    <div className="p-6">
      <PageHeader title="Purchases Report" description="Supplier spending analytics" />

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
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Total Spent</p>
            {isLoading ? <Skeleton className="h-7 w-32 mt-1.5" /> : <p className="text-2xl font-semibold mt-1">{fmt(data?.totalSpent ?? 0)}</p>}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Purchase Orders</p>
            {isLoading ? <Skeleton className="h-7 w-20 mt-1.5" /> : <p className="text-2xl font-semibold mt-1">{data?.totalPurchaseOrders ?? 0}</p>}
          </CardContent>
        </Card>
      </div>

      {data?.topSuppliers && data.topSuppliers.length > 0 && (
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">Top Suppliers</CardTitle></CardHeader>
          <CardContent className="px-0">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-border">
                <th className="px-6 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">Supplier</th>
                <th className="px-6 py-2 text-right text-xs font-medium text-muted-foreground uppercase tracking-wide">Orders</th>
                <th className="px-6 py-2 text-right text-xs font-medium text-muted-foreground uppercase tracking-wide">Total Purchased</th>
              </tr></thead>
              <tbody className="divide-y divide-border">
                {data.topSuppliers.map((s) => (
                  <tr key={s.supplierId} className="hover:bg-muted/20">
                    <td className="px-6 py-2.5 font-medium">{s.supplierName}</td>
                    <td className="px-6 py-2.5 text-right">{s.ordersCount}</td>
                    <td className="px-6 py-2.5 text-right font-medium">{fmt(s.totalPurchased)}</td>
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
