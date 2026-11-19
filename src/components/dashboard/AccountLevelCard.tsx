import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  User2,
  Star,
  Crown,
  Award,
  Gem,
  ArrowUpRight,
  Check,
  LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

type Tier = {
  key: string;
  label: string;
  Icon: LucideIcon;
  color: string;
  /** One-time fee to move up to this tier (0 for the starting tier) */
  fee: number;
  maxBalance: number;
  dailyWithdraw: number;
};

/** Fees and limits are product numbers: edit them here. Keys match account_level in the DB. */
const TIERS: Tier[] = [
  { key: "basic",    label: "STARTER", Icon: User2, color: "#9CA3AF", fee: 0,     maxBalance: 10_000,    dailyWithdraw: 1_000 },
  { key: "veteran",  label: "PRO",     Icon: Star,  color: "#3B82F6", fee: 500,   maxBalance: 50_000,    dailyWithdraw: 5_000 },
  { key: "master",   label: "ELITE",   Icon: Crown, color: "#A855F7", fee: 1_500, maxBalance: 150_000,   dailyWithdraw: 15_000 },
  { key: "ultimate", label: "PREMIER", Icon: Award, color: "#F97316", fee: 3_500, maxBalance: 500_000,   dailyWithdraw: 50_000 },
  { key: "diamond",  label: "LEGACY",  Icon: Gem,   color: "#22D3EE", fee: 7_500, maxBalance: 2_000_000, dailyWithdraw: 200_000 },
];

const money = (n: number) =>
  n.toLocaleString(undefined, { maximumFractionDigits: 0 });

function resolveTier(level: string | null | undefined): Tier {
  const key = (level || "basic").toLowerCase();
  return TIERS.find((x) => key.includes(x.key)) ?? TIERS[0];
}

export const AccountLevelCard = ({
  level,
}: {
  level: string | null | undefined;
}) => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [picked, setPicked] = useState<Tier | null>(null);

  const current = useMemo(() => resolveTier(level), [level]);
  const currentIndex = TIERS.findIndex((t) => t.key === current.key);
  const isTop = currentIndex >= TIERS.length - 1;
  const nextTiers = TIERS.filter((_, i) => i > currentIndex);
  const { Icon, label, color } = current;

  const goPay = (tier: Tier) => {
    setOpen(false);
    setPicked(null);
    const q = new URLSearchParams({
      amount: String(tier.fee),
      purpose: "membership_upgrade",
      level: tier.key,
    });
    navigate(`/dashboard/deposit?${q.toString()}`);
  };

  return (
    <>
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
        <div className="text-xs font-medium tracking-wide text-white/50">
          MEMBERSHIP TIER
        </div>

        <div className="mt-2 flex items-center gap-2">
          <Icon size={22} color={color} />
          <span className="text-lg font-bold" style={{ color }}>
            {label}
          </span>
        </div>

        <div className="mt-2 text-sm text-white/60">
          {isTop
            ? "Top membership — full platform limits"
            : "Higher tiers unlock larger balances & withdrawals"}
        </div>

        <div className="mt-3 space-y-1 text-sm text-white/80">
          <div>Ceiling: ${money(current.maxBalance)}</div>
          <div>Daily payout cap: ${money(current.dailyWithdraw)}</div>
        </div>

        {!isTop && (
          <Button
            size="sm"
            className="mt-4 gap-1"
            onClick={() => setOpen(true)}
          >
            Raise your limits
            <ArrowUpRight size={16} />
          </Button>
        )}
      </div>

      <Dialog
        open={open}
        onOpenChange={(v) => {
          setOpen(v);
          if (!v) setPicked(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Choose a higher tier</DialogTitle>
            <DialogDescription>
              Pay the one-time activation fee for the tier you want. After your
              deposit is confirmed, your membership is moved up and the new
              limits apply.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            {nextTiers.map((t) => {
              const selected = picked?.key === t.key;
              const TierIcon = t.Icon;
              return (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => setPicked(t)}
                  className={`w-full rounded-xl border p-3 text-left transition ${
                    selected
                      ? "border-cyan-400/60 bg-cyan-400/10"
                      : "border-white/10 bg-white/5 hover:border-white/20"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <TierIcon size={18} color={t.color} />
                      <span className="font-semibold" style={{ color: t.color }}>
                        {t.label}
                      </span>
                    </div>
                    {selected && <Check size={18} className="text-cyan-400" />}
                  </div>
                  <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-white/60">
                    <span>Fee ${money(t.fee)}</span>
                    <span>Max ${money(t.maxBalance)}</span>
                    <span>Day ${money(t.dailyWithdraw)}</span>
                  </div>
                </button>
              );
            })}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Not now
            </Button>
            <Button disabled={!picked} onClick={() => picked && goPay(picked)}>
              {picked ? `Continue · $${money(picked.fee)}` : "Select a tier"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
