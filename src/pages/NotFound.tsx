import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { useLandingFontLink } from "@/components/landing/landingFonts";

const NotFound = () => {
  const location = useLocation();
  useLandingFontLink();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname,
    );
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-landing-steel px-6 font-landing-sans text-landing-fog/80">
      <div className="text-center">
        <p className="font-landing-mono text-[11px] uppercase tracking-[0.14em] text-landing-sky">
          Error
        </p>
        <h1 className="mt-3 font-landing-display text-[clamp(64px,12vw,112px)] font-bold leading-none tracking-[-0.03em] text-landing-fog">
          404
        </h1>
        <p className="mt-4 text-lg text-landing-fog/65">Oops! Page not found</p>
        <p className="mt-2 break-all font-landing-mono text-xs text-landing-fog/40">
          {location.pathname}
        </p>
        <a
          href="/"
          className="mt-8 inline-flex items-center justify-center rounded-lg bg-landing-sky px-5 py-2.5 text-sm font-semibold text-landing-steel transition-colors hover:bg-landing-sky-deep"
        >
          Return to Home
        </a>
      </div>
    </div>
  );
};

export default NotFound;
