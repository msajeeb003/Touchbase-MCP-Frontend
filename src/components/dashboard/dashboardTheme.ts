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

/** Channel colours, matching the landing-email / sms / whatsapp / voice tokens. */
export const CHANNEL_COLORS = {
  email: "#7FB4FF",
  sms: "#F2C86A",
  whatsapp: "#5EDBA6",
  call: "#FF9A7A",
} as const;

/** Ordered palette for categorical charts (donuts). Assigned by position. */
export const CATEGORY_PALETTE = [
  "#4F9CF9",
  "#5EDBA6",
  "#F2C86A",
  "#FF9A7A",
  "#A78BFA",
  "#7FB4FF",
  "#F472B6",
  "#94A3B8",
] as const;
