import { useEffect, type ComponentType, type PropsWithChildren } from "react";
import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider, type ThemeProviderProps } from "next-themes";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CAppLayout } from "@/components/CAppLayout";
import { CAuthProvider, useCAuth } from "@/lib/auth";
import CLogin from "@/pages/CLogin";
import CDashboard from "@/pages/CDashboard";
import CCustomers from "@/pages/sales/CCustomers";
import CQuotations from "@/pages/sales/CQuotations";
import COrders from "@/pages/sales/COrders";
import CInvoices from "@/pages/sales/CInvoices";
import CProducts from "@/pages/inventory/CProducts";
import CStock from "@/pages/inventory/CStock";
import CWarehouses from "@/pages/inventory/CWarehouses";
import CSuppliers from "@/pages/purchases/CSuppliers";
import CPurchaseOrders from "@/pages/purchases/CPurchaseOrders";
import CPurchaseInvoices from "@/pages/purchases/CPurchaseInvoices";
import CSalesReport from "@/pages/reports/CSalesReport";
import CInventoryReport from "@/pages/reports/CInventoryReport";
import CPurchasesReport from "@/pages/reports/CPurchasesReport";
import CUsers from "@/pages/settings/CUsers";
import CProjects from "@/pages/planning/CProjects";
import CProjectDetail from "@/pages/planning/CProjectDetail";
import CTasks from "@/pages/planning/CTasks";
import CForbidden from "@/pages/CForbidden";
import CNotFound from "@/pages/CNotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
    },
  },
});

const CThemeProvider = ThemeProvider as ComponentType<
  PropsWithChildren<ThemeProviderProps>
>;

function CRouter() {
  const { loading, user, canAccessPath } = useCAuth();
  const [location, setLocation] = useLocation();

  useEffect(() => {
    if (loading) return;

    if (!user && location !== "/login") {
      setLocation("/login");
    }

    if (user && location === "/login") {
      setLocation("/");
    }
  }, [loading, location, setLocation, user]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-sm text-muted-foreground">
        Loading
      </div>
    );
  }

  if (!user) {
    return (
      <Switch>
        <Route path="/login" component={CLogin} />
        <Route component={CLogin} />
      </Switch>
    );
  }

  const routeComponent = (path: string, component: React.ComponentType) =>
    canAccessPath(path) ? component : CForbidden;

  return (
    <CAppLayout>
      <Switch>
        <Route path="/login" component={CDashboard} />
        <Route path="/" component={CDashboard} />
        <Route
          path="/sales/customers"
          component={routeComponent("/sales/customers", CCustomers)}
        />
        <Route
          path="/sales/quotations"
          component={routeComponent("/sales/quotations", CQuotations)}
        />
        <Route
          path="/sales/orders"
          component={routeComponent("/sales/orders", COrders)}
        />
        <Route
          path="/sales/invoices"
          component={routeComponent("/sales/invoices", CInvoices)}
        />
        <Route
          path="/inventory/products"
          component={routeComponent("/inventory/products", CProducts)}
        />
        <Route
          path="/inventory/stock"
          component={routeComponent("/inventory/stock", CStock)}
        />
        <Route
          path="/inventory/warehouses"
          component={routeComponent("/inventory/warehouses", CWarehouses)}
        />
        <Route
          path="/purchases/suppliers"
          component={routeComponent("/purchases/suppliers", CSuppliers)}
        />
        <Route
          path="/purchases/orders"
          component={routeComponent("/purchases/orders", CPurchaseOrders)}
        />
        <Route
          path="/purchases/invoices"
          component={routeComponent("/purchases/invoices", CPurchaseInvoices)}
        />
        <Route
          path="/reports/sales"
          component={routeComponent("/reports/sales", CSalesReport)}
        />
        <Route
          path="/reports/inventory"
          component={routeComponent("/reports/inventory", CInventoryReport)}
        />
        <Route
          path="/reports/purchases"
          component={routeComponent("/reports/purchases", CPurchasesReport)}
        />
        <Route
          path="/settings/users"
          component={routeComponent("/settings/users", CUsers)}
        />
        <Route
          path="/planning/projects"
          component={routeComponent("/planning/projects", CProjects)}
        />
        <Route
          path="/planning/projects/:id"
          component={routeComponent("/planning/projects", CProjectDetail)}
        />
        <Route
          path="/planning/tasks"
          component={routeComponent("/planning/tasks", CTasks)}
        />
        <Route component={CNotFound} />
      </Switch>
    </CAppLayout>
  );
}

function CApp() {
  return (
    <QueryClientProvider client={queryClient}>
      <CThemeProvider attribute="class" defaultTheme="light" enableSystem>
        <TooltipProvider>
          <CAuthProvider>
            <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
              <CRouter />
            </WouterRouter>
          </CAuthProvider>
          <Toaster />
        </TooltipProvider>
      </CThemeProvider>
    </QueryClientProvider>
  );
}

export default CApp;
