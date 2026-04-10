import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Bot, BarChart3, Mail, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  settingsFormSchema,
  type SettingsFormValues,
} from "@/schema/settings/updateSettings.schema";
import {
  useGetSettingsQuery,
  useUpdateSettingsMutation,
} from "@/store/features/settings/settingsApi";
import { dismissToast, showError, showLoading, showSuccess } from "@/utils/toast";
import { AI_PROVIDER, type SettingsItem, type UpdateSettingsRequestBody } from "@/types/settings";

const sectionCardClass = "rounded-xl border bg-white shadow-sm";
const generalSettingsKeys = [
  "aiProvider",
  "aiApiKey",
  "aiModel",
  "fathomApiKey",
  "smtpHost",
  "smtpPort",
  "smtpUsername",
  "smtpPassword",
  "smtpFromName",
] as const;
const textmagicSettingsKeys = ["textmagicUsername", "textmagicApiKey"] as const;
const twilioSettingsKeys = [
  "twilioAccountSid",
  "twilioAuthToken",
  "twilioPhoneNumber",
] as const;

type DirtySettingsFields = Partial<Record<keyof SettingsFormValues, boolean>>;
type SettingsPayloadKey = keyof UpdateSettingsRequestBody & keyof SettingsFormValues;

const normalizeAiProvider = (value?: string | null): NonNullable<SettingsFormValues["aiProvider"]> => {
  if (!value) return "";

  const normalizedValue = value.trim().toLowerCase();

  if (normalizedValue === AI_PROVIDER.OPENAI) return AI_PROVIDER.OPENAI;
  if (normalizedValue === AI_PROVIDER.GEMINI) return AI_PROVIDER.GEMINI;
  if (normalizedValue === AI_PROVIDER.CLAUDE) return AI_PROVIDER.CLAUDE;

  return "";
};

const normalizeSmsProvider = (value?: string | null): NonNullable<SettingsFormValues["smsProvider"]> => {
  if (!value) return "";

  const normalizedValue = value.trim().toLowerCase();

  if (normalizedValue === "textmagic") return "textmagic";
  if (normalizedValue === "twilio") return "twilio";

  return "";
};

const toInitialValues = (data?: SettingsItem): SettingsFormValues => {
  return {
    aiProvider: normalizeAiProvider(data?.aiProvider),
    aiApiKey: data?.aiApiKey ?? "",
    aiModel: data?.aiModel ?? "",
    fathomApiKey: data?.fathomApiKey ?? "",
    smtpHost: data?.smtpHost ?? "",
    smtpPort: data?.smtpPort ?? undefined,
    smtpUsername: data?.smtpUsername ?? "",
    smtpPassword: data?.smtpPassword ?? "",
    smtpFromName: data?.smtpFromName ?? "",
    smsProvider: normalizeSmsProvider(data?.smsProvider),
    textmagicUsername: data?.textmagicUsername ?? "",
    textmagicApiKey: data?.textmagicApiKey ?? "",
    twilioAccountSid: data?.twilioAccountSid ?? "",
    twilioAuthToken: data?.twilioAuthToken ?? "",
    twilioPhoneNumber: data?.twilioPhoneNumber ?? "",
  };
};

const assignPayloadField = (
  payload: UpdateSettingsRequestBody,
  values: SettingsFormValues,
  key: SettingsPayloadKey,
) => {
  const value = values[key];

  if (key === "smtpPort") {
    payload.smtpPort = typeof value === "number" ? value : null;
    return;
  }

  if (key === "aiProvider") {
    const aiProviderValue = normalizeAiProvider(typeof value === "string" ? value : null);
    payload.aiProvider = aiProviderValue === "" ? null : aiProviderValue;
    return;
  }

  if (key === "smsProvider") {
    payload.smsProvider = value === "textmagic" || value === "twilio" ? value : null;
    return;
  }

  payload[key] = typeof value === "string" && value !== "" ? value : null;
};

const sanitizeUpdatePayload = (
  values: SettingsFormValues,
  dirtyFields: DirtySettingsFields,
): UpdateSettingsRequestBody => {
  const payload: UpdateSettingsRequestBody = {};
  const smsProvider = normalizeSmsProvider(values.smsProvider);

  generalSettingsKeys.forEach((key) => {
    if (dirtyFields[key]) {
      assignPayloadField(payload, values, key);
    }
  });

  if (dirtyFields.smsProvider) {
    assignPayloadField(payload, values, "smsProvider");
  }

  if (smsProvider === "textmagic") {
    textmagicSettingsKeys.forEach((key) => {
      if (dirtyFields[key]) {
        assignPayloadField(payload, values, key);
      }
    });
  }

  if (smsProvider === "twilio") {
    twilioSettingsKeys.forEach((key) => {
      if (dirtyFields[key]) {
        assignPayloadField(payload, values, key);
      }
    });
  }

  return payload;
};

