import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { DashboardLayout } from "./components/dashboard/DashboardLayout";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<DashboardLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="orders" element={<div className="p-6">Orders page coming soon...</div>} />
            <Route path="products" element={<div className="p-6">Products page coming soon...</div>} />
            <Route path="customers" element={<div className="p-6">Customers page coming soon...</div>} />
            <Route path="analytics" element={<div className="p-6">Analytics page coming soon...</div>} />
            <Route path="payments" element={<div className="p-6">Payments page coming soon...</div>} />
            <Route path="reports" element={<div className="p-6">Reports page coming soon...</div>} />
            <Route path="settings" element={<div className="p-6">Settings page coming soon...</div>} />
          </Route>
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
