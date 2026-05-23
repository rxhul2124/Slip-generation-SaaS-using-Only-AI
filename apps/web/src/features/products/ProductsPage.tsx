import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Archive, FileUp, PackagePlus, Search, Star } from "lucide-react";
import { useRef } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { z } from "zod";
import { PageHeader } from "@/components/layout/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Table, Td, Th } from "@/components/ui/table";
import { resources } from "@/lib/api";
import { sampleProducts } from "@/lib/sampleData";
import type { Product } from "@/lib/types";
import { useProducts } from "@/lib/useWarehouseData";
import { useNotificationStore } from "@/stores/notificationStore";

const schema = z.object({
  name: z.string().min(2),
  sku: z.string().min(2),
  category: z.string().optional(),
  packagingType: z.string().optional(),
  quantityDefault: z.coerce.number().int().positive(),
  fragile: z.boolean(),
  hazardous: z.boolean()
});

type FormValues = z.infer<typeof schema>;

export function ProductsPage() {
  const products = useProducts();
  const queryClient = useQueryClient();
  const notify = useNotificationStore((state) => state.push);
  const nameRef = useRef<HTMLInputElement | null>(null);
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      sku: "",
      category: "",
      packagingType: "",
      quantityDefault: 1,
      fragile: false,
      hazardous: false
    }
  });
  const { ref: formNameRef, ...nameField } = form.register("name");

  const createProduct = useMutation({
    mutationFn: (values: FormValues) => resources.products.create(values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      form.reset();
      notify({ tone: "success", title: "Product saved", body: "The SKU is available for slip generation." });
    },
    onError: (error, values) => {
      const localProduct: Product = {
        _id: `local-product-${Date.now()}`,
        name: values.name,
        sku: values.sku,
        category: values.category,
        packagingType: values.packagingType,
        quantityDefault: values.quantityDefault,
        fragile: values.fragile,
        hazardous: values.hazardous
      };
      queryClient.setQueryData<Product[]>(["products"], (current) => [localProduct, ...(current || sampleProducts)]);
      form.reset();
      notify({ tone: "warning", title: "Saved locally", body: `API unavailable, so ${values.sku} was added to this browser session.` });
      void error;
    }
  });

  return (
    <>
      <PageHeader
        eyebrow="Catalog"
        title="Products"
        description="Maintain SKUs, package dimensions, barcode references, default quantities, hazard flags, images, and import/export workflows."
        actions={
          <>
            <Button variant="outline" asChild>
              <Link to="/bulk">
                <FileUp className="h-4 w-4" /> CSV Import
              </Link>
            </Button>
            <Button onClick={() => nameRef.current?.focus()}>
              <PackagePlus className="h-4 w-4" /> Add Product
            </Button>
          </>
        }
      />

      <div className="grid gap-4 xl:grid-cols-[1fr_380px]">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Product Master</CardTitle>
              <CardDescription>Fast filtering for factory, warehouse, and eCommerce dispatch teams.</CardDescription>
            </div>
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input className="pl-9" placeholder="Search SKU, barcode, tag" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <thead>
                  <tr>
                    <Th>Product</Th>
                    <Th>SKU</Th>
                    <Th>Packaging</Th>
                    <Th>Flags</Th>
                    <Th>Default Qty</Th>
                  </tr>
                </thead>
                <tbody>
                  {products.data?.map((product) => (
                    <tr key={product._id}>
                      <Td>
                        <div className="flex items-center gap-2 font-semibold">
                          {product.favorite ? <Star className="h-4 w-4 fill-accent text-accent" /> : null}
                          {product.name}
                        </div>
                        <div className="text-xs text-muted-foreground">{product.category}</div>
                      </Td>
                      <Td className="font-mono">{product.sku}</Td>
                      <Td>{product.packagingType}</Td>
                      <Td>
                        <div className="flex gap-1">
                          {product.fragile ? <Badge variant="warning">Fragile</Badge> : null}
                          {product.hazardous ? <Badge variant="danger">Hazard</Badge> : null}
                          {product.archivedAt ? <Badge variant="muted">Archived</Badge> : null}
                        </div>
                      </Td>
                      <Td>{product.quantityDefault}</Td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <CardTitle>Quick Create</CardTitle>
              <CardDescription>Add operational SKUs without leaving the table.</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <form className="space-y-3" onSubmit={form.handleSubmit((values) => createProduct.mutate(values))}>
              <Input
                placeholder="Product name"
                {...nameField}
                ref={(element) => {
                  formNameRef(element);
                  nameRef.current = element;
                }}
              />
              <Input placeholder="SKU" {...form.register("sku")} />
              <div className="grid grid-cols-2 gap-3">
                <Select {...form.register("category")}>
                  <option value="" disabled>
                    Select category
                  </option>
                  <option>Cartons</option>
                  <option>Bottles</option>
                  <option>Consumables</option>
                  <option>Finished Goods</option>
                </Select>
                <Input type="number" min={1} placeholder="Default quantity" {...form.register("quantityDefault")} />
              </div>
              <Input placeholder="Packaging type" {...form.register("packagingType")} />
              <div className="flex flex-wrap gap-3">
                <Switch checked={form.watch("fragile")} onCheckedChange={(value) => form.setValue("fragile", value)} label="Fragile" />
                <Switch checked={form.watch("hazardous")} onCheckedChange={(value) => form.setValue("hazardous", value)} label="Hazardous" />
              </div>
              <Button className="w-full" type="submit" disabled={createProduct.isPending}>
                <Archive className="h-4 w-4" /> Save Product
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
