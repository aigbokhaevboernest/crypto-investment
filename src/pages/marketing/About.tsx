import { MarketingPage } from "@/components/MarketingPage";

const About = () => (
  <MarketingPage
    title="About CryptoVault"
    intro="A unified platform for crypto mining, AI-powered trading, and expert copy trading."
  >
    <p>
      CryptoVault was founded with a single mission: make institutional-grade
      crypto investing accessible to every retail investor. We combine
      industrial mining infrastructure, machine-learning trading models, and
      verified expert traders so you can grow your portfolio without spending
      hours staring at charts.
    </p>
    <p>
      Our team brings together engineers from leading exchanges, quants from
      top-tier hedge funds, and security professionals from global banks. Every
      decision is grounded in transparency, security, and long-term
      sustainability.
    </p>
    <h2 className="text-xl font-bold text-white">Our principles</h2>
    <ul className="list-disc pl-6 space-y-2">
      <li>Transparent reporting — every transaction is visible in your dashboard.</li>
      <li>Bank-grade security — multi-signature wallets and cold storage by default.</li>
      <li>Instant withdrawals — your money, available whenever you need it.</li>
      <li>Human support — real people, not bots, available 24/7.</li>
    </ul>
  </MarketingPage>
);

export default About;
