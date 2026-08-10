import { useEffect } from "react";
import { revealInClasses, revealPendingClasses } from "./landingUi";

const REVEAL_SELECTOR = ".landing-page [data-reveal]";

/** Adds scroll entrance classes (respects reduced motion). */
export function useLandingReveal(enabled = true) {
  useEffect(() => {
    if (!enabled) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const elements = Array.from(
      document.querySelectorAll<HTMLElement>(REVEAL_SELECTOR),
    );
    elements.forEach((el) => {
      el.classList.add(...revealPendingClasses);
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el = entry.target as HTMLElement;
          el.classList.remove(...revealPendingClasses);
          el.classList.add(...revealInClasses);
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.14 },
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [enabled]);
}
