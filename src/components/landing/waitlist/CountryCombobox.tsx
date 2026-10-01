import { useMemo, useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { countryCodes } from "@/utils/countryCode";

const COUNTRIES = [
  ...new Set(countryCodes.map((item) => item.name)),
].sort((a, b) => a.localeCompare(b));

type CountryComboboxProps = {
  id?: string;
  value: string;
  onChange: (country: string) => void;
  className?: string;
  disabled?: boolean;
};

export function CountryCombobox({
  id,
  value,
  onChange,
  className,
  disabled,
}: CountryComboboxProps) {
  const [open, setOpen] = useState(false);

  const selected = useMemo(
    () => COUNTRIES.find((name) => name === value),
    [value],
  );

  return (
    <Popover modal open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          id={id}
          type="button"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            "flex w-full items-center justify-between border px-3 text-left outline-none",
            "focus-visible:ring-2 focus-visible:ring-landing-sky focus-visible:ring-offset-0",
            "disabled:cursor-not-allowed disabled:opacity-50",
            className,
          )}
        >
          <span
            className={cn(
              "truncate",
              !selected && "text-landing-fog/35",
            )}
          >
            {selected ?? "United States"}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="z-[90] w-[var(--radix-popover-trigger-width)] p-0"
        align="start"
      >
        <Command>
          <CommandInput placeholder="Search country..." />
          <CommandList className="max-h-56">
            <CommandEmpty>No country found.</CommandEmpty>
            <CommandGroup>
              {COUNTRIES.map((name) => (
                <CommandItem
                  key={name}
                  value={name}
                  onSelect={() => {
                    onChange(name);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === name ? "opacity-100" : "opacity-0",
                    )}
                  />
                  {name}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
