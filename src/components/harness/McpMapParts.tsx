import type { ReactNode } from "react";
import { ArrowDown, ArrowRight, ChevronDown, Server, ShieldCheck, type LucideIcon } from "lucide-react";
import { ClaudeLogo } from "./ClaudeLogo";

/** Pieces that put the Claude + MCP path on the How It Works map. */

const MCP_FLOW: { title: string; text: string; icon: LucideIcon | "claude" }[] = [
  { title: "You ask Claude", text: "Type one instruction in plain words.", icon: "claude" },
  { title: "Touchbase MCP server", text: "Checks your access and runs the tools.", icon: Server },
  { title: "Safety rules", text: "Do-not-contact, send window, no placeholders.", icon: ShieldCheck },
];

/** The entry point at the top of the map. */
export function McpMapNode() {
  return (
    <div className="overflow-hidden rounded-xl border border-[#D97757]/45 bg-landing-steel-2 shadow-sm">
      <div className="flex flex-wrap items-center gap-2 border-b border-[#D97757]/25 bg-[#D97757]/10 px-4 py-2.5">
        <ClaudeLogo className="h-4 w-4" />
        <span className="text-xs font-semibold uppercase tracking-wider text-landing-voice">Claude + MCP server</span>
        <span className="rounded-full bg-[#D97757]/15 px-1.5 py-px font-landing-mono text-[9.5px] font-semibold uppercase tracking-[0.08em] text-landing-voice">
          New
        </span>
        <span className="ml-auto text-[11px] font-medium text-landing-fog/60">Optional shortcut</span>
      </div>
      <div className="p-4">
        <ol className="grid grid-cols-1 items-stretch gap-1 md:grid-cols-[1fr_auto_1fr_auto_1fr]">
          {MCP_FLOW.map(({ title, text, icon: Icon }, i) => (
            <li key={title} className="contents">
              {i > 0 ? (
                <span aria-hidden className="flex items-center justify-center text-landing-fog/40">
                  <ArrowDown className="h-4 w-4 md:hidden" />
                  <ArrowRight className="hidden h-4 w-4 md:block" />
                </span>
              ) : null}
              <div className="rounded-lg border border-landing-line bg-landing-steel p-3">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-landing-fog">
                  {Icon === "claude" ? <ClaudeLogo className="h-3.5 w-3.5" /> : <Icon className="h-3.5 w-3.5 text-landing-voice" aria-hidden />}
                  {title}
                </div>
                <p className="mt-1 text-[11.5px] leading-relaxed text-landing-fog/65">{text}</p>
              </div>
            </li>
          ))}
        </ol>
        <a href="#claude-mcp" className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-landing-sky hover:underline">
          How to connect Claude
          <ArrowDown className="h-3 w-3" aria-hidden />
        </a>
      </div>
    </div>
  );
}

/** From the MCP server down to both the Templates and the Lead cards. */
export function McpSplitConnector() {
  const line = "border-[#D97757]/50";
  return (
    <div aria-hidden>
      <div className="relative hidden h-[72px] md:block">
        <div className={`absolute left-1/2 top-0 h-9 border-l-2 border-dashed ${line}`} />
        <div className={`absolute left-[calc(25%-10px)] right-[calc(25%-10px)] top-9 border-t-2 border-dashed ${line}`} />
        <div className={`absolute left-[calc(25%-10px)] top-9 h-8 border-l-2 border-dashed ${line}`} />
        <div className={`absolute right-[calc(25%-10px)] top-9 h-8 border-l-2 border-dashed ${line}`} />
        <ChevronDown className="absolute bottom-[-3px] left-[calc(25%-17px)] h-4 w-4 text-landing-voice" />
        <ChevronDown className="absolute bottom-[-3px] right-[calc(25%-17px)] h-4 w-4 text-landing-voice" />
        <span className="absolute left-1/2 top-9 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded-full border border-[#D97757]/45 bg-landing-steel-2 px-3 py-1 text-[10px] font-semibold text-landing-voice shadow-sm">
          Uses your templates + leads
        </span>
      </div>
      <div className="flex flex-col items-center gap-1 py-3 md:hidden">
        <ChevronDown className="h-4 w-4 text-landing-voice" />
        <span className="rounded-full border border-[#D97757]/45 bg-landing-steel-2 px-3 py-1 text-[10px] font-semibold text-landing-voice">
          Uses your templates + leads
        </span>
        <ChevronDown className="h-4 w-4 text-landing-voice" />
      </div>
    </div>
  );
}

/** Marks where Claude's work joins a step of the map. */
export function McpTag({ children }: { children: ReactNode }) {
  return (
    <p className="mt-3 flex w-full items-start gap-1.5 rounded-md border border-[#D97757]/30 bg-[#D97757]/[0.08] px-2.5 py-1.5 text-left text-[11px] leading-snug text-landing-fog/80">
      <ClaudeLogo className="mt-px h-3 w-3" />
      <span>{children}</span>
    </p>
  );
}

/** Under the five steps: which ones Claude can do, and which stay with you. */
export function McpStepRail() {
  return (
    <div className="mt-5 grid grid-cols-5 gap-2 text-[11.5px] font-medium">
      <div className="col-span-3 flex items-center justify-center gap-1.5 rounded-lg border border-[#D97757]/35 bg-[#D97757]/[0.08] px-3 py-2 text-landing-fog/85">
        <ClaudeLogo className="h-3.5 w-3.5" />
        Claude can do these for you through the MCP server
      </div>
      <div className="col-span-2 flex items-center justify-center gap-1.5 rounded-lg border border-landing-line bg-landing-steel-2 px-3 py-2 text-landing-fog/85">
        <ShieldCheck className="h-3.5 w-3.5 text-landing-whatsapp" aria-hidden />
        You review and approve
      </div>
    </div>
  );
}

/** Extra tile in "One-time setup". */
export function McpSetupTile() {
  return (
    <a
      href="#claude-mcp"
      className="rounded-lg border border-[#D97757]/40 bg-[#D97757]/[0.07] px-3 py-2.5 no-underline transition-colors hover:bg-[#D97757]/[0.12]"
    >
      <span className="mb-1 flex items-center gap-1.5 text-xs font-medium text-landing-fog">
        <ClaudeLogo className="h-3.5 w-3.5" />
        Claude MCP
      </span>
      <span className="block text-[10px] leading-relaxed text-landing-fog/60">Optional · New</span>
    </a>
  );
}
