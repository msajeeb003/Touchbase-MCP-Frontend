import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Sparkles } from "lucide-react";
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
import { dismissToast, showError, showLoading, showSuccess } from "@/utils/toast";
import { cn } from "@/lib/utils";

interface GeneratePromptTextDialogProps {
  onGenerated: (promptText: string) => void;
}

const DEFAULT_STEP_TYPES = "SMS, EMAIL, SMS, EMAIL, SMS, EMAIL";

const parseStepTypesPattern = (input: string) =>
  input
    .split(",")
    .map((part) => part.trim().toUpperCase())
    .filter((part): part is "SMS" | "EMAIL" => part === "SMS" || part === "EMAIL");

export default function GeneratePromptTextDialog({ onGenerated }: GeneratePromptTextDialogProps) {
  const [open, setOpen] = useState(false);
  const [stepTypesInput, setStepTypesInput] = useState(DEFAULT_STEP_TYPES);
  const [generatePromptText, { isLoading }] = useGeneratePromptTextMutation();

  const form = useForm<GeneratePromptTextFormValues>({
    resolver: zodResolver(generatePromptTextSchema),
    defaultValues: {
      followUpScenario: "Client booked a call but didn't show up. Need to re-engage.",
      serviceDescription:
        "We provide AI-powered recruitment automation that reduces hiring time by 60%.",
      sequenceGoal: "Book a 15-minute discovery call to demonstrate our platform.",
      senderName: "Artur Abdullin",
      ctaLink: "https://calendly.com/artech-digital/30min-call",
      companyName: "Artech Digital",
      stepTypesPattern: parseStepTypesPattern(DEFAULT_STEP_TYPES),
      intervalDays: 3,
      toneStyle: "Professional but warm and conversational",
      additionalNotes: "Never mention competitors",
    },
  });

  const stepTypesHelpText = useMemo(
    () => 'Use comma-separated values like "SMS, EMAIL, SMS". Only SMS and EMAIL are allowed.',
    [],
  );

  const onSubmit = async (values: GeneratePromptTextFormValues) => {
    const loadingToastId = showLoading("Generating prompt text...");

    try {
      const response = await generatePromptText(values).unwrap();
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
      <DialogContent className="max-h-[90vh] overflow-y-auto p-0 sm:max-w-2xl">
        <DialogHeader className="border-b px-6 py-5 text-left">
          <DialogTitle className="text-2xl font-semibold text-slate-800">
            Generate Prompt Text
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 px-6 py-5">
            <FormField
              control={form.control}
              name="followUpScenario"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Follow-up Scenario</FormLabel>
                  <FormControl>
                    <Textarea className="min-h-20 resize-y" {...field} />
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
                  <FormLabel>Service Description</FormLabel>
                  <FormControl>
                    <Textarea className="min-h-20 resize-y" {...field} />
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
                    <FormLabel>Sequence Goal</FormLabel>
                    <FormControl>
                      <Input {...field} />
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
                    <FormLabel>Sender Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
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
                    <FormLabel>Company Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
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
                    <FormLabel>CTA Link</FormLabel>
                    <FormControl>
                      <Input placeholder="https://..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="stepTypesPattern"
                render={() => (
                  <FormItem>
                    <FormLabel>Step Types Pattern</FormLabel>
                    <FormControl>
                      <Input
                        value={stepTypesInput}
                        onChange={(event) => {
                          const raw = event.target.value;
                          setStepTypesInput(raw);
                          form.setValue("stepTypesPattern", parseStepTypesPattern(raw), {
                            shouldValidate: true,
                            shouldDirty: true,
                          });
                        }}
                        placeholder="SMS, EMAIL, SMS"
                      />
                    </FormControl>
                    <p className="text-xs text-slate-500">{stepTypesHelpText}</p>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="intervalDays"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Interval Days</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        value={field.value}
                        onChange={(event) => field.onChange(Number(event.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="toneStyle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tone Style</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="additionalNotes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Additional Notes (optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      className="min-h-20 resize-y"
                      placeholder="Anything else AI should keep in mind"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="border-t px-0 pt-5">
              <Button type="button" variant="ghost" onClick={() => setOpen(false)} disabled={isLoading}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading} className="bg-indigo-600 hover:bg-indigo-700">
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
      </DialogContent>
    </Dialog>
  );
}
