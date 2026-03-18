import { FileText, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useGetPromptTemplatesQuery } from "@/store/features/templates/templatesApi";
import ViewTemplateDialog from "@/components/templates/ViewTemplateDialog";

const getStageBadgeClass = (stage: string) => {
  const value = stage.toLowerCase();
  if (value.includes("no")) return "bg-indigo-100 text-indigo-700 border-indigo-200";
  if (value.includes("after")) return "bg-purple-100 text-purple-700 border-purple-200";
  if (value.includes("cancel")) return "bg-pink-100 text-pink-700 border-pink-200";
  return "bg-slate-100 text-slate-700 border-slate-200";
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
  const { data, isLoading, isError } = useGetPromptTemplatesQuery();
  const templates = data?.data ?? [];

  if (isLoading) {
    return <div className="rounded-lg border border-dashed p-8 text-sm text-slate-500">Loading templates...</div>;
  }

  if (isError) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-8 text-sm text-red-600">
        Failed to fetch templates.
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          {/* <p className="text-sm text-slate-500">Follow Up Dashboard</p> */}
          <h2 className="text-4xl font-semibold text-slate-900">
            Prompt Templates{" "}
            <span className="text-xl font-medium text-slate-400">({templates.length})</span>
          </h2>
        </div>
        <Button
          className="gap-2 bg-indigo-600 hover:bg-indigo-700"
          onClick={() => navigate("/dashboard/templates/new")}
        >
          <Plus className="h-4 w-4" />
          New Template
        </Button>
      </div>

      {templates.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50/40 px-6 py-14 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100">
            <FileText className="h-5 w-5 text-indigo-600" />
          </div>
          <h3 className="text-2xl font-semibold text-slate-900">No prompt templates yet.</h3>
          <p className="mx-auto mt-2 max-w-xl text-sm text-slate-500">
            Get started by creating your first template to automate your follow-up sequences.
          </p>
          <Button
            className="mt-6 bg-indigo-600 hover:bg-indigo-700"
            onClick={() => navigate("/dashboard/templates/new")}
          >
            Create First Template
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {templates.map((template) => (
            <div key={template.id} className="rounded-2xl border bg-white p-5 shadow-sm">
              <div className="mb-3 flex items-start justify-between gap-3">
                <h3 className="text-2xl font-semibold text-slate-800">{template.name}</h3>
                <Badge variant="outline" className={getStageBadgeClass(template.followUpStage)}>
                  {template.followUpStage}
                </Badge>
              </div>

              <p className="min-h-14 text-lg text-slate-500">{getSummary(template.promptText)}</p>

              <div className="mt-5 flex items-center justify-between border-t pt-4">
                <p className="text-sm text-slate-500">Updated: {formatDate(template.updatedAt)}</p>
                <div className="flex items-center gap-4 text-base">
                  <ViewTemplateDialog
                    templateId={template.id}
                    trigger={
                      <button className="text-slate-600 hover:text-slate-700" type="button">
                        View
                      </button>
                    }
                  />
                  <button
                    className="text-indigo-600 hover:text-indigo-700"
                    type="button"
                    onClick={() => navigate(`/dashboard/templates/${template.id}/edit`)}
                  >
                    Edit
                  </button>
                  <button className="text-rose-500 hover:text-rose-600" type="button">
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
