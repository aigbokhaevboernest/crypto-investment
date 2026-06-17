import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TRADERS } from "@/lib/constants";
import { Users, TrendingUp, Zap } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const CopyExperts = () => {
  const [copied, setCopied] = useState<string | null>(null);
  return (
    <div>
      <h1 className="text-2xl font-black mb-1">Copy Expert Traders</h1>
      <p className="text-sm text-muted-foreground mb-6">Mirror the trades of top performers.</p>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {TRADERS.map(t => (
          <Card key={t.name} className={`p-5 transition ${copied === t.name ? "border-gold animate-pulse-glow" : ""}`}>
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-gold-gradient flex items-center justify-center text-midnight font-black">{t.avatar}</div>
              <div>
                <div className="font-bold">{t.name}</div>
                <div className="text-xs text-muted-foreground flex items-center gap-1"><Users className="h-3 w-3" /> {t.followers.toLocaleString()}</div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-4">
              <div className="rounded-lg bg-muted/40 p-3"><div className="text-xs text-muted-foreground">ROI</div><div className="font-bold text-success">+{t.roi}%</div></div>
              <div className="rounded-lg bg-muted/40 p-3"><div className="text-xs text-muted-foreground">Win Rate</div><div className="font-bold">{t.winRate}%</div></div>
            </div>
            {copied === t.name && (
              <div className="mt-3 flex items-center gap-1.5 text-xs text-gold font-bold"><Zap className="h-3 w-3" /> SIGNAL ACTIVE — copying trades</div>
            )}
            <Button variant={copied === t.name ? "outlineGold" : "gold"} className="w-full mt-4"
              onClick={() => { setCopied(t.name); toast.success(`Now copying ${t.name}`); }}>
              <TrendingUp className="h-4 w-4" /> {copied === t.name ? "Copying" : "Copy Trade"}
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
};
export default CopyExperts;
