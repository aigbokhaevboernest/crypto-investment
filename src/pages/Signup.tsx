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
  password: z.string().min(4, "Min 4 characters").max(72),
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
    country: "", gender: "", phone: "", account_type: "", currency: "",
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
          currency: form.currency,
        },
      },
    });
    if (error) { setLoading(false); toast.error(error.message); return; }

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
        {/* Logo — untouched */}
        <Link to="/" className="flex flex-col items-center gap-2 mb-6">
          <div className="h-12 w-12 rounded-xl bg-primary flex items-center justify-center font-black text-black text-xl">C</div>
          <span className="font-bold text-lg text-white">CryptoVault</span>
        </Link>

        <div className="rounded-2xl overflow-hidden shadow-2xl" style={{ boxShadow: "0 24px 60px rgba(0,0,0,0.45)" }}>
          {/* Header — dark navy, no cyan clash */}
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

          {/* Form body */}
          <form onSubmit={submit} className="p-6 md:p-8 grid sm:grid-cols-2 gap-4 bg-white">
            {/* Text inputs — light fill, unified border */}
            <Field label="Full Name">
              <Input
                value={form.full_name} onChange={set("full_name")} required
                placeholder="Jane Doe"
                className="h-11 rounded-[10px] border-[1.5px] border-slate-200 bg-[#f8fafc] text-slate-900 placeholder:text-slate-300 focus:border-[#38d9f5] focus:ring-[3px] focus:ring-[rgba(56,217,245,0.12)] focus-visible:ring-[rgba(56,217,245,0.12)] focus-visible:border-[#38d9f5]"
              />
            </Field>
            <Field label="Username">
              <Input
                value={form.username} onChange={set("username")} required
                placeholder="janedoe"
                className="h-11 rounded-[10px] border-[1.5px] border-slate-200 bg-[#f8fafc] text-slate-900 placeholder:text-slate-300 focus:border-[#38d9f5] focus:ring-[3px] focus:ring-[rgba(56,217,245,0.12)] focus-visible:ring-[rgba(56,217,245,0.12)] focus-visible:border-[#38d9f5]"
              />
            </Field>
            <Field label="Email">
              <Input
                type="email" value={form.email} onChange={set("email")} required
                placeholder="jane@example.com"
                className="h-11 rounded-[10px] border-[1.5px] border-slate-200 bg-[#f8fafc] text-slate-900 placeholder:text-slate-300 focus:border-[#38d9f5] focus:ring-[3px] focus:ring-[rgba(56,217,245,0.12)] focus-visible:ring-[rgba(56,217,245,0.12)] focus-visible:border-[#38d9f5]"
              />
            </Field>
            <Field label="Phone Number">
              <Input
                value={form.phone} onChange={set("phone")} required
                placeholder="+1 (555) 000-0000"
                className="h-11 rounded-[10px] border-[1.5px] border-slate-200 bg-[#f8fafc] text-slate-900 placeholder:text-slate-300 focus:border-[#38d9f5] focus:ring-[3px] focus:ring-[rgba(56,217,245,0.12)] focus-visible:ring-[rgba(56,217,245,0.12)] focus-visible:border-[#38d9f5]"
              />
            </Field>

            {/* Dropdowns — keep original gray look */}
            <Field label="Country">
              <select
                value={form.country} onChange={set("country")} required
                className="w-full h-11 rounded-[10px] border-0 bg-[#e5e7eb] px-3 text-sm text-slate-700 appearance-none cursor-pointer focus:outline-none focus:ring-[3px] focus:ring-[rgba(56,217,245,0.12)]"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='7' viewBox='0 0 12 7'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%2394a3b8' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E")`,
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "right 14px center",
                  paddingRight: "36px",
                }}
              >
                <option value="">Select country</option>
                {COUNTRIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </Field>
            <Field label="Gender">
              <select
                value={form.gender} onChange={set("gender")} required
                className="w-full h-11 rounded-[10px] border-0 bg-[#e5e7eb] px-3 text-sm text-slate-700 appearance-none cursor-pointer focus:outline-none focus:ring-[3px] focus:ring-[rgba(56,217,245,0.12)]"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='7' viewBox='0 0 12 7'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%2394a3b8' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E")`,
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "right 14px center",
                  paddingRight: "36px",
                }}
              >
                <option value="">Select</option>
                <option>Male</option><option>Female</option><option>Other</option>
              </select>
            </Field>
            <Field label="Account Type">
              <select
                value={form.account_type} onChange={set("account_type")}
                className="w-full h-11 rounded-[10px] border-0 bg-[#e5e7eb] px-3 text-sm text-slate-700 appearance-none cursor-pointer focus:outline-none focus:ring-[3px] focus:ring-[rgba(56,217,245,0.12)]"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='7' viewBox='0 0 12 7'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%2394a3b8' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E")`,
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "right 14px center",
                  paddingRight: "36px",
                }}
              >
                {ACCOUNT_TYPES.map(a => <option key={a.value} value={a.value}>{a.label}</option>)}
              </select>
            </Field>
            <Field label="Preferred Currency">
              <select
                value={form.currency} onChange={set("currency")}
                className="w-full h-11 rounded-[10px] border-0 bg-[#e5e7eb] px-3 text-sm text-slate-700 appearance-none cursor-pointer focus:outline-none focus:ring-[3px] focus:ring-[rgba(56,217,245,0.12)]"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='7' viewBox='0 0 12 7'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%2394a3b8' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E")`,
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "right 14px center",
                  paddingRight: "36px",
                }}
              >
                {CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.code} — {c.name} ({c.country})</option>)}
              </select>
            </Field>

            {/* Password fields */}
            <Field label="Password">
              <Input
                type="password" value={form.password} onChange={set("password")} required
                placeholder="••••••••"
                className="h-11 rounded-[10px] border-[1.5px] border-slate-200 bg-[#f8fafc] text-slate-900 placeholder:text-slate-300 focus:border-[#38d9f5] focus:ring-[3px] focus:ring-[rgba(56,217,245,0.12)] focus-visible:ring-[rgba(56,217,245,0.12)] focus-visible:border-[#38d9f5]"
              />
            </Field>
            <Field label="Confirm Password">
              <Input
                type="password" value={form.confirm} onChange={set("confirm")} required
                placeholder="••••••••"
                className="h-11 rounded-[10px] border-[1.5px] border-slate-200 bg-[#f8fafc] text-slate-900 placeholder:text-slate-300 focus:border-[#38d9f5] focus:ring-[3px] focus:ring-[rgba(56,217,245,0.12)] focus-visible:ring-[rgba(56,217,245,0.12)] focus-visible:border-[#38d9f5]"
              />
            </Field>

            {/* Divider */}
            <div className="sm:col-span-2 h-px bg-slate-100" />

            {/* Terms */}
            <div className="sm:col-span-2 flex items-center gap-2 text-sm">
              <Checkbox id="tos" defaultChecked />
              <label htmlFor="tos" className="text-slate-500">
                I agree to the <a className="font-medium" style={{ color: "#1ab8d8" }}>Terms &amp; Conditions</a>
              </label>
            </div>

            {/* CTA */}
            <Button
              type="submit" disabled={loading}
              className="sm:col-span-2 w-full h-12 rounded-xl text-[15px] font-semibold border-0"
              style={{
                background: "linear-gradient(135deg, #38d9f5 0%, #1ab8d8 100%)",
                color: "#172640",
                boxShadow: "0 4px 16px rgba(56,217,245,0.32)",
              }}
            >
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

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="space-y-1.5">
    <Label className="text-xs font-medium text-slate-500">{label}</Label>
    {children}
  </div>
);

export default Signup;
