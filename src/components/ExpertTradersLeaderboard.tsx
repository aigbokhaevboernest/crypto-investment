import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Trophy } from "lucide-react";

const TRADERS = [
  { rank: 1, name: "Elon Musk", handle: "@elonmusk", roi: "+342%", win: "94%", followers: "1.2M", featured: true },
  { rank: 2, name: "Cathie Wood", handle: "@cathiedwood", roi: "+187%", win: "81%", followers: "412K" },
  { rank: 3, name: "Michael Saylor", handle: "@saylor", roi: "+164%", win: "79%", followers: "298K" },
  { rank: 4, name: "CZ Binance", handle: "@cz_binance", roi: "+142%", win: "76%", followers: "245K" },
  { rank: 5, name: "Vitalik Buterin", handle: "@vitalikb", roi: "+128%", win: "73%", followers: "188K" },
];

const initials = (name: string) =>
  name.split(" ").map((s) => s[0]).slice(0, 2).join("").toUpperCase();

export const ExpertTradersLeaderboard = () => {
  const navigate = useNavigate();
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => e.isIntersecting && setVisible(true),
      { threshold: 0.15 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section id="traders" className="py-20" style={{ backgroundColor: "#172640" }}>
      <div className="container">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/15 text-primary px-4 py-1.5 text-xs font-semibold uppercase tracking-wider mb-4">
            <Trophy className="h-3.5 w-3.5" /> Expert Traders Leaderboard
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-white">Copy the best in the world</h2>
          <p className="text-white/70 mt-3 max-w-xl mx-auto">
            Top-performing traders ranked by verified ROI. Mirror their portfolios in one tap.
          </p>
        </div>

        <div
          ref={ref}
          className="rounded-2xl overflow-hidden border border-white/10"
          style={{ backgroundColor: "#253E60" }}
        >
          {/* Header (desktop) */}
          <div className="hidden md:grid grid-cols-[60px_1fr_100px_80px_100px_120px] gap-4 px-6 py-3 text-[11px] uppercase tracking-wider text-white/60 border-b border-white/10">
            <div>Rank</div>
            <div>Trader</div>
            <div className="text-right">ROI</div>
            <div className="text-right">Win</div>
            <div className="text-right">Followers</div>
            <div className="text-right">Action</div>
          </div>

          {TRADERS.map((t, i) => (
            <div
              key={t.rank}
              className={`grid grid-cols-[40px_1fr_auto] md:grid-cols-[60px_1fr_100px_80px_100px_120px] gap-4 px-4 md:px-6 py-4 items-center border-b border-white/5 last:border-0 ${
                visible ? "animate-slide-up-fade" : "opacity-0"
              } ${t.featured ? "bg-primary/10" : ""}`}
              style={{ animationDelay: `${i * 110}ms`, animationFillMode: "both" }}
            >
              <div className="text-lg font-black text-white/80 tabular-nums">#{t.rank}</div>

              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`h-10 w-10 rounded-full flex items-center justify-center font-black text-sm shrink-0 ${
                    t.featured ? "text-white" : "text-white"
                  }`}
                  style={{ backgroundColor: t.featured ? "#0E57AF" : "#34486B" }}
                >
                  {initials(t.name)}
                </div>
                <div className="min-w-0">
                  <div className="text-sm md:text-base font-bold text-white truncate">{t.name}</div>
                  <div className="text-xs text-white/60 truncate">{t.handle}</div>
                </div>
              </div>

              <div className="hidden md:block text-right font-black tabular-nums text-primary">{t.roi}</div>
              <div className="hidden md:block text-right text-sm text-white tabular-nums">{t.win}</div>
              <div className="hidden md:block text-right text-sm text-white/70 tabular-nums">{t.followers}</div>

              {/* Mobile: stack ROI + button */}
              <div className="md:hidden flex items-center gap-2">
                <span className="text-sm font-black text-primary tabular-nums">{t.roi}</span>
                <Button size="sm" onClick={() => navigate("/signup")}>Copy</Button>
              </div>

              <div className="hidden md:flex justify-end">
                <Button size="sm" onClick={() => navigate("/signup")}>Copy</Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
