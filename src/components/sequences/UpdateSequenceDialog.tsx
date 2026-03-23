import { useEffect, useState, type ReactNode } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  createSequenceFormSchema,
  type CreateSequenceFormValues,
} from "@/schema/sequences/createSequence.schema";
import { useGetLeadsQuery } from "@/store/features/leads/leadsApi";
import {
  useGetSingleSequenceQuery,
  useUpdateSequenceMutation,
} from "@/store/features/sequences/sequencesApi";
import { useGetPromptTemplatesQuery } from "@/store/features/templates/templatesApi";
import { dismissToast, showError, showLoading, showSuccess } from "@/utils/toast";

interface UpdateSequenceDialogProps {
  sequenceId: string;
  trigger: ReactNode;
}

export default function UpdateSequenceDialog({ sequenceId, trigger }: UpdateSequenceDialogProps) {
  const [open, setOpen] = useState(false);
  const [updateSequence, { isLoading: isUpdating }] = useUpdateSequenceMutation();
  const { data: leadsData, isLoading: isLeadsLoading } = useGetLeadsQuery({ page: 1, limit: 200 });
  const { data: templatesData, isLoading: isTemplatesLoading } = useGetPromptTemplatesQuery();
  const { data: sequenceData, isLoading: isSequenceLoading } = useGetSingleSequenceQuery(sequenceId, {
    skip: !open,
  });

  const leads = leadsData?.data.items ?? [];
  const templates = templatesData?.data ?? [];

  const form = useForm<CreateSequenceFormValues>({
    resolver: zodResolver(createSequenceFormSchema),
    defaultValues: {
      leadId: "",
      name: "",
      totalSteps: 5,
      promptTemplateId: "",
    },
  });

  useEffect(() => {
    if (sequenceData?.data && open) {
      form.reset({
        leadId: sequenceData.data.leadId,
        name: sequenceData.data.name,
        totalSteps: sequenceData.data.totalSteps,
        promptTemplateId: sequenceData.data.promptTemplateId,
      });
    }
  }, [sequenceData, open, form]);

  const onSubmit = async (values: CreateSequenceFormValues) => {
    const loadingToastId = showLoading("Updating sequence...");

    try {
      const response = await updateSequence({
        id: sequenceId,
        body: {
          leadId: values.leadId,
          name: values.name,
          totalSteps: values.totalSteps,
          promptTemplateId: values.promptTemplateId,
        },
      }).unwrap();

      showSuccess(response.message || "Sequence updated successfully");
      setOpen(false);
    } catch (error: unknown) {
      const errorMessage =
        (error as { data?: { message?: string } })?.data?.message ||
        "Failed to update sequence. Please try again.";
      showError(errorMessage);
    } finally {
      dismissToast(loadingToastId);
    }
  };

  return (
    <Dialog  open={open} onOpenChange={setOpen} >
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-2xl p-0">
        <DialogHeader className="border-b px-6 py-5 text-left">
          <DialogTitle className="text-3xl font-semibold text-slate-800">Update Sequence</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 px-6 py-5">
            <FormField
              control={form.control}
              name="leadId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Lead</FormLabel>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={isLeadsLoading || isSequenceLoading}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue
                          placeholder={
                            isLeadsLoading || isSequenceLoading ? "Loading leads..." : "Select a lead"
                          }
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {leads.map((lead) => (
                        <SelectItem key={lead.id} value={lead.id}>
                          <div className="flex flex-row text-left">
                            <span className="font-medium">
                              {lead.name} <sup className="text-slate-500">name</sup>
                            </span>
                            <span>
                              <Plus className="mx-2 h-5 w-5" />
                            </span>
                            <span className="text-xs text-blue-700">
                              {lead.followUpStage}{" "}
                              <sup className="text-blue-500">followUpStage</sup>
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sequence Name</FormLabel>
                  <FormControl>
                    <Input placeholder="NoShow Follow-up for Mosh" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="totalSteps"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Total Steps</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        placeholder="5"
                        value={field.value}
                        disabled
                        onChange={(event) => field.onChange(Number(event.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="promptTemplateId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prompt Template</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={isTemplatesLoading || isSequenceLoading}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue
                            placeholder={
                              isTemplatesLoading || isSequenceLoading
                                ? "Loading templates..."
                                : "Select a template"
                            }
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {templates.map((template) => (
                          <SelectItem key={template.id} value={template.id}>
                            <div className="flex flex-row flex-wrap text-left">
                              <span className="font-medium">
                                {template.name} <sup className="text-slate-500">name</sup>
                              </span>
                              <span>
                                <Plus className="mx-2 h-5 w-5" />
                              </span>
                              <span className="text-xs text-blue-700">
                                {template.followUpStage}{" "}
                                <sup className="text-blue-500">followUpStage</sup>
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter className="border-t px-0 pt-5">
              <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isUpdating || isLeadsLoading || isTemplatesLoading || isSequenceLoading}
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                {isUpdating ? "Updating..." : "Update Sequence"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
