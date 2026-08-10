import { cn } from "@/lib/utils";

export const wrap = "mx-auto w-full max-w-[1160px] px-[clamp(20px,5vw,44px)]";

export const band = "py-[clamp(64px,8vw,116px)]";

export const bandTight = "py-[clamp(48px,6vw,78px)]";

export const bandDark =
  "bg-landing-ink text-white/[0.74] [&_h2]:text-white [&_h3]:text-white [&_h4]:text-white";

export const eyebrow = cn(
  "mb-[18px] flex items-center gap-2.5 font-landing-mono text-[11.5px] uppercase tracking-[0.2em] text-landing-indigo",
  "before:h-[1.5px] before:w-[22px] before:flex-none before:bg-current before:content-['']",
);

export const eyebrowOnDark = "text-landing-indigo-lift";

export const sec =
  "m-0 max-w-[20ch] font-landing-display text-[clamp(29px,4.3vw,48px)] font-bold leading-[1.06] tracking-[-0.022em] text-landing-ink";

export const secOnDark = "text-[#f4f4f8]";

export const lede =
  "mt-5 max-w-[58ch] text-[clamp(17px,1.5vw,19.5px)] text-landing-muted";

export const ledeOnDark = "text-white/[0.62]";

export const btn = cn(
  "inline-flex cursor-pointer items-center justify-center gap-[9px] rounded-[10px] border-[1.5px] border-transparent",
  "font-landing-sans text-[15.5px] font-semibold tracking-[-0.01em] no-underline",
  "px-6 py-3.5 transition-[transform,background,border-color] duration-[160ms]",
  "hover:-translate-y-[1.5px]",
  "focus-visible:outline focus-visible:outline-[2.5px] focus-visible:outline-offset-[3px] focus-visible:outline-landing-indigo",
);

export const btnPrimary = cn(
  "bg-landing-indigo text-white shadow-[0_8px_24px_-10px_rgba(91,77,245,0.8)]",
  "hover:bg-landing-indigo-lift hover:text-white",
);

export const btnGhost = cn(
  "border-landing-line-dark text-white",
  "hover:border-white/[0.42]",
);

export const btnSm = "px-[17px] py-2.5 text-sm";

export const ctaRow = "mt-8 flex flex-wrap gap-3";

export const brand = cn(
  "flex items-center gap-2.5 font-landing-display text-lg font-bold tracking-[-0.02em] text-white no-underline",
  "[&_img]:h-6 [&_img]:w-6 [&_img]:flex-none [&_img]:block",
);

export const revealPendingClasses = ["opacity-0", "translate-y-[14px]"] as const;

export const revealInClasses = [
  "opacity-100",
  "translate-y-0",
  "transition-[opacity,transform]",
  "duration-700",
  "ease-[cubic-bezier(0.2,0.7,0.3,1)]",
] as const;
