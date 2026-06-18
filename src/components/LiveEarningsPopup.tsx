import { useEffect, useState } from "react";
import { TrendingUp, DollarSign, UserPlus, ArrowDownToLine } from "lucide-react";

const NAMES = ["John", "Peter", "Michael", "Sofia", "Aisha", "Yuki", "Liam", "Marcus", "Elena", "Carlos", "Priya", "Amara"];
const COUNTRIES = ["Italy", "Canada", "UAE", "Japan", "Germany", "Brazil", "Singapore", "France", "Spain", "Australia"];
const ACTIONS = [
  { type: "earned", icon: DollarSign, verb: "just earned" },
  { type: "withdrew", icon: ArrowDownToLine, verb: "withdrew" },
  { type: "deposit", icon: TrendingUp, verb: "deposited" },
  { type: "joined", icon: UserPlus, verb: "joined from", isJoin: true },
];

const rand = <T,>(a: T[]) => a[Math.floor(Math.random() * a.length)];

export const LiveEarningsPopup = () => {
  const [item, setItem] = useState<
    | { id: number; name?: string; country: string; verb: string; isJoin?: boolean; amount?: number; Icon: typeof DollarSign }
    | null
  >(null);

  useEffect(() => {
    const tick = () => {
      const action = rand(ACTIONS);
      setItem({
        id: Date.now(),
        name: rand(NAMES),
        country: rand(COUNTRIES),
        verb: action.verb,
        isJoin: action.isJoin,
        amount: (Math.floor(Math.random() * 90) + 5) * 1000,
        Icon: action.icon,
      });
      setTimeout(() => setItem(null), 5000);
    };
    const initial = setTimeout(tick, 2500);
    const interval = setInterval(tick, 8000);
    return () => { clearTimeout(initial); clearInterval(interval); };
  }, []);

  if (!item) return null;
  const Icon = item.Icon;
  return (
    <>
      <style>{`
        @keyframes earnings-slide-up {
          0% { transform: translateY(100%); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
      `}</style>
      <div
        key={item.id}
        className="fixed bottom-6 left-6 z-50"
        style={{ animation: "earnings-slide-up 400ms ease-out both" }}
      >
        <div
          className="flex items-center gap-3 rounded-xl shadow-elegant p-3 pr-5 max-w-[340px]"
          style={{ backgroundColor: "#1BD7C5", color: "#FFFFFF" }}
        >
          <div
            className="h-9 w-9 rounded-lg flex items-center justify-center shrink-0"
            style={{ backgroundColor: "rgba(255,255,255,0.18)", color: "#FFFFFF" }}
          >
            <Icon className="h-4 w-4" />
          </div>
          <p className="text-sm font-medium leading-tight">
            {item.isJoin ? (
              <>New investor {item.verb} <span className="font-bold">{item.country}</span></>
            ) : (
              <>
                {item.name} from {item.country} {item.verb}{" "}
                <span className="font-bold" style={{ color: "#FFF508" }}>
                  ${item.amount?.toLocaleString()}
                </span>
              </>
            )}
          </p>
        </div>
      </div>
    </>
  );
};
