import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useWaitlist } from "./WaitlistContext";

type WaitlistButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
};

/** Opens the shared waitlist modal. Use with landing btn classes. */
export function WaitlistButton({
  children,
  className,
  type = "button",
  onClick,
  ...props
}: WaitlistButtonProps) {
  const { openWaitlist } = useWaitlist();

  return (
    <button
      type={type}
      className={cn(className)}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) openWaitlist();
      }}
      {...props}
    >
      {children}
    </button>
  );
}
