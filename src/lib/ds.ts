/**
 * Touchbase design system: class recipes for React components.
 *
 * The tokens and the plain CSS classes (tb-card, tb-btn-primary, tb-label…)
 * live in src/globals.css. Use the CSS classes on plain elements. Use these
 * recipes on shadcn components (Card, Button): their own background, border,
 * colour and shadow utilities would otherwise win over a CSS class. Written
 * as utilities, tailwind-merge replaces them cleanly.
 *
 * Reference: DESIGN-SYSTEM.md at the repo root.
 */

/** Frosted card surface, as utilities. Same look as the `tb-card` CSS class. */
export const glassCard =
  "rounded-2xl border border-[rgb(var(--tb-stroke)/var(--tb-stroke-a))] bg-[rgb(var(--tb-surface)/var(--tb-surface-a))] text-tb-ink-2 shadow-[var(--tb-shadow)] backdrop-blur-[18px] backdrop-saturate-150";

const btnShape = "h-9 gap-2 rounded-[10px] px-3.5 text-sm font-semibold";

/** The one main action of an area: accent gradient. */
export const btnPrimary = `tb-btn-primary ${btnShape} border-0 bg-transparent text-[rgb(var(--tb-on-accent))] hover:bg-transparent hover:text-[rgb(var(--tb-on-accent))]`;

/** Every other action: quiet glass. */
export const btnQuiet = `${btnShape} border border-tb-ink/10 bg-[rgb(var(--tb-surface)/var(--tb-surface-a))] text-tb-ink hover:bg-tb-ink/[0.06] hover:text-tb-ink`;

/** Destructive or leaving actions. */
export const btnDanger = `${btnShape} border border-landing-voice/35 bg-transparent text-landing-voice hover:bg-landing-voice/[0.08] hover:text-landing-voice`;

/** Smaller size, combine with any of the above. */
export const btnSm = "h-8 rounded-lg px-2.5 text-[13px]";

/** Square icon-only button (Refresh, Copy). Always give it an aria-label. */
export const iconBtn =
  "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] text-tb-ink-3 transition-colors hover:bg-tb-ink/[0.06] hover:text-tb-ink disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[rgb(var(--tb-accent))]";
