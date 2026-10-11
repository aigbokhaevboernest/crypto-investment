import { MarketingPage } from "@/components/MarketingPage";

export const FAQ = () => (
  <MarketingPage title="Frequently Asked Questions" intro="Quick answers to the most common questions about Arvithex Capital Alliance.">
    {[
      ["How do I open an account?", "Click Sign Up, complete the short form, and your account is ready in under 60 seconds."],
      ["What's the minimum deposit?", "Our Bronze plan starts at $100. Other plans start higher."],
      ["How fast are withdrawals?", "Crypto withdrawals are typically processed within a few hours of approval."],
      ["Is my data secure?", "All sensitive data is encrypted in transit and at rest. We never store private keys."],
      ["Do you charge fees?", "We charge a small spread on trades. Deposits and standard withdrawals are free."],
    ].map(([q, a]) => (
      <div key={q}>
        <h3 className="text-lg font-bold text-white">{q}</h3>
        <p className="mt-1 text-white/80">{a}</p>
      </div>
    ))}
  </MarketingPage>
);

export const Terms = () => (
  <MarketingPage title="Terms & Privacy" intro="Last updated June 2026.">
    <p>By using CryptoVault you agree to be bound by these Terms. Crypto investments are volatile and may lose value. You are responsible for the security of your own wallet credentials.</p>
    <p>We collect only the information needed to operate the platform and comply with applicable AML/KYC regulations. We never sell your data.</p>
    <p>Disputes are resolved by binding arbitration in the jurisdiction of incorporation.</p>
  </MarketingPage>
);

export const Policies = () => (
  <MarketingPage title="Platform Policies" intro="Acceptable use, refunds, and operational policies.">
    <p>No fraudulent activity, money laundering, sanctions-list activity, or market manipulation is permitted. Violations result in immediate account suspension.</p>
    <p>Refunds are only available where required by law. All trading positions are final once executed.</p>
    <p>Service availability is targeted at 99.9% uptime but is not guaranteed.</p>
  </MarketingPage>
);
