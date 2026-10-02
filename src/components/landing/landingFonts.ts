import { useEffect } from "react";

/** Google Fonts stylesheet for the landing theme (display, body, mono). */
export const LANDING_FONT_HREF =
  "https://fonts.googleapis.com/css2?family=Red+Hat+Display:wght@500;600;700;800&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap";

/** Loads the landing fonts while the calling page is mounted. */
export function useLandingFontLink() {
  useEffect(() => {
    const preconnectGoogle = document.createElement("link");
    preconnectGoogle.rel = "preconnect";
    preconnectGoogle.href = "https://fonts.googleapis.com";

    const preconnectGstatic = document.createElement("link");
    preconnectGstatic.rel = "preconnect";
    preconnectGstatic.href = "https://fonts.gstatic.com";
    preconnectGstatic.crossOrigin = "anonymous";

    const stylesheet = document.createElement("link");
    stylesheet.rel = "stylesheet";
    stylesheet.href = LANDING_FONT_HREF;

    document.head.append(preconnectGoogle, preconnectGstatic, stylesheet);

    return () => {
      preconnectGoogle.remove();
      preconnectGstatic.remove();
      stylesheet.remove();
    };
  }, []);
}
