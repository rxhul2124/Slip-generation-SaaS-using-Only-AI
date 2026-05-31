import { AlertTriangle, CheckCircle2, FileSpreadsheet, Layers, MapPin, Package, Users, XCircle } from "lucide-react";
import { motion } from "framer-motion";
import type { CsvHealthReport as CsvHealthReportType } from "@/lib/csv/types";

interface CsvHealthReportProps {
  report: CsvHealthReportType;
}

interface StatItem {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  status: "success" | "warning" | "error";
}

export function CsvHealthReport({ report }: CsvHealthReportProps) {
  const stats: StatItem[] = [
    {
      icon: <FileSpreadsheet className="h-5 w-5" />,
      label: "Rows parsed",
      value: `${report.parsedRows} of ${report.totalRows}`,
      status: report.parsedRows === report.totalRows ? "success" : "warning",
    },
    {
      icon: <Layers className="h-5 w-5" />,
      label: "Fields detected",
      value: report.fieldsDetected,
      status: report.fieldsDetected > 0 ? "success" : "error",
    },
    {
      icon: <CheckCircle2 className="h-5 w-5" />,
      label: "Auto-mapped",
      value: report.autoMappedFields,
      status: report.autoMappedFields > 0 ? "success" : "warning",
    },
    {
      icon: <Layers className="h-5 w-5" />,
      label: "Groups formed",
      value: report.groupsFormed,
      status: "success",
    },
    {
      icon: <Package className="h-5 w-5" />,
      label: "Unlinked products",
      value: report.unlinkedProducts,
      status: report.unlinkedProducts === 0 ? "success" : "warning",
    },
    {
      icon: <Users className="h-5 w-5" />,
      label: "Unlinked customers",
      value: report.unlinkedCustomers,
      status: report.unlinkedCustomers === 0 ? "success" : "warning",
    },
    {
      icon: <MapPin className="h-5 w-5" />,
      label: "Missing addresses",
      value: report.missingAddresses,
      status: report.missingAddresses === 0 ? "success" : "warning",
    },
    {
      icon: <XCircle className="h-5 w-5" />,
      label: "Unknown fields",
      value: report.unknownFields,
      status: report.unknownFields === 0 ? "success" : "warning",
    },
  ];

  const statusColors: Record<string, string> = {
    success: "text-emerald-500",
    warning: "text-amber-500",
    error: "text-red-500",
  };

  const statusIcons: Record<string, React.ReactNode> = {
    success: <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />,
    warning: <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />,
    error: <XCircle className="h-3.5 w-3.5 text-red-500" />,
  };

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      {stats.map((stat, i) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.06, duration: 0.3 }}
          className="flex items-start gap-2.5 rounded-xl border bg-card p-3"
        >
          <div className={statusColors[stat.status]}>{stat.icon}</div>
          <div className="min-w-0">
            <p className="text-lg font-bold leading-none">{stat.value}</p>
            <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
              {statusIcons[stat.status]} {stat.label}
            </p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
