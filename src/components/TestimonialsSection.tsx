import { Card } from "@/components/ui/card";
import { Star } from "lucide-react";

const TESTIMONIALS = [
  {
    name: "Marcus Bell",
    role: "Investor · USA",
    initials: "MB",
    rating: 5,
    quote:
      "I've tripled my portfolio in 4 months copying the top traders. Withdrawals are processed within hours every single time.",
  },
  {
    name: "Sofia Chen",
    role: "Day Trader · Singapore",
    initials: "SC",
    rating: 5,
    quote:
      "The AI signals are incredibly accurate. Cleanest dashboard I've used, and the platform feels safer than anything else I've tried.",
  },
  {
    name: "Alex Petrov",
    role: "Crypto Miner · UAE",
    initials: "AP",
    rating: 5,
    quote:
      "Set up my mining plan in under 5 minutes. Daily payouts hit my wallet on the dot. Support team is responsive and human.",
  },
];

export const TestimonialsSection = () => (
  <section className="py-20" style={{ backgroundColor: "#172640" }}>
    <div className="container">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-5xl font-black text-white">Loved by traders worldwide</h2>
        <p className="text-white/70 mt-3 max-w-xl mx-auto">
          Real stories from real investors growing their portfolios with us.
        </p>
      </div>
      <div className="grid md:grid-cols-3 gap-6">
        {TESTIMONIALS.map((t) => (
          <Card
            key={t.name}
            className="p-6 border-0 text-white"
            style={{ backgroundColor: "#253E60" }}
          >
            <div className="flex items-center gap-1 mb-4 text-primary">
              {Array.from({ length: t.rating }).map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-primary" />
              ))}
            </div>
            <p className="text-sm md:text-base text-white/85 leading-relaxed">"{t.quote}"</p>
            <div className="mt-6 flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary text-primary-foreground font-black flex items-center justify-center text-sm">
                {t.initials}
              </div>
              <div>
                <div className="font-bold text-white text-sm">{t.name}</div>
                <div className="text-xs text-white/60">{t.role}</div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  </section>
);
