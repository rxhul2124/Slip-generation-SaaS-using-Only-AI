import { Copy, LayoutTemplate, Pencil, Plus, Trash2 } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNotificationStore } from "@/stores/notificationStore";
import { resources } from "@/lib/api";
import { Pagination } from "@/components/ui/Pagination";
import { TableSkeleton } from "@/components/ui/TableSkeleton";
import { usePagination } from "@/lib/usePagination";

import { Link } from "react-router-dom";
import { PageHeader } from "@/components/layout/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Td, Th, Table } from "@/components/ui/table";
import { sampleTemplates } from "@/lib/sampleData";
import { useTemplates } from "@/lib/useWarehouseData";
import { deleteLocalTemplate, readLocalTemplates } from "@/lib/localTemplates";
import { useEffect, useMemo, useState } from "react";
import { useAuthStore } from "@/stores/authStore";
import { limitsFor } from "@/lib/planLimits";
import { UpgradeBadge } from "@/components/billing/FeatureGate";

export function TemplatesPage() {
  const { page, limit, setPage, setLimit } = usePagination();
  const queryData = useTemplates({ page, limit });
  const templates = queryData.data?.data || [];
  const meta = queryData.data?.meta;
  const isLoading = queryData.isLoading;
  const queryClient = useQueryClient();
  const notify = useNotificationStore((state) => state.push);

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const isApiId = /^[a-f\d]{24}$/i.test(id);
      if (isApiId) {
        await resources.templates.delete(id);
      }
      return id;
    },
    onSuccess: (id) => {
      // Remove from local storage if it's there
      deleteLocalTemplate(id);
      setLocalTemplates(readLocalTemplates());
      queryClient.invalidateQueries({ queryKey: ["templates"] });
      notify({ tone: "success", title: "Template deleted", body: "The template has been removed." });
    },
    onError: (error) => {
      notify({ tone: "error", title: "Delete failed", body: error instanceof Error ? error.message : "Failed to delete template." });
    }
  });
  const plan = useAuthStore((state) => state.company?.plan);
  const [localTemplates, setLocalTemplates] = useState(() => readLocalTemplates());
  const templateOptions = useMemo(() => {
    const baseTemplates = isLoading ? [] : (templates.length ? templates : sampleTemplates);
    return [...localTemplates, ...baseTemplates.filter((template) => !localTemplates.some((local) => local._id === template._id))];
  }, [localTemplates, templates, isLoading]);
  const customTemplateCount = templateOptions.filter((template) => !["Small Template", "Medium Template"].includes(template.name)).length;
  const customTemplateLimit = limitsFor(plan).customTemplates;
  const customTemplateLocked = customTemplateLimit !== Infinity && customTemplateCount >= customTemplateLimit;

  useEffect(() => {
    const refresh = () => setLocalTemplates(readLocalTemplates());
    window.addEventListener("focus", refresh);
    window.addEventListener("slipora:templates-updated", refresh);
    return () => {
      window.removeEventListener("focus", refresh);
      window.removeEventListener("slipora:templates-updated", refresh);
    };
  }, []);

  return (
    <>
      <PageHeader
        eyebrow="Slip Design"
        title="Slip Design"
        description="Built-in small and medium industrial slip layouts for fast printing."
        actions={
          <Button asChild={!customTemplateLocked} disabled={customTemplateLocked}>
            {customTemplateLocked ? (
              <span>
                <Plus className="h-4 w-4" /> New Design <UpgradeBadge label="Pro" />
              </span>
            ) : (
              <Link to="/templates/builder">
                <Plus className="h-4 w-4" /> New Design
              </Link>
            )}
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
          {isLoading ? (
            <TableSkeleton columns={6} rows={3} />
          ) : (
            <>
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
                          {!["Small Template", "Medium Template"].includes(template.name) && (
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="destructive" size="sm" disabled={deleteMutation.isPending}>
                                  <Trash2 className="h-4 w-4" /> Delete
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This will permanently delete the template "{template.name}". This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    className={buttonVariants({ variant: "destructive" })}
                                    onClick={() => deleteMutation.mutate(template._id)}
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          )}
                        </div>
                      </Td>
                    </tr>
                  ))}
                </tbody>
              </Table>

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
            </>
          )}
        </CardContent>
      </Card>
    </>
  );
}
