import { useListStock, useListWarehouses } from "@sme-erp/api-client";
import type { StockLevel } from "@sme-erp/api-client";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { CPageHeader } from "@/components/CPageHeader";
import { CDataTable } from "@/components/CDataTable";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

export default function CStock() {
  const { t } = useTranslation();
  const [warehouseId, setWarehouseId] = useState<string>("all");
  const { data: warehouses } = useListWarehouses();
  const { data, isLoading } = useListStock({
    warehouseId:
      warehouseId && warehouseId !== "all" ? Number(warehouseId) : undefined,
  });

  const columns = [
    {
      header: t("product"),
      cell: (r: StockLevel) => (
        <span className="font-medium">{r.productName}</span>
      ),
    },
    {
      header: t("sku"),
      cell: (r: StockLevel) => (
        <span className="font-mono text-sm text-muted-foreground">{r.sku}</span>
      ),
    },
    { header: t("warehouse"), cell: (r: StockLevel) => r.warehouseName },
    {
      header: t("quantity"),
      cell: (r: StockLevel) => (
        <span
          className={
            r.quantity <= r.minimumStock
              ? "text-red-600 font-semibold"
              : "font-medium"
          }
        >
          {r.quantity}
        </span>
      ),
    },
    { header: t("minStock"), cell: (r: StockLevel) => r.minimumStock },
    {
      header: t("status"),
      cell: (r: StockLevel) =>
        r.quantity <= r.minimumStock ? (
          <Badge variant="destructive" className="text-xs">
            {t("lowStock")}
          </Badge>
        ) : (
          <Badge variant="secondary" className="text-xs">
            {t("ok")}
          </Badge>
        ),
    },
  ];

  return (
    <div className="p-6">
      <CPageHeader
        title={t("stockLevels")}
        description={t("currentInventoryLevelsAcrossAllWarehouses")}
      />
      <div className="mb-4 w-56">
        <Select value={warehouseId} onValueChange={setWarehouseId}>
          <SelectTrigger className="h-8 text-sm">
            <SelectValue placeholder={t("allWarehouses")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("allWarehouses")}</SelectItem>
            {warehouses?.map((w) => (
              <SelectItem key={w.id} value={String(w.id)}>
                {w.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <CDataTable
        columns={columns}
        data={data}
        isLoading={isLoading}
        keyField="productId"
        emptyMessage={t("noStockDataAddProductsAndWarehousesFirst")}
      />
    </div>
  );
}
