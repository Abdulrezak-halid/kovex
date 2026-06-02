import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useLocation } from "wouter";
import {
  LayoutDashboard,
  Users,
  FileText,
  ShoppingCart,
  Receipt,
  Package,
  Warehouse,
  BarChart3,
  Settings,
  ChevronDown,
  ChevronRight,
  Menu,
  X,
  TrendingUp,
  Boxes,
  Truck,
  CalendarDays,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface INavItem {
  labelKey: string;
  href?: string;
  icon: React.ComponentType<{ className?: string }>;
  children?: { labelKey: string; href: string }[];
}

const navItems: INavItem[] = [
  { labelKey: "dashboard", href: "/", icon: LayoutDashboard },
  {
    labelKey: "sales",
    icon: TrendingUp,
    children: [
      { labelKey: "customers", href: "/sales/customers" },
      { labelKey: "quotations", href: "/sales/quotations" },
      { labelKey: "orders", href: "/sales/orders" },
      { labelKey: "invoices", href: "/sales/invoices" },
    ],
  },
  {
    labelKey: "inventory",
    icon: Boxes,
    children: [
      { labelKey: "products", href: "/inventory/products" },
      { labelKey: "stock", href: "/inventory/stock" },
      { labelKey: "warehouses", href: "/inventory/warehouses" },
    ],
  },
  {
    labelKey: "purchases",
    icon: Truck,
    children: [
      { labelKey: "suppliers", href: "/purchases/suppliers" },
      { labelKey: "purchaseOrders", href: "/purchases/orders" },
      { labelKey: "purchaseInvoices", href: "/purchases/invoices" },
    ],
  },
  {
    labelKey: "reports",
    icon: BarChart3,
    children: [
      { labelKey: "salesReport", href: "/reports/sales" },
      { labelKey: "inventoryReport", href: "/reports/inventory" },
      { labelKey: "purchasesReport", href: "/reports/purchases" },
    ],
  },
  {
    labelKey: "planning",
    icon: CalendarDays,
    children: [
      { labelKey: "projects", href: "/planning/projects" },
      { labelKey: "tasks", href: "/planning/tasks" },
    ],
  },
  {
    labelKey: "settings",
    icon: Settings,
    children: [{ labelKey: "users", href: "/settings/users" }],
  },
];

function CNavSection({
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
      (c) => c.href === location || location.startsWith(c.href),
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
    (c) => location === c.href || location.startsWith(c.href),
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

function CLanguageSwitch() {
  const { i18n, t } = useTranslation();

  const changeLanguage = (language: "en" | "tr") => {
    void i18n.changeLanguage(language);
  };

  return (
    <div aria-label={t("language")} className="grid grid-cols-2 gap-1">
      <Button
        aria-pressed={i18n.language === "en"}
        className="h-8 text-xs"
        onClick={() => changeLanguage("en")}
        size="sm"
        type="button"
        variant={i18n.language === "en" ? "default" : "outline"}
      >
        EN
      </Button>
      <Button
        aria-pressed={i18n.language === "tr"}
        className="h-8 text-xs"
        onClick={() => changeLanguage("tr")}
        size="sm"
        type="button"
        variant={i18n.language === "tr" ? "default" : "outline"}
      >
        TR
      </Button>
    </div>
  );
}

function CSidebar({ onNavigate }: { onNavigate?: () => void }) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col h-full bg-sidebar text-sidebar-foreground">
      <div className="px-4 py-5 border-b border-sidebar-border">
        <div className="space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="h-7 w-7 rounded-md flex items-center justify-center overflow-hidden">
              <img
                src="/kovex-icon.png"
                alt={t("appName")}
                className="h-full w-full object-cover"
              />
            </div>
            <div>
              <p className="text-sm font-semibold text-sidebar-foreground leading-tight">
                {t("appName")}
              </p>
              <p className="text-xs text-sidebar-foreground/50">
                {t("appSubtitle")}
              </p>
            </div>
          </div>
          <Button
            asChild
            variant="outline"
            size="sm"
            className="h-8 w-full justify-start gap-2 text-xs text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          >
            <a
              href="http://localhost:5000/api-docs/"
              target="_blank"
              rel="noreferrer"
              onClick={onNavigate}
            >
              <ExternalLink className="h-3.5 w-3.5" />
              {t("apiDocs")}
            </a>
          </Button>
          <CLanguageSwitch />
        </div>
      </div>
      <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-0.5">
        {navItems.map((item) => (
          <CNavSection
            key={item.labelKey}
            item={item}
            onNavigate={onNavigate}
          />
        ))}
      </nav>
      <div className="px-4 py-3 border-t border-sidebar-border">
        {/* <p className="text-xs text-sidebar-foreground/40">v1.0.0</p> */}
        <img
          src="/kovex-removebg.png"
          alt={t("appName")}
          className="w-auto items-baseline"
        />
      </div>
    </div>
  );
}

export function CAppLayout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { t } = useTranslation();

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:shrink-0 lg:w-56">
        <div className="w-56 border-r border-border">
          <CSidebar />
        </div>
      </div>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute left-0 top-0 h-full w-56 shadow-xl">
            <CSidebar onNavigate={() => setMobileOpen(false)} />
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile header */}
        <div className="lg:hidden flex items-center h-12 px-4 border-b border-border bg-background">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="h-4 w-4" />
          </Button>
          <span className="ml-3 text-sm font-semibold">{t("appName")}</span>
          <div className="ml-auto w-24">
            <CLanguageSwitch />
          </div>
        </div>
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
