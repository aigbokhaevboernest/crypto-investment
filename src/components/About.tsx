import { ShieldCheck, Globe2, Sparkles } from "lucide-react";

export const About = () => (
  <section id="about" className="py-20 bg-background">
    <div className="container grid lg:grid-cols-2 gap-12 items-center">
      <div>
        <h2 className="text-3xl md:text-5xl font-black leading-tight">
          Built for serious traders. <span className="text-gold">Trusted worldwide.</span>
        </h2>
        <p className="text-muted-foreground mt-5 text-base md:text-lg">
          CryptoVault is a regulated digital-asset platform combining algorithmic mining, AI-powered
          trading, and verified copy-trade experts. We've helped over 250,000 investors across 316
          countries earn predictable returns on stocks, forex, and crypto — all from a single,
          transparent dashboard.
        </p>
        <div className="mt-8 grid sm:grid-cols-2 gap-4">
          <div className="rounded-xl border border-border bg-card p-4">
            <ShieldCheck className="h-5 w-5 text-gold mb-2" />
            <div className="font-bold">Bank-grade security</div>
            <p className="text-sm text-muted-foreground mt-1">Cold storage, encrypted vaults, DDoS-protected infra.</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4">
            <Globe2 className="h-5 w-5 text-gold mb-2" />
            <div className="font-bold">Global reach</div>
            <p className="text-sm text-muted-foreground mt-1">Available in 316 countries with localised currency.</p>
          </div>
        </div>
      </div>
      <div className="relative">
        <div className="aspect-square rounded-3xl bg-gradient-to-br from-gold/20 via-primary/10 to-transparent border border-gold/20 p-8 flex items-center justify-center">
          <div className="text-center">
            <div className="text-6xl md:text-7xl font-black text-gold">$2.4B+</div>
            <div className="text-sm uppercase tracking-widest text-muted-foreground mt-2">Assets under management</div>
            <div className="mt-8 grid grid-cols-2 gap-4 text-left">
              <Stat n="250K+" l="Active investors" />
              <Stat n="99.9%" l="Platform uptime" />
              <Stat n="316" l="Countries served" />
              <Stat n="24/7" l="Live support" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
);

const Stat = ({ n, l }: { n: string; l: string }) => (
  <div className="rounded-xl bg-card/60 border border-border p-3">
    <div className="text-xl font-black text-gold">{n}</div>
    <div className="text-xs text-muted-foreground">{l}</div>
  </div>
);
