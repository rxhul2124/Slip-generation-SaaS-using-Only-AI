import { Activity, FileDown, LogIn, Printer, Settings } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuditLogs, usePrintJobs, useSlips } from "@/lib/useWarehouseData";

const actionIcon = {
  "auth.login": LogIn,
  "slip.generate": Printer,
  "template.update": Settings,
  "slip.export": FileDown
};

export function ActivityPage() {
  const logs = useAuditLogs();
  const slips = useSlips();
  const jobs = usePrintJobs();
  const events = [
    ...(logs.data || []).map((log) => ({
      id: log._id,
      title: log.action,
      body: `${log.user?.name || "System"} · ${log.resource}${log.resourceId ? ` · ${log.resourceId}` : ""}`,
      at: log.createdAt,
      kind: log.action
    })),
    ...(jobs.data || []).map((job) => ({
      id: job._id,
      title: `print.${job.status}`,
      body: `${job.printer || "Printer"} · ${job.slips.length} slip(s)`,
      at: job.createdAt,
      kind: "slip.export"
    })),
    ...(slips.data || []).map((slip) => ({
      id: slip._id,
      title: "slip.generated",
      body: `${slip.serialNumber} · ${slip.product.name} · ${slip.customer.name}`,
      at: slip.createdAt,
      kind: "slip.generate"
    }))
  ].sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());

  return (
    <>
      <PageHeader
        eyebrow="Workspace"
        title="Activity stream"
        description="A live operational feed for logins, generation, print jobs, exports, template edits, and backup events."
        actions={<Badge variant="success">{events.length} events</Badge>}
      />
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Cross-module events in timestamp order.</CardDescription>
          </div>
          <Activity className="h-5 w-5 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {events.map((event) => {
              const Icon = actionIcon[event.kind as keyof typeof actionIcon] || Activity;
              return (
                <div key={`${event.id}-${event.title}`} className="flex gap-3 rounded-lg border bg-card/70 p-3">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-primary/10 text-primary">
                    <Icon className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold">{event.title}</div>
                    <div className="truncate text-sm text-muted-foreground">{event.body}</div>
                  </div>
                  <div className="shrink-0 text-xs text-muted-foreground">{new Date(event.at).toLocaleTimeString()}</div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </>
  );
}
