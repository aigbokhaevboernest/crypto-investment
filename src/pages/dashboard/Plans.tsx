import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Sparkles } from "lucide-react";
import { PLANS } from "@/lib/constants";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

const PLAN_TO_LEVEL: Record<string, "basic" | "veteran" | "ultimate" | "master" | "diamond"> = {
  Basic: "basic",
  Premium: "veteran",
  VIP: "ultimate",
};

const Plans = () => {
  const { user } = useAuth();
  const [level, setLevel] = useState<string>("basic");
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("account_level, balance").eq("id", user.id).maybeSingle()
      .then(({ data }) => {
        if (data) { setLevel(data.account_level || "basic"); setBalance(Number(data.balance) || 0); }
      });
  }, [user]);

  const activate = async (plan: typeof PLANS[number]) => {
    if (!user) return;
    if (balance < plan.min) {
      toast.error(`Minimum $${plan.min.toLocaleString()} balance required. Please deposit first.`);
      return;
    }
    setLoading(plan.name);
    const newLevel = PLAN_TO_LEVEL[plan.name];
    const { error } = await supabase.from("profiles").update({ account_level: newLevel }).eq("id", user.id);
    setLoading(null);
    if (error) { toast.error(error.message); return; }
    setLevel(newLevel);
    toast.success(`${plan.name} plan activated! Daily ROI ${plan.roi}% for ${plan.duration} days.`);
  };

  return (
    <div>
      <h1 className="text-2xl font-black mb-1">Investment Plans</h1>
      <p className="text-sm text-muted-foreground mb-6">
        Current plan: <span className="text-gold font-bold uppercase">{level}</span> · Balance:{" "}
        <span className="font-bold">${balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
      </p>
      <div className="grid md:grid-cols-3 gap-6">
        {PLANS.map((p) => {
          const isActive = PLAN_TO_LEVEL[p.name] === level;
          return (
            <Card key={p.name} className={`relative p-8 ${p.popular ? "border-gold/50 shadow-gold" : "border-border"}`}>
              {p.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gold-gradient px-3 py-1 text-xs font-bold text-midnight flex items-center gap-1">
                  <Sparkles className="h-3 w-3" /> Most Popular
                </div>
              )}
              <h3 className="text-xl font-bold">{p.name}</h3>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-4xl font-black text-gold">{p.roi}%</span>
                <span className="text-muted-foreground">/ daily</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">for {p.duration} days</p>
              <ul className="mt-6 space-y-3 text-sm">
                <li className="flex gap-2"><Check className="h-4 w-4 text-gold mt-0.5" /> Min deposit ${p.min.toLocaleString()}</li>
                <li className="flex gap-2"><Check className="h-4 w-4 text-gold mt-0.5" /> Daily ROI payouts</li>
                <li className="flex gap-2"><Check className="h-4 w-4 text-gold mt-0.5" /> 24/7 expert support</li>
                <li className="flex gap-2"><Check className="h-4 w-4 text-gold mt-0.5" /> Instant withdrawals</li>
                <li className="flex gap-2"><Check className="h-4 w-4 text-gold mt-0.5" /> Copy trading access</li>
              </ul>
              <Button
                variant={isActive ? "outlineGold" : p.popular ? "gold" : "outline"}
                className="w-full mt-8"
                disabled={isActive || loading === p.name}
                onClick={() => activate(p)}
              >
                {isActive ? "Active Plan" : loading === p.name ? "Activating..." : "Activate Plan"}
              </Button>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
export default Plans;