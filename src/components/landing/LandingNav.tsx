import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import BrandMark from "@/components/landing/BrandMark";
import { WaitlistButton } from "@/components/landing/waitlist";
import { useAppSelector } from "@/store/hooks";
import { decodeAuthToken, isTokenValid } from "@/utils/auth";
import { brand, btn, btnPrimary, btnSm, wrap } from "./landingUi";
import { scrollToSection } from "./scrollToSection";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { id: "watch", label: "Video" },
  { id: "how", label: "How it works" },
  { id: "channels", label: "Channels" },
  { id: "pilot", label: "Pilot" },
  { id: "faq", label: "FAQ" },
] as const;

const navLinkClass =
  "cursor-pointer border-0 bg-transparent p-0 font-inherit text-[14.5px] font-medium text-landing-fog/55 transition-colors duration-150 hover:text-landing-fog";

const mobileLinkClass =
  "cursor-pointer rounded-md border-0 bg-transparent px-2 py-2 text-left font-inherit text-[15px] font-medium text-landing-fog/80 no-underline hover:bg-white/5";

export default function LandingNav() {
  const token = useAppSelector((state) => state.auth.token);
  const isLoggedIn =
    isTokenValid(token) && Boolean(decodeAuthToken(token)?.email);
  const [menuOpen, setMenuOpen] = useState(false);

  const accountHref = isLoggedIn ? "/dashboard" : "/auth/signin";
  const accountLabel = isLoggedIn ? "Dashboard" : "Login";

  const goTo = (id: string) => {
    setMenuOpen(false);
    scrollToSection(id);
  };

  return (
    <header className="sticky top-0 z-[60] border-b border-landing-line bg-landing-steel/85 backdrop-blur-md">
      <div className={cn(wrap, "flex h-[68px] items-center gap-4")}>
        <button
          type="button"
          className={cn(brand, "cursor-pointer border-0 bg-transparent p-0")}
          onClick={() => goTo("top")}
        >
          <BrandMark />
          Touchbase AI
        </button>
        <nav
          className="ml-auto hidden items-center gap-7 md:flex"
          aria-label="Sections"
        >
          {NAV_LINKS.map(({ id, label }) => (
            <button
              key={id}
              type="button"
              className={navLinkClass}
              onClick={() => goTo(id)}
            >
              {label}
            </button>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-2 md:ml-7">
          <Link
            className="hidden h-10 items-center px-3.5 text-[14px] font-semibold text-landing-fog/70 no-underline hover:text-landing-fog sm:inline-flex"
            to={accountHref}
          >
            {accountLabel}
          </Link>
          <WaitlistButton className={cn(btn, btnPrimary, btnSm)}>
            Join the waitlist
          </WaitlistButton>
          <button
            type="button"
            className="inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-md border border-landing-line bg-transparent text-landing-fog md:hidden"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            aria-controls="landing-mobile-nav"
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {menuOpen ? (
        <nav
          id="landing-mobile-nav"
          className="border-t border-landing-line bg-landing-steel px-5 py-3 md:hidden"
          aria-label="Sections (mobile)"
        >
          <div className="flex flex-col gap-1">
            {NAV_LINKS.map(({ id, label }) => (
              <button
                key={id}
                type="button"
                className={mobileLinkClass}
                onClick={() => goTo(id)}
              >
                {label}
              </button>
            ))}
            <Link
              className={mobileLinkClass}
              to={accountHref}
              onClick={() => setMenuOpen(false)}
            >
              {accountLabel}
            </Link>
          </div>
        </nav>
      ) : null}
    </header>
  );
}
