import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Users, TrendingUp, Award, Check, BadgeCheck, Loader2 } from "lucide-react";

// ─── Hardcoded fallback experts (kept as-is) ───────────────────────────────
const HARDCODED_EXPERTS = [
  { id: "hc-1", name: "Alex Petrov",  handle: "@alexp",   specialty: "Forex & Crypto", avatar_url: null, initials: "AP", win_rate: 87, total_profit_usd: 142000, followers: 3821, min_copy_amount: 500 },
  { id: "hc-2", name: "Sofia Chen",   handle: "@sofiac",  specialty: "Stocks & ETFs",  avatar_url: null, initials: "SC", win_rate: 82, total_profit_usd: 98500,  followers: 2190, min_copy_amount: 300 },
  { id: "hc-3", name: "Marcus Bell",  handle: "@marcusb", specialty: "Commodities",    avatar_url: null, initials: "MB", win_rate: 79, total_profit_usd: 74200,  followers: 1540, min_copy_amount: 250 },
  { id: "hc-4", name: "Yuki Tanaka",  handle: "@yukit",   specialty: "Indices & FX",   avatar_url: null, initials: "YT", win_rate: 76, total_profit_usd: 61000,  followers: 1102, min_copy_amount: 200 },
];

interface DBExpert {
  id: string;
  name: string;
  handle: string;
  avatar_url: string | null;
  bio: string | null;
  specialty: string | null;
  win_rate: number;
  total_profit_usd: number;
  followers: number;
  min_copy_amount: number;
}

interface Expert {
  id: string;
  name: string;
  handle: string;
  avatar_url: string | null;
  initials: string;
  specialty: string | null;
  win_rate: number;
  total_profit_usd: number;
  followers: number;
  min_copy_amount: number;
}

const fmt = (n: number) =>
  `$${(n || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const initials = (name: string) =>
  name.split(" ").map((s) => s[0]).join("").slice(0, 2).toUpperCase();

const CopyExperts = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [experts, setExperts] = useState<Expert[]>([]);
  const [assignedId, setAssignedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);

      // Fetch DB experts + assigned expert id in parallel
      const [{ data: dbList }, profRes] = await Promise.all([
        supabase
          .from("expert_traders")
          .select("*")
          .eq("is_active", true)
          .order("sort_order"),
        user
          ? supabase
              .from("profiles")
              .select("assigned_expert_id")
              .eq("id", user.id)
              .maybeSingle()
          : Promise.resolve({ data: null }),
      ]);

      // Merge: DB experts first, then hardcoded ones not already in DB by name
      const dbExperts: Expert[] = ((dbList as DBExpert[] | null) ?? []).map((e) => ({
        ...e,
        initials: initials(e.name),
      }));

      const dbNames = new Set(dbExperts.map((e) => e.name.toLowerCase()));
      const fallbacks = HARDCODED_EXPERTS.filter(
        (h) => !dbNames.has(h.name.toLowerCase())
      );

      setExperts([...dbExperts, ...fallbacks]);
      setAssignedId(
        (profRes?.data as { assigned_expert_id: string | null } | null)
          ?.assigned_expert_id ?? null
      );
      setLoading(false);
    };

    load();
  }, [user?.id]);

  const handleCopy = (e: Expert) => {
    const ok = window.confirm(
      `To copy this expert requires a minimum of ${fmt(e.min_copy_amount)}. Do you wish to proceed?`
    );
    if (ok) navigate("/dashboard/deposit");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-6 h-6 animate-spin text-gold" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white mb-1">Copy Expert Traders</h1>
        <p className="text-sm text-muted-foreground">Mirror the trades of top verified performers.</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {experts.map((e) => {
          const isAssigned = assignedId === e.id;
          return (
            <Card
              key={e.id}
              className={`p-5 flex flex-col transition-all duration-200 ${
                isAssigned ? "border-gold/60 shadow-[0_0_0_1px_rgba(255,200,0,0.3)]" : "border-border"
              }`}
            >
              {/* Header: avatar + name + badge */}
              <div className="flex items-center gap-3 mb-4">
                {e.avatar_url ? (
                  <img
                    src={e.avatar_url}
                    alt={e.name}
                    className="w-12 h-12 rounded-full object-cover shrink-0"
                    onError={(ev) => {
                      (ev.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gold-gradient flex items-center justify-center text-midnight font-black text-base shrink-0">
                    {e.initials}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <p className="font-bold text-[15px] text-white truncate">{e.name}</p>
                    {/* Verified badge on every expert */}
                    <BadgeCheck className="w-4 h-4 text-sky-400 shrink-0" title="Verified expert" />
                  </div>
                  <p className="text-[11px] text-muted-foreground truncate">{e.handle}</p>
                  {e.specialty && (
                    <p className="text-[11px] text-gold truncate">{e.specialty}</p>
                  )}
                </div>
              </div>

              {/* "You are copying" badge */}
              {isAssigned && (
                <div className="mb-3 inline-flex items-center gap-1.5 self-start rounded-full bg-emerald-900/80 text-emerald-300 border border-emerald-500/30 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide">
                  <Check className="w-3 h-3" /> You are copying {e.name}
                </div>
              )}

              {/* Stats row */}
              <div className="grid grid-cols-3 gap-2 mb-3">
                <StatBox icon={Award} label="Win" value={`${e.win_rate ?? 0}%`} />
                <StatBox icon={TrendingUp} label="Profit" value={fmt(e.total_profit_usd ?? 0)} />
                <StatBox icon={Users} label="Copiers" value={(e.followers ?? 0).toLocaleString()} />
              </div>

              {/* Min copy */}
              <p className="text-[11px] text-muted-foreground mb-4">
                Min copy:{" "}
                <span className="text-white font-semibold">{fmt(e.min_copy_amount ?? 0)}</span>
              </p>

              {/* CTA */}
              <Button
                variant={isAssigned ? "outlineGold" : "gold"}
                className="mt-auto w-full"
                onClick={() => handleCopy(e)}
              >
                <TrendingUp className="h-4 w-4" />
                {isAssigned ? "Copying" : "Copy Expert"}
              </Button>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

const StatBox = ({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof TrendingUp;
  label: string;
  value: string;
}) => (
  <div className="rounded-lg bg-muted/40 p-2.5">
    <p className="text-[9px] uppercase tracking-wider text-muted-foreground flex items-center gap-1 mb-0.5">
      <Icon className="w-2.5 h-2.5" /> {label}
    </p>
    <p className="font-bold text-[12px] truncate text-white">{value}</p>
  </div>
);

export default CopyExperts;
