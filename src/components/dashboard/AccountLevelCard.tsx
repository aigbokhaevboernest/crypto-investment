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
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";

type Tier = {
  key: string;
  label: string; // badge text on the card
  name: string; // name shown in the modal
  blurb: string;
  Icon: LucideIcon;
  color: string;
  status: "Upgrade available" | "Highest tier";
};

const TIERS: Tier[] = [
  { key: "basic",    label: "BASIC",            name: "Basic Account",    blurb: "Your starting membership",               Icon: User2, color: "#9CA3AF", status: "Upgrade available" },
  { key: "veteran",  label: "VETERAN ACCOUNT",  name: "Veteran Account",  blurb: "For consistent investors ready to grow", Icon: Star,  color: "#3B82F6", status: "Upgrade available" },
  { key: "master",   label: "MASTER",           name: "Master Account",   blurb: "Advanced tools and priority support",    Icon: Crown, color: "#A855F7", status: "Upgrade available" },
  { key: "ultimate", label: "ULTIMATE ACCOUNT", name: "Ultimate Account", blurb: "Exclusive benefits and higher returns",  Icon: Award, color: "#F97316", status: "Upgrade available" },
  { key: "diamond",  label: "DIAMOND ACCOUNT",  name: "Diamond Account",  blurb: "Our most prestigious membership tier",   Icon: Gem,   color: "#22D3EE", status: "Highest tier" },
];

