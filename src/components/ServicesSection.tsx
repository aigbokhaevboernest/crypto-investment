import { Card } from "@/components/ui/card";
import { Cpu, Brain, Users, Shield, Zap, BarChart3 } from "lucide-react";

const SERVICES = [
  { icon: Cpu, title: "Crypto Mining", desc: "Industrial-grade rigs mining BTC, ETH, and more — 24/7." },
  { icon: Brain, title: "AI Trading", desc: "Machine-learning models executing trades across major exchanges." },
  { icon: Users, title: "Copy Trading", desc: "Mirror the trades of top verified performers with one click." },
  { icon: Shield, title: "Bank-Grade Security", desc: "Multi-layer DDoS protection, encrypted vaults and cold storage." },
  { icon: Zap, title: "Instant Withdrawals", desc: "Payouts processed in BTC, ETH, USDT, bank transfer and more." },
  { icon: BarChart3, title: "Live Analytics", desc: "Real-time dashboards, projected earnings and full transaction history." },
];

export const ServicesSection = () => (
  <section id="services" className="py-20">
    <div className="container">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-5xl font-black text-white">Our Services</h2>
        <p className="text-muted-foreground mt-3 max-w-xl mx-auto">
          Everything you need to grow your crypto portfolio in one platform.
        </p>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {SERVICES.map((s) => (
          <Card key={s.title} className="p-6 hover:border-primary/40 transition group">
            <div className="h-12 w-12 rounded-lg bg-primary/15 text-primary flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition">
              <s.icon className="h-6 w-6" />
            </div>
            <h3 className="font-bold text-lg text-white">{s.title}</h3>
            <p className="text-muted-foreground text-sm mt-2">{s.desc}</p>
          </Card>
        ))}
      </div>
    </div>
  </section>
);
