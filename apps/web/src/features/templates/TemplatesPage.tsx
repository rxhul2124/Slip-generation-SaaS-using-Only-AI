import { Copy, LayoutTemplate, Pencil, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { PageHeader } from "@/components/layout/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Td, Th, Table } from "@/components/ui/table";
import { sampleTemplates } from "@/lib/sampleData";
import { useTemplates } from "@/lib/useWarehouseData";

export function TemplatesPage() {
  const templates = useTemplates();
  const templateOptions = templates.data?.length ? templates.data : sampleTemplates;

  return (
    <>
      <PageHeader
        eyebrow="Slip Design"
        title="Slip Design"
        description="Built-in small and medium industrial slip layouts for fast printing."
        actions={
          <Button asChild>
            <Link to="/templates/builder">
              <Plus className="h-4 w-4" /> New Design
            </Link>
          </Button>
        }
      />

      <Card>
        <CardHeader>
          <div>
            <CardTitle>Default Designs</CardTitle>
            <CardDescription>Small Template fits three slips per row. Medium Template fits two slips per row.</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <thead>
              <tr>
                <Th>Name</Th>
                <Th>Format</Th>
                <Th>Size</Th>
                <Th>Mode</Th>
                <Th>Elements</Th>
                <Th></Th>
              </tr>
            </thead>
            <tbody>
              {templateOptions.map((template) => (
                <tr key={template._id}>
                  <Td>
                    <span className="flex items-center gap-2 font-semibold">
                      <LayoutTemplate className="h-4 w-4 text-primary" /> {template.name}
                    </span>
                  </Td>
                  <Td>{template.format}</Td>
                  <Td>
                    {template.width} x {template.height} {template.units}
                  </Td>
                  <Td>{template.thermalMode ? <Badge variant="success">Thermal</Badge> : <Badge variant="muted">Sheet</Badge>}</Td>
                  <Td>{template.elements.length}</Td>
                  <Td className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button asChild variant="outline" size="sm">
                        <Link to={`/templates/builder?template=${template._id}`}>
                          <Pencil className="h-4 w-4" /> Edit
                        </Link>
                      </Button>
                      <Button asChild variant="outline" size="sm">
                        <Link to={`/templates/builder?template=${template._id}&duplicate=1`}>
                          <Copy className="h-4 w-4" /> Duplicate
                        </Link>
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
