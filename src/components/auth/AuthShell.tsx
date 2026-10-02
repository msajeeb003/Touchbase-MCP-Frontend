import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import BrandMark from "@/components/landing/BrandMark";
import { gridBgStyle } from "@/components/landing/landingUi";
import { useLandingFontLink } from "@/components/landing/landingFonts";

type AuthShellProps = {
  title: string;
  subtitle: string;
  children: ReactNode;
};

/** Full-page frame for sign-in and sign-up, in the landing page's steel theme. */
export default function AuthShell({ title, subtitle, children }: AuthShellProps) {
  useLandingFontLink();

  return (
    <div
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-landing-steel px-4 py-10 font-landing-sans text-landing-fog/80 antialiased"
      style={gridBgStyle}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[520px] bg-[radial-gradient(50%_60%_at_50%_0%,rgba(79,156,249,0.14),transparent_70%)]"
      />

      <div className="relative w-full max-w-[28rem]">
        <Link
          to="/"
          className="mb-5 inline-flex items-center gap-2 font-landing-mono text-[12px] text-landing-fog/50 no-underline transition-colors hover:text-landing-fog"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
          Back to home
        </Link>

        <main className="rounded-2xl border border-landing-line bg-landing-steel-2 px-6 py-8 shadow-[0_40px_90px_-40px_rgba(0,0,0,0.9)] sm:px-8">
          <div className="mb-6 flex justify-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-landing-sky/30 bg-landing-sky-soft p-2">
              <BrandMark className="h-full w-full" />
            </div>
          </div>

          <div className="mb-8 text-center">
            <h1 className="m-0 font-landing-display text-[clamp(26px,5vw,32px)] font-bold leading-tight tracking-[-0.02em] text-landing-fog">
              {title}
            </h1>
            <p className="m-0 mt-2 text-[16px] leading-[1.55] text-landing-fog/60">
              {subtitle}
            </p>
          </div>

          {children}
        </main>
      </div>
    </div>
  );
}
