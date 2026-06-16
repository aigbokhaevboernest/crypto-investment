import { MarketingPage } from "@/components/MarketingPage";

const RiskDisclosure = () => (
  <MarketingPage
    title="Risk Disclosure"
    intro="Trading and investing in digital assets carry significant risk. Please read carefully."
  >
    <p>
      The value of digital assets can fluctuate substantially in short periods
      of time. You may lose some or all of your invested capital. You should
      only invest funds that you can afford to lose, and you should seek
      independent financial advice if you are unsure about any aspect of the
      products offered on this platform.
    </p>
    <h2 className="text-xl font-bold text-white">Market risk</h2>
    <p>Crypto markets are highly volatile and operate 24/7. Prices can move sharply at any time.</p>
    <h2 className="text-xl font-bold text-white">Operational risk</h2>
    <p>Online platforms are subject to outages, cyber-attacks and regulatory changes. We mitigate these but cannot eliminate them.</p>
    <h2 className="text-xl font-bold text-white">Past performance</h2>
    <p>Historical returns are not a guarantee of future results. Quoted ROI figures are indicative only.</p>
  </MarketingPage>
);

export default RiskDisclosure;
