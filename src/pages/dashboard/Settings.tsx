import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { COUNTRIES } from "@/lib/constants";
import { CURRENCIES } from "@/lib/currencies";

const Settings = () => {
  const { user } = useAuth();
  const [form, setForm] = useState({ full_name: "", username: "", phone: "", country: "", currency: "USD" });
  const [pwd, setPwd] = useState({ next: "", confirm: "" });
  const [loading, setLoading] = useState(false);
  const [pwdLoading, setPwdLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("full_name, username, phone, country, currency").eq("id", user.id).maybeSingle()
      .then(({ data }) => data && setForm({
        full_name: data.full_name || "",
        username: data.username || "",
        phone: data.phone || "",
        country: data.country || "",
        currency: data.currency || "USD",
      }));
  }, [user]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    const { error } = await supabase.from("profiles").update(form).eq("id", user.id);
    setLoading(false);
    if (error) toast.error(error.message); else toast.success("Profile updated");
  };

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pwd.next.length < 6) return toast.error("Password must be at least 6 characters");
    if (pwd.next !== pwd.confirm) return toast.error("Passwords do not match");
    setPwdLoading(true);
    const { error } = await supabase.auth.updateUser({ password: pwd.next });
    setPwdLoading(false);
    if (error) toast.error(error.message);
    else { toast.success("Password updated"); setPwd({ next: "", confirm: "" }); }
  };

  return (
    <div className="max-w-xl space-y-6">
      <h1 className="text-2xl font-black text-white">Settings</h1>
      <Card className="p-6">
        <h2 className="font-bold mb-4 text-white">Profile</h2>
        <form onSubmit={save} className="space-y-4">
          <div className="space-y-1.5"><Label>Email</Label>
            <Input value={user?.email || ""} disabled className="opacity-70" />
          </div>
          <div className="space-y-1.5"><Label>Full Name</Label>
            <Input value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })} />
          </div>
          <div className="space-y-1.5"><Label>Username</Label>
            <Input value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} />
          </div>
          <div className="space-y-1.5"><Label>Phone</Label>
            <Input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
          </div>
          <div className="space-y-1.5"><Label>Country</Label>
            <select value={form.country} onChange={e => setForm({ ...form, country: e.target.value })}
              className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm text-white">
              <option value="">Select country</option>
              {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="space-y-1.5"><Label>Preferred Currency</Label>
            <select value={form.currency} onChange={e => setForm({ ...form, currency: e.target.value })}
              className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm text-white">
              {CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.code} — {c.name} ({c.country})</option>)}
            </select>
          </div>
          <Button variant="gold" type="submit" disabled={loading} className="w-full">
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {loading ? "Saving..." : "Save Changes"}
          </Button>
        </form>
      </Card>

      <Card className="p-6">
        <h2 className="font-bold mb-4 text-white">Change Password</h2>
        <form onSubmit={changePassword} className="space-y-4">
          <div className="space-y-1.5"><Label>New Password</Label>
            <Input type="password" value={pwd.next} onChange={e => setPwd({ ...pwd, next: e.target.value })} required />
          </div>
          <div className="space-y-1.5"><Label>Confirm Password</Label>
            <Input type="password" value={pwd.confirm} onChange={e => setPwd({ ...pwd, confirm: e.target.value })} required />
          </div>
          <Button variant="outlineGold" type="submit" disabled={pwdLoading} className="w-full">
            {pwdLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {pwdLoading ? "Updating..." : "Update Password"}
          </Button>
        </form>
      </Card>
    </div>
  );
};
export default Settings;
