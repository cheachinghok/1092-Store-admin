import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface Order {
  _id?: string;
  orderNumber?: string;
  user?: { name?: string; email?: string };
  totalAmount?: number;
  orderStatus?: string;
  createdAt?: string;
}

const getStatusVariant = (status: string) => {
  switch (status) {
    case "delivered":
    case "completed":
      return "default";
    case "pending":
      return "secondary";
    case "processing":
      return "outline";
    case "cancelled":
      return "destructive";
    default:
      return "secondary";
  }
};

const formatCurrency = (val: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val || 0);

export function RecentOrders({ orders = [] }: { orders?: Order[] }) {
  if (orders.length === 0) {
    return (
      <Card className="col-span-2">
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
          <CardDescription>Latest orders from your customers</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-8">
            No recent orders to display.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle>Recent Orders</CardTitle>
        <CardDescription>Latest orders from your customers</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {orders.map((order) => {
            const customerName = order.user?.name || 'Unknown';
            const email = order.user?.email || '';
            const initials = customerName
              .split(' ')
              .map((n) => n[0])
              .join('')
              .toUpperCase()
              .slice(0, 2);
            const orderId = order.orderNumber || `#${order._id?.slice(-6)}`;

            return (
              <div
                key={order._id}
                className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src="/placeholder.svg" alt={customerName} />
                    <AvatarFallback className="bg-gradient-primary text-white">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium leading-none">{customerName}</p>
                    <p className="text-sm text-muted-foreground">{email}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="text-sm font-medium">{formatCurrency(order.totalAmount || 0)}</p>
                    <p className="text-xs text-muted-foreground">{orderId}</p>
                  </div>
                  <Badge variant={getStatusVariant(order.orderStatus || '')}>
                    {order.orderStatus || 'pending'}
                  </Badge>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
