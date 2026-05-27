import { Pause, Play, Printer, RefreshCw, Send } from "lucide-react";
import { Pagination } from "@/components/ui/Pagination";
import { TableSkeleton } from "@/components/ui/TableSkeleton";
import { usePagination } from "@/lib/usePagination";

import { useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Table, Td, Th } from "@/components/ui/table";
import { usePrintJobs } from "@/lib/useWarehouseData";
import { useNotificationStore } from "@/stores/notificationStore";

const statusTone = {
  queued: "warning",
  rendering: "warning",
  ready: "default",
  printing: "default",
  completed: "success",
  failed: "danger"
} as const;

export function PrintQueuePage() {
  const { page, limit, setPage, setLimit } = usePagination();
  const queryData = usePrintJobs({ page, limit });
  const jobs = queryData.data?.data || [];
  const meta = queryData.data?.meta;
  const isLoading = queryData.isLoading;
  const notify = useNotificationStore((state) => state.push);
  const [silentPrint, setSilentPrint] = useState(false);

  return (
    <>
      <PageHeader
        eyebrow="Print Operations"
        title="Print queue"
        description="Manage queued browser prints, bulk PDFs, thermal jobs, reprints, silent mode, and printer readiness."
        actions={
          <>
            <Button variant="outline" onClick={() => notify({ tone: "success", title: "Queue refreshed", body: `${jobs.length || 0} jobs loaded.` })}>
              <RefreshCw className="h-4 w-4" /> Refresh
            </Button>
            <Button onClick={() => notify({ tone: "info", title: "Batch queued", body: "The current ready slips were added to the print queue." })}>
              <Send className="h-4 w-4" /> Queue Batch
            </Button>
          </>
        }
      />
      <div className="grid gap-4 xl:grid-cols-[1fr_360px]">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Queued Jobs</CardTitle>
              <CardDescription>Track print lifecycle across thermal, PDF, and browser print targets.</CardDescription>
            </div>
            <Badge variant="success">{jobs.filter((job) => job.status !== "completed").length || 0} active</Badge>
          </CardHeader>
          <CardContent>
            <Table>
              <thead>
                <tr>
                  <Th>Job</Th>
                  <Th>Printer</Th>
                  <Th>Format</Th>
                  <Th>Slips</Th>
                  <Th>Status</Th>
                  <Th>Actions</Th>
                </tr>
              </thead>
              <tbody>
                {jobs.map((job) => (
                  <tr key={job._id}>
                    <Td className="font-mono">{job._id}</Td>
                    <Td>{job.printer}</Td>
                    <Td>{job.format}</Td>
                    <Td>{job.slips.length}</Td>
                    <Td>
                      <Badge variant={statusTone[job.status]}>{job.status}</Badge>
                    </Td>
                    <Td>
                      <div className="flex gap-1">
                        <Button
                          variant="outline"
                          size="icon"
                          aria-label="Start job"
                          onClick={() => notify({ tone: "success", title: "Print job started", body: job._id })}
                        >
                          <Play className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          aria-label="Pause job"
                          onClick={() => notify({ tone: "warning", title: "Print job paused", body: job._id })}
                        >
                          <Pause className="h-4 w-4" />
                        </Button>
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
              <CardTitle>Printer Control</CardTitle>
              <CardDescription>Default device, thermal vendor, DPI, and silent mode controls.</CardDescription>
            </div>
            <Printer className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent className="space-y-3">
            <Select defaultValue="">
              <option value="" disabled>
                Select printer
              </option>
              <option value="zebra">Zebra ZD421 - Dispatch Bay 1</option>
              <option value="brother">Brother QL - Packing Desk</option>
              <option value="office">Office A4 Laser</option>
            </Select>
            <Select defaultValue="">
              <option value="" disabled>
                Select DPI
              </option>
              <option value="203">203 DPI</option>
              <option value="300">300 DPI</option>
              <option value="600">600 DPI</option>
            </Select>
            <Switch
              checked={silentPrint}
              onCheckedChange={(checked) => {
                setSilentPrint(checked);
                notify({ tone: "info", title: "Silent print mode", body: checked ? "Enabled" : "Disabled" });
              }}
              label="Silent print mode"
            />
            <div className="rounded-lg border bg-muted/40 p-3 text-sm text-muted-foreground">
              Desktop printer detection is exposed through Electron via `window.packslipDesktop.getPrinters()`.
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
  );
}
