import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  User2,
  Star,
  Crown,
  Award,
  Gem,
  ChevronRight,
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
  label: string; // badge text on the card
  name: string; // name shown in the modal
  blurb: string;
  Icon: LucideIcon;
  color: string;
  status: "Upgrade available" | "Highest tier";
  /** One-time fee to move up to this tier (edit these numbers freely) */
  fee: number;
  maxBalance: number;
  dailyWithdraw: number;
};

const TIERS: Tier[] = [
  { key: "basic",    label: "BASIC",            name: "Basic Account",    blurb: "Your starting membership",                 Icon: User2, color: "#9CA3AF", status: "Upgrade available", fee: 0,     maxBalance: 10_000,    dailyWithdraw: 1_000 },
  { key: "veteran",  label: "VETERAN ACCOUNT",  name: "Veteran Account",  blurb: "For consistent investors ready to grow",   Icon: Star,  color: "#3B82F6", status: "Upgrade available", fee: 500,   maxBalance: 50_000,    dailyWithdraw: 5_000 },
  { key: "master",   label: "MASTER",           name: "Master Account",   blurb: "Advanced tools and priority support",      Icon: Crown, color: "#A855F7", status: "Upgrade available", fee: 1_500, maxBalance: 150_000,   dailyWithdraw: 15_000 },
  { key: "ultimate", label: "ULTIMATE ACCOUNT", name: "Ultimate Account", blurb: "Exclusive benefits and higher returns",    Icon: Award, color: "#F97316", status: "Upgrade available", fee: 3_500, maxBalance: 500_000,   dailyWithdraw: 50_000 },
  { key: "diamond",  label: "DIAMOND ACCOUNT",  name: "Diamond Account",  blurb: "Our most prestigious membership tier",     Icon: Gem,   color: "#22D3EE", status: "Highest tier",      fee: 7_500, maxBalance: 2_000_000, dailyWithdraw: 200_000 },
];

const money = (n: number) =>
  n.toLocaleString(undefined, { maximumFractionDigits: 0 });

export const AccountLevelCard = ({ level }: { level: string | null | undefined }) => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [picked, setPicked] = useState<Tier | null>(null);

  const key = (level || "basic").toLowerCase();
  const t = useMemo(
    () => TIERS.find((x) => key.includes(x.key)) ?? TIERS[0],
    [key]
  );
  const { Icon, label, color, status } = t;
  const currentIndex = TIERS.findIndex((x) => x.key === t.key);
  const isTop = currentIndex >= TIERS.length - 1;

  const close = () => {
    setOpen(false);
    setPicked(null);
  };

  const goPay = (tier: Tier) => {
    close();
    const q = new URLSearchParams({
      amount: String(tier.fee),
      purpose: "membership_upgrade",
      level: tier.key,
    });
    navigate(`/dashboard/deposit?${q.toString()}`);
  };

  return (
    <>
      {/* Card: same look and size as before, button sits on the side */}
      <div
        className="relative rounded-2xl p-5 text-white"
        style={{ backgroundColor: "#34486B", border: `1px solid ${color}33` }}
      >
        <p className="text-[10px] tracking-widest text-white/60 font-semibold">ACCOUNT LEVEL</p>
        <div className="mt-3 flex items-center gap-1.5">
          <Icon className="h-[1.05em] w-[1.05em] shrink-0" strokeWidth={2.25} style={{ color }} />
          <span className="font-extrabold text-lg leading-none" style={{ color }}>
            {label}
          </span>
        </div>
        <p className="text-xs text-white/55 mt-3">{status}</p>

        {!isTop && (
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="absolute right-4 top-4 inline-flex items-center gap-1 rounded-full bg-primary/20 px-3 py-1.5 text-xs font-semibold text-primary transition hover:bg-primary/30"
          >
            Upgrade
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Modal */}
      <Dialog
        open={open}
        onOpenChange={(v) => (v ? setOpen(true) : close())}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto rounded-3xl p-0 sm:max-w-md">
          <DialogHeader className="border-b px-6 py-5 text-left">
            <DialogTitle>Upgrade Account</DialogTitle>
            <DialogDescription>Select a plan to request an upgrade</DialogDescription>
          </DialogHeader>

          <div className="px-6 pb-2">
            <p className="text-sm text-muted-foreground">
              Current level: <span className="font-semibold text-foreground">{t.name}</span>
              {" · "}Select an upgrade badge and make the required deposit.
            </p>

            <div className="mt-4 space-y-3">
              {TIERS.slice(currentIndex).map((tier, i) => {
                const isCurrent = i === 0;
                const selected = picked?.key === tier.key;
                const TierIcon = tier.Icon;
                return (
                  <button
                    key={tier.key}
                    type="button"
                    disabled={isCurrent}
                    onClick={() => setPicked(tier)}
                    className={`w-full rounded-2xl border p-4 text-left transition ${
                      isCurrent
                        ? "cursor-default bg-muted/40 opacity-70"
                        : selected
                        ? "border-primary bg-primary/5 ring-1 ring-primary"
                        : "hover:border-foreground/30"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <TierIcon className="h-4 w-4 shrink-0" style={{ color: tier.color }} />
                        <span className="font-semibold">{tier.name}</span>
                      </div>
                      {isCurrent ? (
                        <span className="text-xs tracking-wider text-muted-foreground">CURRENT</span>
                      ) : selected ? (
                        <Check className="h-4 w-4 text-primary" />
                      ) : null}
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{tier.blurb}</p>
                    <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
                      <div>
                        <p className="text-muted-foreground">{isCurrent ? "Fee paid" : "Upgrade fee"}</p>
                        <p className="font-semibold">{isCurrent ? "—" : `$${money(tier.fee)}`}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Ceiling</p>
                        <p className="font-semibold">${money(tier.maxBalance)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Daily payout</p>
                        <p className="font-semibold">${money(tier.dailyWithdraw)}</p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <DialogFooter className="grid grid-cols-2 gap-3 px-6 pb-6 pt-4 sm:space-x-0">
            <Button variant="outline" className="rounded-xl" onClick={close}>
              Cancel
            </Button>
            <Button
              className="rounded-xl"
              disabled={!picked}
              onClick={() => picked && goPay(picked)}
            >
              {picked ? `Continue · $${money(picked.fee)}` : "Continue"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