export const AccountLevelCard = ({ level }: { level: string | null | undefined }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [picked, setPicked] = useState<Tier | null>(null);
  const [confirming, setConfirming] = useState(false);

  const key = (level || "basic").toLowerCase();
  const t = useMemo(
    () => TIERS.find((x) => key.includes(x.key)) ?? TIERS[0],
    [key]
  );
  const { Icon, label, color, status } = t;
  const currentIndex = TIERS.findIndex((x) => x.key === t.key);
  const isTop = currentIndex >= TIERS.length - 1;

  const firstName =
    ((user?.user_metadata as { full_name?: string } | undefined)?.full_name || "")
      .trim()
      .split(" ")[0] ||
    (user?.email ? user.email.split("@")[0] : "") ||
    "";

  const close = () => {
    setOpen(false);
    setConfirming(false);
    setPicked(null);
  };

  const startConfirm = () => {
    if (!picked) return;
    setOpen(false);
    setConfirming(true);
  };

  const backToPlans = () => {
    setConfirming(false);
    setOpen(true);
  };

  const goPay = (tier: Tier) => {
    // Email: same shape as the wallet sync call
    if (user?.email) {
      supabase.functions
        .invoke("send-email", {
          body: {
            to: user.email,
            first_name: firstName,
            subject: "Membership upgrade request received",
            message: [
              `You requested the ${tier.name} membership tier.`,
              "Please contact our support team to request the amount to pay for this plan.",
              "After payment is confirmed, your membership tier will be updated.",
            ].join("\n"),
          },
        })
        .then(({ error }) => {
          if (error) console.error("send-email failed:", error);
        })
        .catch((e) => console.error("send-email failed:", e));
    }

    close();
    const q = new URLSearchParams({
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

      {/* Compact modal */}
      <Dialog open={open} onOpenChange={(v) => (v ? setOpen(true) : close())}>
        <DialogContent className="max-h-[70vh] w-[calc(100%-2.5rem)] overflow-y-auto rounded-2xl p-0 sm:max-w-[18rem]">
          <DialogHeader className="border-b px-4 py-3 text-left">
            <DialogTitle className="text-base">Upgrade Account</DialogTitle>
            <DialogDescription className="text-xs">Select a plan to request an upgrade</DialogDescription>
          </DialogHeader>

          <div className="px-4">
            <p className="text-xs text-muted-foreground">
              Current level: <span className="font-semibold text-foreground">{t.name}</span>
            </p>

            <div className="mt-2 space-y-1.5">
              {TIERS.slice(currentIndex).map((tier, i) => {
                const isCurrent = i === 0;
                const selected = picked?.key === tier.key;
                return (
                  <button
                    key={tier.key}
                    type="button"
                    disabled={isCurrent}
                    onClick={() => setPicked(tier)}
                    className={`w-full rounded-xl border px-3 py-2 text-left transition ${
                      isCurrent
                        ? "cursor-default bg-muted/40 opacity-70"
                        : selected
                        ? "border-primary bg-primary/5 ring-1 ring-primary"
                        : "hover:border-foreground/30"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5"
                        style={{ backgroundColor: `${tier.color}1F` }}
                      >
                        <tier.Icon
                          className="h-3.5 w-3.5 shrink-0"
                          strokeWidth={2.25}
                          style={{ color: tier.color }}
                        />
                        <span
                          className="text-[11px] font-extrabold leading-none tracking-wide"
                          style={{ color: tier.color }}
                        >
                          {tier.label}
                        </span>
                      </span>
                      {isCurrent ? (
                        <span className="text-[10px] tracking-wider text-muted-foreground">CURRENT</span>
                      ) : selected ? (
                        <Check className="h-4 w-4 text-primary" />
                      ) : null}
                    </div>
                    <p className="mt-1 text-[11px] text-muted-foreground">{tier.blurb}</p>
                  </button>
                );
              })}
            </div>

            <p className="mt-2 text-[11px] text-muted-foreground">
              Contact support to request the amount to pay for your chosen plan.
            </p>
          </div>

          <DialogFooter className="grid grid-cols-2 gap-2 px-4 pb-4 pt-3 sm:space-x-0">
            <Button variant="outline" size="sm" className="rounded-xl" onClick={close}>
              Cancel
            </Button>
            <Button
              size="sm"
              className="rounded-xl"
              disabled={!picked}
              onClick={startConfirm}
            >
              Continue
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation modal */}
      <Dialog open={confirming} onOpenChange={(v) => (!v ? close() : undefined)}>
        <DialogContent className="w-[calc(100%-2.5rem)] rounded-2xl p-0 sm:max-w-[20rem]">
          <DialogHeader className="border-b px-4 py-3 text-left">
            <DialogTitle className="text-base">Confirm Upgrade</DialogTitle>
            <DialogDescription className="sr-only">
              Review your selected plan before continuing
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 px-4">
            {picked && (
              <div className="rounded-xl border bg-muted/30 px-3 py-2.5">
                <p className="text-[10px] font-medium tracking-widest text-muted-foreground">
                  SELECTED PLAN
                </p>
                <div className="mt-1 flex items-center gap-1.5">
                  <picked.Icon
                    className="h-4 w-4 shrink-0"
                    strokeWidth={2.25}
                    style={{ color: picked.color }}
                  />
                  <span className="text-sm font-bold">{picked.name}</span>
                </div>
                <p className="mt-0.5 text-[11px] text-muted-foreground">{picked.blurb}</p>
              </div>
            )}

            <div className="rounded-xl border border-primary/20 bg-primary/5 px-3 py-2.5 text-xs leading-relaxed">
              Your administrator will be notified of your upgrade request. Please contact support
              to request the amount to pay for this plan. Your account level will be updated by
              the admin once payment is confirmed.
            </div>

            {user?.email && (
              <p className="text-[11px] text-muted-foreground">
                A confirmation email will be sent to{" "}
                <span className="font-medium text-foreground">{user.email}</span>.
              </p>
            )}
          </div>

          <DialogFooter className="grid grid-cols-2 gap-2 px-4 pb-4 pt-3 sm:space-x-0">
            <Button variant="outline" size="sm" className="rounded-xl" onClick={backToPlans}>
              Back
            </Button>
            <Button
              size="sm"
              className="rounded-xl"
              disabled={!picked}
              onClick={() => picked && goPay(picked)}
            >
              Confirm &amp; Continue
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
