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
    <footer className="border-t border-landing-line py-10">
      <div
        className={cn(
          wrap,
          "flex flex-col gap-5 text-[13.5px] text-landing-fog/50 sm:flex-row sm:items-center",
        )}
      >
        <button
          type="button"
          className={cn(
            brand,
            "cursor-pointer border-0 bg-transparent p-0 text-[17px]",
          )}
          onClick={() => scrollToSection("top")}
        >
          <BrandMark />
          Follow-Up AI
        </button>
        <nav
          aria-label="Footer"
          className="flex flex-wrap gap-x-5 gap-y-2 font-medium sm:ml-auto"
        >
          {FOOTER_LINKS.map(({ id, label }) => (
            <button
              key={id}
              type="button"
              className="cursor-pointer border-0 bg-transparent p-0 font-inherit text-inherit hover:text-landing-fog"
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
