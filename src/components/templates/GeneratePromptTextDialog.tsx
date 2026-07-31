import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CircleHelp, Loader2, Sparkles } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  generatePromptTextSchema,
  type GeneratePromptTextFormValues,
} from "@/schema/templates/generatePromptText.schema";
import { useGeneratePromptTextMutation } from "@/store/features/templates/templatesApi";
import type { GeneratePromptTextRequestBody } from "@/types/templates";
import { dismissToast, showError, showLoading, showSuccess } from "@/utils/toast";
import { cn } from "@/lib/utils";

interface GeneratePromptTextDialogProps {
  onGenerated: (promptText: string) => void;
}

export default function GeneratePromptTextDialog({ onGenerated }: GeneratePromptTextDialogProps) {
  const [open, setOpen] = useState(false);
  const [generatePromptText, { isLoading }] = useGeneratePromptTextMutation();

  const form = useForm<GeneratePromptTextFormValues>({
    resolver: zodResolver(generatePromptTextSchema),
    defaultValues: {
      followUpScenario: "",
      serviceDescription: "",
      sequenceGoal: "",
      senderName: "",
      ctaLink: "",
      companyName: "",
      additionalNotes: "",
    },
  });

  const onSubmit = async (values: GeneratePromptTextFormValues) => {
    const loadingToastId = showLoading("Generating prompt text...");

    try {
      const payload: GeneratePromptTextRequestBody = {
        followUpScenario: values.followUpScenario,
        serviceDescription: values.serviceDescription,
        sequenceGoal: values.sequenceGoal,
        senderName: values.senderName,
        ...(values.ctaLink ? { ctaLink: values.ctaLink } : {}),
        ...(values.companyName ? { companyName: values.companyName } : {}),
        ...(values.additionalNotes ? { additionalNotes: values.additionalNotes } : {}),
      };

      generatePromptTextSchema.parse(payload);
      const response = await generatePromptText(payload).unwrap();
      const generated = response.data.promptText;
      onGenerated(generated);
      showSuccess(response.message || "Prompt text generated successfully");
      setOpen(false);
    } catch (error: unknown) {
      const errorMessage =
        (error as { data?: { message?: string } })?.data?.message ||
        "Failed to generate prompt text. Please try again.";
      showError(errorMessage);
    } finally {
      dismissToast(loadingToastId);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          type="button"
          size="sm"
          className={cn(
            "h-8 gap-1.5 bg-gradient-to-r from-violet-600 via-fuchsia-600 to-indigo-600 text-white shadow-sm hover:from-violet-700 hover:via-fuchsia-700 hover:to-indigo-700",
          )}
        >
          <Sparkles className="h-3.5 w-3.5" />
          Generate with AI
        </Button>
      </DialogTrigger>
      <DialogContent className="my-4 w-[calc(100vw-2rem)] max-h-[calc(90vh-2rem)] overflow-y-auto p-0 sm:max-w-2xl">
        <DialogHeader className="border-b px-6 py-5 text-left">
          <DialogTitle className="text-2xl font-semibold text-slate-800">
            Generate Prompt Text
          </DialogTitle>
        </DialogHeader>

        <TooltipProvider delayDuration={120}>
          <Form {...form}>
            <form
              onSubmit={(event) => {
                event.preventDefault();
                event.stopPropagation();
                void form.handleSubmit(onSubmit)(event);
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.stopPropagation();
                }
              }}
              className="space-y-5 px-6 py-5"
            >
              <FormField
                control={form.control}
                name="followUpScenario"
                render={({ field }) => (
                  <FormItem>
                    <FieldLabel
                      label="Follow-up Scenario"
                      required
                      hint="Describe the exact situation. Example: Client booked a call but did not show up, now needs a re-engagement sequence."
                    />
                    <FormControl>
                      <Textarea
                        className="min-h-20 resize-y"
                        placeholder="Example: Client booked a call but did not show up. Need to re-engage politely."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="serviceDescription"
                render={({ field }) => (
                  <FormItem>
                    <FieldLabel
                      label="Service Description"
                      required
                      hint="Briefly explain what you offer and the outcome. Example: AI-powered recruitment automation that reduces hiring time by 60%."
                    />
                    <FormControl>
                      <Textarea
                        className="min-h-20 resize-y"
                        placeholder="Example: We provide AI-powered recruitment automation that reduces hiring time by 60%."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="sequenceGoal"
                  render={({ field }) => (
                    <FormItem>
                      <FieldLabel
                        label="Sequence Goal"
                        required
                        hint="What outcome should this follow-up sequence achieve? Example: Book a 15-minute discovery call."
                      />
                      <FormControl>
                        <Input placeholder="Example: Book a 15-minute discovery call." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="senderName"
                  render={({ field }) => (
                    <FormItem>
                      <FieldLabel
                        label="Sender Name"
                        required
                        hint="Name that should appear as the sender in generated messages. Example: Artur Abdullin."
                      />
                      <FormControl>
                        <Input placeholder="Example: Artur Abdullin" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="companyName"
                  render={({ field }) => (
                    <FormItem>
                      <FieldLabel
                        label="Company Name"
                        hint="Company name to mention in prompt context. Example: Artech Digital."
                      />
                      <FormControl>
                        <Input placeholder="Example: Artech Digital" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="ctaLink"
                  render={({ field }) => (
                    <FormItem>
                      <FieldLabel
                        label="CTA Link"
                        hint="Call-to-action URL for booking or next step. Example: https://calendly.com/yourname/30min-call"
                      />
                      <FormControl>
                        <Input placeholder="Example: https://calendly.com/yourname/30min-call" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="additionalNotes"
                render={({ field }) => (
                  <FormItem>
                    <FieldLabel
                      label="Additional Notes"
                      hint="Extra constraints or instructions. Example: Never mention competitors."
                    />
                    <FormControl>
                      <Textarea
                        className="min-h-20 resize-y"
                        placeholder="Example: Never mention competitors"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter className="border-t px-0 pt-5">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setOpen(false)}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  disabled={isLoading}
                  className="bg-indigo-600 hover:bg-indigo-700"
                  onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    void form.handleSubmit(onSubmit)();
                  }}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    "Generate Prompt"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </TooltipProvider>
      </DialogContent>
    </Dialog>
  );
}

function FieldHint({ text }: { text: string }) {
  const [open, setOpen] = useState(false);

  return (
    <Tooltip open={open} onOpenChange={setOpen}>
      <TooltipTrigger asChild>
        <button
          type="button"
          tabIndex={-1}
          aria-label="Field information"
          onPointerEnter={() => setOpen(true)}
          onPointerLeave={() => setOpen(false)}
          onFocus={(event) => {
            event.currentTarget.blur();
            setOpen(false);
          }}
          className="inline-flex h-4 w-4 items-center justify-center rounded-full text-slate-400 transition-colors hover:text-slate-600"
        >
          <CircleHelp className="h-4 w-4" />
        </button>
      </TooltipTrigger>
      <TooltipContent className="max-w-xs whitespace-pre-wrap text-left text-xs leading-5">
        {text}
      </TooltipContent>
    </Tooltip>
  );
}

function FieldLabel({
  label,
  hint,
  required = false,
}: {
  label: string;
  hint: string;
  required?: boolean;
}) {
  return (
    <div className="flex items-center gap-1.5">
      <FormLabel>
        {label}
        {required ? <span className="ml-0.5 text-destructive">*</span> : null}
      </FormLabel>
      <FieldHint text={hint} />
    </div>
  );
}
