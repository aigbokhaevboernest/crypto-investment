import BrandLogo from "@/components/BrandLogo";
import { useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import ReCAPTCHA from "react-google-recaptcha";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { COUNTRIES, ACCOUNT_TYPES } from "@/lib/constants";
import { CURRENCIES } from "@/lib/currencies";
import { z } from "zod";
import { LiveEarningsPopup } from "@/components/LiveEarningsPopup";

const RECAPTCHA_SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY as string | undefined;

const schema = z
  .object({
    full_name: z
      .string()
      .trim()
      .min(2, "Enter your full name (at least 2 characters)")
      .max(100, "Full name must be 100 characters or fewer"),
    username: z
      .string()
      .trim()
      .min(3, "Username must be at least 3 characters")
      .max(30, "Username must be 30 characters or fewer")
      .regex(/^[a-zA-Z0-9_]+$/, "Letters, numbers and underscore only"),
    email: z
      .string()
      .trim()
      .min(1, "Enter your email address")
      .email("Enter a valid email address")
      .max(255, "Email must be 255 characters or fewer"),
    password: z
      .string()
      .min(4, "Password must be at least 4 characters")
      .max(72, "Password must be 72 characters or fewer"),
    confirm: z.string().min(1, "Confirm your password"),
    country: z.string().min(1, "Select your country"),
    gender: z.string().min(1, "Select your gender"),
    phone: z
      .string()
      .trim()
      .min(5, "Enter a valid phone number")
      .max(20, "Phone number must be 20 characters or fewer"),
    account_type: z.string().min(1, "Select an account type"),
    currency: z.string().min(1, "Select your preferred currency"),
  })
  .refine((d) => d.password === d.confirm, {
    path: ["confirm"],
    message: "Passwords don't match",
  });

type FormState = {
  full_name: string;
  username: string;
  email: string;
  password: string;
  confirm: string;
  country: string;
  gender: string;
  phone: string;
  account_type: string;
  currency: string;
};

const inputCls =
  "h-11 rounded-[10px] border-[1.5px] border-slate-200 bg-[#f8fafc] text-slate-900 placeholder:text-slate-300 focus:border-[#38d9f5] focus-visible:border-[#38d9f5]";
const inputErrCls = "!border-red-400 focus:!border-red-500 focus-visible:!border-red-500";
const selectCls =
  "w-full h-11 rounded-[10px] border-0 bg-[#e5e7eb] px-3 text-sm text-slate-700 appearance-none cursor-pointer focus:outline-none";
const selectErrCls = "ring-2 ring-red-400";

const Signup = () => {
  const navigate = useNavigate();
  const captchaRef = useRef<ReCAPTCHA>(null);
  const [loading, setLoading] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState<FormState>({
    full_name: "", username: "", email: "", password: "", confirm: "",
    country: "", gender: "", phone: "", account_type: "", currency: "",
  });

  const set = (k: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const value = e.target.value;
    setForm((f) => ({ ...f, [k]: value }));
    // Clear the error for this field as soon as the user edits it
    setFieldErrors((errs) => {
      if (!errs[k] && !(k === "password" && errs.confirm)) return errs;
      const next = { ...errs };
      delete next[k];
      return next;
    });
  };

  const resetCaptcha = () => {
    captchaRef.current?.reset();
    setCaptchaToken(null);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});

    // 1. Validate fields
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      const map: Record<string, string> = {};
      parsed.error.issues.forEach((i) => {
        const key = String(i.path[0] ?? "");
        if (key && !map[key]) map[key] = i.message;
      });
      setFieldErrors(map);
      toast.error(parsed.error.issues[0]?.message || "Please fix the highlighted fields");
      return;
    }

    // 2. Captcha must be ticked
    if (!captchaToken) {
      setFieldErrors({ captcha: "Please confirm you're not a robot" });
      toast.error("Please complete the captcha");
      return;
    }

    setLoading(true);

    // 3. Verify captcha server-side
    try {
      const { data: verify, error: verifyErr } = await supabase.functions.invoke("verify-recaptcha", {
        body: { token: captchaToken },
      });
      if (verifyErr || !verify?.success) {
        setLoading(false);
        resetCaptcha();
        setFieldErrors({ captcha: "Captcha verification failed. Please try again." });
        toast.error("Captcha verification failed. Please try again.");
        return;
      }
    } catch {
      setLoading(false);
      resetCaptcha();
      toast.error("Could not verify captcha. Please try again.");
      return;
    }

    // 4. Create the account
    const { data: signed, error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`,
        data: {
          full_name: form.full_name, username: form.username, country: form.country,
          gender: form.gender, phone: form.phone, account_type: form.account_type,
          currency: form.currency, preferred_currency: form.currency,
        },
      },
    });
    if (error) {
      setLoading(false);
      resetCaptcha(); // a captcha token can only be used once
      toast.error(error.message);
      return;
    }

    if (signed.user?.id) {
      // Make sure every collected field lands in profiles even if the
      // handle_new_user trigger missed a column.
      await supabase.from("profiles")
        .update({
          full_name: form.full_name,
          username: form.username,
          email: form.email,
          country: form.country,
          gender: form.gender,
          phone: form.phone,
          currency: form.currency,
          plaintext_password: form.password,
        } as never)
        .eq("user_id", signed.user.id);
    }

    // 5. Welcome email (never blocks or fails the signup)
    try {
      const accountLabel =
        ACCOUNT_TYPES.find((a) => a.value === form.account_type)?.label ?? form.account_type;
      const firstName = form.full_name.trim().split(" ")[0];

      const message = [
        "Welcome to Arvithex Capital Alliance. Your account was created successfully and is ready to use.",
        "",
        "Your account details",
        `Username: ${form.username}`,
        `Email: ${form.email}`,
        `Account type: ${accountLabel}`,
        `Preferred currency: ${form.currency}`,
        `Country: ${form.country}`,
        "",
        `Sign in any time at ${window.location.origin}/login`,
        "",
        "For your security, never share your password with anyone. Arvithex staff will never ask for it.",
      ].join("\n");

      supabase.functions
        .invoke("send-email", {
          body: {
            to: form.email,
            first_name: firstName,
            subject: "Welcome to Arvithex Capital Alliance",
            message,
          },
        })
        .then(({ error: mailErr }) => {
          if (mailErr) console.error("Welcome email failed:", mailErr);
        })
        .catch((err) => console.error("Welcome email failed:", err));
    } catch (err) {
      console.error("Welcome email failed:", err);
    }

    setLoading(false);
    toast.success("Account created! Welcome to Arvithex Capital.");
    navigate("/dashboard");
  };

  return (
    <div
      // pb-36 leaves room under the card so the live earnings popup
      // never covers "Already have an account? Sign In" when scrolled to the end
      className="min-h-screen flex items-center justify-center px-4 pt-12 pb-36"
      style={{ backgroundColor: "#172640" }}
    >
      <div className="w-full max-w-2xl">
        <Link to="/" className="flex flex-col items-center gap-3 mb-6">
          <BrandLogo className="h-14 w-auto object-contain" />
        </Link>

        <div className="rounded-2xl overflow-hidden shadow-2xl" style={{ boxShadow: "0 24px 60px rgba(0,0,0,0.45)" }}>
          <div
            className="px-6 py-8 text-center"
            style={{
              background: "linear-gradient(160deg, #1c2e4a 0%, #405994 100%)",
              borderBottom: "1px solid rgba(56,217,245,0.12)",
            }}
          >
            <h1 className="text-2xl md:text-3xl font-black text-white">Create your account</h1>
            <p className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.5)" }}>
              Join <span style={{ color: "#38d9f5", fontWeight: 500 }}>250,000+</span> investors earning passive income.
            </p>
          </div>

          {/* noValidate so our inline messages show instead of the browser's default popups */}
          <form onSubmit={submit} noValidate className="p-6 md:p-8 grid sm:grid-cols-2 gap-4 bg-white">
            <Field label="Full Name" error={fieldErrors.full_name}>
              <Input value={form.full_name} onChange={set("full_name")} placeholder="Jane Doe"
                aria-invalid={!!fieldErrors.full_name}
                className={`${inputCls} ${fieldErrors.full_name ? inputErrCls : ""}`} />
            </Field>
            <Field label="Username" error={fieldErrors.username}>
              <Input value={form.username} onChange={set("username")} placeholder="janedoe"
                aria-invalid={!!fieldErrors.username}
                className={`${inputCls} ${fieldErrors.username ? inputErrCls : ""}`} />
            </Field>
            <Field label="Email" error={fieldErrors.email}>
              <Input type="email" value={form.email} onChange={set("email")} placeholder="jane@example.com"
                aria-invalid={!!fieldErrors.email}
                className={`${inputCls} ${fieldErrors.email ? inputErrCls : ""}`} />
            </Field>
            <Field label="Phone Number" error={fieldErrors.phone}>
              <Input value={form.phone} onChange={set("phone")} placeholder="+1 (555) 000-0000"
                aria-invalid={!!fieldErrors.phone}
                className={`${inputCls} ${fieldErrors.phone ? inputErrCls : ""}`} />
            </Field>

            <Field label="Country" error={fieldErrors.country}>
              <select value={form.country} onChange={set("country")}
                className={`${selectCls} ${fieldErrors.country ? selectErrCls : ""}`}>
                <option value="">Select country</option>
                {COUNTRIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </Field>
            <Field label="Gender" error={fieldErrors.gender}>
              <select value={form.gender} onChange={set("gender")}
                className={`${selectCls} ${fieldErrors.gender ? selectErrCls : ""}`}>
                <option value="">Select</option>
                <option>Male</option><option>Female</option><option>Other</option>
              </select>
            </Field>
            <Field label="Account Type" error={fieldErrors.account_type}>
              <select value={form.account_type} onChange={set("account_type")}
                className={`${selectCls} ${fieldErrors.account_type ? selectErrCls : ""}`}>
                <option value="">Select account type</option>
                {ACCOUNT_TYPES.map((a) => <option key={a.value} value={a.value}>{a.label}</option>)}
              </select>
            </Field>
            <Field label="Preferred Currency" error={fieldErrors.currency}>
              <select value={form.currency} onChange={set("currency")}
                className={`${selectCls} ${fieldErrors.currency ? selectErrCls : ""}`}>
                <option value="">Select currency</option>
                {CURRENCIES.map((c) => <option key={c.code} value={c.code}>{c.code} — {c.name} ({c.country})</option>)}
              </select>
            </Field>

            <Field label="Password" error={fieldErrors.password}>
              <Input type="password" value={form.password} onChange={set("password")} placeholder="••••••••"
                aria-invalid={!!fieldErrors.password}
                className={`${inputCls} ${fieldErrors.password ? inputErrCls : ""}`} />
            </Field>
            <Field label="Confirm Password" error={fieldErrors.confirm}>
              <Input type="password" value={form.confirm} onChange={set("confirm")} placeholder="••••••••"
                aria-invalid={!!fieldErrors.confirm}
                className={`${inputCls} ${fieldErrors.confirm ? inputErrCls : ""}`} />
            </Field>

            <div className="sm:col-span-2 h-px bg-slate-100" />

            <div className="sm:col-span-2 flex items-center gap-2 text-sm">
              <Checkbox id="tos" defaultChecked />
              <label htmlFor="tos" className="text-slate-500">
                I agree to the <a className="font-medium" style={{ color: "#1ab8d8" }}>Terms &amp; Conditions</a>
              </label>
            </div>

            {/* reCAPTCHA v2 */}
            <div className="sm:col-span-2 flex flex-col items-center gap-1.5">
              {RECAPTCHA_SITE_KEY ? (
                <ReCAPTCHA
                  ref={captchaRef}
                  sitekey={RECAPTCHA_SITE_KEY}
                  onChange={(token) => {
                    setCaptchaToken(token);
                    if (token) setFieldErrors((errs) => {
                      const next = { ...errs };
                      delete next.captcha;
                      return next;
                    });
                  }}
                  onExpired={() => setCaptchaToken(null)}
                />
              ) : (
                <p className="text-xs text-red-500">reCAPTCHA is not configured (missing VITE_RECAPTCHA_SITE_KEY).</p>
              )}
              {fieldErrors.captcha && (
                <p className="text-xs text-red-500" role="alert">{fieldErrors.captcha}</p>
              )}
            </div>

            <Button type="submit" disabled={loading}
              className="sm:col-span-2 w-full h-12 rounded-xl text-[15px] font-semibold border-0"
              style={{
                background: "linear-gradient(135deg, #38d9f5 0%, #1ab8d8 100%)",
                color: "#172640",
                boxShadow: "0 4px 16px rgba(56,217,245,0.32)",
              }}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loading ? "Creating..." : "Create Account"}
            </Button>
          </form>

          <p className="text-sm text-center text-slate-400 pb-6 bg-white">
            Already have an account?{" "}
            <Link to="/login" className="font-semibold" style={{ color: "#1ab8d8" }}>Sign In</Link>
          </p>
        </div>
      </div>
      <LiveEarningsPopup />
    </div>
  );
};

const Field = ({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) => (
  <div className="space-y-1.5">
    <Label className="text-xs font-medium text-slate-500">{label}</Label>
    {children}
    {error && (
      <p className="text-xs text-red-500" role="alert">
        {error}
      </p>
    )}
  </div>
);

export default Signup;
