import logo from "@/assets/logo.png";
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
      className={cn("h-6 w-6 flex-none object-contain", className)}
    />
  );
}
