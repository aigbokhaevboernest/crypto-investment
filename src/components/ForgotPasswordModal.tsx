import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, ArrowLeft, KeyRound, Mail, ShieldCheck, Eye, EyeOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const BRAND = "Arvithex Capital Alliance";
const RESEND_SECONDS = 60;

/**
 * All reset logic runs in the `password-reset` edge function.
 * The browser never generates, sees, or stores the code or any user data.
 */
const callReset = async (body: Record<string, unknown>) => {
  const { data, error } = await supabase.functions.invoke("password-reset", { body });
  if (error) throw new Error("Network error. Please try again.");
  if (!data?.ok) throw new Error(data?.error || "Something went wrong. Please try again.");
  return data;
};

type Props = { open: boolean; onOpenChange: (o: boolean) => void };

const strength = (p: string) => {
  let s = 0;
  if (p.length >= 8) s++;
  if (/[A-Z]/.test(p) && /[a-z]/.test(p)) s++;
  if (/\d/.test(p)) s++;
  if (/[^A-Za-z0-9]/.test(p) || p.length >= 14) s++;
  return s; // 0-4
};

const STEP_META = {
  1: { icon: Mail, title: "Reset your password", sub: "Enter your account email and we'll send you a 6-digit code." },
  2: { icon: KeyRound, title: "Check your email", sub: "" },
  3: { icon: ShieldCheck, title: "Create a new password", sub: "Use at least 8 characters. A mix of letters, numbers and symbols is stronger." },
} as const;

