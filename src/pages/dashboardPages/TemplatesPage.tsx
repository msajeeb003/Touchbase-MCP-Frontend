import { FileText, Loader2, Plus } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  useDeletePromptTemplateMutation,
  useGetPromptTemplatesQuery,
} from "@/store/features/templates/templatesApi";
import ViewTemplateDialog from "@/components/templates/ViewTemplateDialog";
import { dismissToast, showError, showLoading, showSuccess } from "@/utils/toast";

const getStageBadgeClass = (stage: string) => {
  const value = stage.toLowerCase();
  if (value.includes("no")) return "bg-landing-sky/20 text-landing-sky border-landing-sky/40";
  if (value.includes("after")) return "bg-landing-violet/15 text-landing-violet border-landing-violet/40";
  if (value.includes("cancel")) return "bg-landing-voice/15 text-landing-voice border-landing-voice/40";
  return "bg-landing-fog/[0.06] text-landing-fog/80 border-landing-line";
};

const formatDate = (dateString: string) =>
  new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

const getSummary = (promptText: string) => {
  const plain = promptText.replace(/\s+/g, " ").trim();
  return plain.length > 90 ? `${plain.slice(0, 90)}...` : plain;
};

export default function TemplatesPage() {
  const navigate = useNavigate();
  const [deletingTemplateId, setDeletingTemplateId] = useState<string | null>(null);
  const [deletePromptTemplate] = useDeletePromptTemplateMutation();
  const { data, isLoading, isError } = useGetPromptTemplatesQuery();
  const templates = data?.data ?? [];

  const handleDeleteTemplate = async (templateId: string) => {
    const loadingToastId = showLoading("Deleting template...");
    setDeletingTemplateId(templateId);

    try {
      const response = await deletePromptTemplate(templateId).unwrap();
      showSuccess(response.message || "Prompt template deleted successfully");
    } catch (error: unknown) {
      const errorMessage =
        (error as { data?: { message?: string } })?.data?.message ||
        "Failed to delete prompt template. Please try again.";
      showError(errorMessage);
    } finally {
      dismissToast(loadingToastId);
      setDeletingTemplateId(null);
    }
  };

  if (isLoading) {
    return <div className="rounded-xl border border-dashed border-landing-line p-8 font-landing-sans text-sm text-landing-fog/60">Loading templates...</div>;
  }

  if (isError) {
    return (
      <div className="rounded-xl border border-landing-voice/40 bg-landing-voice/10 p-8 font-landing-sans text-sm text-landing-voice">
        Failed to fetch templates.
      </div>
    );
  }

  return (
    <div className="space-y-5 font-landing-sans text-landing-fog/80">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          {/* <p className="text-sm text-landing-fog/55">Follow Up Dashboard</p> */}
          <h2 className="font-landing-display text-[clamp(26px,3vw,34px)] font-bold tracking-[-0.02em] text-landing-fog">
            Prompt Templates{" "}
            <span className="font-landing-mono text-lg font-normal text-landing-fog/40">({templates.length})</span>
          </h2>
        </div>
        <Button
          className="gap-2 bg-landing-sky font-semibold text-landing-steel hover:bg-landing-sky-deep"
          onClick={() => navigate("/dashboard/templates/new")}
        >
          <Plus className="h-4 w-4" />
          New Template
        </Button>
      </div>

      {templates.length === 0 ? (
        <div className="rounded-xl border border-dashed border-landing-line bg-landing-steel-2 px-6 py-14 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-landing-sky/20">
            <FileText className="h-5 w-5 text-landing-sky" />
          </div>
          <h3 className="font-landing-display text-2xl font-bold text-landing-fog">No prompt templates yet.</h3>
          <p className="mx-auto mt-2 max-w-xl text-sm text-landing-fog/55">
            Get started by creating your first template to automate your follow-up sequences.
          </p>
          <Button
            className="mt-6 bg-landing-sky font-semibold text-landing-steel hover:bg-landing-sky-deep"
            onClick={() => navigate("/dashboard/templates/new")}
          >
            Create First Template
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-2">
          {templates.map((template) => (
            <div key={template.id} className="rounded-2xl border border-landing-line bg-landing-steel-2 p-5 transition-colors hover:border-landing-sky/40">
              <div className="mb-3 flex items-start justify-between gap-3">
                <h3 className="font-landing-display text-xl font-bold leading-tight text-landing-fog">{template.name}</h3>
                <p className={`flex-none whitespace-nowrap rounded-full border px-2.5 py-1 text-center font-landing-mono text-[11px] font-medium ${getStageBadgeClass(template.followUpStage)}`}>
                  {template.followUpStage}
                </p>
              </div>

              <p className="min-h-14 text-[15px] leading-relaxed text-landing-fog/55">{getSummary(template.promptText)}</p>

              <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-landing-line pt-4">
                <p className="font-landing-mono text-[12px] text-landing-fog/45">Updated: {formatDate(template.updatedAt)}</p>
                <div className="flex items-center gap-4 text-sm font-medium">
                  <ViewTemplateDialog
                    templateId={template.id}
                    trigger={
                      <button className="text-landing-fog/65 hover:text-landing-fog" type="button">
                        View
                      </button>
                    }
                  />
                  <button
                    className="text-landing-sky hover:underline"
                    type="button"
                    onClick={() => navigate(`/dashboard/templates/${template.id}/edit`)}
                  >
                    Edit
                  </button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <button
                        className="text-landing-voice hover:underline disabled:cursor-not-allowed disabled:opacity-70"
                        type="button"
                        disabled={deletingTemplateId === template.id}
                      >
                        {deletingTemplateId === template.id ? "Deleting..." : "Delete"}
                      </button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="border-landing-line bg-landing-steel-2 font-landing-sans">
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete template?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete{" "}
                          <span className="font-medium text-foreground">{template.name}</span>.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          className="bg-rose-600 text-[#fff] hover:bg-rose-700"
                          onClick={() => handleDeleteTemplate(template.id)}
                        >
                          {deletingTemplateId === template.id ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Deleting
                            </>
                          ) : (
                            "Delete"
                          )}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
