import { Loader2 } from "lucide-react";
import { TableSkeleton } from "./TableSkeleton";

export function PageLoader() {
  return (
    <div className="flex h-full w-full flex-col animate-in fade-in-50 duration-500">
      <div className="flex flex-col gap-4 pb-6 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <div className="h-4 w-20 rounded bg-muted animate-pulse" />
          <div className="h-8 w-48 rounded bg-muted animate-pulse" />
          <div className="h-4 w-64 rounded bg-muted animate-pulse" />
        </div>
        <div className="h-10 w-24 rounded bg-muted animate-pulse" />
      </div>
      <div className="flex-1 rounded-md border bg-card text-card-foreground shadow-sm p-4">
        <div className="flex items-center justify-center py-12 text-muted-foreground">
          <Loader2 className="mr-2 h-6 w-6 animate-spin" />
          <span className="text-sm font-medium">Loading module...</span>
        </div>
        <TableSkeleton columns={5} />
      </div>
    </div>
  );
}
