import { useState, type FormEvent } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import {
  Dialog,
  DialogDescription,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { showError, showSuccess } from "@/utils/toast";
import { btn, btnPrimary } from "../landingUi";
import { CountryCombobox } from "./CountryCombobox";
import { submitWaitlist } from "./submitWaitlist";
import { useWaitlist } from "./WaitlistContext";

const ROLES = [
  "Founder",
  "Agency owner",
  "Sales / SDR",
  "Sales manager",
  "Consultant",
  "Marketing",
  "Operations",
  "Other",
] as const;

const fieldLabel =
  "mb-1.5 block font-landing-mono text-[11px] uppercase tracking-[0.14em] text-landing-muted";

const fieldControl =
  "h-11 rounded-[10px] border-landing-line bg-white font-landing-sans text-[15px] text-landing-ink placeholder:text-landing-muted/70 focus-visible:ring-landing-indigo";

export function WaitlistModal() {
  const { open, setOpen, closeWaitlist } = useWaitlist();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [country, setCountry] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const resetForm = () => {
    setName("");
    setEmail("");
    setRole("");
    setCountry("");
    setSubmitting(false);
    setSubmitted(false);
    setError("");
  };

  const onOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) resetForm();
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!role || !country || submitting) return;

    setError("");
    setSubmitting(true);

    try {
      await submitWaitlist({
        name: name.trim(),
        email: email.trim(),
        role,
        country,
      });
      setSubmitted(true);
      showSuccess(
        "You're on the waitlist. We'll be in touch shortly about a pilot place.",
      );
      window.setTimeout(() => {
        closeWaitlist();
        resetForm();
      }, 700);
    } catch {
      const message = "Something went wrong. Please try again.";
      setError(message);
      showError(message);
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPortal>
        <DialogOverlay className="z-[70] bg-black/55" />
        <DialogPrimitive.Content
          className={cn(
            "fixed left-1/2 top-1/2 z-[80] grid w-[calc(100%-2rem)] max-w-[440px] -translate-x-1/2 -translate-y-1/2",
            "gap-0 overflow-hidden rounded-2xl border border-landing-line bg-white p-0 font-landing-sans",
            "shadow-[0_24px_80px_rgba(14,17,48,0.28)] duration-200",
            "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
            "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
          )}
        >
          <DialogPrimitive.Close
            type="button"
            className="absolute right-4 top-4 rounded-md border border-landing-line bg-[#f4f5f8] p-1.5 text-landing-ink opacity-90 transition-opacity hover:opacity-100"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>

          <div className="px-6 pb-6 pt-7 sm:px-7">
            <DialogHeader className="mb-6 space-y-2 text-left">
              <DialogTitle className="font-landing-display text-[clamp(24px,3vw,28px)] font-bold tracking-[-0.02em] text-landing-ink">
                Join the waitlist
              </DialogTitle>
              <DialogDescription className="text-[15px] leading-[1.55] text-landing-muted">
                Tell us a little about you and we will be in touch about a pilot
                place.
              </DialogDescription>
            </DialogHeader>

            <form className="space-y-4" onSubmit={onSubmit}>
              <div>
                <Label htmlFor="waitlist-name" className={fieldLabel}>
                  Name
                </Label>
                <Input
                  id="waitlist-name"
                  name="name"
                  required
                  autoComplete="name"
                  placeholder="Your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={fieldControl}
                  disabled={submitting || submitted}
                />
              </div>

              <div>
                <Label htmlFor="waitlist-email" className={fieldLabel}>
                  Email
                </Label>
                <Input
                  id="waitlist-email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={fieldControl}
                  disabled={submitting || submitted}
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="waitlist-role" className={fieldLabel}>
                    Role
                  </Label>
                  <Select
                    value={role || undefined}
                    onValueChange={setRole}
                    disabled={submitting || submitted}
                  >
                    <SelectTrigger id="waitlist-role" className={fieldControl}>
                      <SelectValue placeholder="Select..." />
                    </SelectTrigger>
                    <SelectContent className="z-[90]">
                      {ROLES.map((item) => (
                        <SelectItem key={item} value={item}>
                          {item}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="waitlist-country" className={fieldLabel}>
                    Country
                  </Label>
                  <CountryCombobox
                    id="waitlist-country"
                    value={country}
                    onChange={setCountry}
                    className={fieldControl}
                    disabled={submitting || submitted}
                  />
                </div>
              </div>

              {error ? (
                <p className="text-[13px] text-red-600" role="alert">
                  {error}
                </p>
              ) : null}

              <button
                type="submit"
                disabled={submitting || submitted || !role || !country}
                className={cn(
                  btn,
                  btnPrimary,
                  "mt-2 h-12 w-full rounded-[10px] text-[15px] disabled:opacity-60",
                )}
              >
                {submitted
                  ? "Request sent"
                  : submitting
                    ? "Sending..."
                    : "Send Request"}
              </button>
            </form>

            <p className="mt-4 text-center font-landing-mono text-[11.5px] leading-[1.5] text-landing-muted">
              We only use these details to contact you about the pilot.
            </p>
          </div>
        </DialogPrimitive.Content>
      </DialogPortal>
    </Dialog>
  );
}
