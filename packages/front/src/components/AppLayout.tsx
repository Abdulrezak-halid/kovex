import { useState } from "react";
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
  ClipboardList,
  CalendarDays,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface NavItem {
  label: string;
  href?: string;
  icon: React.ComponentType<{ className?: string }>;
  children?: { label: string; href: string }[];
}

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  {
    label: "Sales",
    icon: TrendingUp,
    children: [
      { label: "Customers", href: "/sales/customers" },
      { label: "Quotations", href: "/sales/quotations" },
      { label: "Orders", href: "/sales/orders" },
      { label: "Invoices", href: "/sales/invoices" },
    ],
  },
  {
    label: "Inventory",
    icon: Boxes,
    children: [
      { label: "Products", href: "/inventory/products" },
      { label: "Stock", href: "/inventory/stock" },
      { label: "Warehouses", href: "/inventory/warehouses" },
    ],
  },
  {
    label: "Purchases",
    icon: Truck,
    children: [
      { label: "Suppliers", href: "/purchases/suppliers" },
      { label: "Purchase Orders", href: "/purchases/orders" },
      { label: "Purchase Invoices", href: "/purchases/invoices" },
    ],
  },
  {
    label: "Reports",
    icon: BarChart3,
    children: [
      { label: "Sales Report", href: "/reports/sales" },
      { label: "Inventory Report", href: "/reports/inventory" },
      { label: "Purchases Report", href: "/reports/purchases" },
    ],
  },
  {
    label: "Planning",
    icon: CalendarDays,
    children: [
      { label: "Projects", href: "/planning/projects" },
      { label: "Tasks", href: "/planning/tasks" },
    ],
  },
  {
    label: "Settings",
    icon: Settings,
    children: [{ label: "Users", href: "/settings/users" }],
  },
];

function NavSection({
  item,
  onNavigate,
}: {
  item: NavItem;
  onNavigate?: () => void;
}) {
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
        {item.label}
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
          {item.label}
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
                {child.label}
              </Link>
            );
          })}
      </div>
      )}
    </div>
  );
}

function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <div className="flex flex-col h-full bg-sidebar text-sidebar-foreground">
      <div className="px-4 py-5 border-b border-sidebar-border">
        <div className="flex items-center gap-2.5">
          <div className="h-7 w-7 rounded-md bg-sidebar-primary flex items-center justify-center">
            <ClipboardList className="h-4 w-4 text-sidebar-primary-foreground" />
          </div>
          <div>
            <p className="text-sm font-semibold text-sidebar-foreground leading-tight">
              SME ERP
            </p>
            <p className="text-xs text-sidebar-foreground/50">
              Business Operations
            </p>
          </div>
        </div>
      </div>
      <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-0.5">
        {navItems.map((item) => (
          <NavSection key={item.label} item={item} onNavigate={onNavigate} />
        ))}
      </nav>
      <div className="px-4 py-3 border-t border-sidebar-border">
        <p className="text-xs text-sidebar-foreground/40">v1.0.0</p>
      </div>
    </div>
  );
}

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:shrink-0 lg:w-56">
        <div className="w-56 border-r border-border">
          <Sidebar />
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
            <Sidebar onNavigate={() => setMobileOpen(false)} />
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
          <span className="ml-3 text-sm font-semibold">SME ERP</span>
        </div>
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
