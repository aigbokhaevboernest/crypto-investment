import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Check, Sparkles, Loader2 } from "lucide-react";
import { PLANS } from "@/lib/constants";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

const Plans = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [level, setLevel] = useState<string>("basic");
  const [balance, setBalance] = useState(0);
  const [selectedPlan, setSelectedPlan] = useState<(typeof PLANS)[number] | null>(null);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("account_level, total_balance").eq("user_id", user.id).maybeSingle()
      .then(({ data }) => {
        if (data) { setLevel(data.account_level || "basic"); setBalance(Number(data.total_balance) || 0); }
      });
  }, [user]);

  const confirmPlan = async () => {
    if (!selectedPlan || !user) return;
    setSending(true);
    const { error } = await supabase.functions.invoke("send-email", {
      body: {
        to: user.email,
        subject: `You selected the ${selectedPlan.name} plan`,
        message: `You've selected the ${selectedPlan.name} plan (${selectedPlan.roi}% daily, ${selectedPlan.duration} days). Minimum deposit: $${selectedPlan.min.toLocaleString()}. Complete your deposit to activate it.`,
      },
    });
    setSending(false);
    if (error) {
      toast.error("Couldn't send confirmation email, but you can continue.");
    }
    setSelectedPlan(null);
    navigate("/dashboard/deposit");
  };

  return (
    <div>
      <h1 className="text-2xl font-black mb-1 text-white">Trading Plans</h1>
      <p className="text-sm text-white/70 mb-6">
        Current plan: <span className="text-primary font-bold uppercase">{level}</span> · Balance:{" "}
        <span className="font-bold text-white">${balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
      </p>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {PLANS.map((p) => {
          const featured = p.popular;
          return (
            <Card
              key={p.name}
              className="relative p-8 border-0 text-white"
              style={{ backgroundColor: featured ? "#00D4FF" : "#253E60" }}
            >
              {featured && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-white px-3 py-1 text-xs font-bold text-[#172640] flex items-center gap-1">
                  <Sparkles className="h-3 w-3" /> Most Popular
                </div>
              )}
              <h3 className="text-xl font-bold">{p.name}</h3>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-4xl font-black">{p.roi}%</span>
                <span className="opacity-80">/ daily</span>
              </div>
              <p className="text-sm opacity-80 mt-1">for {p.duration} days</p>
              <ul className="mt-6 space-y-3 text-sm">
                {[
                  `Min deposit $${p.min.toLocaleString()}`,
                  "Daily ROI payouts",
                  "24/7 expert support",
                  "Instant withdrawals",
                  "Copy trading access",
                ].map(item => (
                  <li key={item} className="flex gap-2">
                    <Check className="h-4 w-4 mt-0.5" style={{ color: featured ? "#fff" : "#00D4FF" }} /> {item}
                  </li>
                ))}
              </ul>
              <Button
                className={`w-full mt-8 ${featured ? "bg-white text-[#172640] hover:bg-white/90" : "bg-primary text-white hover:bg-[#00B8E0]"}`}
                onClick={() => setSelectedPlan(p)}
              >
                Buy Plan
              </Button>
            </Card>
          );
        })}
      </div>

      <Dialog open={!!selectedPlan} onOpenChange={(o) => !o && setSelectedPlan(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Confirm {selectedPlan?.name} plan</DialogTitle>
            <DialogDescription>
              {selectedPlan?.roi}% daily for {selectedPlan?.duration} days. Minimum deposit ${selectedPlan?.min.toLocaleString()}.
              We'll send a confirmation to {user?.email}, then take you to deposit funds.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setSelectedPlan(null)} disabled={sending}>Cancel</Button>
            <Button onClick={confirmPlan} disabled={sending}>
              {sending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Confirm & Deposit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
export default Plans;
