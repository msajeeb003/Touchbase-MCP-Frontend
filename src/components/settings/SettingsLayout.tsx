import { forwardRef, useState, type ComponentProps, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

/*
 * Settings building blocks: a sticky section menu, groups, and sections laid
 * out as "title and one line on the left, fields on the right". Each section
 * shows its current state next to its title. Uses the design-system tokens.
 */

export type SettingsNavGroup = { label: string; items: { id: string; title: string }[] };

/** Section menu for desktop: plain links to each section. Phones scroll the page. */
export function SettingsNav({ groups }: { groups: SettingsNavGroup[] }) {
  return (
    <nav aria-label="Settings sections" className="sticky top-20 hidden space-y-5 lg:block">
      {groups.map((g) => (
        <div key={g.label}>
          <p className="tb-label mb-1.5 px-2.5">{g.label}</p>
          <ul className="space-y-0.5">
            {g.items.map((it) => (
              <li key={it.id}>
                <a
                  href={`#${it.id}`}
                  className="block rounded-lg px-2.5 py-1.5 text-[13.5px] text-tb-ink-3 transition-colors hover:bg-tb-ink/[0.04] hover:text-tb-ink"
                >
                  {it.title}
                </a>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  );
}

/** A labelled group of sections inside one glass card. */
export function SettingsGroup({ label, note, children }: { label: string; note?: string; children: ReactNode }) {
  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between gap-3 px-1">
        <h2 className="tb-h2">{label}</h2>
        {note ? <span className="tb-meta">{note}</span> : null}
      </div>
      <div className="tb-card divide-y divide-tb-ink/[0.07]">{children}</div>
    </div>
  );
}

export type SectionStatus = { text: string; tone?: "ok" | "warn" | "off" };

/** One setting area: title, one line and status on the left; fields on the right. */
export function SettingsSection({
  id,
  title,
  desc,
  status,
  help,
  children,
}: {
  id: string;
  title: string;
  desc?: string;
  status?: SectionStatus;
  help?: { to: string; label?: string };
  children: ReactNode;
}) {
  return (
    <section id={id} className="grid scroll-mt-20 grid-cols-1 gap-x-8 gap-y-4 p-5 md:grid-cols-[minmax(0,220px)_minmax(0,1fr)]">
      <div className="min-w-0 space-y-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <h3 className="tb-h3">{title}</h3>
          {status ? <StatusText status={status} /> : null}
        </div>
        {desc ? <p className="tb-meta">{desc}</p> : null}
        {help ? (
          <Link to={help.to} className="inline-block pt-0.5 text-[12.5px] font-medium text-tb-accent hover:underline">
            {help.label ?? "Setup guide"}
          </Link>
        ) : null}
      </div>
      <div className="min-w-0 space-y-4">{children}</div>
    </section>
  );
}

export function StatusText({ status }: { status: SectionStatus }) {
  const tone = status.tone ?? "off";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 text-[12px] font-medium",
        tone === "ok" ? "text-landing-whatsapp" : tone === "warn" ? "text-landing-sms" : "text-tb-ink-3",
      )}
    >
      <span
        aria-hidden
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          tone === "ok" ? "bg-landing-whatsapp" : tone === "warn" ? "bg-landing-sms" : "bg-tb-ink-3/60",
        )}
      />
      {status.text}
    </span>
  );
}

/** Right-aligned row for a section's own save button. */
export function SectionActions({ children, hint }: { children: ReactNode; hint?: string }) {
  return (
    <div className="flex flex-wrap items-center justify-end gap-3 pt-1">
      {hint ? <span className="tb-meta mr-auto">{hint}</span> : null}
      {children}
    </div>
  );
}

/** Text input for keys and passwords: hidden by default, with a show/hide button. */
export const SecretInput = forwardRef<HTMLInputElement, ComponentProps<typeof Input>>(function SecretInput(
  { className, ...props },
  ref,
) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <Input
        ref={ref}
        {...props}
        type={show ? "text" : "password"}
        autoComplete="off"
        spellCheck={false}
        className={cn("pr-10 font-landing-mono text-[13px]", className)}
      />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        aria-label={show ? "Hide" : "Show"}
        title={show ? "Hide" : "Show"}
        className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-tb-ink-3 hover:text-tb-ink"
      >
        {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );
});
