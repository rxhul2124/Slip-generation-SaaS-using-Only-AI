import { FileSpreadsheet, Printer, Upload } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { useReactToPrint } from "react-to-print";
import { PageHeader } from "@/components/layout/PageHeader";
import { PrintSheet } from "@/components/print/PrintSheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/input";
import { Table, Td, Th } from "@/components/ui/table";
import { sampleCustomers, sampleProducts, sampleSlips, sampleTemplate } from "@/lib/sampleData";
import type { GeneratedSlip } from "@/lib/types";
import { useNotificationStore } from "@/stores/notificationStore";

export function BulkGenerationPage() {
  const [csv, setCsv] = useState("");
  const printRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const notify = useNotificationStore((state) => state.push);
  const rows = useMemo(() => csv.split("\n").slice(1).filter(Boolean), [csv]);
  const slips = useMemo<GeneratedSlip[]>(
    () =>
      rows.map((row, index) => {
        const [productName, qty, customerName, orderReference] = row.split(",");
        return {
          ...sampleSlips[0],
          _id: `bulk-${index}`,
          serialNumber: `SLIP-2026-${String(index + 12).padStart(6, "0")}`,
          product: sampleProducts.find((product) => product.name === productName) || sampleProducts[0],
          customer: sampleCustomers.find((customer) => customer.name === customerName) || sampleCustomers[0],
          template: sampleTemplate,
          slipType: index === 2 ? "qc" : "packing",
          quantity: Number(qty || 1),
          quantityUnit: (sampleProducts.find((product) => product.name === productName) || sampleProducts[0]).quantityUnit,
          displayWeight: (sampleProducts.find((product) => product.name === productName) || sampleProducts[0]).weight,
          orderReference,
          destination: sampleCustomers.find((customer) => customer.name === customerName)?.shippingAddress?.city,
          createdAt: new Date().toISOString()
        };
      }),
    [rows]
  );
  const print = useReactToPrint({ content: () => printRef.current, documentTitle: "packslip-bulk" });

  return (
    <>
      <PageHeader
        eyebrow="Bulk"
        title="Bulk generation"
        description="Upload CSV rows, validate hundreds of packing slips, paginate intelligently, and send to PDF or print queue."
        actions={
          <>
            <Badge variant="success">{slips.length} ready</Badge>
            <Button variant="outline" onClick={() => fileRef.current?.click()}>
              <Upload className="h-4 w-4" /> Upload CSV
            </Button>
            <Button onClick={print}>
              <Printer className="h-4 w-4" /> Print Batch
            </Button>
          </>
        }
      />

      <div className="grid gap-4 xl:grid-cols-[430px_1fr]">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>CSV Input</CardTitle>
              <CardDescription>Expected columns: Product, Quantity, Customer, OrderReference.</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <input
              ref={fileRef}
              className="hidden"
              type="file"
              accept=".csv,text/csv"
              onChange={async (event) => {
                const file = event.target.files?.[0];
                if (!file) return;
                setCsv(await file.text());
                notify({ tone: "success", title: "CSV loaded", body: `${file.name} is ready for validation.` });
              }}
            />
            <Textarea
              className="min-h-[340px] font-mono text-xs"
              value={csv}
              onChange={(event) => setCsv(event.target.value)}
              placeholder="Product,Quantity,Customer,OrderReference"
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Validation Queue</CardTitle>
              <CardDescription>Rows are matched against known products, customers, and the selected default template.</CardDescription>
            </div>
            <FileSpreadsheet className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <Table>
              <thead>
                <tr>
                  <Th>Serial</Th>
                  <Th>Product</Th>
                  <Th>Customer</Th>
                  <Th>Qty</Th>
                  <Th>Status</Th>
                </tr>
              </thead>
              <tbody>
                {slips.map((slip) => (
                  <tr key={slip._id}>
                    <Td className="font-mono">{slip.serialNumber}</Td>
                    <Td>{slip.product.name}</Td>
                    <Td>{slip.customer.name}</Td>
                    <Td>{slip.quantity}</Td>
                    <Td>
                      <Badge variant="success">Valid</Badge>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </Table>
            <div className="hidden">
              <div ref={printRef}>
                <PrintSheet slips={slips} paper="a4" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
