import { ShieldCheck } from "lucide-react";
import { Pagination } from "@/components/ui/Pagination";
import { TableSkeleton } from "@/components/ui/TableSkeleton";
import { usePagination } from "@/lib/usePagination";

import { PageHeader } from "@/components/layout/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, Td, Th } from "@/components/ui/table";
import { useAuditLogs } from "@/lib/useWarehouseData";

export function AuditLogsPage() {
  const { page, limit, setPage, setLimit } = usePagination();
  const queryData = useAuditLogs({ page, limit });
  const logs = queryData.data?.data || [];
  const meta = queryData.data?.meta;
  const isLoading = queryData.isLoading;

  return (
    <>
      <PageHeader
        eyebrow="Compliance"
        title="Audit logs"
        description="Track logins, edits, deletions, print actions, exports, billing changes, and template modifications."
        actions={<Badge variant="success">Retention enabled</Badge>}
      />
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Workspace Activity</CardTitle>
            <CardDescription>User, IP, device, timestamp, action, and resource history.</CardDescription>
          </div>
          <ShieldCheck className="h-5 w-5 text-primary" />
        </CardHeader>
        <CardContent>
          <Table>
            <thead>
              <tr>
                <Th>Action</Th>
                <Th>User</Th>
                <Th>Resource</Th>
                <Th>IP</Th>
                <Th>Timestamp</Th>
              </tr>
            </thead>
            <tbody>
                {logs.map((log: any) => (
                <tr key={log._id}>
                  <Td className="font-mono">{log.action}</Td>
                  <Td>{log.user?.name || "System"}</Td>
                  <Td>{log.resourceId || log.resource}</Td>
                  <Td>{log.ip}</Td>
                  <Td>{new Date(log.createdAt).toLocaleString()}</Td>
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
          </CardContent>
      </Card>
    </>
  );
}
