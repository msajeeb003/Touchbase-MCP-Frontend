import { useEffect, type CSSProperties } from "react";

/**
 * Steel theme for the dashboard overview.
 *
 * Scoped overrides of the shadcn CSS variables, so Card, Table, Badge and the
 * chart tooltip/legend/grid pick up the dark surface without being edited.
 * Values are HSL triplets, matching how the app's tokens are declared.
 */
export const steelSurfaceVars = {
  "--background": "216 28% 7%",
  "--foreground": "210 29% 93%",
  "--card": "212 28% 10%",
  "--card-foreground": "210 29% 93%",
  "--popover": "212 28% 10%",
  "--popover-foreground": "210 29% 93%",
  "--muted": "213 28% 14%",
  "--muted-foreground": "212 16% 65%",
  "--accent": "213 28% 14%",
  "--accent-foreground": "210 29% 93%",
  "--border": "213 22% 17%",
  "--input": "213 22% 17%",
  "--ring": "213 93% 64%",
  "--primary": "213 93% 64%",
  "--primary-foreground": "216 28% 7%",
  "--secondary": "213 28% 14%",
  "--secondary-foreground": "210 29% 93%",
} as CSSProperties;

/**
 * Applies the steel variables to <body> while the calling page is mounted.
 *
 * Use this on pages that open dialogs, selects or tooltips: those render in
 * portals outside the page's DOM, so variables scoped to a wrapper element
 * never reach them. Previous values are restored on unmount, so pages that
 * have not been restyled keep the light theme.
 */
export function useSteelTheme() {
  useEffect(() => {
    const body = document.body;
    const entries = Object.entries(steelSurfaceVars) as [string, string][];
    const previous = entries.map(
      ([name]) => [name, body.style.getPropertyValue(name)] as const,
    );

    entries.forEach(([name, value]) => body.style.setProperty(name, value));

    return () => {
      previous.forEach(([name, value]) => {
        if (value) body.style.setProperty(name, value);
        else body.style.removeProperty(name);
      });
    };
  }, []);
}

export const dashCard =
  "border-landing-line bg-landing-steel-2 text-landing-fog shadow-none";

export const dashCardTitle =
  "inline-flex items-center gap-2 font-landing-display text-lg font-bold tracking-[-0.01em] text-landing-fog";

export const dashCardIcon = "h-5 w-5 text-landing-sky";

export const dashCardDesc = "text-sm text-landing-fog/55";

export const dashEmpty =
  "rounded-xl border border-dashed border-landing-line bg-landing-steel px-6 py-10 text-center text-sm text-landing-fog/50";

/**
 * Light counterpart of steelSurfaceVars, used by the dashboard overview when
 * the user picks the light theme.
 */
export const lightSurfaceVars = {
  "--background": "210 33% 97%",
  "--foreground": "221 39% 11%",
  "--card": "0 0% 100%",
  "--card-foreground": "221 39% 11%",
  "--popover": "0 0% 100%",
  "--popover-foreground": "221 39% 11%",
  "--muted": "210 29% 95%",
  "--muted-foreground": "215 16% 40%",
  "--accent": "210 29% 95%",
  "--accent-foreground": "221 39% 11%",
  "--border": "214 20% 88%",
  "--input": "214 20% 88%",
  "--ring": "213 74% 53%",
  "--primary": "213 74% 53%",
  "--primary-foreground": "0 0% 100%",
  "--secondary": "210 29% 95%",
  "--secondary-foreground": "221 39% 11%",
} as CSSProperties;

/**
 * Chart colours as CSS variable references, so they follow the active theme
 * (the triplets are declared in globals.css). Recharts and the chart tooltip
 * accept these anywhere a colour string is expected.
 */
const token = (name: string) => `rgb(var(--landing-${name}))`;

/** Channel colours, matching the landing-email / sms / whatsapp / voice tokens. */
export const CHANNEL_COLORS = {
  email: token("email"),
  sms: token("sms"),
  whatsapp: token("whatsapp"),
  call: token("voice"),
} as const;

/** Primary accent for single-series charts. */
export const ACCENT_COLOR = token("sky");

/** Ordered palette for categorical charts (donuts). Assigned by position. */
export const CATEGORY_PALETTE = [
  token("sky"),
  token("whatsapp"),
  token("sms"),
  token("voice"),
  token("violet"),
  token("email"),
  token("pink"),
  token("slate"),
] as const;
