import { useListStock, useListWarehouses } from "@sme-erp/api-client";
import type { StockLevel } from "@sme-erp/api-client";
import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { DataTable } from "@/components/DataTable";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

export default function Stock() {
  const [warehouseId, setWarehouseId] = useState<string>("all");
  const { data: warehouses } = useListWarehouses();
  const { data, isLoading } = useListStock({ warehouseId: warehouseId && warehouseId !== "all" ? Number(warehouseId) : undefined });

  const columns = [
    { header: "Product", cell: (r: StockLevel) => <span className="font-medium">{r.productName}</span> },
    { header: "SKU", cell: (r: StockLevel) => <span className="font-mono text-sm text-muted-foreground">{r.sku}</span> },
    { header: "Warehouse", cell: (r: StockLevel) => r.warehouseName },
    {
      header: "Quantity",
      cell: (r: StockLevel) => (
        <span className={r.quantity <= r.minimumStock ? "text-red-600 font-semibold" : "font-medium"}>
          {r.quantity}
        </span>
      ),
    },
    { header: "Min Stock", cell: (r: StockLevel) => r.minimumStock },
    {
      header: "Status",
      cell: (r: StockLevel) =>
        r.quantity <= r.minimumStock ? (
          <Badge variant="destructive" className="text-xs">Low Stock</Badge>
        ) : (
          <Badge variant="secondary" className="text-xs">OK</Badge>
        ),
    },
  ];

  return (
    <div className="p-6">
      <PageHeader title="Stock Levels" description="Current inventory levels across all warehouses" />
      <div className="mb-4 w-56">
        <Select value={warehouseId} onValueChange={setWarehouseId}>
          <SelectTrigger className="h-8 text-sm">
            <SelectValue placeholder="All warehouses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All warehouses</SelectItem>
            {warehouses?.map((w) => (
              <SelectItem key={w.id} value={String(w.id)}>{w.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <DataTable
        columns={columns}
        data={data}
        isLoading={isLoading}
        keyField="productId"
        emptyMessage="No stock data. Add products and warehouses first."
      />
    </div>
  );
}
