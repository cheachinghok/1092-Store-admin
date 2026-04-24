import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { DashboardLayout } from "./components/dashboard/DashboardLayout";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import Product from "./pages/Product";
import Report from "./pages/Report";
import Order from "./pages/Order";
import Customer from "./pages/Customer";
import Category from "./pages/Category";
import Login from "./pages/login";
import ProtectedRoute from "./middleware/protect";
const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
            }>
            <Route index element={<Dashboard />} />
            <Route path="orders" element={<Order />} />
            <Route path="products" element={<Product />} />
            <Route path="categories" element={<Category />} />
            <Route path="customers" element={<Customer />} />
            <Route path="analytics" element={<div className="p-6">Analytics page coming soon...</div>} />
            <Route path="payments" element={<div className="p-6">Payments page coming soon...</div>} />
            <Route path="reports" element={<Report />} />
            <Route path="settings" element={<div className="p-6">Settings page coming soon...</div>} />
          </Route>
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
