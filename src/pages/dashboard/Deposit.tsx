import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { Copy, Upload, CheckCircle2, Loader2 } from "lucide-react";

const WALLETS = {
  BTC:  { addr: "bc1qktwnakauyewk9s39vk7d0dr6lkmpdn3u94uwcn", color: "#F7931A" },
  ETH:  { addr: "0x018f663B1fD13e45131B0f71CF611CDE980DC618", color: "#627EEA" },
  USDT: { addr: "TEbVanagXRzdnE3NVdnoWKb85XSQNEj9wL",        color: "#26A17B" },
} as const;

type Method = keyof typeof WALLETS;

const Deposit = () => {
  const { user } = useAuth();
  const [method, setMethod] = useState<Method>("BTC");
  const [amount, setAmount] = useState(() => {
    const u = new URLSearchParams(window.location.search);
    return u.get("amount") || "";
  });
  const [proof, setProof] = useState<File | null>(null);
  const [proofPreview, setProofPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onFile = (f: File | null) => {
    if (f && f.size > 5 * 1024 * 1024) { toast.error("File exceeds 5MB"); return; }
    setProof(f);
    if (f && f.type.startsWith("image/")) {
      const r = new FileReader();
      r.onload = () => setProofPreview(r.result as string);
      r.readAsDataURL(f);
    } else {
      setProofPreview(null);
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!proof) return toast.error("Please upload proof of payment");
    setLoading(true);
    const { error } = await supabase.from("transactions").insert({
      user_id: user.id,
      type: "deposit",
      amount: parseFloat(amount),
      method,
      wallet_address: WALLETS[method].addr,
      proof_url: proofPreview ?? proof.name,
      status: "pending",
    } as never);
    setLoading(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Deposit submitted. Awaiting confirmation.");
    setAmount(""); setProof(null); setProofPreview(null);
  };

  const qr = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${WALLETS[method].addr}`;

  return (
    <div className="max-w-lg">
      <h1 className="text-xl font-black mb-0.5 text-white">Deposit Funds</h1>
      <p className="text-xs text-white/60 mb-4">
        Send crypto to the address below, then submit proof of payment.
      </p>

      <Card className="p-4 pb-10 space-y-4">
        <div className="grid grid-cols-3 gap-2">
          {(Object.keys(WALLETS) as Method[]).map((m) => {
            const active = method === m;
            return (
              <button
                key={m}
                type="button"
                onClick={() => setMethod(m)}
                className="rounded-md border py-1.5 text-xs font-bold transition"
                style={{
                  borderColor: active ? WALLETS[m].color : "rgba(255,255,255,0.12)",
                  backgroundColor: active ? `${WALLETS[m].color}22` : "transparent",
                  color: active ? WALLETS[m].color : "rgba(255,255,255,0.5)",
                }}
              >
                {m}
              </button>
            );
          })}
        </div>

        <div className="flex flex-col items-center gap-3 p-4 rounded-lg bg-muted/30">
          <img src={qr} alt={`${method} QR`} className="rounded-lg bg-white p-2" width={200} height={200} />
          <div className="w-full">
            <p className="text-[10px] text-muted-foreground mb-1 uppercase tracking-wider">
              {method} Wallet Address
            </p>
            <div className="flex gap-1.5">
              <Input readOnly value={WALLETS[method].addr} className="font-mono text-[10px] h-8 truncate" />
              <Button type="button" variant="outline" size="icon" className="h-8 w-8 shrink-0"
                onClick={() => { navigator.clipboard.writeText(WALLETS[method].addr); toast.success("Copied"); }}>
                <Copy className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </div>

        <form onSubmit={submit} className="space-y-3">
          <div className="space-y-1">
            <Label className="text-xs">Amount</Label>
            <Input type="number" min="1" step="0.01" value={amount}
              onChange={(e) => setAmount(e.target.value)} required className="h-9 text-sm" placeholder="0.00" />
          </div>

          <div className="space-y-1">
            <Label className="text-xs">Proof of Payment</Label>
            <label className="flex items-center gap-2 cursor-pointer border border-dashed border-border rounded-lg px-3 py-2.5 text-xs hover:border-primary/50 transition">
              {proof ? (
                <>
                  <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                  <span className="truncate text-primary">{proof.name}</span>
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="text-muted-foreground">Click to upload — JPG / PNG / PDF, max 5 MB</span>
                </>
              )}
              <input type="file" accept="image/*,application/pdf" className="hidden"
                onChange={(e) => onFile(e.target.files?.[0] ?? null)} />
            </label>
            {proofPreview && (
              <img src={proofPreview} alt="proof preview" className="mt-1.5 max-h-20 rounded-md border border-border object-contain" />
            )}
          </div>

          <Button variant="gold" type="submit" disabled={loading} className="w-full h-9 text-sm">
            {loading && <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />}
            {loading ? "Submitting…" : "Confirm Deposit"}
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default Deposit;
