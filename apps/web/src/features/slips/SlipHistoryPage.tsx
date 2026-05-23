import { Copy, Download, Printer, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/layout/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, Td, Th } from "@/components/ui/table";
import type { GeneratedSlip } from "@/lib/types";
import { saveLocalSlip, useSlips } from "@/lib/useWarehouseData";
import { useNotificationStore } from "@/stores/notificationStore";

function generatedSlipCount(slip: GeneratedSlip) {
  const settings = slip.printSettings || {};
  const value = settings.generatedCopies ?? settings.slipsPerPage;
  const count = typeof value === "number" ? value : Number(value || 1);
  return Number.isFinite(count) && count > 0 ? count : 1;
}

export function SlipHistoryPage() {
  const slips = useSlips();
  const [search, setSearch] = useState("");
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const notify = useNotificationStore((state) => state.push);
  const filteredSlips = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return slips.data || [];
    return (slips.data || []).filter((slip) =>
      [slip.serialNumber, slip.orderReference, slip.product.name, slip.customer.name].some((value) => value?.toLowerCase().includes(q))
    );
  }, [search, slips.data]);

  const patchSlip = (id: string, patch: Partial<GeneratedSlip>) => {
    let updatedSlip: GeneratedSlip | undefined;
    queryClient.setQueryData<GeneratedSlip[]>(["slips"], (current) =>
      (current || []).map((slip) => {
        if (slip._id !== id) return slip;
        updatedSlip = { ...slip, ...patch };
        return updatedSlip;
      })
    );
    if (updatedSlip) saveLocalSlip(updatedSlip);
  };

  return (
    <>
      <PageHeader
        eyebrow="History"
        title="Generated slips"
        description="Search serial numbers, duplicate previous slips, reprint, export, and inspect activity for every generated label."
      />
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Slip Archive</CardTitle>
            <CardDescription>Every generated slip is retained with print and export counters.</CardDescription>
          </div>
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input className="pl-9" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search serial or order reference" />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <thead>
              <tr>
                <Th>Serial</Th>
                <Th>Order</Th>
                <Th>Product</Th>
                <Th>Customer</Th>
                <Th>Qty</Th>
                <Th>Slips</Th>
                <Th>Created</Th>
                <Th>Status</Th>
                <Th>Actions</Th>
              </tr>
            </thead>
            <tbody>
              {filteredSlips.map((slip) => (
                <tr key={slip._id}>
                  <Td className="font-mono font-semibold">{slip.serialNumber}</Td>
                  <Td>{slip.orderReference}</Td>
                  <Td>{slip.product.partName || slip.product.name}</Td>
                  <Td>{slip.customer.name}</Td>
                  <Td>
                    {slip.quantity} {slip.quantityUnit || slip.product.quantityUnit || "NOS"}
                  </Td>
                  <Td>{generatedSlipCount(slip)}</Td>
                  <Td>{new Date(slip.createdAt).toLocaleDateString()}</Td>
                  <Td>
                    <Badge variant={slip.status === "printed" ? "success" : "default"}>{slip.status}</Badge>
                  </Td>
                  <Td>
                    <div className="flex gap-1">
                      <Button
                        variant="outline"
                        size="icon"
                        aria-label="Duplicate"
                        onClick={() => {
                          notify({ tone: "info", title: "Slip duplicated", body: `${slip.serialNumber} loaded into the generator.` });
                          navigate("/generate");
                        }}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        aria-label="Print"
                        onClick={() => {
                          patchSlip(slip._id, {
                            status: "printed",
                            printedCount: slip.printedCount + 1
                          });
                          notify({ tone: "success", title: "Print recorded", body: `${slip.serialNumber} print count updated.` });
                        }}
                      >
                        <Printer className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        aria-label="Export"
                        onClick={() => {
                          patchSlip(slip._id, {
                            status: "exported",
                            exportedCount: slip.exportedCount + 1
                          });
                          notify({ tone: "success", title: "Export recorded", body: `${slip.serialNumber} export count updated.` });
                        }}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}
