import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Pagination } from "@/components/ui/Pagination";
import { TableSkeleton } from "@/components/ui/TableSkeleton";
import { usePagination } from "@/lib/usePagination";

import { Layers3, PackageCheck, Plus, Star } from "lucide-react";
import { useMemo, useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Table, Td, Th } from "@/components/ui/table";
import { resources } from "@/lib/api";
import { sampleTemplates } from "@/lib/sampleData";
import type { Preset } from "@/lib/types";
import { useCustomers, usePresets, useProducts, useTemplates } from "@/lib/useWarehouseData";
import { useNotificationStore } from "@/stores/notificationStore";
import { FeatureGate, UpgradeBadge } from "@/components/billing/FeatureGate";

export function PresetsPage() {
  const { page, limit, setPage, setLimit } = usePagination();
  const queryData = usePresets({ page, limit });
  const presets = queryData.data?.data || [];
  const meta = queryData.data?.meta;
  const isLoading = queryData.isLoading;
  const products = useProducts();
  const customers = useCustomers();
  const templates = useTemplates();
  const queryClient = useQueryClient();
  const notify = useNotificationStore((state) => state.push);
  const productOptions = products.data?.data || [];
  const customerOptions = customers.data?.data || [];
  const templateOptions = templates.data?.data || sampleTemplates;
  const [name, setName] = useState("");
  const [product, setProduct] = useState("");
  const [customer, setCustomer] = useState("");
  const [template, setTemplate] = useState("");
  const selectedTemplate = useMemo(() => templateOptions.find((item) => item._id === template), [template, templateOptions]);
  const selectedProduct = useMemo(() => productOptions.find((item) => item._id === product), [product, productOptions]);
  const selectedCustomer = useMemo(() => customerOptions.find((item) => item._id === customer), [customer, customerOptions]);

  const createPreset = useMutation({
    mutationFn: () =>
      resources.presets.create({
        name,
        product,
        customer,
        template,
        description: "Saved from the operational presets screen",
        printSettings: { paper: selectedTemplate?.format || "4x6", dpi: selectedTemplate?.thermalMode ? 203 : 300 }
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["presets"] });
      notify({ tone: "success", title: "Preset saved", body: `${name} is ready for slip generation.` });
    },
    onError: (error) => {
      const localPreset: Preset = {
        _id: `local-preset-${Date.now()}`,
        name,
        description: "Saved locally while the API is unavailable.",
        product: selectedProduct,
        customer: selectedCustomer,
        template: selectedTemplate!,
        printSettings: { paper: selectedTemplate?.format || "4x6", dpi: selectedTemplate?.thermalMode ? 203 : 300 },
        tags: ["local", selectedTemplate?.thermalMode ? "thermal" : "sheet"],
        createdAt: new Date().toISOString()
      };
      queryClient.setQueryData<Preset[]>(["presets"], (current) => [localPreset, ...(current || [])]);
      notify({ tone: "warning", title: "Preset saved locally", body: "The API is offline, so this preset was saved in the browser session." });
      void error;
    }
  });

  return (
    <FeatureGate feature="presets" title="Slip presets" body="Presets are available on Pro and Enterprise plans." minimum="Pro">
    <>
      <PageHeader
        eyebrow="Reusable Workflows"
        title="Slip presets"
        description="Save repeatable customer, product, template, dimension, and print-setting combinations for high-speed dispatch."
        actions={
          <Button onClick={() => createPreset.mutate()} disabled={createPreset.isPending || !name || !product || !customer || !template}>
            <Plus className="h-4 w-4" /> Save Preset <UpgradeBadge label="Pro" />
          </Button>
        }
      />

      <div className="grid gap-4 xl:grid-cols-[1fr_380px]">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Preset Library</CardTitle>
              <CardDescription>Operational shortcuts for marketplace, export, fragile, and warehouse workflows.</CardDescription>
            </div>
            <Badge variant="success">{presets.length || 0} active</Badge>
          </CardHeader>
          <CardContent>
            <Table>
              <thead>
                <tr>
                  <Th>Name</Th>
                  <Th>Product</Th>
                  <Th>Customer</Th>
                  <Th>Template</Th>
                  <Th>Tags</Th>
                </tr>
              </thead>
              <tbody>
                {presets.map((preset) => (
                  <tr key={preset._id}>
                    <Td>
                      <span className="flex items-center gap-2 font-semibold">
                        <Star className="h-4 w-4 fill-accent text-accent" /> {preset.name}
                      </span>
                      <div className="text-xs text-muted-foreground">{preset.description}</div>
                    </Td>
                    <Td>{preset.product?.name || "Any product"}</Td>
                    <Td>{preset.customer?.name || "Any customer"}</Td>
                    <Td>{preset.template?.name}</Td>
                    <Td>
                      <div className="flex flex-wrap gap-1">
                        {preset.tags?.map((tag) => (
                          <Badge key={tag} variant="muted">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <CardTitle>Create Preset</CardTitle>
              <CardDescription>Bind a trusted print setup to common dispatch work.</CardDescription>
            </div>
            <Layers3 className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent className="space-y-3">
            <Input value={name} onChange={(event) => setName(event.target.value)} placeholder="Preset name" />
            <Select value={product} onChange={(event) => setProduct(event.target.value)}>
              <option value="" disabled>
                Select product
              </option>
              {productOptions.map((item) => (
                <option key={item._id} value={item._id}>
                  {item.name}
                </option>
              ))}
            </Select>
            <Select value={customer} onChange={(event) => setCustomer(event.target.value)}>
              <option value="" disabled>
                Select company
              </option>
              {customerOptions.map((item) => (
                <option key={item._id} value={item._id}>
                  {item.name}
                </option>
              ))}
            </Select>
            <Select value={template} onChange={(event) => setTemplate(event.target.value)}>
              <option value="" disabled>
                Select template
              </option>
              {templateOptions.map((item) => (
                <option key={item._id} value={item._id}>
                  {item.name}
                </option>
              ))}
            </Select>
            <div className="rounded-lg border bg-muted/40 p-3 text-sm">
              <div className="flex items-center gap-2 font-semibold">
                <PackageCheck className="h-4 w-4 text-primary" /> Print settings
              </div>
              <div className="mt-2 text-muted-foreground">
                {selectedTemplate ? `${selectedTemplate.thermalMode ? "203 DPI thermal label" : "300 DPI sheet export"} - ${selectedTemplate.format}` : "Select a template to preview print settings."}
              </div>
            </div>
          
            {meta && (
              <Pagination
                page={meta.page}
                pages={meta.pages}
                limit={meta.limit}
                total={meta.total}
                onPageChange={setPage}
                onLimitChange={setLimit}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </>
    </FeatureGate>
  );
}
