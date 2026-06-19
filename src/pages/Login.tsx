import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { ForgotPasswordModal } from "@/components/ForgotPasswordModal";
import { LiveEarningsPopup } from "@/components/LiveEarningsPopup";

const Login = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showForgot, setShowForgot] = useState(false);
  const [showPw, setShowPw] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    let email = identifier.trim();
    if (!email.includes("@")) {
      const { data } = await supabase.rpc("get_email_by_username", { _username: email });
      if (!data) { setLoading(false); toast.error("User not found"); return; }
      email = data as string;
    }
    const { data: signed, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) { setLoading(false); toast.error(error.message); return; }

    if (signed.user?.id) {
      const { data: prof } = await supabase
        .from("profiles").select("status").eq("user_id", signed.user.id).maybeSingle();
      if (prof?.status === "blocked") {
        await supabase.auth.signOut();
        setLoading(false);
        toast.error("Account blocked. Contact support");
        return;
      }
    }

    setLoading(false);
    toast.success("Welcome back!");
    navigate("/dashboard");
  };

  const inputClass =
    "h-11 rounded-[10px] border-[1.5px] border-slate-200 bg-[#f8fafc] text-slate-900 placeholder:text-slate-300 focus:border-[#38d9f5] focus:ring-[3px] focus:ring-[rgba(56,217,245,0.12)] focus-visible:ring-[rgba(56,217,245,0.12)] focus-visible:border-[#38d9f5]";

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-12"
      style={{ backgroundColor: "#172640" }}
    >
      <div className="w-full max-w-md">
        {/* Logo — untouched */}
        <Link to="/" className="flex flex-col items-center gap-2 mb-6">
          <div className="h-12 w-12 rounded-xl bg-primary flex items-center justify-center font-black text-black text-xl">C</div>
          <span className="font-bold text-lg text-white">CryptoVault</span>
        </Link>

        <div className="rounded-2xl overflow-hidden" style={{ boxShadow: "0 24px 60px rgba(0,0,0,0.45)" }}>
          {/* Header — dark navy, no cyan clash */}
          <div
            className="px-6 py-8 text-center"
            style={{
              background: "linear-gradient(160deg, #1c2e4a 0%, #405994 100%)",
              borderBottom: "1px solid rgba(56,217,245,0.12)",
            }}
          >
            <h1 className="text-2xl font-black text-white">Welcome back</h1>
            <p className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.5)" }}>
              Sign in with your username.
            </p>
          </div>

          {/* Form body */}
          <form onSubmit={submit} className="p-6 md:p-8 space-y-5 bg-white">
            {/* Username */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-slate-500">Username</Label>
              <Input
                value={identifier}
                onChange={e => setIdentifier(e.target.value)}
                required
                placeholder="yourusername"
                className={inputClass}
              />
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-medium text-slate-500">Password</Label>
                <button
                  type="button"
                  onClick={() => setShowForgot(true)}
                  className="text-xs font-medium hover:underline"
                  style={{ color: "#1ab8d8" }}
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Input
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className={`${inputClass} pr-10`}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  aria-label={showPw ? "Hide password" : "Show password"}
                >
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Divider */}
            <div className="h-px bg-slate-100" />

            {/* Remember me */}
            <label className="flex items-center gap-2 text-sm text-slate-500 cursor-pointer">
              <Checkbox defaultChecked /> Remember me
            </label>

            {/* CTA */}
            <Button
              type="submit" disabled={loading}
              className="w-full h-12 rounded-xl text-[15px] font-semibold border-0"
              style={{
                background: "linear-gradient(135deg, #38d9f5 0%, #1ab8d8 100%)",
                color: "#172640",
                boxShadow: "0 4px 16px rgba(56,217,245,0.32)",
              }}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <p className="text-sm text-center text-slate-400 pb-6 bg-white">
            New here?{" "}
            <Link to="/signup" className="font-semibold" style={{ color: "#1ab8d8" }}>
              Create an account
            </Link>
          </p>
        </div>
      </div>

      <ForgotPasswordModal open={showForgot} onOpenChange={setShowForgot} />
      <LiveEarningsPopup />
    </div>
  );
};

export default Login;
