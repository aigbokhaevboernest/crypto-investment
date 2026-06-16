import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { About } from "@/components/About";
import { LiveCryptoTicker } from "@/components/LiveCryptoTicker";
import { ServicesSection } from "@/components/ServicesSection";
import { PlansSection } from "@/components/PlansSection";
import { ExpertTradersLeaderboard } from "@/components/ExpertTradersLeaderboard";
import { StatsTicker } from "@/components/StatsTicker";
import { TestimonialsSection } from "@/components/TestimonialsSection";
import { HowItWorks } from "@/components/HowItWorks";
import { LiveEarningsPopup } from "@/components/LiveEarningsPopup";
import { Footer } from "@/components/Footer";

const Index = () => (
  <div className="min-h-screen bg-background">
    <Navbar />
    <main>
      <Hero />
      {/* TradingView Ticker Tape directly under hero — no gap */}
      <LiveCryptoTicker />
      <About />
      <ServicesSection />
      <PlansSection />
      <ExpertTradersLeaderboard />
      <StatsTicker />
      <TestimonialsSection />
      <HowItWorks />
    </main>
    <Footer />
    <LiveEarningsPopup />
  </div>
);

export default Index;
