import BrandMark from "@/components/landing/BrandMark";
import { brand, wrap } from "./landingUi";
import { cn } from "@/lib/utils";

export default function LandingFooter() {
  return (
    <footer className="mt-[clamp(64px,8vw,116px)] border-t border-landing-line pb-[52px] pt-[38px]">
      <div
        className={cn(
          wrap,
          "flex flex-wrap items-center gap-[18px] text-[13.5px] text-landing-muted",
        )}
      >
        <a className={cn(brand, "text-landing-ink")} href="#top">
          <BrandMark />
          Follow-Up AI
        </a>
        <nav aria-label="Footer" className="ml-auto flex gap-[22px]">
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
