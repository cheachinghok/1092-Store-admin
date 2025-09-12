import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Package } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface Product {
  id: string;
  name: string;
  sku: string;
  price: number;
  stock: number;
  image?: string;
  category: string;
}

const mockProducts: Product[] = [
  {
    id: "1",
    name: "Wireless Bluetooth Headphones",
    sku: "WBH-001",
    price: 129.99,
    stock: 45,
    image: "/placeholder.svg",
    category: "Electronics"
  },
  {
    id: "2",
    name: "Organic Cotton T-Shirt",
    sku: "OCT-002",
    price: 29.99,
    stock: 12,
    image: "/placeholder.svg",
    category: "Clothing"
  },
  {
    id: "3",
    name: "Stainless Steel Water Bottle",
    sku: "SSW-003",
    price: 24.99,
    stock: 0,
    image: "/placeholder.svg",
    category: "Home & Garden"
  },
  {
    id: "4",
    name: "Laptop Stand Adjustable",
    sku: "LSA-004",
    price: 89.99,
    stock: 23,
    image: "/placeholder.svg",
    category: "Office"
  },
  {
    id: "5",
    name: "Yoga Mat Premium",
    sku: "YMP-005",
    price: 49.99,
    stock: 8,
    image: "/placeholder.svg",
    category: "Sports"
  },
  {
    id: "6",
    name: "Smart Home Hub",
    sku: "SHH-006",
    price: 199.99,
    stock: 34,
    image: "/placeholder.svg",
    category: "Electronics"
  }
];

const getStockStatus = (stock: number) => {
  if (stock === 0) {
    return { label: "Out of Stock", variant: "destructive" as const };
  } else if (stock < 10) {
    return { label: "Low Stock", variant: "outline" as const };
  } else {
    return { label: "In Stock", variant: "secondary" as const };
  }
};

export function ProductInventory() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Package className="h-5 w-5 text-primary" />
          <CardTitle>Product Inventory</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="text-right">Price</TableHead>
              <TableHead className="text-right">Stock</TableHead>
              <TableHead className="text-center">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockProducts.map((product) => {
              const stockStatus = getStockStatus(product.stock);
              return (
                <TableRow key={product.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={product.image} alt={product.name} />
                        <AvatarFallback>
                          <Package className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{product.name}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-sm text-muted-foreground">
                    {product.sku}
                  </TableCell>
                  <TableCell>{product.category}</TableCell>
                  <TableCell className="text-right font-medium">
                    ${product.price.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {product.stock}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant={stockStatus.variant}>
                      {stockStatus.label}
                    </Badge>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}