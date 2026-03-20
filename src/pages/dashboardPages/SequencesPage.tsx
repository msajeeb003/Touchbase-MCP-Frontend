import { useMemo, useState } from "react";
import { Loader2, Pencil, Plus, RefreshCw, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import AddSequenceDialog from "@/components/sequences/AddSequenceDialog";
import UpdateSequenceDialog from "@/components/sequences/UpdateSequenceDialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  useDeleteSequenceMutation,
  useGetSequencesQuery,
} from "@/store/features/sequences/sequencesApi";
import type { SequenceStatus } from "@/types/sequences";
import { dismissToast, showError, showLoading, showSuccess } from "@/utils/toast";

const VALID_STATUSES: SequenceStatus[] = ["draft", "active", "paused", "completed", "cancelled"];

const getStatusBadgeClass = (status: SequenceStatus) => {
  if (status === "active") return "border-green-200 bg-green-100 text-green-700";
  if (status === "draft") return "border-amber-200 bg-amber-100 text-amber-700";
  if (status === "completed") return "border-emerald-200 bg-emerald-100 text-emerald-700";
  if (status === "cancelled") return "border-rose-200 bg-rose-100 text-rose-700";
  if (status === "paused") return "border-blue-200 bg-blue-100 text-blue-700";
  return "border-slate-200 bg-slate-100 text-slate-700";
};

const getStatusLabel = (status: SequenceStatus) => status.charAt(0).toUpperCase() + status.slice(1);

export default function SequencesPage() {
  const [stageFilter, setStageFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [deletingSequenceId, setDeletingSequenceId] = useState<string | null>(null);
  const { data, isLoading, isError } = useGetSequencesQuery();
  const [deleteSequence] = useDeleteSequenceMutation();
  const sequences = useMemo(() => data?.data ?? [], [data?.data]);

  const stageOptions = useMemo(() => {
    const uniqueStages = Array.from(
      new Set(sequences.map((item) => item.promptTemplate?.followUpStage).filter(Boolean)),
    );
    return ["All", ...uniqueStages];
  }, [sequences]);

  const filteredSequences = useMemo(
    () =>
      sequences.filter((item) => {
        const matchesStage =
          stageFilter === "All" || item.promptTemplate?.followUpStage === stageFilter;
        const matchesStatus = statusFilter === "All" || item.status === statusFilter;
        return matchesStage && matchesStatus;
      }),
    [sequences, stageFilter, statusFilter],
  );

  const handleDeleteSequence = async (sequenceId: string) => {
    const loadingToastId = showLoading("Deleting sequence...");
    setDeletingSequenceId(sequenceId);

    try {
      const response = await deleteSequence(sequenceId).unwrap();
      showSuccess(response.message || "Sequence deleted successfully");
    } catch (error: unknown) {
      const errorMessage =
        (error as { data?: { message?: string } })?.data?.message ||
        "Failed to delete sequence. Please try again.";
      showError(errorMessage);
    } finally {
      dismissToast(loadingToastId);
      setDeletingSequenceId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-sm text-slate-500">
        <div className="flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin text-indigo-600" />
          <span>Loading sequences...</span>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-8 text-sm text-red-600">
        Failed to fetch sequences.
      </div>
    );
  }

  return (
    <div className="w-full min-w-0 space-y-4 overflow-x-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          {/* <p className="text-sm text-slate-500">Follow Up Dashboard</p> */}
          <h2 className="flex items-center gap-2 text-3xl font-semibold text-slate-900">
            <RefreshCw className="h-6 w-6 text-indigo-500" />
            Sequences
          </h2>
        </div>
        <AddSequenceDialog
          trigger={
            <Button className="gap-2 bg-indigo-600 hover:bg-indigo-700">
              <Plus className="h-4 w-4" />
              New Sequence
            </Button>
          }
        />
      </div>

      <div className="w-full min-w-0 rounded-xl border bg-white shadow-sm">
        <div className="flex flex-wrap items-center gap-3 border-b p-4">
          <div className="w-full sm:w-[140px]">
            <Select value={stageFilter} onValueChange={setStageFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter: All" />
              </SelectTrigger>
              <SelectContent>
                {stageOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option === "All" ? "Filter: All" : option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="w-full sm:w-[140px]">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Status: All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">Status: All</SelectItem>
                {VALID_STATUSES.map((status) => (
                  <SelectItem key={status} value={status}>
                    {getStatusLabel(status)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {filteredSequences.length === 0 ? (
          <div className="p-8 text-center">
            <h3 className="text-lg font-semibold text-slate-900">No sequences found</h3>
            <p className="mt-1 text-sm text-slate-500">Try changing the filters to see available sequences.</p>
          </div>
        ) : (
          <div className="w-full max-w-full overflow-x-auto">
            <Table className="min-w-[920px]">
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Lead</TableHead>
                  <TableHead>Steps</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Template</TableHead>
                  <TableHead className="text-center">Edit</TableHead>
                  <TableHead className="text-center">Delete</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSequences.map((sequence) => (
                  <TableRow key={sequence.id}>
                    <TableCell className="font-medium text-slate-900">{sequence.name}</TableCell>
                    <TableCell className="text-slate-600">{sequence.lead?.name || "N/A"}</TableCell>
                    <TableCell className="text-slate-600">
                      {sequence._count?.steps ?? 0}/{sequence.totalSteps}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getStatusBadgeClass(sequence.status)}>
                        {getStatusLabel(sequence.status)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-slate-600">
                      {sequence.promptTemplate?.followUpStage || sequence.promptTemplate?.name || "N/A"}
                    </TableCell>
                    <TableCell className="text-center">
                      <UpdateSequenceDialog
                        sequenceId={sequence.id}
                        trigger={
                          <Button variant="ghost" size="icon" className="text-indigo-600 hover:text-indigo-700">
                            <Pencil className="h-4 w-4" />
                            <span className="sr-only">Update sequence</span>
                          </Button>
                        }
                      />
                    </TableCell>
                    <TableCell className="text-center">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-rose-600 hover:text-rose-700"
                            disabled={deletingSequenceId === sequence.id}
                          >
                            {deletingSequenceId === sequence.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                            <span className="sr-only">Delete sequence</span>
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete sequence?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will permanently delete{" "}
                              <span className="font-medium text-foreground">{sequence.name}</span>.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              className="bg-rose-600 text-white hover:bg-rose-700"
                              onClick={() => handleDeleteSequence(sequence.id)}
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}
