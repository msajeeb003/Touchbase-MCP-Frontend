import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
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
import { Switch } from "@/components/ui/switch";
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
import { useSteelTheme } from "@/components/dashboard/dashboardTheme";
import { ClaudeAccessCard, ClaudePermissionsCard, SafetyRulesCard, SendWindowCard } from "@/components/harness/SettingsCards";
import {
  SecretInput,
  SettingsGroup,
  SettingsNav,
  SettingsSection,
  type SectionStatus,
  type SettingsNavGroup,
} from "@/components/settings/SettingsLayout";
import { btnPrimary, btnQuiet } from "@/lib/ds";

const generalSettingsKeys = [
  "aiProvider",
  "aiApiKey",
  "aiModel",
  "fathomApiKey",
  "autoDraftEnabled",
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
  "twilioWhatsappNumber",
] as const;
const retellSettingsKeys = ["retellApiKey", "retellAgentId", "retellCallerNumber"] as const;

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
    autoDraftEnabled: data?.autoDraftEnabled ?? false,
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
    twilioWhatsappNumber: data?.twilioWhatsappNumber ?? "",
    retellApiKey: data?.retellApiKey ?? "",
    retellAgentId: data?.retellAgentId ?? "",
    retellCallerNumber: data?.retellCallerNumber ?? "",
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

  if (key === "autoDraftEnabled") {
    payload.autoDraftEnabled = Boolean(value);
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

  retellSettingsKeys.forEach((key) => {
    if (dirtyFields[key]) {
      assignPayloadField(payload, values, key);
    }
  });

  return payload;
};

