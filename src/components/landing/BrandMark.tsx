// Landing-only mark in the steel/sky palette. The app keeps "@/assets/logo.png".
import logo from "@/assets/landingpagelogo.png";
import { cn } from "@/lib/utils";

type BrandMarkProps = {
  className?: string;
};

export default function BrandMark({ className }: BrandMarkProps) {
  return (
    <img
      src={logo}
      alt=""
      aria-hidden="true"
      className={cn("h-9 w-9 flex-none object-contain", className)}
    />
  );
}
