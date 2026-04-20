import { useEffect, useState } from "react";
import { DollarSign, ShoppingCart, Users, TrendingUp, Package, CreditCard } from "lucide-react";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { SalesChart } from "@/components/dashboard/SalesChart";
import { RecentOrders } from "@/components/dashboard/RecentOrders";
import { ProductInventory } from "@/components/dashboard/ProductInventory";
import { get } from "@/lib/apiClient";

export default function Dashboard() {
  const [dashData, setDashData] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    get('/api/analytics/dashboard')
      .then((res) => setDashData(res.data))
      .catch(() => {});

    get('/api/orders')
      .then((res) => setOrders((res.data || []).slice(0, 5)))
      .catch(() => {});
  }, []);

  const today = dashData?.today || {};
  const growth = dashData?.growth || {};
  const inventory = dashData?.inventory || {};

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val || 0);

  const formatGrowth = (val: number | string) => {
    const n = parseFloat(String(val || 0));
    return `${n >= 0 ? '+' : ''}${n.toFixed(1)}% from yesterday`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back! Here's an overview of your e-commerce performance.
        </p>
      </div>

      {/* Metrics Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Today's Revenue"
          value={dashData ? formatCurrency(today.revenue) : '—'}
          change={dashData ? formatGrowth(growth.revenue) : 'Loading...'}
          changeType={growth.revenue >= 0 ? 'positive' : 'negative'}
          icon={DollarSign}
        />
        <MetricCard
          title="Today's Orders"
          value={dashData ? String(today.orders || 0) : '—'}
          change={dashData ? formatGrowth(growth.orders) : 'Loading...'}
          changeType={growth.orders >= 0 ? 'positive' : 'negative'}
          icon={ShoppingCart}
        />
        <MetricCard
          title="Total Products"
          value={dashData ? String(inventory.productCount || 0) : '—'}
          change={`${dashData?.alerts?.lowStockCount || 0} low stock`}
          changeType={dashData?.alerts?.lowStockCount > 0 ? 'negative' : 'positive'}
          icon={Package}
        />
        <MetricCard
          title="Today's Profit"
          value={dashData ? formatCurrency(today.profit) : '—'}
          change={dashData ? formatGrowth(growth.profit) : 'Loading...'}
          changeType={growth.profit >= 0 ? 'positive' : 'negative'}
          icon={TrendingUp}
        />
      </div>

      {/* Charts and Tables Grid */}
      <div className="grid gap-6 md:grid-cols-4">
        <SalesChart />
        <div className="space-y-6">
          <MetricCard
            title="Inventory Value"
            value={dashData ? formatCurrency(inventory.totalInventoryValue) : '—'}
            change={dashData ? `Cost: ${formatCurrency(inventory.totalInventoryCost)}` : ''}
            changeType="neutral"
            icon={CreditCard}
          />
          <MetricCard
            title="Avg Order Value"
            value={dashData ? formatCurrency(today.averageOrderValue) : '—'}
            change="Today's average"
            changeType="neutral"
            icon={ShoppingCart}
          />
        </div>
      </div>

      {/* Recent Orders */}
      <div className="grid gap-6 md:grid-cols-1">
        <RecentOrders orders={orders} />
      </div>

      {/* Product Inventory */}
      <div className="grid gap-6 md:grid-cols-1">
        <ProductInventory />
      </div>
    </div>
  );
}
