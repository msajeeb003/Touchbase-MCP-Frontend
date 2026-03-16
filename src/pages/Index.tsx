import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";

function Field({
  label,
  children,
  hint,
}: {
  label: string;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-end justify-between gap-4">
        <Label className="text-[0.95rem] font-medium text-slate-800">{label}</Label>
        {hint ? (
          <span className="text-xs text-slate-500">{hint}</span>
        ) : null}
      </div>
      {children}
    </div>
  );
}

const Index = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);

  const canSubmit = useMemo(() => {
    return email.trim().length > 3 && password.length >= 6 && !loading;
  }, [email, password, loading]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    // Simulated auth flow for now (no backend connected).
    await new Promise((r) => setTimeout(r, 650));
    setLoading(false);

    toast({
      title: "Signed in",
      description: `Welcome back${email ? ", " + email : ""}.`,
    });
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(1200px_600px_at_80%_-10%,rgba(99,102,241,0.24),transparent_60%),radial-gradient(900px_500px_at_0%_10%,rgba(14,165,233,0.22),transparent_55%),radial-gradient(900px_500px_at_100%_60%,rgba(236,72,153,0.14),transparent_55%)]">
      <div className="mx-auto flex min-h-screen max-w-6xl items-stretch">
        <div className="flex w-full flex-col justify-center px-4 py-10 sm:px-6 lg:w-[520px] lg:px-10">
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 rounded-full border bg-white/70 px-3 py-1 text-xs font-medium text-slate-700 shadow-sm backdrop-blur">
              <span className="h-2 w-2 rounded-full bg-indigo-500" />
              Secure access
            </div>
            <h1 className="mt-4 text-balance text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
              Welcome back
            </h1>
            <p className="mt-2 text-pretty text-sm leading-relaxed text-slate-600">
              Sign in to continue. This is a polished UI shell — wire it up to your auth
              provider when you’re ready.
            </p>
          </div>

          <Card className="rounded-2xl border-white/60 bg-white/70 p-5 shadow-xl shadow-indigo-500/5 backdrop-blur sm:p-6">
            <form onSubmit={onSubmit} className="space-y-5">
              <Field label="Email" hint="Work or personal">
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                  <Input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    type="email"
                    autoComplete="email"
                    className={cn(
                      "h-11 rounded-xl border-slate-200 bg-white/80 pl-10 text-slate-900 placeholder:text-slate-400",
                      "focus-visible:ring-2 focus-visible:ring-indigo-500/40"
                    )}
                  />
                </div>
              </Field>

              <Field label="Password" hint="Min 6 characters">
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                  <Input
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    className={cn(
                      "h-11 rounded-xl border-slate-200 bg-white/80 pl-10 pr-12 text-slate-900 placeholder:text-slate-400",
                      "focus-visible:ring-2 focus-visible:ring-indigo-500/40"
                    )}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-lg p-2 text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </Field>

              <div className="flex items-center justify-between gap-4">
                <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-700">
                  <Checkbox
                    checked={remember}
                    onCheckedChange={(v) => setRemember(Boolean(v))}
                    className="rounded-md border-slate-300 data-[state=checked]:border-indigo-600 data-[state=checked]:bg-indigo-600"
                  />
                  Remember me
                </label>

                <Button
                  type="button"
                  variant="link"
                  className="h-auto px-0 text-sm font-medium text-indigo-700 hover:text-indigo-800"
                  onClick={() =>
                    toast({
                      title: "Password reset",
                      description: "Hook this up to your reset flow.",
                    })
                  }
                >
                  Forgot password?
                </Button>
              </div>

              <Button
                type="submit"
                disabled={!canSubmit}
                className={cn(
                  "h-11 w-full rounded-xl bg-indigo-600 text-white shadow-sm shadow-indigo-500/20",
                  "hover:bg-indigo-700",
                  "disabled:opacity-60"
                )}
              >
                {loading ? "Signing in…" : "Sign in"}
              </Button>

              <div className="relative py-1">
                <Separator className="bg-slate-200" />
                <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border bg-white px-2 py-0.5 text-xs text-slate-600">
                  or
                </span>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Button
                  type="button"
                  variant="secondary"
                  className="h-11 rounded-xl bg-slate-100 text-slate-900 hover:bg-slate-200"
                  onClick={() => toast({ title: "Continue with Google", description: "Connect OAuth when ready." })}
                >
                  Continue with Google
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  className="h-11 rounded-xl bg-slate-100 text-slate-900 hover:bg-slate-200"
                  onClick={() => toast({ title: "Continue with GitHub", description: "Connect OAuth when ready." })}
                >
                  Continue with GitHub
                </Button>
              </div>

              <p className="text-center text-sm text-slate-600">
                New here?{" "}
                <button
                  type="button"
                  className="font-medium text-indigo-700 underline-offset-4 hover:underline"
                  onClick={() =>
                    toast({
                      title: "Create account",
                      description: "Add a sign-up route when you’re ready.",
                    })
                  }
                >
                  Create an account
                </button>
              </p>
            </form>
          </Card>

          <p className="mt-6 text-center text-xs text-slate-500">
            By continuing, you agree to our Terms & Privacy Policy.
          </p>
        </div>

        {/* Right side visual panel */}
        <div className="relative hidden flex-1 items-stretch p-6 lg:flex">
          <div className="relative w-full overflow-hidden rounded-3xl border border-white/50 bg-white/30 shadow-2xl shadow-indigo-500/10 backdrop-blur">
            <img
              src="/placeholder.svg"
              alt=""
              className="absolute inset-0 h-full w-full object-cover opacity-[0.22]"
            />
            <div className="absolute inset-0 bg-[radial-gradient(900px_500px_at_20%_20%,rgba(99,102,241,0.28),transparent_55%),radial-gradient(700px_420px_at_80%_70%,rgba(14,165,233,0.22),transparent_55%)]" />

            <div className="relative flex h-full flex-col justify-between p-8">
              <div className="max-w-sm">
                <p className="text-xs font-medium tracking-wide text-slate-700/80">
                  TEAM WORKSPACE
                </p>
                <h2 className="mt-3 text-balance text-2xl font-semibold leading-tight text-slate-900">
                  A calm, colorful login that feels premium.
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-slate-700">
                  Responsive layout, strong contrast, and a clean form hierarchy.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-white/60 bg-white/60 p-4 shadow-sm">
                  <p className="text-xs font-medium text-slate-600">Status</p>
                  <p className="mt-1 text-lg font-semibold text-slate-900">Operational</p>
                  <p className="mt-2 text-xs text-slate-600">99.98% uptime</p>
                </div>
                <div className="rounded-2xl border border-white/60 bg-white/60 p-4 shadow-sm">
                  <p className="text-xs font-medium text-slate-600">Security</p>
                  <p className="mt-1 text-lg font-semibold text-slate-900">MFA-ready</p>
                  <p className="mt-2 text-xs text-slate-600">SSO, OAuth, magic links</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
