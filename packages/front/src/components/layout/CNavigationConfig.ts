import type { ComponentType } from "react";
import { roleCanAccessModule, type PermissionModule } from "@/lib/auth";
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
  permission?: PermissionModule;
  adminOnly?: boolean;
  children?: {
    labelKey: string;
    href: string;
    permission?: PermissionModule;
  }[];
}

export const navItems: INavItem[] = [
  {
    labelKey: "dashboard",
    href: "/",
    icon: LayoutDashboard,
    permission: "dashboard",
  },
  {
    labelKey: "sales",
    icon: TrendingUp,
    children: [
      { labelKey: "customers", href: "/sales/customers", permission: "sales" },
      {
        labelKey: "quotations",
        href: "/sales/quotations",
        permission: "sales",
      },
      { labelKey: "orders", href: "/sales/orders", permission: "sales" },
      {
        labelKey: "invoices",
        href: "/sales/invoices",
        permission: "accounting",
      },
    ],
  },
  {
    labelKey: "inventory",
    icon: Boxes,
    children: [
      {
        labelKey: "products",
        href: "/inventory/products",
        permission: "inventory",
      },
      { labelKey: "stock", href: "/inventory/stock", permission: "inventory" },
      {
        labelKey: "warehouses",
        href: "/inventory/warehouses",
        permission: "inventory",
      },
    ],
  },
  {
    labelKey: "purchases",
    icon: Truck,
    children: [
      {
        labelKey: "suppliers",
        href: "/purchases/suppliers",
        permission: "purchases",
      },
      {
        labelKey: "purchaseOrders",
        href: "/purchases/orders",
        permission: "purchases",
      },
      {
        labelKey: "purchaseInvoices",
        href: "/purchases/invoices",
        permission: "accounting",
      },
    ],
  },
  {
    labelKey: "reports",
    icon: BarChart3,
    children: [
      {
        labelKey: "salesReport",
        href: "/reports/sales",
        permission: "reports",
      },
      {
        labelKey: "inventoryReport",
        href: "/reports/inventory",
        permission: "reports",
      },
      {
        labelKey: "purchasesReport",
        href: "/reports/purchases",
        permission: "reports",
      },
    ],
  },
  {
    labelKey: "planning",
    icon: CalendarDays,
    children: [
      {
        labelKey: "projects",
        href: "/planning/projects",
        permission: "planning",
      },
      { labelKey: "tasks", href: "/planning/tasks", permission: "planning" },
    ],
  },
  {
    labelKey: "settings",
    icon: Settings,
    adminOnly: true,
    permission: "settings",
    children: [
      { labelKey: "users", href: "/settings/users", permission: "settings" },
    ],
  },
];

function canUsePermission(
  role: string | undefined,
  permission?: PermissionModule,
) {
  return !permission || roleCanAccessModule(role, permission);
}

export function permittedNavItems(role: string | undefined) {
  return navItems
    .map((item) => {
      if (!canUsePermission(role, item.permission)) return null;
      if (!item.children) return item;

      const children = item.children.filter((child) =>
        canUsePermission(role, child.permission),
      );
      return children.length ? { ...item, children } : null;
    })
    .filter((item): item is INavItem => item != null);
}

export function searchItems(role: string | undefined) {
  return permittedNavItems(role).flatMap((item) => {
    if (item.href) {
      return [{ labelKey: item.labelKey, href: item.href }];
    }

    return item.children ?? [];
  });
}
