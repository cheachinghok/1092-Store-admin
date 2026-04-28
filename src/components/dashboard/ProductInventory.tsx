import { useEffect, useState } from "react";
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
import { get } from "@/lib/apiClient";
import { formatKHR } from "@/lib/utils";

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
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    get('/api/products/low-stock', { threshold: 10, limit: 10 })
      .then((res) => setProducts(res.data || []))
      .catch(() => {
        // fallback to regular products
        get('/api/products', { limit: 10 })
          .then((res) => setProducts(res.data || []))
          .catch(() => {});
      });
  }, []);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Package className="h-5 w-5 text-primary" />
          <CardTitle>Product Inventory</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-0 sm:p-6">
        <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="text-right">Price</TableHead>
              <TableHead className="text-right">Stock</TableHead>
              <TableHead className="text-center">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => {
              const stockStatus = getStockStatus(product.stock);
              return (
                <TableRow key={product._id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={product.images?.[0]} alt={product.name} />
                        <AvatarFallback>
                          <Package className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{product.name}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{product.category?.name || product.category}</TableCell>
                  <TableCell className="text-right font-medium">
                    <div>${(product.sellingPrice || 0).toFixed(2)}</div>
                    {product.sellingPriceKHR ? (
                      <div className="text-xs text-muted-foreground">{formatKHR(product.sellingPriceKHR)}</div>
                    ) : null}
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
            {products.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                  No products found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        </div>
      </CardContent>
    </Card>
  );
}
