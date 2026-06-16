import { MarketingPage } from "@/components/MarketingPage";

const AMLKYC = () => (
  <MarketingPage
    title="AML / KYC Policy"
    intro="Our commitment to a safe, transparent and compliant trading environment."
  >
    <p>
      CryptoVault enforces strict Anti-Money-Laundering (AML) and Know-Your-Customer
      (KYC) procedures in line with international standards including FATF
      recommendations, EU AMLD frameworks, and the US Bank Secrecy Act.
    </p>
    <h2 className="text-xl font-bold text-white">What we collect</h2>
    <ul className="list-disc pl-6 space-y-2">
      <li>Government-issued ID (passport, driver's licence or national ID)</li>
      <li>Proof of address dated within the last 90 days</li>
      <li>A selfie verification photo</li>
    </ul>
    <h2 className="text-xl font-bold text-white">How we use it</h2>
    <p>
      Submitted documents are encrypted in transit and at rest, and are
      reviewed by our compliance team within 24–48 hours. Data is never sold
      or shared with third parties beyond our regulated custodians.
    </p>
  </MarketingPage>
);

export default AMLKYC;
