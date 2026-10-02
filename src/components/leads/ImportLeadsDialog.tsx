import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type DragEvent,
  type ReactNode,
} from "react";
import {
  AlertCircle,
  Download,
  FileSpreadsheet,
  Info,
  Loader2,
  UploadCloud,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useImportLeadsCsvMutation } from "@/store/features/leads/leadsApi";
import type { ImportLeadsCsvData } from "@/types/leads";
import { dismissToast, showError, showLoading, showSuccess } from "@/utils/toast";

interface ImportLeadsDialogProps {
  trigger: ReactNode;
}

/** Lead fields the backend can map from your CSV headers. */
const REQUIRED_FIELDS = ["name"] as const;
const RECOMMENDED_FIELDS = ["email or phone (at least one for follow-up)"] as const;
const OPTIONAL_FIELDS = [
  "email",
  "phone",
  "notes",
  "company",
  "location",
  "followUpStage",
] as const;

const SAMPLE_TEMPLATE_COLUMNS = [
  "name",
  "email",
  "phone",
  "company",
  "location",
  "followUpStage",
  "notes",
] as const;

const SAMPLE_CSV_ROWS = [
  SAMPLE_TEMPLATE_COLUMNS.join(","),
  "John Doe,john@example.com,+8801712345678,Acme Corp,Dhaka,PRD,Interested in MVP scope",
  "Jane Smith,,+8801812345678,Biz Lab,Chittagong,No Show,Follow up next week",
  "Alex Lee,alex@company.com,,Startup Inc,Sylhet,Qualified,Met at conference",
] as const;

