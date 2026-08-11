import BrandMark from "@/components/landing/BrandMark";
import { brand, wrap } from "./landingUi";
import { cn } from "@/lib/utils";

export default function LandingFooter() {
  return (
    <footer className="mt-[clamp(48px,8vw,116px)] border-t border-landing-line pb-10 pt-8 sm:pb-[52px] sm:pt-[38px]">
      <div
        className={cn(
          wrap,
          "flex flex-col gap-5 text-[13.5px] text-landing-muted sm:flex-row sm:flex-wrap sm:items-center sm:gap-[18px]",
        )}
      >
        <a className={cn(brand, "text-landing-ink")} href="#top">
          <BrandMark />
          Follow-Up AI
        </a>
        <nav
          aria-label="Footer"
          className="flex flex-wrap gap-x-5 gap-y-2.5 sm:ml-auto sm:gap-[22px]"
        >
          <a href="#how" className="no-underline hover:text-landing-ink">
            How it works
          </a>
          <a href="#channels" className="no-underline hover:text-landing-ink">
            Channels
          </a>
          <a href="#pilot" className="no-underline hover:text-landing-ink">
            Pilot
          </a>
          <a href="#faq" className="no-underline hover:text-landing-ink">
            FAQ
          </a>
        </nav>
      </div>
    </footer>
  );
}
