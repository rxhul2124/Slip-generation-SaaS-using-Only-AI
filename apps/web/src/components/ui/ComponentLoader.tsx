import { Loader2 } from "lucide-react";

export function ComponentLoader({ className = "min-h-[200px]" }: { className?: string }) {
  return (
    <div className={`flex w-full flex-col items-center justify-center rounded-md border border-dashed bg-muted/20 p-8 text-center animate-in fade-in-50 duration-500 ${className}`}>
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      <span className="mt-4 text-sm font-medium text-muted-foreground">Loading widget...</span>
    </div>
  );
}
