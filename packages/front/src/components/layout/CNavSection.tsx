import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useLocation } from "wouter";
import { ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { INavItem } from "@/components/layout/CNavigationConfig";

export function CNavSection({
  item,
  onNavigate,
}: {
  item: INavItem;
  onNavigate?: () => void;
}) {
  const { t } = useTranslation();
  const [location] = useLocation();
  const [open, setOpen] = useState(() => {
    if (!item.children) return false;
    return item.children.some(
      (child) => child.href === location || location.startsWith(child.href),
    );
  });

  if (!item.children && item.href) {
    const isActive = location === item.href;
    return (
      <Link
        href={item.href}
        onClick={onNavigate}
        className={cn(
          "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
          isActive
            ? "bg-sidebar-primary text-sidebar-primary-foreground"
            : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
        )}
      >
        <item.icon className="h-4 w-4 shrink-0" />
        {t(item.labelKey)}
      </Link>
    );
  }

  const hasActiveChild = item.children?.some(
    (child) => location === child.href || location.startsWith(child.href),
  );

  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          "w-full flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium transition-colors",
          hasActiveChild
            ? "text-sidebar-foreground"
            : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
        )}
      >
        <span className="flex items-center gap-3">
          <item.icon className="h-4 w-4 shrink-0" />
          {t(item.labelKey)}
        </span>
        {open ? (
          <ChevronDown className="h-3.5 w-3.5" />
        ) : (
          <ChevronRight className="h-3.5 w-3.5" />
        )}
      </button>
      {open && (
        <div className="mt-1 ml-7 space-y-0.5">
          {item.children?.map((child) => {
            const isActive = location === child.href;
            return (
              <Link
                key={child.href}
                href={child.href}
                onClick={onNavigate}
                className={cn(
                  "block px-3 py-1.5 rounded-md text-sm transition-colors",
                  isActive
                    ? "bg-sidebar-primary text-sidebar-primary-foreground font-medium"
                    : "text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                )}
              >
                {t(child.labelKey)}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