export default function SettingsPage() {
  useSteelTheme();
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


  // Links such as /dashboard/settings#claude-access scroll to their section.
  const location = useLocation();
  useEffect(() => {
    const id = location.hash.slice(1);
    if (!id || isLoading) return;
    const t = window.setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" }), 250);
    return () => window.clearTimeout(t);
  }, [location.hash, isLoading]);

  if (isLoading) {
    return (
      <div className="tb-card flex items-center gap-2 p-6 font-landing-sans text-sm text-tb-ink-3">
        <Loader2 className="h-4 w-4 animate-spin text-tb-accent" />
        Loading settings…
      </div>
    );
  }

  if (isError) {
    return (
      <div className="tb-card p-6 font-landing-sans text-sm text-landing-voice">
        Could not load your settings. Try again in a moment.
      </div>
    );
  }

  // Current state of each section, from what is saved.
  const saved = data?.data;
  const PROVIDER_NAME: Record<string, string> = { openai: "OpenAI", gemini: "Gemini", claude: "Claude" };
  const on = (text: string): SectionStatus => ({ text, tone: "ok" });
  const off = (text = "Not set"): SectionStatus => ({ text });
  const status = {
    ai: initialAiProvider ? on(`${PROVIDER_NAME[initialAiProvider] ?? initialAiProvider}${saved?.aiModel ? ` · ${saved.aiModel}` : ""}`) : off(),
    email: saved?.smtpHost && saved?.smtpUsername ? on("Connected") : off(),
    sms: initialSmsProvider ? on(initialSmsProvider === "twilio" ? "Twilio" : "TextMagic") : off("Off"),
    calls: saved?.retellApiKey ? on("Connected") : off(),
    transcripts: saved?.fathomApiKey ? on(saved?.autoDraftEnabled ? "Connected · Auto draft on" : "Connected") : off(),
  };

  const nav: SettingsNavGroup[] = [
    {
      label: "Messaging & AI",
      items: [
        { id: "ai-model", title: "AI model" },
        { id: "email", title: "Email" },
        { id: "sms", title: "SMS" },
        { id: "ai-calls", title: "AI calls" },
        { id: "transcripts", title: "Call transcripts" },
      ],
    },
    {
      label: "Claude",
      items: [
        { id: "claude-access", title: "Connect Claude" },
        { id: "claude-permissions", title: "Permissions" },
        { id: "send-window", title: "Send window" },
        { id: "claude-safety", title: "Safety rules" },
      ],
    },
  ];

  const isDirty = form.formState.isDirty;

  return (
    <div className="mx-auto max-w-[1180px] space-y-6 font-landing-sans">
      <header>
        <h1 className="tb-title">Settings</h1>
        <p className="tb-meta mt-1">
          Last saved {saved?.updatedAt ? new Date(saved.updatedAt).toLocaleString() : "never"}
        </p>
      </header>

      <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[180px_minmax(0,1fr)]">
        <SettingsNav groups={nav} />

        <div className="min-w-0 space-y-8">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSave)}>
              <SettingsGroup label="Messaging & AI">
                <SettingsSection id="ai-model" title="AI model" desc="Writes your follow-up drafts." status={status.ai} help={{ to: "/docs/ai-credentials" }}>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="aiProvider"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Provider</FormLabel>
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
                          <FormLabel>Model</FormLabel>
                          <FormControl>
                            <Input placeholder="gpt-4o-mini" {...field} value={field.value ?? ""} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="aiApiKey"
                      render={({ field }) => (
                        <FormItem className="sm:col-span-2">
                          <FormLabel>API key</FormLabel>
                          <FormControl>
                            <SecretInput placeholder="sk-proj-…" {...field} value={field.value ?? ""} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </SettingsSection>

                <SettingsSection id="email" title="Email" desc="Sends your email follow-ups (SMTP)." status={status.email} help={{ to: "/docs/email-smtp" }}>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-[minmax(0,1fr)_110px]">
                    <FormField
                      control={form.control}
                      name="smtpHost"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Host</FormLabel>
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
                          <FormLabel>Port</FormLabel>
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
                  </div>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="smtpUsername"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Username</FormLabel>
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
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <SecretInput placeholder="••••••••" {...field} value={field.value ?? ""} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="smtpFromName"
                      render={({ field }) => (
                        <FormItem className="sm:col-span-2">
                          <FormLabel>From name</FormLabel>
                          <FormControl>
                            <Input placeholder="Sam from Brightline" {...field} value={field.value ?? ""} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </SettingsSection>

                <SettingsSection id="sms" title="SMS" desc="Sends your text follow-ups." status={status.sms} help={{ to: "/docs/sms-settings" }}>
                  <FormField
                    control={form.control}
                    name="smsProvider"
                    render={({ field }) => (
                      <FormItem className="sm:max-w-xs">
                        <FormLabel>Provider</FormLabel>
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
                            <SelectItem value="none">Off</SelectItem>
                            <SelectItem value="textmagic">TextMagic</SelectItem>
                            <SelectItem value="twilio">Twilio</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {smsProvider === "textmagic" ? (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="textmagicUsername"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Username</FormLabel>
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
                            <FormLabel>API key</FormLabel>
                            <FormControl>
                              <SecretInput placeholder="tm_api_…" {...field} value={field.value ?? ""} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  ) : null}

                  {smsProvider === "twilio" ? (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <p className="tb-meta sm:col-span-2">One Twilio account sends both SMS and WhatsApp.</p>
                      <FormField
                        control={form.control}
                        name="twilioAccountSid"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Account SID</FormLabel>
                            <FormControl>
                              <Input placeholder="AC…" className="font-landing-mono text-[13px]" {...field} value={field.value ?? ""} />
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
                            <FormLabel>Auth token</FormLabel>
                            <FormControl>
                              <SecretInput placeholder="••••••••" {...field} value={field.value ?? ""} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="twilioPhoneNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>SMS number</FormLabel>
                            <FormControl>
                              <Input placeholder="+1234567890" {...field} value={field.value ?? ""} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="twilioWhatsappNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>WhatsApp number</FormLabel>
                            <FormControl>
                              <Input placeholder="+12345678910" {...field} value={field.value ?? ""} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  ) : null}
                </SettingsSection>

                <SettingsSection id="ai-calls" title="AI calls" desc="Outbound AI voice calls with Retell." status={status.calls} help={{ to: "/docs/retell-ai-calling" }}>
                  <FormField
                    control={form.control}
                    name="retellApiKey"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>API key</FormLabel>
                        <FormControl>
                          <SecretInput placeholder="key_…" {...field} value={field.value ?? ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="retellAgentId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Agent ID</FormLabel>
                          <FormControl>
                            <Input placeholder="agent_…" className="font-landing-mono text-[13px]" {...field} value={field.value ?? ""} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="retellCallerNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Caller number</FormLabel>
                          <FormControl>
                            <Input placeholder="+1234567890" {...field} value={field.value ?? ""} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </SettingsSection>

                <SettingsSection id="transcripts" title="Call transcripts" desc="Imports your calls from Fathom." status={status.transcripts} help={{ to: "/docs/fathom-transcripts" }}>
                  <FormField
                    control={form.control}
                    name="fathomApiKey"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fathom API key</FormLabel>
                        <FormControl>
                          <SecretInput placeholder="fathom_api_…" {...field} value={field.value ?? ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="autoDraftEnabled"
                    render={({ field }) => (
                      <FormItem>
                        <label className="flex cursor-pointer items-start justify-between gap-4">
                          <span>
                            <span className="block text-sm font-medium text-tb-ink">Auto draft</span>
                            <span className="block text-[12.5px] text-tb-ink-3">Draft a follow-up from each new call.</span>
                          </span>
                          <FormControl>
                            <Switch
                              className="mt-0.5 shrink-0"
                              checked={Boolean(field.value)}
                              onCheckedChange={field.onChange}
                              aria-label="Auto draft"
                            />
                          </FormControl>
                        </label>
                      </FormItem>
                    )}
                  />
                </SettingsSection>
              </SettingsGroup>

              {/* One save bar for the group above, shown only when something changed. */}
              <div
                className={
                  isDirty
                    ? "tb-glass sticky bottom-4 z-10 mt-3 flex flex-wrap items-center gap-3 rounded-2xl px-4 py-3"
                    : "hidden"
                }
              >
                <p className="mr-auto text-sm font-medium text-tb-ink">You have unsaved changes</p>
                <Button type="button" variant="outline" className={btnQuiet} onClick={() => form.reset(toInitialValues(data?.data))}>
                  Discard
                </Button>
                <Button type="submit" disabled={isSaving} className={btnPrimary}>
                  {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  Save changes
                </Button>
              </div>
            </form>
          </Form>

          {/* These save on their own, separately from the form above. */}
          <SettingsGroup label="Claude" note="Only you can change these">
            <ClaudeAccessCard />
            <ClaudePermissionsCard />
            <SendWindowCard />
            <SafetyRulesCard />
          </SettingsGroup>
        </div>
      </div>
    </div>
  );
}
