import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Bot, BarChart3, Mail, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
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
  settingsFormSchema,
  type SettingsFormValues,
} from "@/schema/settings/updateSettings.schema";
import {
  useGetSettingsQuery,
  useUpdateSettingsMutation,
} from "@/store/features/settings/settingsApi";
import { dismissToast, showError, showLoading, showSuccess } from "@/utils/toast";
import type { UpdateSettingsRequestBody } from "@/types/settings";

const sectionCardClass = "rounded-xl border bg-white shadow-sm";
const AI_PROVIDERS = ["openai", "gemini"] as const;
const AI_MODEL_BY_PROVIDER = {
  openai: "gpt-4o-mini",
  gemini: "gemini-2.0-flash",
} as const;

type AiProvider = (typeof AI_PROVIDERS)[number];

const toInitialValues = (data?: {
  aiProvider: string | null;
  aiApiKey: string | null;
  aiModel: string | null;
  fathomApiKey: string | null;
  smtpHost: string | null;
  smtpPort: number | null;
  smtpUsername: string | null;
  smtpPassword: string | null;
  smtpFromName: string | null;
  textmagicUsername: string | null;
  textmagicApiKey: string | null;
}): SettingsFormValues => {
  const normalizedProvider =
    typeof data?.aiProvider === "string" ? data.aiProvider.trim().toLowerCase() : "";
  const aiProvider = AI_PROVIDERS.includes(normalizedProvider as AiProvider)
    ? (normalizedProvider as AiProvider)
    : undefined;

  const aiModelFromApi = typeof data?.aiModel === "string" ? data.aiModel.trim() : "";
  const aiModel =
    aiProvider && aiModelFromApi === AI_MODEL_BY_PROVIDER[aiProvider]
      ? aiModelFromApi
      : aiProvider
        ? AI_MODEL_BY_PROVIDER[aiProvider]
        : undefined;

  return {
  aiProvider,
  aiApiKey: data?.aiApiKey ?? "",
  aiModel,
  fathomApiKey: data?.fathomApiKey ?? "",
  smtpHost: data?.smtpHost ?? "",
  smtpPort: data?.smtpPort ?? undefined,
  smtpUsername: data?.smtpUsername ?? "",
  smtpPassword: data?.smtpPassword ?? "",
  smtpFromName: data?.smtpFromName ?? "",
  textmagicUsername: data?.textmagicUsername ?? "",
  textmagicApiKey: data?.textmagicApiKey ?? "",
  };
};

const sanitizeUpdatePayload = (values: SettingsFormValues): UpdateSettingsRequestBody => {
  return {
    aiProvider: values.aiProvider ?? "",
    aiApiKey: values.aiApiKey ?? "",
    aiModel: values.aiModel ?? "",
    fathomApiKey: values.fathomApiKey ?? "",
    smtpHost: values.smtpHost ?? "",
    smtpPort: typeof values.smtpPort === "number" ? values.smtpPort : undefined,
    smtpUsername: values.smtpUsername ?? "",
    smtpPassword: values.smtpPassword ?? "",
    smtpFromName: values.smtpFromName ?? "",
    textmagicUsername: values.textmagicUsername ?? "",
    textmagicApiKey: values.textmagicApiKey ?? "",
  };
};

