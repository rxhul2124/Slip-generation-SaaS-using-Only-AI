import { MailPlus, Shield } from "lucide-react";
import { Pagination } from "@/components/ui/Pagination";
import { TableSkeleton } from "@/components/ui/TableSkeleton";
import { usePagination } from "@/lib/usePagination";

import { useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Table, Td, Th } from "@/components/ui/table";
import { useTeamMembers } from "@/lib/useWarehouseData";
import { useAuthStore } from "@/stores/authStore";
import { useNotificationStore } from "@/stores/notificationStore";

export function TeamPage() {
  const { page, limit, setPage, setLimit } = usePagination();
  const queryData = useTeamMembers({ page, limit });
  const members = queryData.data?.data || [];
  const meta = queryData.data?.meta;
  const isLoading = queryData.isLoading;
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [teamMembers, setTeamMembers] = useState(members);
  const notify = useNotificationStore((state) => state.push);
  const currentRole = useAuthStore((state) => state.role);
  const isOwner = currentRole === "owner";

  return (
    <>
      <PageHeader eyebrow="Team" title="Team Members" description="Only the company owner can invite people and choose roles." />
      <div className="grid gap-4 xl:grid-cols-[1fr_360px]">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Members</CardTitle>
              <CardDescription>Owner, admin, manager, and staff roles.</CardDescription>
            </div>
            <Shield className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <Table>
              <thead>
                <tr>
                  <Th>Name</Th>
                  <Th>Email</Th>
                  <Th>Role</Th>
                  <Th>Status</Th>
                </tr>
              </thead>
              <tbody>
                {teamMembers.map((member: any) => (
                  <tr key={member.email}>
                    <Td className="font-semibold">{member.name}</Td>
                    <Td>{member.email}</Td>
                    <Td>{member.role}</Td>
                    <Td>
                      <Badge variant="success">{member.status}</Badge>
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
              <CardTitle>Invite</CardTitle>
              <CardDescription>{isOwner ? "Invite a teammate by email and role." : "Ask the company owner to invite or change roles."}</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input value={email} onChange={(event) => setEmail(event.target.value)} placeholder="email@company.com" disabled={!isOwner} />
            <Select value={role} onChange={(event) => setRole(event.target.value)} disabled={!isOwner}>
              <option value="" disabled>
                Select role
              </option>
              <option value="admin">Admin</option>
              <option value="manager">Manager</option>
              <option value="staff">Staff</option>
            </Select>
            <Button
              className="w-full"
              disabled={!isOwner}
              onClick={() => {
                if (!email) {
                  notify({ tone: "warning", title: "Email required", body: "Enter a teammate email before sending an invite." });
                  return;
                }
                if (!role) {
                  notify({ tone: "warning", title: "Role required", body: "Choose a role for this teammate." });
                  return;
                }
                setTeamMembers((current: any) => [
                  ...current,
                  { name: email.split("@")[0], email, role: role[0].toUpperCase() + role.slice(1), status: "Invited" }
                ]);
                setEmail("");
                setRole("");
                notify({ tone: "success", title: "Invite sent", body: `${email} was invited as ${role}.` });
              }}
            >
              <MailPlus className="h-4 w-4" /> Send Invite
            </Button>
          
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
