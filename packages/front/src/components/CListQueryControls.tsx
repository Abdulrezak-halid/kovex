import { Search } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type SortOption = {
  value: string;
  label: string;
};

type CListQueryControlsProps = {
  search: string;
  onSearchChange: (value: string) => void;
  sortBy: string;
  onSortByChange: (value: string) => void;
  sortOrder: "asc" | "desc";
  onSortOrderChange: (value: "asc" | "desc") => void;
  limit: number;
  onLimitChange: (value: number) => void;
  sortOptions: SortOption[];
  searchPlaceholder?: string;
};

export function CListQueryControls({
  search,
  onSearchChange,
  sortBy,
  onSortByChange,
  sortOrder,
  onSortOrderChange,
  limit,
  onLimitChange,
  sortOptions,
  searchPlaceholder,
}: CListQueryControlsProps) {
  const { t } = useTranslation();

  return (
    <div className="mb-4 flex flex-wrap items-end gap-3">
      <div className="min-w-[260px] flex-1">
        <Label className="text-xs">{t("search")}</Label>
        <div className="relative mt-1">
          <Search className="pointer-events-none absolute left-2.5 top-2 h-4 w-4 text-muted-foreground" />
          <Input
            className="h-8 pl-8 text-sm"
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder={searchPlaceholder ?? t("searchRecords")}
          />
        </div>
      </div>
      <div className="w-[170px]">
        <Label className="text-xs">{t("sortBy")}</Label>
        <Select value={sortBy} onValueChange={onSortByChange}>
          <SelectTrigger className="mt-1 h-8 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {sortOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="w-[140px]">
        <Label className="text-xs">{t("sortOrder")}</Label>
        <Select
          value={sortOrder}
          onValueChange={(value) => onSortOrderChange(value as "asc" | "desc")}
        >
          <SelectTrigger className="mt-1 h-8 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="desc">{t("descending")}</SelectItem>
            <SelectItem value="asc">{t("ascending")}</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="w-[120px]">
        <Label className="text-xs">{t("limit")}</Label>
        <Select
          value={String(limit)}
          onValueChange={(value) => onLimitChange(Number(value))}
        >
          <SelectTrigger className="mt-1 h-8 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {[25, 50, 100, 200].map((value) => (
              <SelectItem key={value} value={String(value)}>
                {value}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
