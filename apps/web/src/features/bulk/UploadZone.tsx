import { FileSpreadsheet, Loader2, Upload, X } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { validateCsvFile } from "@/lib/csv/csvParser";

interface UploadZoneProps {
  onFileAccepted: (file: File) => void;
  isProcessing?: boolean;
}

export function UploadZone({ onFileAccepted, isProcessing }: UploadZoneProps) {
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [acceptedFile, setAcceptedFile] = useState<File | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    (file: File) => {
      setError(null);
      const validation = validateCsvFile(file);
      if (!validation.valid) {
        setError(validation.error || "Invalid file");
        return;
      }
      setAcceptedFile(file);
      onFileAccepted(file);
    },
    [onFileAccepted]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="mx-auto w-full max-w-xl"
    >
      <div
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={`
          relative flex min-h-[280px] cursor-pointer flex-col items-center justify-center
          rounded-2xl border-2 border-dashed p-8 text-center transition-all duration-300
          ${dragOver
            ? "scale-[1.02] border-primary bg-primary/5 shadow-lg shadow-primary/10"
            : "border-border bg-muted/20 hover:border-primary/50 hover:bg-muted/30"
          }
          ${isProcessing ? "pointer-events-none opacity-60" : ""}
        `}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".csv,text/csv,.txt"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
            e.target.value = "";
          }}
        />

        <AnimatePresence mode="wait">
          {isProcessing ? (
            <motion.div
              key="processing"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex flex-col items-center gap-4"
            >
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <div>
                <p className="text-lg font-semibold">Analyzing CSV...</p>
                <p className="text-sm text-muted-foreground">Detecting columns, types, and field mappings</p>
              </div>
            </motion.div>
          ) : acceptedFile ? (
            <motion.div
              key="accepted"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex flex-col items-center gap-4"
            >
              <div className="grid h-14 w-14 place-items-center rounded-xl bg-primary/10">
                <FileSpreadsheet className="h-7 w-7 text-primary" />
              </div>
              <div>
                <p className="text-lg font-semibold">{acceptedFile.name}</p>
                <p className="text-sm text-muted-foreground">{formatSize(acceptedFile.size)}</p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setAcceptedFile(null);
                  setError(null);
                }}
                className="flex items-center gap-1 rounded-md px-3 py-1.5 text-xs text-muted-foreground hover:bg-muted"
              >
                <X className="h-3 w-3" /> Choose different file
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex flex-col items-center gap-4"
            >
              <motion.div
                animate={{ y: dragOver ? -4 : 0 }}
                className="grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5"
              >
                <Upload className="h-8 w-8 text-primary" />
              </motion.div>
              <div>
                <p className="text-lg font-semibold">Drop your CSV file here</p>
                <p className="text-sm text-muted-foreground">or click to browse · .csv up to 10MB</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-3 text-center text-sm font-medium text-destructive"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
