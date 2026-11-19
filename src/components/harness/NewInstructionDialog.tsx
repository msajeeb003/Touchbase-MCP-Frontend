import { useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { Check, Copy, Sparkles, Terminal } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { primaryBtn } from "./ui";

const EXAMPLES = [
  "Show me my leads in the Demo done stage who have not replied in the last 7 days.",
  "Follow up with every lead in the Demo done stage who has not replied in 7 days: one email now and a short SMS two days later. Use what they said on the call.",
  "Here are my notes from today's call with a lead: … Save the notes and write them a follow-up email.",
  "This lead asked us to stop contacting them. Make sure nothing goes out to them.",
  "What did you prepare for me today, and what is still waiting for my approval?",
];

/**
 * Instructions are typed in Claude, not in this app. This dialog explains that
 * and offers example instructions to copy.
 */
export default function NewInstructionDialog({ trigger }: { trigger?: ReactNode }) {
  const [copied, setCopied] = useState<number | null>(null);

  const copy = async (text: string, i: number) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const t = document.createElement("textarea");
      t.value = text;
      document.body.appendChild(t);
      t.select();
      try {
        document.execCommand("copy");
      } catch {
        /* nothing more to try */
      }
      t.remove();
    }
    setCopied(i);
    window.setTimeout(() => setCopied(null), 1500);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button className={primaryBtn}>
            <Sparkles className="h-4 w-4" />
            New instruction
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-xl font-landing-sans">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-landing-display text-landing-fog">
            <Sparkles className="h-5 w-5 text-landing-violet" />
            Give Claude an instruction
          </DialogTitle>
        </DialogHeader>
        <p className="text-sm text-landing-fog/65">
          Type your instruction in Claude (the desktop app or Claude Code) once it is connected to Touchbase.
          Claude's work appears under AI Tasks the moment it starts, and its drafts wait in the Review Queue.
          Nothing is sent before you approve.
        </p>
        <div className="space-y-2">
          <p className="font-landing-mono text-[10.5px] uppercase tracking-[0.12em] text-landing-fog/45">Examples</p>
          {EXAMPLES.map((ex, i) => (
            <div key={ex} className="flex items-start gap-2 rounded-xl border border-landing-line bg-landing-steel px-3 py-2.5">
              <p className="min-w-0 flex-1 text-[13px] text-landing-fog/85">“{ex}”</p>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 shrink-0 gap-1 px-2 text-landing-sky hover:bg-landing-fog/5 hover:text-landing-sky"
                onClick={() => copy(ex, i)}
              >
                {copied === i ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                {copied === i ? "Copied" : "Copy"}
              </Button>
            </div>
          ))}
        </div>
        <Link
          to="/dashboard/settings#claude-access"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-landing-sky hover:underline"
        >
          <Terminal className="h-4 w-4" />
          Not connected yet? Create an access token in Settings
        </Link>
      </DialogContent>
    </Dialog>
  );
}
