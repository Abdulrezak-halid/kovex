import type { ComponentType } from "react";
import {
  BarChart3,
  Boxes,
  CalendarDays,
  LayoutDashboard,
  Settings,
  TrendingUp,
  Truck,
} from "lucide-react";

export interface INavItem {
  labelKey: string;
  href?: string;
  icon: ComponentType<{ className?: string }>;
  adminOnly?: boolean;
  children?: { labelKey: string; href: string }[];
}

export const navItems: INavItem[] = [
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
    adminOnly: true,
    children: [{ labelKey: "users", href: "/settings/users" }],
  },
];

export function permittedNavItems(isAdmin: boolean) {
  return navItems.filter((item) => !item.adminOnly || isAdmin);
}

export function searchItems(isAdmin: boolean) {
  return permittedNavItems(isAdmin).flatMap((item) => {
    if (item.href) {
      return [{ labelKey: item.labelKey, href: item.href }];
    }

    return item.children ?? [];
  });
}