export default function SettingsPage() {
  const { data, isLoading, isError } = useGetSettingsQuery();
  const [updateSettings, { isLoading: isSaving }] = useUpdateSettingsMutation();

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsFormSchema),
    defaultValues: toInitialValues(),
  });
  const initialAiProvider = normalizeAiProvider(data?.data?.aiProvider);
  const watchedAiProvider = normalizeAiProvider(form.watch("aiProvider"));
  const aiProvider = form.formState.dirtyFields.aiProvider
    ? watchedAiProvider
    : watchedAiProvider || initialAiProvider;
  const initialSmsProvider = normalizeSmsProvider(data?.data?.smsProvider);
  const watchedSmsProvider = normalizeSmsProvider(form.watch("smsProvider"));
  const smsProvider = form.formState.dirtyFields.smsProvider
    ? watchedSmsProvider
    : watchedSmsProvider || initialSmsProvider;

  useEffect(() => {
    if (data?.data) {
      form.reset(toInitialValues(data.data));
      form.setValue("aiProvider", normalizeAiProvider(data.data.aiProvider), {
        shouldDirty: false,
        shouldTouch: false,
        shouldValidate: false,
      });
      form.setValue("smsProvider", normalizeSmsProvider(data.data.smsProvider), {
        shouldDirty: false,
        shouldTouch: false,
        shouldValidate: false,
      });
    }
  }, [data, form]);

  const handleSave = async (values: SettingsFormValues) => {
    const payload = sanitizeUpdatePayload(
      values,
      form.formState.dirtyFields as DirtySettingsFields,
    );

    if (Object.keys(payload).length === 0) {
      showSuccess("No changes to save");
      return;
    }

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
              {/* <Button type="button" variant="outline" size="sm" onClick={() => handleTestConnection("AI")}>
                Test Connection
              </Button> */}
            </div>
            <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="aiProvider"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>AI Provider</FormLabel>
                    <Select
                      key={aiProvider || "none"}
                      value={aiProvider || "none"}
                      onValueChange={(value) => field.onChange(value === "none" ? "" : value)}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select provider" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        <SelectItem value={AI_PROVIDER.OPENAI}>OpenAI</SelectItem>
                        <SelectItem value={AI_PROVIDER.GEMINI}>Gemini</SelectItem>
                        <SelectItem value={AI_PROVIDER.CLAUDE}>Claude</SelectItem>
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
                    <FormControl>
                      <Input placeholder="e.g. gpt-4o-mini / gemini-2.0-flash" {...field} value={field.value ?? ""} />
                    </FormControl>
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
              {/* <Button
                type="button"
                variant="outline"
                size="sm"
                className="text-emerald-700"
                onClick={() => handleTestConnection("Fathom")}
              >
                Test Connection
              </Button> */}
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
              {/* <Button
                type="button"
                variant="outline"
                size="sm"
                className="text-violet-700"
                onClick={() => handleTestConnection("SMTP")}
              >
                Test Connection
              </Button> */}
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
                      <Input placeholder="name" {...field} value={field.value ?? ""} />
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
                  <h3 className="font-medium text-slate-900">SMS Settings</h3>
                  <p className="text-xs text-slate-500">
                    Choose an SMS provider or disable SMS for text follow-ups.
                  </p>
                </div>
              </div>
              {/* <Button
                type="button"
                variant="outline"
                size="sm"
                className="text-orange-700"
                onClick={() => handleTestConnection("TextMagic")}
              >
                Test Connection
              </Button> */}
            </div>
            <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="smsProvider"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>SMS Provider</FormLabel>
                    <Select
                      key={smsProvider || "none"}
                      value={smsProvider || "none"}
                      onValueChange={(value) => field.onChange(value === "none" ? "" : value)}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select provider" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        <SelectItem value="textmagic">TextMagic</SelectItem>
                        <SelectItem value="twilio">Twilio</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {smsProvider === "" ? (
                <div className="rounded-lg border border-dashed bg-slate-50 px-4 py-3 text-sm text-slate-500 md:col-span-2">
                  SMS is currently disabled. Select a provider above to configure text follow-ups.
                </div>
              ) : null}

              {smsProvider === "textmagic" ? (
                <>
                  <FormField
                    control={form.control}
                    name="textmagicUsername"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>TextMagic Username</FormLabel>
                        <FormControl>
                          <Input placeholder="username" {...field} value={field.value ?? ""} />
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
                </>
              ) : null}

              {smsProvider === "twilio" ? (
                <>
                  <FormField
                    control={form.control}
                    name="twilioAccountSid"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Twilio Account SID</FormLabel>
                        <FormControl>
                          <Input placeholder="AC1234..." {...field} value={field.value ?? ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="twilioAuthToken"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Twilio Auth Token</FormLabel>
                        <FormControl>
                          <Input placeholder="twilio_auth_token" {...field} value={field.value ?? ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="twilioPhoneNumber"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Twilio Phone Number</FormLabel>
                        <FormControl>
                          <Input placeholder="+1234567890" {...field} value={field.value ?? ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              ) : null}
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
