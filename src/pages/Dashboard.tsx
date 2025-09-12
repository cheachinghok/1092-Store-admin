import { DollarSign, ShoppingCart, Users, TrendingUp, Package, CreditCard } from "lucide-react";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { SalesChart } from "@/components/dashboard/SalesChart";
import { RecentOrders } from "@/components/dashboard/RecentOrders";

export default function Dashboard() {
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
          title="Total Revenue"
          value="$45,231.89"
          change="+20.1% from last month"
          changeType="positive"
          icon={DollarSign}
        />
        <MetricCard
          title="Orders"
          value="2,350"
          change="+180.1% from last month"
          changeType="positive"
          icon={ShoppingCart}
        />
        <MetricCard
          title="Customers"
          value="12,234"
          change="+19% from last month"
          changeType="positive"
          icon={Users}
        />
        <MetricCard
          title="Conversion Rate"
          value="3.2%"
          change="+1.2% from last month"
          changeType="positive"
          icon={TrendingUp}
        />
      </div>

      {/* Charts and Tables Grid */}
      <div className="grid gap-6 md:grid-cols-4">
        <SalesChart />
        <div className="space-y-6">
          <MetricCard
            title="Products Sold"
            value="573"
            change="+201 today"
            changeType="positive"
            icon={Package}
          />
          <MetricCard
            title="Avg Order Value"
            value="$52.40"
            change="-12% from last month"
            changeType="negative"
            icon={CreditCard}
          />
        </div>
      </div>

      {/* Recent Orders */}
      <div className="grid gap-6 md:grid-cols-1">
        <RecentOrders />
      </div>
    </div>
  );
}