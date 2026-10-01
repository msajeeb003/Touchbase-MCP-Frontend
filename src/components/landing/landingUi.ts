import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";

export const wrap = "mx-auto w-full max-w-[1160px] px-5 sm:px-6";

/** Standard section rhythm. Sections alternate between steel and steel-2. */
export const band = "border-t border-landing-line py-20 lg:py-28";

export const bandTight = "border-t border-landing-line py-20 lg:py-24";

/** Second surface colour for alternating sections. */
export const bandAlt = "bg-landing-steel-2";

/** Fine engineering grid used behind the hero and the closing CTA. */
export const gridBgStyle: CSSProperties = {
  backgroundImage:
    "linear-gradient(rgba(233,238,243,0.045) 1px, transparent 1px), linear-gradient(90deg, rgba(233,238,243,0.045) 1px, transparent 1px)",
  backgroundSize: "32px 32px",
};

export const eyebrow =
  "m-0 font-landing-mono text-[11px] uppercase tracking-[0.18em] text-landing-sky";

export const sec =
  "m-0 mt-3 font-landing-display text-[clamp(30px,4vw,48px)] font-bold leading-[1.06] tracking-[-0.03em] text-landing-fog";

export const lede = "m-0 mt-4 text-[clamp(17px,1.4vw,19px)] text-landing-fog/60";

export const btn = cn(
  "inline-flex h-12 cursor-pointer items-center justify-center rounded-md border border-transparent px-6",
  "font-landing-sans text-[15px] no-underline transition-colors duration-150",
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-landing-sky",
);

export const btnPrimary =
  "bg-landing-sky font-bold text-landing-steel hover:bg-landing-sky-deep hover:text-landing-steel";

export const btnGhost =
  "border-landing-fog/20 font-semibold text-landing-fog hover:border-landing-fog/50";

export const btnSm = "h-10 px-4 text-[14px]";

export const ctaRow = "mt-8 flex flex-wrap gap-3";

export const brand = cn(
  "flex items-center gap-2.5 font-landing-display text-lg font-bold tracking-[-0.02em] text-landing-fog no-underline",
  "[&_img]:h-9 [&_img]:w-9 [&_img]:flex-none [&_img]:block",
);

/** Small mono chip used for field names, outcome pills and flow tags. */
export const chip =
  "rounded-md border border-landing-line px-2.5 py-1 font-landing-mono text-[12px] text-landing-fog/60";

/** "01 · Input" style badge for the how-it-works steps. */
export const stepBadge =
  "inline-flex h-9 items-center rounded-md border border-landing-sky/30 bg-landing-sky-soft px-3 font-landing-mono text-[12px] text-landing-sky";

export const stepTitle =
  "m-0 mt-4 font-landing-display text-[clamp(24px,2.4vw,30px)] font-bold leading-tight tracking-[-0.02em] text-landing-fog";

export const stepBody = "m-0 mt-3 max-w-[50ch] text-[16px] text-landing-fog/60";

export const revealPendingClasses = ["opacity-0", "translate-y-[14px]"] as const;

export const revealInClasses = [
  "opacity-100",
  "translate-y-0",
  "transition-[opacity,transform]",
  "duration-700",
  "ease-[cubic-bezier(0.2,0.7,0.3,1)]",
] as const;
