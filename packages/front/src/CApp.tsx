import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
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
import CNotFound from "@/pages/CNotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
    },
  },
});

function CRouter() {
  const { loading, user } = useCAuth();

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

  return (
    <CAppLayout>
      <Switch>
        <Route path="/" component={CDashboard} />
        <Route path="/sales/customers" component={CCustomers} />
        <Route path="/sales/quotations" component={CQuotations} />
        <Route path="/sales/orders" component={COrders} />
        <Route path="/sales/invoices" component={CInvoices} />
        <Route path="/inventory/products" component={CProducts} />
        <Route path="/inventory/stock" component={CStock} />
        <Route path="/inventory/warehouses" component={CWarehouses} />
        <Route path="/purchases/suppliers" component={CSuppliers} />
        <Route path="/purchases/orders" component={CPurchaseOrders} />
        <Route path="/purchases/invoices" component={CPurchaseInvoices} />
        <Route path="/reports/sales" component={CSalesReport} />
        <Route path="/reports/inventory" component={CInventoryReport} />
        <Route path="/reports/purchases" component={CPurchasesReport} />
        <Route path="/settings/users" component={CUsers} />
        <Route path="/planning/projects" component={CProjects} />
        <Route path="/planning/projects/:id" component={CProjectDetail} />
        <Route path="/planning/tasks" component={CTasks} />
        <Route component={CNotFound} />
      </Switch>
    </CAppLayout>
  );
}

function CApp() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <CAuthProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <CRouter />
          </WouterRouter>
        </CAuthProvider>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default CApp;
