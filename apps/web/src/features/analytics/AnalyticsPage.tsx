import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { PageHeader } from "@/components/layout/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useCustomers, useProducts, useTemplates } from "@/lib/useWarehouseData";

const daily = [
  { label: "08:00", slips: 12 },
  { label: "10:00", slips: 28 },
  { label: "12:00", slips: 19 },
  { label: "14:00", slips: 36 },
  { label: "16:00", slips: 42 },
  { label: "18:00", slips: 22 }
];

export function AnalyticsPage() {
  const products = useProducts();
  const customers = useCustomers();
  const templates = useTemplates();
  const usage = products.data?.map((product, index) => ({ name: product.name, value: [42, 31, 18][index] || 12 })) || [];
  const colors = ["#0f766e", "#f59e0b", "#64748b"];

  return (
    <>
      <PageHeader
        eyebrow="Reports"
        title="Reports"
        description="See daily slips, top products, busy companies, and peak print times."
        actions={<Badge variant="success">Ready</Badge>}
      />
      <div className="grid gap-4 xl:grid-cols-[1.4fr_1fr]">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Peak Usage Times</CardTitle>
              <CardDescription>Slip generation activity by hour.</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={daily}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="label" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="slips" fill="#0f766e" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Product Usage</CardTitle>
              <CardDescription>Share of slips by product.</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={usage} dataKey="value" nameKey="name" outerRadius={108} label>
                    {usage.map((entry, index) => (
                      <Cell key={entry.name} fill={colors[index % colors.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
      <div className="mt-4 grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Most Shipped Product</CardTitle>
            <CardDescription>{products.data?.[0]?.name}</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Busiest Customer</CardTitle>
            <CardDescription>{customers.data?.[0]?.name}</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Top Template</CardTitle>
            <CardDescription>{templates.data?.[0]?.name}</CardDescription>
          </CardHeader>
        </Card>
      </div>
    </>
  );
}
