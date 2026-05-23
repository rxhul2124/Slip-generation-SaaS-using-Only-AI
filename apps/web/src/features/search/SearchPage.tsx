import { Barcode, Building2, LayoutTemplate, Package, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, Td, Th } from "@/components/ui/table";
import { useCustomers, useProducts, useSlips, useTemplates } from "@/lib/useWarehouseData";

export function SearchPage() {
  const [query, setQuery] = useState(new URLSearchParams(window.location.search).get("q") || "");
  const products = useProducts();
  const customers = useCustomers();
  const templates = useTemplates();
  const slips = useSlips();
  const q = query.toLowerCase().trim();

  const results = useMemo(
    () => ({
      products: (products.data || []).filter((item) => [item.name, item.sku, item.barcode, item.category].some((value) => value?.toLowerCase().includes(q))),
      customers: (customers.data || []).filter((item) => [item.name, item.email, item.phone, item.taxNumber].some((value) => value?.toLowerCase().includes(q))),
      templates: (templates.data || []).filter((item) => [item.name, item.format].some((value) => value?.toLowerCase().includes(q))),
      slips: (slips.data || []).filter((item) => [item.serialNumber, item.orderReference, item.customer.name, item.product.name].some((value) => value?.toLowerCase().includes(q)))
    }),
    [customers.data, products.data, q, slips.data, templates.data]
  );

  const total = results.products.length + results.customers.length + results.templates.length + results.slips.length;

  return (
    <>
      <PageHeader
        eyebrow="Search"
        title="Search"
        description="Find companies, products, slips, order numbers, and designs."
        actions={<Badge variant="success">{total} matches</Badge>}
      />
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Quick Search</CardTitle>
            <CardDescription>Type what you need and see matching records.</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input className="pl-9" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Part number, company, slip number, order reference" />
          </div>
          <div className="grid gap-4 xl:grid-cols-2">
            <ResultTable title="Products" icon={Package} rows={results.products.map((item) => [item.name, item.sku || item.partNumber || "No part number", item.category || "Uncategorized"])} />
            <ResultTable title="Customers" icon={Building2} rows={results.customers.map((item) => [item.name, item.email || "No email", item.shippingAddress?.city || "No city"])} />
            <ResultTable title="Templates" icon={LayoutTemplate} rows={results.templates.map((item) => [item.name, item.format, item.thermalMode ? "Thermal" : "Sheet"])} />
            <ResultTable title="Slips" icon={Barcode} rows={results.slips.map((item) => [item.serialNumber, item.product.name, item.customer.name])} />
          </div>
        </CardContent>
      </Card>
    </>
  );
}

function ResultTable({ title, icon: Icon, rows }: { title: string; icon: typeof Package; rows: string[][] }) {
  return (
    <div className="rounded-lg border">
      <div className="flex items-center gap-2 border-b p-3 text-sm font-bold">
        <Icon className="h-4 w-4 text-primary" /> {title}
      </div>
      <Table>
        <thead>
          <tr>
            <Th>Name</Th>
            <Th>Ref</Th>
            <Th>Meta</Th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.join("-")}>
              <Td className="font-semibold">{row[0]}</Td>
              <Td>{row[1]}</Td>
              <Td>{row[2]}</Td>
            </tr>
          ))}
          {!rows.length ? (
            <tr>
              <Td colSpan={3} className="text-muted-foreground">
                No matches
              </Td>
            </tr>
          ) : null}
        </tbody>
      </Table>
    </div>
  );
}
