import { Link } from "react-router-dom";
import BrandMark from "@/components/landing/BrandMark";
import { WaitlistButton } from "@/components/landing/waitlist";
import { useAppSelector } from "@/store/hooks";
import { decodeAuthToken, isTokenValid } from "@/utils/auth";
import { brand, btn, btnGhost, btnPrimary, btnSm, wrap } from "./landingUi";
import { cn } from "@/lib/utils";

export default function LandingNav() {
  const token = useAppSelector((state) => state.auth.token);
  const isLoggedIn =
    isTokenValid(token) && Boolean(decodeAuthToken(token)?.email);

  return (
    <header className="sticky top-0 z-[60] border-b border-landing-line-dark bg-[rgba(14,17,48,0.9)] backdrop-blur-[14px]">
      <div className={cn(wrap, "flex h-[66px] items-center gap-3.5")}>
        <a className={brand} href="#top">
          <BrandMark />
          Follow-Up AI
        </a>
        <nav
          className="ml-auto hidden gap-[26px] text-[14.5px] min-[921px]:flex"
          aria-label="Sections"
        >
          <a
            href="#how"
            className="text-white/[0.66] no-underline transition-colors duration-[180ms] hover:text-white"
          >
            How it works
          </a>
          <a
            href="#channels"
            className="text-white/[0.66] no-underline transition-colors duration-[180ms] hover:text-white"
          >
            Channels
          </a>
          <a
            href="#pilot"
            className="text-white/[0.66] no-underline transition-colors duration-[180ms] hover:text-white"
          >
            Pilot
          </a>
          <a
            href="#faq"
            className="text-white/[0.66] no-underline transition-colors duration-[180ms] hover:text-white"
          >
            FAQ
          </a>
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
