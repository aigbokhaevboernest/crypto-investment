import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Sparkles } from "lucide-react";
import { PLANS } from "@/lib/constants";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

const Plans = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [level, setLevel] = useState<string>("basic");
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("account_level, total_balance").eq("id", user.id).maybeSingle()
      .then(({ data }) => {
        if (data) { setLevel(data.account_level || "basic"); setBalance(Number(data.total_balance) || 0); }
      });
  }, [user]);

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
                onClick={() => navigate("/dashboard/deposit")}
              >
                Buy Plan
              </Button>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
export default Plans;