export default function ImportLeadsDialog({ trigger }: ImportLeadsDialogProps) {
  const fileInputId = useId();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [open, setOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [lastImportResult, setLastImportResult] = useState<ImportLeadsCsvData | null>(null);
  const [importLeadsCsv, { isLoading }] = useImportLeadsCsvMutation();

  const sampleTemplateUrl = useMemo(() => {
    const blob = new Blob([SAMPLE_CSV_ROWS.join("\n")], { type: "text/csv;charset=utf-8;" });
    return URL.createObjectURL(blob);
  }, []);

  useEffect(() => {
    return () => {
      URL.revokeObjectURL(sampleTemplateUrl);
    };
  }, [sampleTemplateUrl]);

  const resetDialogState = () => {
    setSelectedFile(null);
    setIsDragging(false);
    setLastImportResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen) {
      resetDialogState();
    }
  };

  const handleFileSelection = (file: File | null) => {
    if (!file) return;

    const isCsvFile =
      file.type === "text/csv" ||
      file.name.toLowerCase().endsWith(".csv") ||
      file.type === "application/vnd.ms-excel";

    if (!isCsvFile) {
      showError("Please choose a valid CSV file.");
      return;
    }

    setSelectedFile(file);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    handleFileSelection(event.target.files?.[0] ?? null);
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
    handleFileSelection(event.dataTransfer.files?.[0] ?? null);
  };

  const handleImport = async () => {
    if (!selectedFile) {
      showError("Please select a CSV file first.");
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);

    const loadingToastId = showLoading("Importing CSV...");

    try {
      const response = await importLeadsCsv(formData).unwrap();
      setLastImportResult(response.data);
      showSuccess(response.message || "CSV imported successfully");
    } catch (error: unknown) {
      const errorMessage =
        (error as { data?: { message?: string } })?.data?.message ||
        "Failed to import CSV. Please try again.";
      showError(errorMessage);
    } finally {
      dismissToast(loadingToastId);
    }
  };

  const columnMappingEntries = lastImportResult
    ? Object.entries(lastImportResult.columnMapping ?? {})
    : [];

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="w-[calc(100vw-1.5rem)] max-w-4xl gap-0 overflow-hidden border-landing-line bg-landing-steel-2 p-0 sm:rounded-2xl">
        <DialogHeader className="border-b px-6 py-5">
          <DialogTitle className="flex items-center gap-3 font-landing-display text-2xl font-bold text-landing-fog">
            <FileSpreadsheet className="h-6 w-6 text-landing-sky" />
            Import Leads
          </DialogTitle>
        </DialogHeader>

        <div className="max-h-[75vh] space-y-6 overflow-y-auto px-6 py-5">
          <div
            role="button"
            tabIndex={0}
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(event) => {
              event.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={(event) => {
              event.preventDefault();
              setIsDragging(false);
            }}
            onDrop={handleDrop}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                fileInputRef.current?.click();
              }
            }}
            className={`rounded-2xl border-2 border-dashed p-6 text-center transition-colors sm:p-10 ${
              isDragging
                ? "border-landing-sky bg-landing-sky-soft"
                : "border-landing-line bg-landing-steel hover:border-landing-sky/50 hover:bg-white/[0.03]"
            }`}
          >
            <input
              ref={fileInputRef}
              id={fileInputId}
              type="file"
              accept=".csv,text/csv"
              className="hidden"
              onChange={handleFileChange}
            />

            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-landing-sky-soft">
              <UploadCloud className="h-7 w-7 text-landing-sky" />
            </div>

            <h3 className="text-xl font-semibold text-landing-fog">Drag and drop CSV file</h3>
            <p className="mt-2 text-sm text-landing-fog/55">
              Or click to browse from your computer.
            </p>

            <Button
              type="button"
              variant="outline"
              className="mt-5"
              onClick={(event) => {
                event.stopPropagation();
                fileInputRef.current?.click();
              }}
            >
              Browse Files
            </Button>

            {selectedFile ? (
              <div className="mt-4 rounded-xl border border-landing-sky/30 bg-landing-sky-soft px-4 py-3 text-left">
                <p className="text-sm font-medium text-landing-fog">{selectedFile.name}</p>
                <p className="text-xs text-landing-fog/55">
                  {(selectedFile.size / 1024).toFixed(2)} KB selected
                </p>
              </div>
            ) : null}
          </div>

          <div className="rounded-2xl border border-landing-line bg-white/[0.03] p-5">
            <div className="flex items-center gap-2 text-sm font-medium text-landing-fog">
              <Info className="h-4 w-4 text-landing-sky" />
              What your CSV should include
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <div className="rounded-lg border border-landing-line bg-landing-steel px-4 py-3 text-sm text-landing-fog/55">
                <p className="font-medium text-landing-fog">Required</p>
                <p className="mt-2">{REQUIRED_FIELDS.join(", ")}</p>
              </div>
              <div className="rounded-lg border border-landing-line bg-landing-steel px-4 py-3 text-sm text-landing-fog/55">
                <p className="font-medium text-landing-fog">Recommended</p>
                <p className="mt-2">{RECOMMENDED_FIELDS.join(", ")}</p>
              </div>
            </div>
            <div className="mt-3 rounded-lg border border-landing-line bg-landing-steel px-4 py-3 text-sm text-landing-fog/55">
              <p className="font-medium text-landing-fog">Optional</p>
              <p className="mt-2">{OPTIONAL_FIELDS.join(", ")}</p>
            </div>
            <p className="mt-4 text-sm text-landing-fog/65">
              Download the{" "}
              <a
                href={sampleTemplateUrl}
                download="leads-import-template.csv"
                className="inline-flex items-center gap-1 font-medium text-landing-sky hover:text-landing-fog"
              >
                sample template
                <Download className="h-3.5 w-3.5" />
              </a>{" "}
              — it uses the column names above ({SAMPLE_TEMPLATE_COLUMNS.join(", ")}).
            </p>
          </div>

          {lastImportResult ? (
            <div className="space-y-4 rounded-2xl border border-landing-line bg-landing-steel">
              <div className="border-b px-5 py-4">
                <h3 className="font-semibold text-landing-fog">Last Import Results</h3>
              </div>

              <div className="grid gap-3 px-5 md:grid-cols-3">
                <div className="rounded-2xl border border-landing-whatsapp/30 bg-landing-whatsapp/10 px-4 py-5 text-center">
                  <p className="text-3xl font-semibold text-landing-whatsapp">
                    {lastImportResult.success}
                  </p>
                  <p className="mt-1 text-sm font-medium text-landing-whatsapp">Imported</p>
                </div>
                <div className="rounded-2xl border border-landing-voice/30 bg-landing-voice/10 px-4 py-5 text-center">
                  <p className="text-3xl font-semibold text-landing-voice">{lastImportResult.failed}</p>
                  <p className="mt-1 text-sm font-medium text-landing-voice">Failed</p>
                </div>
                <div className="rounded-2xl border border-landing-sms/30 bg-landing-sms/10 px-4 py-5 text-center">
                  <p className="text-3xl font-semibold text-landing-sms">{lastImportResult.total}</p>
                  <p className="mt-1 text-sm font-medium text-landing-sms">Total Rows</p>
                </div>
              </div>

              {columnMappingEntries.length > 0 ? (
                <div className="px-5">
                  <p className="mb-3 text-sm font-medium text-landing-fog">Column mapping</p>
                  <div className="rounded-xl border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>CSV column</TableHead>
                          <TableHead>Lead field</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {columnMappingEntries.map(([csvColumn, leadField]) => (
                          <TableRow key={csvColumn}>
                            <TableCell className="font-medium text-landing-fog">
                              {csvColumn}
                            </TableCell>
                            <TableCell className="text-landing-fog/65">{leadField}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              ) : null}

              {lastImportResult.errors.length > 0 ? (
                <div className="px-5 pb-5">
                  <div className="mb-3 flex items-center gap-2 text-sm font-medium text-landing-fog">
                    <AlertCircle className="h-4 w-4 text-landing-voice" />
                    Import Errors
                  </div>

                  <div className="rounded-xl border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Row</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Reason</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {lastImportResult.errors.map((item) => (
                          <TableRow key={`${item.row}-${item.email}-${item.reason}`}>
                            <TableCell className="font-medium text-landing-fog">
                              {item.row}
                            </TableCell>
                            <TableCell className="text-landing-fog/65">
                              {item.email || "—"}
                            </TableCell>
                            <TableCell className="text-landing-voice">{item.reason}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              ) : (
                <div className="px-5 pb-5 text-sm text-landing-whatsapp">
                  No row-level errors found in the last import.
                </div>
              )}
            </div>
          ) : null}
        </div>

        <DialogFooter className="border-t px-6 py-4">
          <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
            Close
          </Button>
          <Button
            type="button"
            onClick={handleImport}
            disabled={isLoading || !selectedFile}
            className="bg-landing-sky font-semibold text-landing-steel hover:bg-landing-sky-deep"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Import CSV
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
