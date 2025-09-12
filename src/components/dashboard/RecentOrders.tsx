import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const recentOrders = [
  {
    id: "#ORD-001",
    customer: "Alice Johnson",
    email: "alice@example.com",
    amount: "$299.99",
    status: "completed",
    date: "2024-01-15",
  },
  {
    id: "#ORD-002",
    customer: "Bob Smith",
    email: "bob@example.com",
    amount: "$149.50",
    status: "pending",
    date: "2024-01-15",
  },
  {
    id: "#ORD-003",
    customer: "Carol White",
    email: "carol@example.com",
    amount: "$75.25",
    status: "processing",
    date: "2024-01-14",
  },
  {
    id: "#ORD-004",
    customer: "David Brown",
    email: "david@example.com",
    amount: "$425.00",
    status: "completed",
    date: "2024-01-14",
  },
  {
    id: "#ORD-005",
    customer: "Emma Davis",
    email: "emma@example.com",
    amount: "$89.99",
    status: "cancelled",
    date: "2024-01-13",
  },
];

const getStatusVariant = (status: string) => {
  switch (status) {
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

export function RecentOrders() {
  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle>Recent Orders</CardTitle>
        <CardDescription>
          Latest orders from your customers
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentOrders.map((order) => (
            <div key={order.id} className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
              <div className="flex items-center space-x-4">
                <Avatar className="h-9 w-9">
                  <AvatarImage src="/placeholder.svg" alt={order.customer} />
                  <AvatarFallback className="bg-gradient-primary text-white">
                    {order.customer.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium leading-none">{order.customer}</p>
                  <p className="text-sm text-muted-foreground">{order.email}</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <p className="text-sm font-medium">{order.amount}</p>
                  <p className="text-xs text-muted-foreground">{order.id}</p>
                </div>
                <Badge variant={getStatusVariant(order.status)}>
                  {order.status}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}