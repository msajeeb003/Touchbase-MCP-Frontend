import { Link } from "react-router-dom";
import BrandMark from "@/components/landing/BrandMark";
import { WaitlistButton } from "@/components/landing/waitlist";
import { useAppSelector } from "@/store/hooks";
import { decodeAuthToken, isTokenValid } from "@/utils/auth";
import { brand, btn, btnGhost, btnPrimary, btnSm, wrap } from "./landingUi";
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
  "cursor-pointer border-0 bg-transparent p-0 font-inherit text-[14.5px] text-white/[0.66] transition-colors duration-[180ms] hover:text-white";

export default function LandingNav() {
  const token = useAppSelector((state) => state.auth.token);
  const isLoggedIn =
    isTokenValid(token) && Boolean(decodeAuthToken(token)?.email);

  return (
    <header className="sticky top-0 z-[60] border-b border-landing-line-dark bg-[rgba(14,17,48,0.9)] backdrop-blur-[14px]">
      <div className={cn(wrap, "flex h-[66px] items-center gap-3.5")}>
        <button
          type="button"
          className={cn(brand, "cursor-pointer border-0 bg-transparent p-0")}
          onClick={() => scrollToSection("top")}
        >
          <BrandMark />
          Follow-Up AI
        </button>
        <nav
          className="ml-auto hidden gap-[26px] text-[14.5px] min-[921px]:flex"
          aria-label="Sections"
        >
          {NAV_LINKS.map(({ id, label }) => (
            <button
              key={id}
              type="button"
              className={navLinkClass}
              onClick={() => scrollToSection(id)}
            >
              {label}
            </button>
          ))}
        </nav>
        <div className="ml-auto flex gap-2 min-[921px]:ml-[26px]">
          {isLoggedIn ? (
            <Link className={cn(btn, btnGhost, btnSm)} to="/dashboard">
              Dashboard
            </Link>
          ) : (
            <Link className={cn(btn, btnGhost, btnSm)} to="/auth/signin">
              Login
            </Link>
          )}
          <WaitlistButton className={cn(btn, btnPrimary, btnSm)}>
            Join the waitlist
          </WaitlistButton>
        </div>
      </div>
    </header>
  );
}
