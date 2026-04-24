import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { get } from "@/lib/apiClient";

export function SalesChart() {
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    get('/api/analytics/profit', { period: 'month' })
      .then((res) => {
        const daily = res.data?.dailyProfit || [];
        setChartData(
          daily.map((d: any) => ({
            date: d._id?.slice(5) || d._id,
            revenue: d.revenue || 0,
            profit: d.profit || 0,
          }))
        );
      })
      .catch(() => {});
  }, []);

  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle>Sales Overview</CardTitle>
        <CardDescription>
          Daily revenue and profit for the current month
        </CardDescription>
      </CardHeader>
      <CardContent className="pl-2">
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="date"
              className="text-xs text-muted-foreground"
              tick={{ fill: "hsl(var(--muted-foreground))" }}
            />
            <YAxis
              className="text-xs text-muted-foreground"
              tick={{ fill: "hsl(var(--muted-foreground))" }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "6px",
              }}
            />
            <Line
              type="monotone"
              dataKey="revenue"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              name="Revenue"
            />
            <Line
              type="monotone"
              dataKey="profit"
              stroke="hsl(var(--success))"
              strokeWidth={2}
              name="Profit"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
