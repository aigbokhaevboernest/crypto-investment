import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { CURRENCIES } from "@/lib/currencies";
import { SuspendedBanner } from "@/components/dashboard/SuspendedBanner";
import { useProfileStatus } from "@/hooks/use-profile-status";
import { AccountLevelCard } from "@/components/dashboard/AccountLevelCard";
import { HARDCODED_EXPERTS } from "@/lib/experts";
import {
  Wallet, TrendingUp, ArrowDownToLine, ArrowUpFromLine, Users, Bitcoin,
  Activity, CheckCircle2, Clock, XCircle, AlertCircle, X,
} from "lucide-react";

type Profile = {
  full_name: string | null;
  total_balance: number | null;
  profit: number | null;
  deposit: number | null;
  withdrawal: number | null;
  account_level: string | null;
  currency: string | null;
  assigned_expert_id: string | null;
};

type Expert = {
  id: string; name: string; handle: string | null; specialty: string | null; avatar_url: string | null;
};

type Tx = {
  id: string; type: string; method: string | null; amount: number; status: string; created_at: string;
};

// Module-level cache — revisits render instantly while we refresh in the background.
const cache: Record<string, { profile: Profile | null; expert: Expert | null; txs: Tx[]; totalWithdrawn: number; copiedCount: number }> = {};

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { suspended } = useProfileStatus();
  const cached = user ? cache[user.id] : undefined;

  const [p, setP] = useState<Profile | null>(cached?.profile ?? null);
  const [loadingProfile, setLoadingProfile] = useState(!cached);
  const [txs, setTxs] = useState<Tx[] | null>(cached?.txs ?? null);
  const [expert, setExpert] = useState<Expert | null>(cached?.expert ?? null);
  const [copiedCount, setCopiedCount] = useState(cached?.copiedCount ?? 0);
  const [totalWithdrawn, setTotalWithdrawn] = useState(cached?.totalWithdrawn ?? 0);
  const [showSignal, setShowSignal] = useState(true);

  const symbol = CURRENCIES.find((c) => c.code === (p?.currency || "USD"))?.symbol ?? "$";
  const fmtBal = (n: number | null | undefined) =>
    `${symbol}${(Number(n) || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const fmtNum = (n: number | null | undefined) =>
    (Number(n) || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    const refreshAll = async () => {
      const { data } = await supabase.from("profiles")
        .select("full_name, total_balance, profit, deposit, withdrawal, account_level, currency, assigned_expert_id")
        .eq("user_id", user.id).maybeSingle();
      if (cancelled) return;
      const profile = (data as unknown as Profile) ?? null;
      setP(profile); setLoadingProfile(false);

      let expertId: string | null = profile?.assigned_expert_id ?? null;
      let ccount = 0;
      if (!expertId) {
        const { data: ue } = await supabase.from("user_experts").select("expert_id").eq("user_id", user.id).eq("is_copying", true);
        const rows = (ue as { expert_id: string }[] | null) ?? [];
        ccount = rows.length;
        expertId = rows[0]?.expert_id ?? null;
      } else {
        ccount = 1;
      }
      if (cancelled) return;
      setCopiedCount(ccount);

      let exp: Expert | null = null;
      if (expertId) {
        const { data: ex } = await supabase.from("expert_traders")
          .select("id, name, handle, specialty, avatar_url").eq("id", expertId).maybeSingle();
        const fallback = HARDCODED_EXPERTS.find((e) => e.id === expertId);
        exp = (ex as Expert | null) ??
          (fallback ? { id: fallback.id, name: fallback.name, handle: fallback.handle, specialty: fallback.specialty, avatar_url: null } : null);
      }
      if (cancelled) return;
      setExpert(exp);

      const { data: txd } = await supabase.from("transactions")
        .select("id, type, method, amount, status, created_at")
        .eq("user_id", user.id).order("created_at", { ascending: false }).limit(20);
      if (cancelled) return;
      const rows = (txd as Tx[] | null) ?? [];
      const totalW = rows.filter((t) => t.type === "withdrawal" && /^approved$/i.test(t.status))
        .reduce((acc, t) => acc + Number(t.amount || 0), 0);
      const txSlice = rows.slice(0, 8);
      setTxs(txSlice);
      setTotalWithdrawn(totalW);

      cache[user.id] = { profile, expert: exp, txs: txSlice, totalWithdrawn: totalW, copiedCount: ccount };
    };

    refreshAll();

    const ch = supabase
      .channel(`dash-${user.id}`)
      .on("postgres_changes",
        { event: "*", schema: "public", table: "profiles", filter: `user_id=eq.${user.id}` },
        () => refreshAll())
      .on("postgres_changes",
        { event: "*", schema: "public", table: "transactions", filter: `user_id=eq.${user.id}` },
        () => refreshAll())
      .subscribe();

    const onVisible = () => { if (document.visibilityState === "visible") refreshAll(); };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      cancelled = true;
      supabase.removeChannel(ch);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [user?.id]);

  const btc = (Number(p?.total_balance) / 67500 || 0).toFixed(8);
  const firstName = (p?.full_name || "").trim().split(" ")[0];
  const showLowSignal = showSignal && !loadingProfile && (Number(p?.deposit) || 0) === 0;
  const initials = (expert?.name || "").split(" ").map((s) => s[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div className="space-y-6">
      {suspended && <SuspendedBanner />}

      <div className="pt-2">
        <p className="text-[11px] uppercase tracking-widest text-white/50">Welcome back</p>
        <h1 className="text-2xl md:text-3xl font-black text-white mt-1">
          {loadingProfile && !p ? <span className="inline-block h-7 w-40 skeleton-shimmer rounded" /> : (firstName || "Trader") + "."}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Your investment overview at a glance.</p>
      </div>

      {showLowSignal && (
        <div className="flex items-center justify-between gap-3 rounded-full border border-red-500/40 bg-red-500/10 px-4 py-2">
          <div className="flex items-center gap-2 text-red-300">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm font-semibold">You have a low signal</span>
          </div>
          <button onClick={() => setShowSignal(false)} className="text-red-300 hover:text-red-100 p-1 -mr-1" aria-label="Dismiss">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {expert && (
        <Link to="/dashboard/copy-experts"
          className="flex w-full items-center gap-2.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-2 hover:bg-emerald-500/20 transition">
          <span className="relative flex h-2.5 w-2.5 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
          </span>
          {expert.avatar_url ? (
            <img src={expert.avatar_url} alt={expert.name} className="w-6 h-6 rounded-full object-cover" />
          ) : (
            <span className="w-6 h-6 rounded-full bg-red-600 text-white flex items-center justify-center text-[9px] font-black">
              {initials}
            </span>
          )}
          <span className="text-[13px] text-white/80">
            YOU ARE COPYING <span className="text-white font-bold">{expert.name}</span>
            {expert.handle && <span className="text-white/40"> {expert.handle}</span>}
          </span>
        </Link>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {loadingProfile && !p ? (
          <>
            <div className="h-32 skeleton-shimmer" />
            <div className="h-32 skeleton-shimmer" />
            <div className="h-32 skeleton-shimmer" />
            <div className="h-32 skeleton-shimmer" />
          </>
        ) : (
          <>
            <BigCard icon={Wallet}          label="Total Balance" primary={fmtBal(p?.total_balance)} secondary={`≈ ${btc} BTC`} hero />
            <BigCard icon={TrendingUp}      label="Profit"        primary={fmtBal(p?.profit)}        secondary="All time" accent="text-success" />
            <BigCard icon={ArrowDownToLine} label="Deposit"       primary={fmtBal(p?.deposit)}       secondary="All time" />
            <AccountLevelCard level={p?.account_level} />
          </>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <SmallCard icon={ArrowUpFromLine} label="Total Withdrawals" value={fmtBal(totalWithdrawn)} />
        <SmallCard icon={Users}           label="Copied Experts"    value={String(copiedCount)} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Button variant="gold" size="lg" onClick={() => navigate("/dashboard/deposit")}>
          <ArrowDownToLine className="h-4 w-4" /> Deposit
        </Button>
        <Button variant="outlineGold" size="lg" onClick={() => navigate("/dashboard/withdraw")}>
          <ArrowUpFromLine className="h-4 w-4" /> Withdraw
        </Button>
      </div>

      <Card className="p-0 overflow-hidden border-border">
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bitcoin className="h-4 w-4 text-primary" />
            <h3 className="font-bold">Live BTC/USD Chart</h3>
          </div>
          <span className="text-xs text-muted-foreground">TradingView</span>
        </div>
        <iframe
          title="trading"
          src="https://s.tradingview.com/widgetembed/?frameElementId=tv&symbol=BINANCE%3ABTCUSDT&interval=60&theme=dark&style=1&hidesidetoolbar=1&hidetoptoolbar=0&saveimage=0"
          className="w-full h-[420px] border-0"
        />
      </Card>

      <Card className="p-0 overflow-hidden border-border">
        <div className="px-5 py-4 border-b border-border flex items-center gap-2">
          <Activity className="h-4 w-4 text-primary" />
          <h3 className="font-bold">Recent Activity</h3>
        </div>
        {txs === null && (
          <ul className="divide-y divide-border">
            {Array.from({ length: 3 }).map((_, i) => (
              <li key={i} className="px-5 py-3 flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg skeleton-shimmer" />
                <div className="flex-1 space-y-1.5">
                  <div className="skeleton-shimmer h-4 w-32" />
                  <div className="skeleton-shimmer h-3 w-44" />
                </div>
                <div className="skeleton-shimmer h-4 w-16" />
              </li>
            ))}
          </ul>
        )}
        {txs !== null && txs.length === 0 && (
          <div className="p-6 text-center text-sm text-muted-foreground">No transactions yet.</div>
        )}
        {txs && txs.length > 0 && (
          <ul className="divide-y divide-border">
            {txs.slice(0, 5).map((t) => (
              <li key={t.id} className="px-5 py-3 flex items-center gap-3">
                <div className={`h-9 w-9 rounded-lg flex items-center justify-center ${
                  t.type === "deposit" ? "bg-success/15 text-success" : "bg-destructive/15 text-destructive"
                }`}>
                  {t.type === "deposit" ? <ArrowDownToLine className="h-4 w-4" /> : <ArrowUpFromLine className="h-4 w-4" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium capitalize">
                    {t.type} · <span className="text-muted-foreground">{t.method || "—"}</span>
                  </div>
                  <div className="text-xs text-muted-foreground">{new Date(t.created_at).toLocaleString()}</div>
                </div>
                <div className="text-sm font-bold tabular-nums">{fmtNum(t.amount)}</div>
                <StatusPill status={t.status} />
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
};

export const StatusPill = ({ status }: { status: string }) => {
  const s = status?.toLowerCase();
  const map: Record<string, { style: React.CSSProperties; Icon: typeof Clock; label: string }> = {
    pending:        { style: { backgroundColor: "rgba(255,230,0,0.15)", color: "#FFE600", borderColor: "#FFE600" }, Icon: Clock, label: "Pending" },
    pending_review: { style: { backgroundColor: "rgba(255,230,0,0.15)", color: "#FFE600", borderColor: "#FFE600" }, Icon: Clock, label: "Pending" },
    awaiting_code:  { style: { backgroundColor: "rgba(255,230,0,0.15)", color: "#FFE600", borderColor: "#FFE600" }, Icon: Clock, label: "Awaiting Code" },
    approved:       { style: { backgroundColor: "rgba(34,197,94,0.15)", color: "#22c55e", borderColor: "rgba(34,197,94,0.4)" }, Icon: CheckCircle2, label: "Approved" },
    rejected:       { style: { backgroundColor: "rgba(239,68,68,0.15)", color: "#ef4444", borderColor: "rgba(239,68,68,0.4)" }, Icon: XCircle, label: "Rejected" },
    failed:         { style: { backgroundColor: "rgba(239,68,68,0.15)", color: "#ef4444", borderColor: "rgba(239,68,68,0.4)" }, Icon: XCircle, label: "Failed" },
    cancelled:      { style: { backgroundColor: "rgba(148,163,184,0.15)", color: "#94a3b8", borderColor: "rgba(148,163,184,0.4)" }, Icon: XCircle, label: "Cancelled" },
  };
  const cfg = map[s] || map.pending;
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase"
      style={cfg.style}
    >
      <cfg.Icon className="h-3 w-3" /> {cfg.label}
    </span>
  );
};

const BigCard = ({ icon: Icon, label, primary, secondary, accent, hero }: {
  icon: typeof Wallet; label: string; primary: string; secondary: string; accent?: string; hero?: boolean;
}) => (
  <Card className="p-5 border-0 text-white"
    style={{
      backgroundColor: "#34486B",
      border: hero ? "1px solid rgba(0,212,255,0.35)" : undefined,
      boxShadow: hero ? "0 0 0 1px rgba(0,212,255,0.15), 0 4px 24px -8px rgba(0,212,255,0.35)" : undefined,
    }}>
    <div className="flex items-center justify-between">
      <span className="text-xs uppercase tracking-wider text-white/70">{label}</span>
      <Icon className={`h-4 w-4 ${hero ? "text-primary" : "text-white/70"}`} />
    </div>
    <div className={`mt-3 text-2xl font-black tabular-nums ${accent || "text-white"}`}>{primary}</div>
    <div className="text-xs text-white/60 mt-1">{secondary}</div>
  </Card>
);

const SmallCard = ({ icon: Icon, label, value }: { icon: typeof Wallet; label: string; value: string }) => (
  <Card className="p-4">
    <div className="flex items-center justify-between">
      <span className="text-[10px] sm:text-xs uppercase tracking-wider text-muted-foreground">{label}</span>
      <Icon className="h-3.5 w-3.5 text-muted-foreground" />
    </div>
    <div className="mt-2 text-lg font-bold tabular-nums">{value}</div>
  </Card>
);

export default Dashboard;
