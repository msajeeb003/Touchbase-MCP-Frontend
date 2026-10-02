/** Shared class strings for the sign-in and sign-up forms (landing steel theme). */

export const authLabel =
  "font-landing-mono text-[11px] font-normal uppercase tracking-[0.14em] text-landing-fog/50";

/**
 * Dark input. The autofill rules stop Chrome painting a light background
 * over the field when it fills saved credentials.
 */
export const authInput = [
  "h-12 rounded-md border-landing-line bg-landing-steel font-landing-sans text-[15px] text-landing-fog",
  "placeholder:text-landing-fog/35",
  "focus-visible:ring-2 focus-visible:ring-landing-sky focus-visible:ring-offset-0",
  "[&:-webkit-autofill]:shadow-[inset_0_0_0_1000px_#0d1117]",
  "[&:-webkit-autofill]:[-webkit-text-fill-color:#e9eef3]",
  "[&:-webkit-autofill]:[caret-color:#e9eef3]",
].join(" ");

export const authFieldIcon =
  "pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-landing-fog/40";

export const authToggle =
  "absolute right-3 top-1/2 -translate-y-1/2 rounded-sm text-landing-fog/40 transition-colors hover:text-landing-fog focus-visible:outline focus-visible:outline-2 focus-visible:outline-landing-sky";

export const authHint = "text-[13px] text-landing-fog/45";

export const authError = "text-[13px] font-medium text-landing-voice";

export const authSubmit =
  "mt-2 h-12 w-full rounded-md bg-landing-sky font-landing-sans text-[15px] font-bold text-landing-steel hover:bg-landing-sky-deep focus-visible:ring-landing-sky focus-visible:ring-offset-0 disabled:opacity-60";

export const authDivider = "my-6 h-px w-full bg-landing-line";

export const authFootnote = "m-0 text-center text-[15px] text-landing-fog/60";

export const authLink =
  "font-semibold text-landing-sky no-underline hover:text-landing-fog hover:underline";
