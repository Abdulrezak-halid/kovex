import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppLayout } from "@/components/AppLayout";
import Dashboard from "@/pages/Dashboard";
import Customers from "@/pages/sales/Customers";
import Quotations from "@/pages/sales/Quotations";
import Orders from "@/pages/sales/Orders";
import Invoices from "@/pages/sales/Invoices";
import Products from "@/pages/inventory/Products";
import Stock from "@/pages/inventory/Stock";
import Warehouses from "@/pages/inventory/Warehouses";
import Suppliers from "@/pages/purchases/Suppliers";
import PurchaseOrders from "@/pages/purchases/PurchaseOrders";
import PurchaseInvoices from "@/pages/purchases/PurchaseInvoices";
import SalesReport from "@/pages/reports/SalesReport";
import InventoryReport from "@/pages/reports/InventoryReport";
import PurchasesReport from "@/pages/reports/PurchasesReport";
import Users from "@/pages/settings/Users";
import Projects from "@/pages/planning/Projects";
import ProjectDetail from "@/pages/planning/ProjectDetail";
import Tasks from "@/pages/planning/Tasks";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
    },
  },
});

function Router() {
  return (
    <AppLayout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/sales/customers" component={Customers} />
        <Route path="/sales/quotations" component={Quotations} />
        <Route path="/sales/orders" component={Orders} />
        <Route path="/sales/invoices" component={Invoices} />
        <Route path="/inventory/products" component={Products} />
        <Route path="/inventory/stock" component={Stock} />
        <Route path="/inventory/warehouses" component={Warehouses} />
        <Route path="/purchases/suppliers" component={Suppliers} />
        <Route path="/purchases/orders" component={PurchaseOrders} />
        <Route path="/purchases/invoices" component={PurchaseInvoices} />
        <Route path="/reports/sales" component={SalesReport} />
        <Route path="/reports/inventory" component={InventoryReport} />
        <Route path="/reports/purchases" component={PurchasesReport} />
        <Route path="/settings/users" component={Users} />
        <Route path="/planning/projects" component={Projects} />
        <Route path="/planning/projects/:id" component={ProjectDetail} />
        <Route path="/planning/tasks" component={Tasks} />
        <Route component={NotFound} />
      </Switch>
    </AppLayout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
