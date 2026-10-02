import type { ReactNode } from "react";
import { Lightbulb, Braces, FileText } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { showError, showSuccess } from "@/utils/toast";

export const PROMPT_TEMPLATE_VARIABLE_ROWS = [
  { variable: "{{lead.name}}", dbField: "Lead.name", exampleValue: "Rahim Ahmed" },
  { variable: "{{lead.email}}", dbField: "Lead.email", exampleValue: "rahim@acme.com" },
  { variable: "{{lead.phone}}", dbField: "Lead.phone", exampleValue: "+8801700000000" },
  { variable: "{{lead.company}}", dbField: "Lead.company", exampleValue: "Acme Corp" },
  { variable: "{{lead.location}}", dbField: "Lead.location", exampleValue: "Dhaka, Bangladesh" },
  {
    variable: "{{lead.followUpStage}}",
    dbField: "Lead.followUpStage",
    exampleValue: "Interested",
  },
  {
    variable: "{{lead.notes}}",
    dbField: "Lead.notes",
    exampleValue: "Met at DhakaTech 2024",
  },
  { variable: "{{sequence.name}}", dbField: "Sequence.name", exampleValue: "Q1 Outreach" },
] as const;

export const PROMPT_TEMPLATE_EXAMPLE = `You are a Virtual Assistant writing follow-up messages on behalf of Artur Abdullin at Artech Digital.

A meeting transcript (when available) may be appended under "--- TRANSCRIPT ---".

Your task is to generate ONE message for the CURRENT STEP ONLY. Cadence, channel selection, tone, and intensity are provided separately by the application — do not invent a sequence schedule.

---

## ROLE & CONTEXT

- You represent {{sequence.name}} and write on behalf of Artur Abdullin at Artech Digital.
- Scenario: The lead, {{lead.name}}, booked a discovery call but did not show up. This sequence is designed to re-engage them, acknowledge the missed call without pressure, and invite them to reschedule.
- Service: Artech Digital offers AI-powered recruitment automation that reduces hiring time by 60%. The goal is to help companies hire faster and smarter with less manual effort.
- Stay consultative, human, and specific to the lead's situation at every step.

---

## GOALS

- Re-engage {{lead.name}} after a missed scheduled call with Artur Abdullin.
- Acknowledge the no-show gracefully — no guilt, no friction.
- Remind the lead of the value Artech Digital's AI recruitment automation can deliver (60% reduction in hiring time).
- Invite them to book a new 15-minute discovery call using the provided CTA link.
- Keep the door open and make it easy for the lead to respond or reschedule at their convenience.

---

## PERSONALIZATION & LINKS

- Address the lead by first name using {{lead.name}}.
- Reference available context where relevant: {{lead.company}}, {{lead.location}}, {{lead.followUpStage}}, {{lead.notes}}. Omit any fields that are empty or not applicable.
- Booking CTA: https://calendly.com/yourname/30min-call
- Include this CTA link once in EMAIL, SMS, and WHATSAPP steps, placed where a soft, natural ask fits.
- For CALL steps: reference the next step verbally (e.g., "I'd love to find a new time that works for you") — do not read the URL aloud.
- Do NOT invent or include any URL other than https://calendly.com/yourname/30min-call.
- Sign all messages as: Artur Abdullin.

---

## OUTPUT FORMAT (STRICT — required for the system)

### If current step is EMAIL

1. **Line 1 MUST be exactly:** \`SUBJECT: <short, human subject line>\`
2. **Line 2 MUST be blank.**
3. **From line 3:** email body with greeting, body paragraphs, and sign-off.
4. In the **first or second paragraph**, include a **brief recap** of the originally scheduled call or relevant context when a transcript or notes are available.
5. Acknowledge the missed call briefly and without blame — keep the tone warm and understanding.
6. Include the CTA link once in the body where the rescheduling ask feels natural.
7. Early steps: warmer, low-pressure reconnection tone. Later steps: gentle, soft urgency while remaining consultative and respectful.

### If current step is SMS

- **No subject line.**
- **2–4 short sentences max.** One clear CTA with the provided link.
- Acknowledge the missed call in one brief, friendly sentence.
- Keep it natural — avoid sounding automated or transactional.

### If current step is WHATSAPP

- **No subject line.**
- **3–6 short sentences.** Conversational and warm tone; light formatting (*bold*, _italic_) is allowed where it aids readability.
- Acknowledge the missed call lightly, lead with value, and include the CTA link once.

### If current step is CALL

- **No subject line.**
- **5–8 concise bullet points** as talking points for a live follow-up phone call.
- Include a warm opener referencing the missed call, key questions to uncover the lead's hiring challenges, the core value proposition (AI recruitment automation, 60% faster hiring), and a clear verbal close to reschedule.
- Do not use email subject/body format.
- Do not read a URL aloud — reference the next step conversationally.

---

## STYLE REFERENCES (do not copy verbatim — adapt to the lead's context and current step position)

EMAIL (tone only):
SUBJECT: Sorry we missed each other, {{lead.name}}

Hi {{lead.name}},

I noticed we had a call scheduled recently — no worries at all, I know things come up. I just wanted to reach back out because I think there's a real opportunity to save your team significant time on hiring.

At Artech Digital, we help companies like {{lead.company}} cut their hiring time by up to 60% using AI-powered recruitment automation. I'd love to show you how it works in a quick 15-minute call.

Whenever you're ready, you can grab a time here: https://calendly.com/yourname/30min-call

No pressure — happy to work around your schedule.

Best,
Artur Abdullin
Artech Digital

SMS (tone only):
Hey {{lead.name}} — we missed each other on our call, no worries! I'd love to reconnect and show you how Artech Digital helps teams hire 60% faster with AI. Book a new time here: https://calendly.com/yourname/30min-call

WHATSAPP (tone only):
Hi {{lead.name}}! 👋 We missed each other on our call — totally understand, life gets busy. I still think what we're doing at Artech Digital could make a real difference for *{{lead.company}}*'s hiring process. We help teams cut hiring time by _60%_ using AI automation. Would love to find a new time: https://calendly.com/yourname/30min-call

CALL (talking points only):
- Open warmly: reference {{lead.name}} by name, mention you had a call scheduled and wanted to personally follow up
- Acknowledge the missed call with zero pressure — "I know things get busy, just wanted to make sure you didn't miss out"
- Ask a discovery question: "Are you currently finding that your hiring process is taking longer than you'd like?"
- Introduce the value proposition: Artech Digital's AI recruitment automation helps companies reduce hiring time by 60%
- Tailor to their context using {{lead.company}}, {{lead.notes}}, or {{lead.location}} if relevant
- Handle timing objection: "Totally understand — even a 15-minute call could save your team weeks down the line"
- Close: suggest rescheduling and offer to send a new calendar link right after the call

---

## WRITING GUIDELINES

- Write for the current step only — do not draft or reference other steps in the sequence.
- Keep language natural, direct, and human. Avoid corporate buzzwords and filler phrases.
- Never make {{lead.name}} feel guilty or pressured about the missed call — frame it as an easy opportunity to reconnect.
- Use transcript details or notes from {{lead.notes}} when present; do not invent facts, pain points, or prior conversations.
- The missed-call context should be acknowledged briefly — it is the entry point, not the focus. The focus is the value Artech Digital can deliver.
- Adapt urgency and warmth to the step position supplied by the application at generation time.
- Always close with a clear, low-friction next step tied to the 15-minute discovery call.`;

function IdeaSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-2">
      <h3 className="text-sm font-semibold tracking-wide text-primary">
        ## {title}
      </h3>
      <div className="text-sm leading-relaxed text-muted-foreground">{children}</div>
    </section>
  );
}

export default function PromptTemplateReference() {
  const handleCopyVariable = async (variable: string) => {
    try {
      await navigator.clipboard.writeText(variable);
      showSuccess(`Copied ${variable}`);
    } catch {
      showError("Failed to copy variable");
    }
  };

  return (
    <div className="rounded-xl border border-border bg-card p-1 shadow-sm">
      <Tabs defaultValue="idea" className="w-full">
        <TabsList className="grid h-auto w-full grid-cols-3 gap-1 rounded-lg bg-muted p-1">
          <TabsTrigger
            value="idea"
            className="gap-1.5 data-[state=active]:bg-background data-[state=active]:shadow-sm"
          >
            <Lightbulb className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">Prompt idea</span>
          </TabsTrigger>
          <TabsTrigger
            value="variables"
            className="gap-1.5 data-[state=active]:bg-background data-[state=active]:shadow-sm"
          >
            <Braces className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">Variables</span>
          </TabsTrigger>
          <TabsTrigger
            value="example"
            className="gap-1.5 data-[state=active]:bg-background data-[state=active]:shadow-sm"
          >
            <FileText className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">Example</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="idea" className="mt-0 rounded-b-lg px-4 pb-4 pt-3">
          <div className="space-y-5">
            <IdeaSection title="ROLE & CONTEXT">
              <p>
                You write follow-up messages on behalf of Artur Abdullin at Artech Digital for{" "}
                {"{{lead.name}}"}.
              </p>
              <p>
                Scenario: the lead booked a discovery call but did not show up. Re-engage without
                pressure and invite them to reschedule.
              </p>
              <p>
                Service: AI-powered recruitment automation that reduces hiring time by 60%. Stay
                consultative, human, and specific to the lead&apos;s situation.
              </p>
              <p>
                Cadence, channels, tone, and intensity come from the app — do not invent a sequence
                schedule.
              </p>
            </IdeaSection>

            <IdeaSection title="GOALS">
              <ul className="list-inside list-disc space-y-1">
                <li>Re-engage {"{{lead.name}}"} after a missed scheduled call</li>
                <li>Acknowledge the no-show gracefully — no guilt, no friction</li>
                <li>Remind them of AI recruitment automation value (60% faster hiring)</li>
                <li>Invite them to book a new 15-minute discovery call via the CTA</li>
                <li>Keep the door open and make rescheduling easy</li>
              </ul>
            </IdeaSection>

            <IdeaSection title="PERSONALIZATION & LINKS">
              <ul className="list-inside list-disc space-y-1">
                <li>Address by first name using {"{{lead.name}}"}</li>
                <li>
                  Use {"{{lead.company}}"}, {"{{lead.location}}"}, {"{{lead.followUpStage}}"},{" "}
                  {"{{lead.notes}}"} when relevant; omit empty fields
                </li>
                <li>Booking CTA: https://calendly.com/yourname/30min-call</li>
                <li>Include CTA once in EMAIL, SMS, and WHATSAPP</li>
                <li>CALL: reference next step verbally — do not read the URL aloud</li>
                <li>Do not invent any other URL</li>
                <li>Sign as: Artur Abdullin</li>
              </ul>
            </IdeaSection>

            <IdeaSection title="EMAIL GUIDELINES">
              <ul className="list-inside list-disc space-y-1">
                <li>Line 1 must be exactly: SUBJECT: &lt;short, human subject line&gt;</li>
                <li>Line 2 blank; body from line 3 with greeting, paragraphs, sign-off</li>
                <li>Brief recap of the missed call / context early in the body</li>
                <li>Acknowledge without blame; include CTA once where the ask feels natural</li>
                <li>Early steps warmer; later steps soft urgency, still consultative</li>
              </ul>
            </IdeaSection>

            <IdeaSection title="SMS GUIDELINES">
              <ul className="list-inside list-disc space-y-1">
                <li>No subject line</li>
                <li>2–4 short sentences max; one clear CTA with the provided link</li>
                <li>Acknowledge the missed call in one brief, friendly sentence</li>
                <li>Keep it natural — avoid sounding automated</li>
              </ul>
            </IdeaSection>

            <IdeaSection title="WHATSAPP GUIDELINES">
              <ul className="list-inside list-disc space-y-1">
                <li>No subject line</li>
                <li>3–6 short sentences; conversational and warm</li>
                <li>Light formatting (*bold*, _italic_) allowed where helpful</li>
                <li>Acknowledge lightly, lead with value, include CTA once</li>
              </ul>
            </IdeaSection>

            <IdeaSection title="CALL GUIDELINES">
              <ul className="list-inside list-disc space-y-1">
                <li>No subject line</li>
                <li>5–8 concise bullet points as talking points</li>
                <li>Warm opener, discovery question, value prop, verbal close to reschedule</li>
                <li>Do not use email format; do not read a URL aloud</li>
              </ul>
            </IdeaSection>

            <IdeaSection title="WRITING GUIDELINES">
              <ul className="list-inside list-disc space-y-1">
                <li>Write for the current step only — do not draft other steps</li>
                <li>Natural, direct, human language; avoid buzzwords and filler</li>
                <li>Never make the lead feel guilty about the missed call</li>
                <li>Use transcript / {"{{lead.notes}}"} when present; do not invent facts</li>
                <li>Missed-call context is the entry point — focus on value delivered</li>
                <li>Adapt urgency/warmth to the step position from the app</li>
                <li>Always close with a clear, low-friction next step</li>
              </ul>
            </IdeaSection>
          </div>
        </TabsContent>

        <TabsContent value="variables" className="mt-0 rounded-b-lg px-4 pb-4 pt-3">
          <p className="mb-1 text-sm font-medium text-foreground">Template variables</p>
          <p className="mb-3 text-xs text-muted-foreground">
            Click a variable to copy it. Values match your database fields.
          </p>
          <div className="overflow-x-auto rounded-lg border border-border bg-card">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="w-[1%] whitespace-nowrap">Variable</TableHead>
                  <TableHead>DB Field</TableHead>
                  <TableHead>Example Value</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {PROMPT_TEMPLATE_VARIABLE_ROWS.map((row) => (
                  <TableRow key={row.variable} className="border-border">
                    <TableCell className="align-middle">
                      <button
                        type="button"
                        onClick={() => void handleCopyVariable(row.variable)}
                        title={`Copy ${row.variable}`}
                        className="rounded-md border border-input bg-muted px-2.5 py-1 font-mono text-xs text-foreground transition-colors hover:bg-muted/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      >
                        {row.variable}
                      </button>
                    </TableCell>
                    <TableCell className="text-sm text-foreground">{row.dbField}</TableCell>
                    <TableCell className="align-middle">
                      <span className="inline-block rounded-md border border-input bg-muted px-2.5 py-1 text-xs text-muted-foreground">
                        {row.exampleValue}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="example" className="mt-0 rounded-b-lg px-4 pb-4 pt-3">
          <p className="mb-2 text-sm font-medium text-foreground">Sample prompt (for inspiration)</p>
          <pre className="max-h-[min(420px,55vh)] overflow-y-auto whitespace-pre-wrap rounded-lg border border-border bg-background p-3 text-xs leading-relaxed text-muted-foreground shadow-inner">
            {PROMPT_TEMPLATE_EXAMPLE}
          </pre>
        </TabsContent>
      </Tabs>
    </div>
  );
}
