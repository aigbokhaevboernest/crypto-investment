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

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-12"
      style={{ backgroundColor: "#172640" }}
    >
      <div className="w-full max-w-md">
        <Link to="/" className="flex flex-col items-center gap-2 mb-6">
          <div className="h-12 w-12 rounded-xl bg-primary flex items-center justify-center font-black text-black text-xl">C</div>
          <span className="font-bold text-lg text-white">CryptoVault</span>
        </Link>

        <div className="rounded-2xl border border-slate-200 bg-white shadow-xl overflow-hidden">
          <div className="bg-primary text-black px-6 py-8 text-center">
            <h1 className="text-2xl font-black">Welcome back</h1>
            <p className="text-sm opacity-90 mt-1">Sign in with your username.</p>
          </div>

          <form onSubmit={submit} className="p-6 md:p-8 space-y-5">
            <div className="space-y-1.5">
              <Label className="text-slate-700">Username</Label>
              <Input
                value={identifier}
                onChange={e => setIdentifier(e.target.value)}
                required
                className="bg-white border-slate-300 text-slate-900"
                placeholder="yourusername"
              />
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label className="text-slate-700">Password</Label>
                <button type="button" onClick={() => setShowForgot(true)} className="text-sm font-medium text-primary hover:underline">
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Input
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  className="bg-white border-slate-300 text-slate-900 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(s => !s)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-500 hover:text-slate-800"
                  aria-label={showPw ? "Hide password" : "Show password"}
                >
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <label className="flex items-center gap-2 text-sm text-slate-600">
              <Checkbox defaultChecked /> Remember me
            </label>
            <Button type="submit" disabled={loading} className="w-full">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <p className="text-sm text-center text-slate-600 pb-6">
            New here? <Link to="/signup" className="text-primary font-semibold">Create an account</Link>
          </p>
        </div>
      </div>
      <ForgotPasswordModal open={showForgot} onOpenChange={setShowForgot} />
      <LiveEarningsPopup />
    </div>
  );
};

export default Login;
