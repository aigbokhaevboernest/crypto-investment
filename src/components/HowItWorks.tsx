import { UserPlus, Wallet, TrendingUp, ArrowDownToLine } from "lucide-react";

const STEPS = [
  { n: 1, icon: UserPlus, title: "Create an account", desc: "Sign up in under 60 seconds. No paperwork required." },
  { n: 2, icon: Wallet, title: "Fund your wallet", desc: "Deposit BTC, ETH, USDT or wire transfer — instant credit." },
  { n: 3, icon: TrendingUp, title: "Pick a plan or expert", desc: "Choose an investment plan or copy a top-performing trader." },
  { n: 4, icon: ArrowDownToLine, title: "Withdraw profits", desc: "Cash out anytime in crypto or fiat. No hidden fees." },
];

export const HowItWorks = () => (
  <section
    className="relative py-24 overflow-hidden"
    style={{
      backgroundImage:
        "url('https://images.unsplash.com/photo-1642790551116-18e150f248e3?auto=format&fit=crop&w=1920&q=80')",
      backgroundSize: "cover",
      backgroundPosition: "center",
    }}
  >
    <div className="absolute inset-0" style={{ backgroundColor: "rgba(14, 32, 60, 0.85)" }} />
    <div className="container relative">
      <div className="text-center mb-14">
        <h2 className="text-3xl md:text-5xl font-black text-white">How It Works</h2>
        <p className="text-white/75 mt-3 max-w-xl mx-auto">
          Four simple steps from sign-up to your first withdrawal.
        </p>
      </div>
      <div className="grid md:grid-cols-4 gap-6">
        {STEPS.map((s) => (
          <div
            key={s.n}
            className="rounded-2xl p-6 border border-white/10 backdrop-blur"
            style={{ backgroundColor: "rgba(37, 62, 96, 0.55)" }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div
                className="h-10 w-10 rounded-full text-primary-foreground flex items-center justify-center font-black"
                style={{ backgroundColor: "#0E57AF" }}
              >
                {s.n}
              </div>
              <s.icon className="h-5 w-5 text-white/70" />
            </div>
            <h3 className="font-bold text-lg text-white">{s.title}</h3>
            <p className="text-sm text-white/70 mt-2">{s.desc}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);
