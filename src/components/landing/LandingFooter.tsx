import BrandMark from "@/components/landing/BrandMark";
import { brand, wrap } from "./landingUi";
import { scrollToSection } from "./scrollToSection";
import { cn } from "@/lib/utils";

const FOOTER_LINKS = [
  { id: "how", label: "How it works" },
  { id: "channels", label: "Channels" },
  { id: "pilot", label: "Pilot" },
  { id: "faq", label: "FAQ" },
] as const;

export default function LandingFooter() {
  return (
    <footer className="mt-[clamp(48px,8vw,116px)] border-t border-landing-line pb-10 pt-8 sm:pb-[52px] sm:pt-[38px]">
      <div
        className={cn(
          wrap,
          "flex flex-col gap-5 text-[13.5px] text-landing-muted sm:flex-row sm:flex-wrap sm:items-center sm:gap-[18px]",
        )}
      >
        <button
          type="button"
          className={cn(
            brand,
            "cursor-pointer border-0 bg-transparent p-0 text-landing-ink",
          )}
          onClick={() => scrollToSection("top")}
        >
          <BrandMark />
          Follow-Up AI
        </button>
        <nav
          aria-label="Footer"
          className="flex flex-wrap gap-x-5 gap-y-2.5 sm:ml-auto sm:gap-[22px]"
        >
          {FOOTER_LINKS.map(({ id, label }) => (
            <button
              key={id}
              type="button"
              className="cursor-pointer border-0 bg-transparent p-0 font-inherit text-inherit hover:text-landing-ink"
              onClick={() => scrollToSection(id)}
            >
              {label}
            </button>
          ))}
        </nav>
      </div>
    </footer>
  );
}
