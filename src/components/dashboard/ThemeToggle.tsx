import { Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AppTheme } from "@/lib/appTheme";

const OPTIONS: { value: AppTheme; label: string; icon: typeof Sun }[] = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
];

interface ThemeToggleProps {
  theme: AppTheme;
  onChange: (theme: AppTheme) => void;
  className?: string;
}

/** Segmented light / dark switch, styled with the steel tokens so it follows the active theme. */
export default function ThemeToggle({ theme, onChange, className }: ThemeToggleProps) {
  return (
    <div
      role="group"
      aria-label="Theme"
      className={cn(
        "inline-flex rounded-lg border border-landing-line bg-landing-steel-2 p-0.5 font-landing-sans",
        className,
      )}
    >
      {OPTIONS.map(({ value, label, icon: Icon }) => {
        const active = theme === value;
        return (
          <button
            key={value}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(value)}
            className={cn(
              "inline-flex h-8 items-center gap-1.5 rounded-md px-2.5 text-xs font-medium transition-colors",
              active
                ? "bg-landing-sky-soft text-landing-sky"
                : "text-landing-fog/55 hover:text-landing-fog",
            )}
          >
            <Icon className="h-3.5 w-3.5" aria-hidden />
            {label}
          </button>
        );
      })}
    </div>
  );
}
