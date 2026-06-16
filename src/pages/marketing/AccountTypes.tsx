import { MarketingPage } from "@/components/MarketingPage";

const AccountTypes = () => (
  <MarketingPage
    title="Account Types"
    intro="Choose the account that fits how you invest."
  >
    <h2 className="text-xl font-bold text-white">Crypto Mining</h2>
    <p>Earn daily payouts from our industrial mining infrastructure. Ideal for hands-off, recurring income.</p>
    <h2 className="text-xl font-bold text-white">AI Trading</h2>
    <p>Machine-learning models execute trades across major exchanges 24/7 with risk controls calibrated to your appetite.</p>
    <h2 className="text-xl font-bold text-white">Copy Trading</h2>
    <p>Mirror the portfolios of verified top-performing traders in real time. One tap to copy, full control to stop anytime.</p>
    <h2 className="text-xl font-bold text-white">Forex & Stocks</h2>
    <p>Trade the world's most liquid markets directly from your dashboard with institutional spreads.</p>
  </MarketingPage>
);

export default AccountTypes;