export default function SettingsPage() {
  const { data, isLoading, isError } = useGetSettingsQuery();
  const [updateSettings, { isLoading: isSaving }] = useUpdateSettingsMutation();

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsFormSchema),
    defaultValues: toInitialValues(),
  });
  const selectedProvider = form.watch("aiProvider");

  useEffect(() => {
    if (data?.data) {
      form.reset(toInitialValues(data.data));
    }
  }, [data, form]);

  useEffect(() => {
    if (!selectedProvider) return;

    const expectedModel = AI_MODEL_BY_PROVIDER[selectedProvider];
    const currentModel = form.getValues("aiModel");

    if (currentModel !== expectedModel) {
      form.setValue("aiModel", expectedModel, { shouldDirty: true, shouldValidate: true });
    }
  }, [selectedProvider, form]);

  const handleTestConnection = (label: string) => {
    showSuccess(`${label} test feature coming soon.`);
  };

  const handleSave = async (values: SettingsFormValues) => {
    const payload = sanitizeUpdatePayload(values);
    const loadingToastId = showLoading("Saving settings...");

    try {
      const response = await updateSettings(payload).unwrap();
      showSuccess(response.message || "Settings updated successfully");
      form.reset(toInitialValues(response.data));
    } catch (error: unknown) {
      const errorMessage =
        (error as { data?: { message?: string } })?.data?.message ||
        "Failed to update settings. Please try again.";
      showError(errorMessage);
    } finally {
      dismissToast(loadingToastId);
    }
  };

  if (isLoading) {
    return <div className="rounded-lg border border-dashed p-8 text-sm text-slate-500">Loading settings...</div>;
  }

  if (isError) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-8 text-sm text-red-600">
        Failed to fetch settings.
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <h2 className="text-3xl font-semibold text-slate-900">Settings</h2>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSave)} className="space-y-4">
          <section className={sectionCardClass}>
            <div className="flex flex-wrap items-center justify-between gap-3 border-b bg-slate-50/70 px-4 py-3">
              <div className="flex items-start gap-2">
                <Bot className="mt-0.5 h-4 w-4 text-indigo-600" />
                <div>
                  <h3 className="font-medium text-slate-900">AI Configuration</h3>
                  <p className="text-xs text-slate-500">Configure your AI assistant settings and models.</p>
                </div>
              </div>
              <Button type="button" variant="outline" size="sm" onClick={() => handleTestConnection("AI")}>
                Test Connection
              </Button>
            </div>
            <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="aiProvider"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>AI Provider</FormLabel>
                    <Select
                      value={field.value || undefined}
                      onValueChange={(value) => field.onChange(value as AiProvider)}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select provider" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="openai">openai</SelectItem>
                        <SelectItem value="gemini">gemini</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="aiModel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>AI Model</FormLabel>
                    <Select
                      value={field.value || undefined}
                      onValueChange={field.onChange}
                      disabled={!selectedProvider}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select provider first" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {selectedProvider ? (
                          <SelectItem value={AI_MODEL_BY_PROVIDER[selectedProvider]}>
                            {AI_MODEL_BY_PROVIDER[selectedProvider]}
                          </SelectItem>
                        ) : null}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="aiApiKey"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>AI API Key</FormLabel>
                    <FormControl>
                      <Input placeholder="sk-proj-..." {...field} value={field.value ?? ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </section>

          <section className={sectionCardClass}>
            <div className="flex flex-wrap items-center justify-between gap-3 border-b bg-slate-50/70 px-4 py-3">
              <div className="flex items-start gap-2">
                <BarChart3 className="mt-0.5 h-4 w-4 text-emerald-600" />
                <div>
                  <h3 className="font-medium text-slate-900">Fathom Call Transcripts</h3>
                  <p className="text-xs text-slate-500">
                    Connect your Fathom analytics account to import call transcripts.
                  </p>
                </div>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="text-emerald-700"
                onClick={() => handleTestConnection("Fathom")}
              >
                Test Connection
              </Button>
            </div>
            <div className="p-4">
              <FormField
                control={form.control}
                name="fathomApiKey"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fathom API Key</FormLabel>
                    <FormControl>
                      <Input placeholder="fathom_api_..." {...field} value={field.value ?? ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </section>

          <section className={sectionCardClass}>
            <div className="flex flex-wrap items-center justify-between gap-3 border-b bg-slate-50/70 px-4 py-3">
              <div className="flex items-start gap-2">
                <Mail className="mt-0.5 h-4 w-4 text-violet-600" />
                <div>
                  <h3 className="font-medium text-slate-900">Email (SMTP) Settings</h3>
                  <p className="text-xs text-slate-500">Configure SMTP settings for outgoing email follow-ups.</p>
                </div>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="text-violet-700"
                onClick={() => handleTestConnection("SMTP")}
              >
                Test Connection
              </Button>
            </div>
            <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="smtpHost"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>SMTP Host</FormLabel>
                    <FormControl>
                      <Input placeholder="smtp.office365.com" {...field} value={field.value ?? ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="smtpPort"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>SMTP Port</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        max={65535}
                        placeholder="587"
                        value={typeof field.value === "number" ? field.value : ""}
                        onChange={(event) => {
                          const value = event.target.value;
                          field.onChange(value === "" ? undefined : Number(value));
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="smtpUsername"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>SMTP Username</FormLabel>
                    <FormControl>
                      <Input placeholder="team@company.com" {...field} value={field.value ?? ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="smtpPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>SMTP Password</FormLabel>
                    <FormControl>
                      <Input placeholder="password" {...field} value={field.value ?? ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="smtpFromName"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>SMTP From Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Artech" {...field} value={field.value ?? ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </section>

          <section className={sectionCardClass}>
            <div className="flex flex-wrap items-center justify-between gap-3 border-b bg-slate-50/70 px-4 py-3">
              <div className="flex items-start gap-2">
                <MessageSquare className="mt-0.5 h-4 w-4 text-orange-600" />
                <div>
                  <h3 className="font-medium text-slate-900">SMS (TextMagic) Settings</h3>
                  <p className="text-xs text-slate-500">Configure SMS messaging service for text follow-ups.</p>
                </div>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="text-orange-700"
                onClick={() => handleTestConnection("TextMagic")}
              >
                Test Connection
              </Button>
            </div>
            <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="textmagicUsername"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>TextMagic Username</FormLabel>
                    <FormControl>
                      <Input placeholder="oauthartechdigitalem" {...field} value={field.value ?? ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="textmagicApiKey"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>TextMagic API Key</FormLabel>
                    <FormControl>
                      <Input placeholder="tm_api_..." {...field} value={field.value ?? ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </section>

          <div className="flex flex-col gap-3 border-t bg-white/70 px-1 pt-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-slate-500">
              Last updated:{" "}
              {data?.data.updatedAt
                ? new Date(data.data.updatedAt).toLocaleString()
                : "Not available"}
            </p>
            <div className="flex items-center gap-2">
              <Button type="button" variant="outline" onClick={() => form.reset(toInitialValues(data?.data))}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSaving} className="bg-indigo-600 hover:bg-indigo-700">
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}
