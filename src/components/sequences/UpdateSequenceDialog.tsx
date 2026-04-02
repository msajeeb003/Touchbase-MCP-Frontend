import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, ChevronsUpDown, Plus, Search } from "lucide-react";
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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
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
import { cn } from "@/lib/utils";
import { dismissToast, showError, showLoading, showSuccess } from "@/utils/toast";

interface UpdateSequenceDialogProps {
  sequenceId: string;
  trigger: ReactNode;
}

function buildAutoSequenceName(leadName: string, templateName: string) {
  return `${leadName} — ${templateName}`;
}

export default function UpdateSequenceDialog({ sequenceId, trigger }: UpdateSequenceDialogProps) {
  const [open, setOpen] = useState(false);
  const [leadPickerOpen, setLeadPickerOpen] = useState(false);
  const [leadSearchQuery, setLeadSearchQuery] = useState("");
  const [updateSequence, { isLoading: isUpdating }] = useUpdateSequenceMutation();
  const { data: leadsData, isLoading: isLeadsLoading } = useGetLeadsQuery({ page: 1, limit: 200 });
  const { data: templatesData, isLoading: isTemplatesLoading } = useGetPromptTemplatesQuery();
  const { data: sequenceData, isLoading: isSequenceLoading } = useGetSingleSequenceQuery(sequenceId, {
    skip: !open,
  });

  const leads = useMemo(() => {
    const items = leadsData?.data.items ?? [];
    return [...items].sort((a, b) =>
      a.name.localeCompare(b.name, undefined, { sensitivity: "base" }),
    );
  }, [leadsData?.data.items]);
  const templates = useMemo(() => templatesData?.data ?? [], [templatesData?.data]);

  const filteredLeads = useMemo(() => {
    const q = leadSearchQuery.trim().toLowerCase();
    if (!q) return leads;
    return leads.filter((lead) => lead.name.toLowerCase().includes(q));
  }, [leads, leadSearchQuery]);

  useEffect(() => {
    if (!leadPickerOpen) setLeadSearchQuery("");
  }, [leadPickerOpen]);

  const form = useForm<CreateSequenceFormValues>({
    resolver: zodResolver(createSequenceFormSchema),
    defaultValues: {
      leadId: "",
      name: "",
      totalSteps: 5,
      promptTemplateId: "",
    },
  });

  const lastAutoSequenceNameRef = useRef("");
  const watchedLeadId = useWatch({ control: form.control, name: "leadId" });
  const watchedTemplateId = useWatch({ control: form.control, name: "promptTemplateId" });

  useEffect(() => {
    if (sequenceData?.data && open) {
      const d = sequenceData.data;
      form.reset({
        leadId: d.leadId,
        name: d.name,
        totalSteps: d.totalSteps,
        promptTemplateId: d.promptTemplateId,
      });
    }
  }, [sequenceData, open, form]);

  useEffect(() => {
    if (!sequenceData?.data || !open) return;
    const d = sequenceData.data;
    const lead = leads.find((l) => l.id === d.leadId);
    const template = templates.find((t) => t.id === d.promptTemplateId);
    if (lead && template) {
      const generated = buildAutoSequenceName(lead.name, template.name);
      lastAutoSequenceNameRef.current = d.name === generated ? generated : "";
    } else {
      lastAutoSequenceNameRef.current = "";
    }
  }, [sequenceData, open, leads, templates]);

  useEffect(() => {
    if (!watchedLeadId || !watchedTemplateId) return;
    const lead = leads.find((l) => l.id === watchedLeadId);
    const template = templates.find((t) => t.id === watchedTemplateId);
    if (!lead || !template) return;

    const generated = buildAutoSequenceName(lead.name, template.name);
    const current = form.getValues("name");
    if (current === "" || current === lastAutoSequenceNameRef.current) {
      form.setValue("name", generated, { shouldValidate: true, shouldDirty: true });
      lastAutoSequenceNameRef.current = generated;
    }
  }, [watchedLeadId, watchedTemplateId, leads, templates, form]);

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
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setLeadPickerOpen(false);
      }}
    >
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
              render={({ field }) => {
                const selectedLead = leads.find((l) => l.id === field.value);
                return (
                  <FormItem className="flex flex-col">
                    <FormLabel>Lead</FormLabel>
                    <Popover modal={false} open={leadPickerOpen} onOpenChange={setLeadPickerOpen}>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            type="button"
                            variant="outline"
                            role="combobox"
                            aria-expanded={leadPickerOpen}
                            disabled={isLeadsLoading || isSequenceLoading}
                            className={cn(
                              "h-10 w-full justify-between font-normal",
                              !field.value && "text-muted-foreground",
                            )}
                          >
                            <span className="truncate text-left">
                              {isLeadsLoading || isSequenceLoading
                                ? "Loading leads..."
                                : selectedLead
                                  ? selectedLead.name
                                  : "Select a lead"}
                            </span>
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent
                        className="z-[100] w-[var(--radix-popover-trigger-width)] p-0"
                        align="start"
                        onWheel={(e) => e.stopPropagation()}
                      >
                        <div
                          className="flex flex-col overflow-hidden rounded-md border-0 bg-popover text-popover-foreground"
                          onWheel={(e) => e.stopPropagation()}
                        >
                          <div className="flex items-center gap-2 border-b px-3">
                            <Search className="h-4 w-4 shrink-0 opacity-50" aria-hidden />
                            <Input
                              type="search"
                              autoComplete="off"
                              placeholder="Search by lead name..."
                              value={leadSearchQuery}
                              onChange={(e) => setLeadSearchQuery(e.target.value)}
                              className="h-11 border-0 border-transparent bg-transparent px-0 shadow-none outline-none ring-0 ring-offset-0 focus-visible:border-0 focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
                            />
                          </div>
                          <div
                            role="listbox"
                            className="max-h-[min(280px,45vh)] overflow-y-auto overscroll-y-contain p-1"
                            onWheel={(e) => e.stopPropagation()}
                          >
                            {filteredLeads.length === 0 ? (
                              <p className="py-6 text-center text-sm text-muted-foreground">
                                No lead found.
                              </p>
                            ) : (
                              filteredLeads.map((lead) => (
                                <button
                                  key={lead.id}
                                  type="button"
                                  role="option"
                                  aria-selected={field.value === lead.id}
                                  className={cn(
                                    "flex w-full cursor-default items-center rounded-sm px-2 py-2 text-left text-sm outline-none hover:bg-accent hover:text-accent-foreground",
                                    field.value === lead.id && "bg-accent text-accent-foreground",
                                  )}
                                  onClick={() => {
                                    field.onChange(lead.id);
                                    setLeadPickerOpen(false);
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4 shrink-0",
                                      field.value === lead.id ? "opacity-100" : "opacity-0",
                                    )}
                                    aria-hidden
                                  />
                                  <div className="flex min-w-0 flex-1 flex-row flex-wrap items-center gap-x-1 text-left">
                                    <span className="font-medium">
                                      {lead.name}{" "}
                                      <sup className="text-slate-500">name</sup>
                                    </span>
                                    <Plus className="mx-1 h-4 w-4 shrink-0 text-slate-400" />
                                    <span className="text-xs text-blue-700">
                                      {lead.followUpStage}{" "}
                                      <sup className="text-blue-500">followUpStage</sup>
                                    </span>
                                  </div>
                                </button>
                              ))
                            )}
                          </div>
                        </div>
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                );
              }}
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
                        >
                          {field.value
                            ? templates.find((t) => t.id === field.value)?.name
                            : undefined}
                        </SelectValue>
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {templates.map((template) => (
                        <SelectItem key={template.id} value={template.id}>
                          <div className="flex flex-row flex-wrap text-left">
                            <span className="font-medium">
                              {template.name} <sup className=" text-slate-500">name</sup>{" "}
                            </span>
                            <span>
                              {" "}
                              <Plus className="mx-2 h-5 w-5" />{" "}
                            </span>
                            <span className="text-xs text-blue-700 ">
                              {template.followUpStage}{" "}
                              <sup className=" text-blue-500">followUpStage</sup>
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
                    <Input
                      placeholder="Select lead and template to auto-fill"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Built from lead + template when both are chosen. You can edit it anytime.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

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
