import { TableSkeleton } from "./TableSkeleton";
import { Loader2 } from "lucide-react";
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "./card";
import { Badge } from "./badge";

function PageHeaderSkeleton() {
  return (
    <div className="flex flex-col gap-4 pb-6 md:flex-row md:items-center md:justify-between animate-in fade-in-50 duration-500">
      <div className="space-y-2">
        <div className="h-4 w-20 rounded bg-muted animate-pulse" />
        <div className="h-8 w-48 rounded bg-muted animate-pulse" />
        <div className="h-4 w-64 rounded bg-muted animate-pulse" />
      </div>
      <div className="h-10 w-24 rounded bg-muted animate-pulse" />
    </div>
  );
}

export function TablePageSkeleton({ columns = 5 }: { columns?: number }) {
  return (
    <div className="flex h-full w-full flex-col">
      <PageHeaderSkeleton />
      <div className="flex-1 rounded-md border bg-card text-card-foreground shadow-sm p-4 animate-in fade-in-50 duration-500">
        <div className="mb-4 space-y-2">
          <div className="h-6 w-32 rounded bg-muted animate-pulse" />
          <div className="h-4 w-48 rounded bg-muted animate-pulse" />
        </div>
        <TableSkeleton columns={columns} />
      </div>
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="flex h-full w-full flex-col">
      <PageHeaderSkeleton />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="animate-in fade-in-50 duration-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 w-24 rounded bg-muted animate-pulse" />
              <div className="h-4 w-4 rounded-full bg-muted animate-pulse" />
            </CardHeader>
            <CardContent>
              <div className="h-8 w-16 rounded bg-muted animate-pulse" />
              <div className="h-3 w-32 rounded bg-muted animate-pulse mt-2" />
            </CardContent>
          </Card>
        ))}
      </div>
      <Card className="flex-1 animate-in fade-in-50 duration-500">
        <CardHeader>
          <div className="h-6 w-32 rounded bg-muted animate-pulse" />
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full rounded bg-muted animate-pulse" />
        </CardContent>
      </Card>
    </div>
  );
}

export function FormPageSkeleton() {
  return (
    <div className="flex h-full w-full flex-col">
      <PageHeaderSkeleton />
      <div className="grid gap-6 md:grid-cols-3 animate-in fade-in-50 duration-500">
        <div className="md:col-span-2 space-y-6">
          {Array.from({ length: 2 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <div className="h-6 w-48 rounded bg-muted animate-pulse" />
                <div className="h-4 w-64 rounded bg-muted animate-pulse mt-1" />
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="h-10 w-full rounded bg-muted animate-pulse" />
                <div className="h-10 w-full rounded bg-muted animate-pulse" />
                <div className="h-10 w-3/4 rounded bg-muted animate-pulse" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="h-6 w-32 rounded bg-muted animate-pulse" />
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="h-24 w-full rounded bg-muted animate-pulse" />
              <div className="h-10 w-full rounded bg-muted animate-pulse" />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export function CardsPageSkeleton() {
  return (
    <div className="flex h-full w-full flex-col">
      <PageHeaderSkeleton />
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 animate-in fade-in-50 duration-500">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <div className="h-6 w-48 rounded bg-muted animate-pulse" />
              <div className="h-4 w-full rounded bg-muted animate-pulse mt-2" />
              <div className="h-4 w-5/6 rounded bg-muted animate-pulse mt-1" />
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="h-24 w-full rounded bg-muted animate-pulse" />
              <div className="flex justify-between mt-4">
                <div className="h-8 w-20 rounded bg-muted animate-pulse" />
                <div className="h-8 w-24 rounded bg-muted animate-pulse" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export function BuilderSkeleton() {
  return (
    <div className="flex h-[calc(100vh-4rem)] w-full overflow-hidden border-t">
      <div className="w-64 shrink-0 border-r bg-muted/20 animate-pulse hidden md:block" />
      <div className="flex-1 flex flex-col items-center justify-center bg-muted/10">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
      <div className="w-80 shrink-0 border-l bg-muted/20 animate-pulse hidden lg:block" />
    </div>
  );
}

export function AuthSkeleton() {
  return (
    <div className="flex h-screen w-full items-center justify-center p-4">
      <Card className="w-full max-w-sm shadow-xl border-t-4 border-t-primary animate-in fade-in-50 zoom-in-95 duration-500">
        <CardHeader className="space-y-2 text-center pb-6">
          <div className="h-8 w-8 rounded bg-primary/20 mx-auto animate-pulse" />
          <div className="h-6 w-32 rounded bg-muted mx-auto animate-pulse mt-2" />
          <div className="h-4 w-48 rounded bg-muted mx-auto animate-pulse mt-1" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="h-10 w-full rounded bg-muted animate-pulse" />
          <div className="h-10 w-full rounded bg-muted animate-pulse" />
          <div className="h-10 w-full rounded bg-primary/20 animate-pulse mt-6" />
        </CardContent>
      </Card>
    </div>
  );
}
