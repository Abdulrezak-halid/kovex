import { Skeleton } from "@/components/ui/skeleton";
import { useTranslation } from "react-i18next";
import { translateText } from "@/lib/i18n";
import { useCAuth } from "@/lib/auth";

interface IColumn<T> {
  header: string;
  accessor?: keyof T;
  cell?: (row: T) => React.ReactNode;
  className?: string;
}

interface IDataTableProps<T> {
  columns: IColumn<T>[];
  data: T[] | undefined;
  isLoading?: boolean;
  keyField: keyof T;
  emptyMessage?: string;
}

export function CDataTable<T>({
  columns,
  data,
  isLoading,
  keyField,
  emptyMessage,
}: IDataTableProps<T>) {
  const { t } = useTranslation();
  const { canManageData } = useCAuth();
  const visibleColumns = columns.filter(
    (col) => canManageData || col.header.toLowerCase() !== "actions",
  );

  return (
    <div className="w-full overflow-x-auto rounded-lg border border-border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/40">
            {visibleColumns.map((col) => (
              <th
                key={col.header}
                className={`px-4 py-2.5 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider ${col.className ?? ""}`}
              >
                {translateText(t, col.header)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border bg-card">
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <tr key={i}>
                {visibleColumns.map((col) => (
                  <td key={col.header} className="px-4 py-3">
                    <Skeleton className="h-4 w-full" />
                  </td>
                ))}
              </tr>
            ))
          ) : !data || data.length === 0 ? (
            <tr>
              <td
                colSpan={visibleColumns.length}
                className="px-4 py-8 text-center text-sm text-muted-foreground"
              >
                {emptyMessage
                  ? translateText(t, emptyMessage)
                  : t("noRecordsFound")}
              </td>
            </tr>
          ) : (
            data.map((row) => (
              <tr
                key={String(row[keyField])}
                className="hover:bg-muted/20 transition-colors"
              >
                {visibleColumns.map((col) => (
                  <td
                    key={col.header}
                    className={`px-4 py-3 ${col.className ?? ""}`}
                  >
                    {col.cell
                      ? col.cell(row)
                      : String(row[col.accessor!] ?? "")}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
