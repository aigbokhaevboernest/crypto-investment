import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ArrowLeft, HandCoins, TrendingUp, UserCog } from "lucide-react";

const LEVELS = ["basic", "veteran", "ultimate", "master", "diamond"] as const;

type Profile = any;

const AdminUserEdit = () => {
  const { id } = useParams();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [managers, setManagers] = useState<Profile[]>([]);
  const [fundAmount, setFundAmount] = useState(0);
  const [fundType, setFundType] = useState<"add" | "subtract">("add");
  const [fundNote, setFundNote] = useState("");
  const [tradeAmount, setTradeAmount] = useState(0);
  const [tradeNote, setTradeNote] = useState("");
  const [authCode, setAuthCode] = useState("");
  const [taxCode, setTaxCode] = useState("");
  const [withStatus, setWithStatus] = useState("active");
  const [withMsg, setWithMsg] = useState("");
  const [managerId, setManagerId] = useState<string>("");

  const load = async () => {
    if (!id) return;
    const { data } = await supabase.from("profiles").select("*").eq("id", id).maybeSingle();
    if (data) {
      setProfile(data);
      setAuthCode((data as any).authorization_code ?? "");
      setTaxCode((data as any).tax_code ?? "");
      setWithStatus((data as any).withdrawal_status ?? "active");
      setWithMsg((data as any).withdrawal_message ?? "");
      setManagerId((data as any).manager_id ?? "");
    }
    const { data: mgrs } = await supabase.from("profiles").select("id, full_name, email").limit(50);
    setManagers((mgrs ?? []) as any);
  };
  useEffect(() => { load(); }, [id]);

  if (!profile) return <p>Loading...</p>;

  const adjustFund = async () => {
    if (!fundAmount) return toast.error("Enter amount");
    const delta = fundType === "add" ? fundAmount : -fundAmount;
    const newBal = Math.max(0, Number(profile.balance ?? 0) + delta);
    const { error } = await supabase.from("profiles").update({ balance: newBal }).eq("id", profile.id);
    if (error) return toast.error(error.message);
    await supabase.from("balance_adjustments").insert({ user_id: profile.id, amount: delta, type: fundType, note: fundNote });
    toast.success("Balance updated"); setFundAmount(0); setFundNote(""); load();
  };

  const tradeTopup = async () => {
    if (!tradeAmount) return toast.error("Enter amount");
    const newProfit = Number(profile.profit ?? 0) + Number(tradeAmount);
    const { error } = await supabase.from("profiles").update({ profit: newProfit }).eq("id", profile.id);
    if (error) return toast.error(error.message);
    await supabase.from("trade_topups").insert({ user_id: profile.id, amount: tradeAmount, note: tradeNote });
    toast.success("Trade top-up applied"); setTradeAmount(0); setTradeNote(""); load();
  };

  const saveCodes = async () => {
    const { error } = await supabase.from("profiles").update({
      authorization_code: authCode, tax_code: taxCode,
    } as any).eq("id", profile.id);
    if (error) return toast.error(error.message);
    toast.success("Codes updated");
  };

  const saveWithdrawal = async () => {
    const { error } = await supabase.from("profiles").update({
      withdrawal_status: withStatus, withdrawal_message: withMsg,
    } as any).eq("id", profile.id);
    if (error) return toast.error(error.message);
    toast.success("Withdrawal settings saved");
  };

  const saveManager = async () => {
    const { error } = await supabase.from("profiles").update({ manager_id: managerId || null } as any).eq("id", profile.id);
    if (error) return toast.error(error.message);
    toast.success("Manager assigned");
  };

  const saveLevel = async (level: string) => {
    const { error } = await supabase.from("profiles").update({ account_level: level as any }).eq("id", profile.id);
    if (error) return toast.error(error.message);
    toast.success("Level updated"); load();
  };

  return (
    <div className="space-y-5 max-w-4xl">
      <Link to="/admin/users"><Button variant="ghost" size="sm"><ArrowLeft className="h-4 w-4 mr-1" />Back to users</Button></Link>
      <Card className="p-5">
        <div className="flex flex-wrap justify-between gap-2">
          <div>
            <h1 className="text-2xl font-black">{profile.full_name}</h1>
            <p className="text-sm text-muted-foreground">@{profile.username} • {profile.email}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground uppercase">Balance</p>
            <p className="text-2xl font-black text-gold">${Number(profile.balance ?? 0).toLocaleString()}</p>
          </div>
        </div>
      </Card>

      <Card className="p-5">
        <h2 className="font-bold mb-3 flex items-center gap-2"><HandCoins className="h-4 w-4 text-gold" />Add / Subtract Fund</h2>
        <div className="grid sm:grid-cols-3 gap-3">
          <div>
            <Label>Type</Label>
            <select className="w-full h-10 rounded-md border border-input bg-background px-2 text-sm" value={fundType} onChange={e => setFundType(e.target.value as any)}>
              <option value="add">Add</option><option value="subtract">Subtract</option>
            </select>
          </div>
          <div><Label>Amount</Label><Input type="number" value={fundAmount} onChange={e => setFundAmount(Number(e.target.value))} /></div>
          <div><Label>Note</Label><Input value={fundNote} onChange={e => setFundNote(e.target.value)} /></div>
        </div>
        <Button variant="gold" className="mt-3" onClick={adjustFund}>Apply</Button>
      </Card>

      <Card className="p-5">
        <h2 className="font-bold mb-3 flex items-center gap-2"><TrendingUp className="h-4 w-4 text-gold" />Trade Topup (adds to profit)</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          <div><Label>Amount</Label><Input type="number" value={tradeAmount} onChange={e => setTradeAmount(Number(e.target.value))} /></div>
          <div><Label>Note</Label><Input value={tradeNote} onChange={e => setTradeNote(e.target.value)} /></div>
        </div>
        <Button variant="gold" className="mt-3" onClick={tradeTopup}>Apply</Button>
      </Card>

      <Card className="p-5">
        <h2 className="font-bold mb-3">Authorization & Tax Codes</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          <div><Label>Authorization Code</Label><Input value={authCode} onChange={e => setAuthCode(e.target.value)} /></div>
          <div><Label>Tax Code</Label><Input value={taxCode} onChange={e => setTaxCode(e.target.value)} /></div>
        </div>
        <Button variant="gold" className="mt-3" onClick={saveCodes}>Save Codes</Button>
      </Card>

      <Card className="p-5">
        <h2 className="font-bold mb-3">Account Level</h2>
        <div className="flex flex-wrap gap-2">
          {LEVELS.map(l => (
            <Button key={l} size="sm" variant={profile.account_level === l ? "gold" : "outline"} onClick={() => saveLevel(l)}>{l}</Button>
          ))}
        </div>
      </Card>

      <Card className="p-5">
        <h2 className="font-bold mb-3 flex items-center gap-2"><UserCog className="h-4 w-4 text-gold" />Assign Manager</h2>
        <select className="w-full h-10 rounded-md border border-input bg-background px-2 text-sm" value={managerId} onChange={e => setManagerId(e.target.value)}>
          <option value="">— Select an Account Manager —</option>
          {managers.filter(m => m.id !== profile.id).map(m => (
            <option key={m.id} value={m.id}>{m.full_name} ({m.email})</option>
          ))}
        </select>
        <Button variant="gold" className="mt-3" onClick={saveManager}>Change Account Manager</Button>
      </Card>

      <Card className="p-5">
        <h2 className="font-bold mb-3">Change Withdrawal Status / Message</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <Label>Status</Label>
            <select className="w-full h-10 rounded-md border border-input bg-background px-2 text-sm" value={withStatus} onChange={e => setWithStatus(e.target.value)}>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
              <option value="pending_code">Requires Code</option>
            </select>
          </div>
          <div className="sm:col-span-2"><Label>Message shown to user</Label><Textarea rows={2} value={withMsg} onChange={e => setWithMsg(e.target.value)} /></div>
        </div>
        <Button variant="gold" className="mt-3" onClick={saveWithdrawal}>Save Withdrawal Settings</Button>
      </Card>
    </div>
  );
};
export default AdminUserEdit;