export const ForgotPasswordModal = ({ open, onOpenChange }: Props) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [pwd, setPwd] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const reset = () => {
    setStep(1); setEmail(""); setCode(""); setPwd(""); setConfirm("");
    setShowPwd(false); setCooldown(0); setLoading(false);
  };
  const close = () => { reset(); onOpenChange(false); };

  const requestCode = async () => {
  const { data, error } = await supabase.functions.invoke("send-reset-code", {
    body: { email: email.trim() },
  });
  if (error) {
    let msg = "Network error. Please try again.";
    try {
      const body = await (error as any).context?.json?.();
      if (body?.error) msg = body.error;
    } catch { /* keep default message */ }
    throw new Error(msg);
  }
  if (!data?.success) throw new Error(data?.error || "Could not send code. Please try again.");
  setCooldown(RESEND_SECONDS);
};


  // Step 1 — request code
  const submitEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await requestCode();
      toast.success("If an account exists for that email, a code is on its way.");
      setStep(2);
    } catch (err: any) {
      toast.error(err.message);
    } finally { setLoading(false); }
  };

  const resend = async () => {
    if (cooldown > 0 || loading) return;
    setLoading(true);
    try {
      await requestCode();
      setCode("");
      toast.success("New code sent.");
    } catch (err: any) {
      toast.error(err.message);
    } finally { setLoading(false); }
  };

  // Step 2 — verify code
  const submitCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length !== 6) { toast.error("Enter the 6-digit code."); return; }
    setLoading(true);
    try {
      await callReset({ action: "verify", email: email.trim(), code });
      setStep(3);
    } catch (err: any) {
      toast.error(err.message);
    } finally { setLoading(false); }
  };

  // Step 3 — set new password
  const submitNewPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pwd.length < 8) { toast.error("Password must be at least 8 characters."); return; }
    if (pwd !== confirm) { toast.error("Passwords don't match."); return; }
    setLoading(true);
    try {
      await callReset({ action: "complete", email: email.trim(), code, newPassword: pwd });
      toast.success("Password changed. You can now sign in.");
      close();
    } catch (err: any) {
      toast.error(err.message);
    } finally { setLoading(false); }
  };

  const meta = STEP_META[step];
  const Icon = meta.icon;
  const score = strength(pwd);
  const scoreColor = ["bg-muted", "bg-red-500", "bg-amber-500", "bg-lime-500", "bg-emerald-500"][score];
  const scoreLabel = ["", "Weak", "Fair", "Good", "Strong"][score];

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) reset(); onOpenChange(o); }}>
      <DialogContent
        className="w-[calc(100%-2rem)] max-w-md rounded-3xl border border-border/60 bg-card p-0 shadow-2xl overflow-hidden gap-0"
      >
        {/* Progress */}
        <div className="flex gap-1.5 px-6 pt-6" aria-label={`Step ${step} of 3`}>
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${n <= step ? "bg-primary" : "bg-muted"}`}
            />
          ))}
        </div>

        <div className="px-6 pb-7 pt-5">
          <DialogHeader className="items-center space-y-3 text-center sm:text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/20">
              <Icon className="h-6 w-6" />
            </div>
            <DialogTitle className="text-xl font-semibold tracking-tight">{meta.title}</DialogTitle>
            <DialogDescription className="text-sm leading-relaxed text-muted-foreground">
              {step === 2 ? (
                <>We sent a 6-digit code to <span className="font-medium text-foreground break-all">{email}</span>. It expires in 15 minutes.</>
              ) : meta.sub}
            </DialogDescription>
          </DialogHeader>

          {step === 1 && (
            <form onSubmit={submitEmail} className="mt-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fp-email">Email address</Label>
                <Input
                  id="fp-email" type="email" required autoFocus autoComplete="email"
                  placeholder="you@example.com"
                  className="h-12 rounded-xl"
                  value={email} onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <Button type="submit" className="h-12 w-full rounded-xl text-base" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Send reset code
              </Button>
              <Button type="button" variant="ghost" className="w-full rounded-xl" onClick={close}>
                Back to sign in
              </Button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={submitCode} className="mt-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fp-code" className="sr-only">6-digit code</Label>
                <Input
                  id="fp-code" autoFocus inputMode="numeric" autoComplete="one-time-code"
                  maxLength={6} placeholder="••••••"
                  className="h-14 rounded-xl text-center text-2xl font-bold tracking-[0.5em]"
                  value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                />
              </div>
              <div className="flex gap-2">
                <Button type="button" variant="outline" className="h-12 rounded-xl px-4" aria-label="Back" onClick={() => setStep(1)} disabled={loading}>
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <Button type="submit" className="h-12 flex-1 rounded-xl text-base" disabled={loading || code.length !== 6}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Verify code
                </Button>
              </div>
              <p className="text-center text-sm text-muted-foreground">
                Didn't get it?{" "}
                <button
                  type="button" onClick={resend} disabled={cooldown > 0 || loading}
                  className="font-medium text-primary disabled:text-muted-foreground disabled:no-underline hover:underline"
                >
                  {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend code"}
                </button>
              </p>
            </form>
          )}

          {step === 3 && (
            <form onSubmit={submitNewPassword} className="mt-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fp-pwd">New password</Label>
                <div className="relative">
                  <Input
                    id="fp-pwd" required autoFocus autoComplete="new-password"
                    type={showPwd ? "text" : "password"}
                    className="h-12 rounded-xl pr-11"
                    value={pwd} onChange={(e) => setPwd(e.target.value)}
                  />
                  <button
                    type="button" onClick={() => setShowPwd((s) => !s)}
                    aria-label={showPwd ? "Hide password" : "Show password"}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {pwd && (
                  <div className="flex items-center gap-3">
                    <div className="flex flex-1 gap-1">
                      {[1, 2, 3, 4].map((n) => (
                        <div key={n} className={`h-1 flex-1 rounded-full ${n <= score ? scoreColor : "bg-muted"}`} />
                      ))}
                    </div>
                    <span className="w-12 text-right text-xs text-muted-foreground">{scoreLabel}</span>
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="fp-confirm">Confirm password</Label>
                <Input
                  id="fp-confirm" required autoComplete="new-password"
                  type={showPwd ? "text" : "password"}
                  className="h-12 rounded-xl"
                  value={confirm} onChange={(e) => setConfirm(e.target.value)}
                />
                {confirm && pwd !== confirm && (
                  <p className="text-xs text-red-500">Passwords don't match.</p>
                )}
              </div>
              <div className="flex gap-2">
                <Button type="button" variant="outline" className="h-12 rounded-xl px-4" aria-label="Back" onClick={() => setStep(2)} disabled={loading}>
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <Button type="submit" className="h-12 flex-1 rounded-xl text-base" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Change password
                </Button>
              </div>
            </form>
          )}

          <p className="mt-6 text-center text-xs text-muted-foreground">{BRAND} Security</p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
