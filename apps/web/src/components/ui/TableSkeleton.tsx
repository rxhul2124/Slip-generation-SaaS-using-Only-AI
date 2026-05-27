import * as React from "react";
import { Table, Th, Td } from "./table";

interface TableSkeletonProps {
  columns: number;
  rows?: number;
}

export function TableSkeleton({ columns, rows = 5 }: TableSkeletonProps) {
  return (
    <div className="rounded-md border overflow-hidden">
      <Table>
        <thead>
          <tr>
            {Array.from({ length: columns }).map((_, i) => (
              <Th key={i}>
                <div className="h-4 w-20 bg-muted rounded animate-pulse" />
              </Th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <tr key={rowIndex}>
              {Array.from({ length: columns }).map((_, colIndex) => (
                <Td key={colIndex}>
                  <div className={`h-4 bg-muted rounded animate-pulse ${
                    colIndex === 0 ? 'w-3/4' :
                    colIndex === columns - 1 ? 'w-8 ml-auto' :
                    'w-1/2'
                  }`} />
                </Td>
              ))}
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
}
