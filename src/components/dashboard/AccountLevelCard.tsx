import { User2, Star, Crown, Award, Gem, LucideIcon } from "lucide-react";

type Tier = {
  key: string;
  label: string;
  Icon: LucideIcon;
  color: string;
  status: "Upgrade available" | "Highest tier";
};

const TIERS: Tier[] = [
  { key: "basic",    label: "BASIC",            Icon: User2, color: "#9CA3AF", status: "Upgrade available" },
  { key: "veteran",  label: "VETERAN ACCOUNT",  Icon: Star,  color: "#3B82F6", status: "Upgrade available" },
  { key: "master",   label: "MASTER",           Icon: Crown, color: "#A855F7", status: "Upgrade available" },
  { key: "ultimate", label: "ULTIMATE ACCOUNT", Icon: Award, color: "#F97316", status: "Upgrade available" },
  { key: "diamond",  label: "DIAMOND ACCOUNT",  Icon: Gem,   color: "#22D3EE", status: "Highest tier" },
];

export const AccountLevelCard = ({ level }: { level: string | null | undefined }) => {
  const key = (level || "basic").toLowerCase();
  const t = TIERS.find((x) => key.includes(x.key)) ?? TIERS[0];
  const { Icon, label, color, status } = t;
  return (
    <div
      className="rounded-2xl p-5 text-white"
      style={{ backgroundColor: "#34486B", border: `1px solid ${color}33` }}
    >
      <p className="text-[10px] tracking-widest text-white/60 font-semibold">ACCOUNT LEVEL</p>
      <div className="mt-3 flex items-center gap-3">
        <Icon className="h-8 w-8 shrink-0" style={{ color }} />
        <span className="font-extrabold text-lg leading-tight" style={{ color }}>
          {label}
        </span>
      </div>
      <p className="text-xs text-white/55 mt-3">{status}</p>
    </div>
  );
};
