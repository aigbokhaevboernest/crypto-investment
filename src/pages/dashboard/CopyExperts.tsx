import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Users, TrendingUp, Award, Check, BadgeCheck, Loader2 } from "lucide-react";

type Expert = {
  id: string;
  name: string;
  handle: string | null;
  specialty: string | null;
  avatar_url: string | null;
  win_rate: number | null;
  total_profit_usd: number | null;
  followers: number | null;
  min_copy_amount: number | null;
};

const PLAN_OPTIONS = [
  { amount: 1500,  label: "Regular Plan" },
  { amount: 3800,  label: "Silver Plan" },
  { amount: 5000,  label: "Refined" },
  { amount: 9500,  label: "Advanced" },
  { amount: 12600, label: "Premium" },
  { amount: 15900, label: "Superior" },
  { amount: 21300, label: "Elite" },
  { amount: 26800, label: "Ultra" },
  { amount: 31500, label: "Deluxe" },
  { amount: 38950, label: "VIP" },
  { amount: 47200, label: "Ultimate" },
];

const fmt = (n: number | null | undefined) =>
  `$${(Number(n) || 0).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

const initialsOf = (name: string) =>
  name.split(" ").map((s) => s[0]).join("").slice(0, 2).toUpperCase();

const CopyExperts = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [experts, setExperts] = useState<Expert[]>([]);
  const [copyingIds, setCopyingIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [modalExpert, setModalExpert] = useState<Expert | null>(null);
  const [planAmount, setPlanAmount] = useState<string>("");
  const [recurring, setRecurring] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const [{ data: list }, ueRes] = await Promise.all([
        supabase.from("expert_traders").select("*").eq("is_active", true).order("sort_order"),
        user
          ? supabase.from("user_experts").select("expert_id, is_copying").eq("user_id", user.id).eq("is_copying", true)
          : Promise.resolve({ data: null }),
      ]);

      setExperts((list as Expert[] | null) ?? []);
      const ids = new Set<string>(
        ((ueRes?.data as { expert_id: string }[] | null) ?? []).map((r) => String(r.expert_id))
      );
      setCopyingIds(ids);
      setLoading(false);
    };
    load();
  }, [user?.id]);

  const openModal = (e: Expert) => {
    setModalExpert(e);
    setPlanAmount("");
    setRecurring(false);
  };

  const completeSubscription = async () => {
    if (!user || !modalExpert) return;
    const amt = Number(planAmount);
    if (!amt) { toast.warning("Please choose a plan amount"); return; }

    setSubmitting(true);

    const selected = PLAN_OPTIONS.find((p) => p.amount === amt);
    const [{ error: csErr }, { error: ueErr }] = await Promise.all([
      supabase.from("copy_subscriptions").insert({
        user_id: user.id,
        trader_id: modalExpert.id,
        status: "active",
        plan_amount: amt,
        plan_name: selected?.label ?? null,
        recurring_monthly: recurring,
      } as never),
      supabase.from("user_experts").insert({
        user_id: user.id,
        expert_id: modalExpert.id as unknown as never,
        is_copying: true,
        deposit_confirmed: false,
      } as never),
    ]);

    setSubmitting(false);
    if (csErr || ueErr) {
      toast.error(csErr?.message ?? ueErr?.message ?? "Failed to subscribe");
      return;
    }

    toast.success(`Subscribed to ${modalExpert.name}`);
    setModalExpert(null);
    navigate(`/dashboard/deposit?amount=${amt}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white mb-1">Copy Experts</h1>
        <p className="text-sm text-muted-foreground">Browse our verified experts and start copying their trades.</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {experts.map((e) => {
          const isCopying = copyingIds.has(e.id);
          return (
            <Card key={e.id} className={`p-5 flex flex-col ${isCopying ? "border-emerald-500/40" : "border-border"}`}>
              <div className="flex items-center gap-3 mb-4">
                {e.avatar_url ? (
                  <img src={e.avatar_url} alt={e.name} className="w-12 h-12 rounded-full object-cover shrink-0" />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-red-600 flex items-center justify-center text-white font-black text-base shrink-0">
                    {initialsOf(e.name)}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <p className="font-bold text-[15px] text-white truncate">{e.name}</p>
                    <BadgeCheck className="w-4 h-4 text-sky-400 shrink-0" />
                  </div>
                  <p className="text-[11px] text-muted-foreground truncate">{e.handle}</p>
                  {e.specialty && <p className="text-[11px] text-red-400 truncate">{e.specialty}</p>}
                </div>
              </div>

              {isCopying && (
                <div className="mb-3 inline-flex items-center gap-1.5 self-start rounded-full bg-emerald-900/60 text-emerald-300 border border-emerald-500/30 px-2.5 py-1 text-[11px] font-semibold">
                  <Check className="w-3 h-3" /> You are copying {e.name}
                </div>
              )}

              <div className="grid grid-cols-3 gap-2 mb-3">
                <StatBox icon={Award}      label="Win"     value={`${e.win_rate ?? 0}%`} />
                <StatBox icon={TrendingUp} label="Profit"  value={fmt(e.total_profit_usd)} />
                <StatBox icon={Users}      label="Copiers" value={(e.followers ?? 0).toLocaleString()} />
              </div>

              <p className="text-[11px] text-muted-foreground mb-4">
                Min copy: <span className="text-white font-semibold">{fmt(e.min_copy_amount)}</span>
              </p>

              <Button
                variant={isCopying ? "outlineGold" : "gold"}
                className="mt-auto w-full"
                onClick={() => openModal(e)}
              >
                <TrendingUp className="h-4 w-4" />
                {isCopying ? "Adjust Subscription" : "Copy Expert"}
              </Button>
            </Card>
          );
        })}
      </div>

      {/* Subscription modal — white theme */}
      <Dialog open={!!modalExpert} onOpenChange={(o) => !o && setModalExpert(null)}>
        <DialogContent className="bg-white text-slate-900 rounded-2xl border-0 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-slate-900">
              Subscribe to {modalExpert?.name}
            </DialogTitle>
            <DialogDescription className="text-slate-500">
              Subscribe Amount and Plan
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-slate-700 text-sm">Plan</Label>
              <select
                value={planAmount}
                onChange={(e) => setPlanAmount(e.target.value)}
                className="w-full h-11 rounded-xl border border-slate-300 bg-white text-slate-900 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#00D4FF]"
              >
                <option value="">— Choose Plan Amount —</option>
                {PLAN_OPTIONS.map((p) => (
                  <option key={p.amount} value={p.amount}>
                    ${p.amount.toLocaleString()} – {p.label}
                  </option>
                ))}
              </select>
            </div>

            <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
              <Checkbox
                checked={recurring}
                onCheckedChange={(c) => setRecurring(!!c)}
              />
              Recurring Monthly
            </label>
          </div>

          <DialogFooter className="flex-row gap-2 sm:gap-2">
            <Button
              variant="outline"
              onClick={() => setModalExpert(null)}
              className="flex-1 border-slate-300 text-slate-700 hover:bg-slate-100"
            >
              Cancel
            </Button>
            <Button
              onClick={completeSubscription}
              disabled={submitting}
              className="flex-1 bg-[#00D4FF] hover:bg-[#00B8E0] text-white"
            >
              {submitting && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              Complete Subscription
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const StatBox = ({ icon: Icon, label, value }: { icon: typeof TrendingUp; label: string; value: string }) => (
  <div className="rounded-lg bg-muted/40 p-2.5">
    <p className="text-[9px] uppercase tracking-wider text-muted-foreground flex items-center gap-1 mb-0.5">
      <Icon className="w-2.5 h-2.5" /> {label}
    </p>
    <p className="font-bold text-[12px] truncate text-white">{value}</p>
  </div>
);

export default CopyExperts;
