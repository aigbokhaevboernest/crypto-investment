import { MarketingPage } from "@/components/MarketingPage";

const Licences = () => (
  <MarketingPage
    title="Licences & Regulation"
    intro="CryptoVault operates under multiple international regulatory frameworks."
  >
    <p>
      We hold money services and virtual asset service provider registrations
      across several jurisdictions. Where local law requires it, we partner
      with licenced custodians and clearing partners to ensure your funds are
      held to the highest standard.
    </p>
    <ul className="list-disc pl-6 space-y-2">
      <li>VASP registration — multiple EU member states</li>
      <li>MSB registration — FinCEN, United States</li>
      <li>Class F licence — Comoros International Financial Authority</li>
    </ul>
    <p>
      Specific licence numbers and counterparty details are available on
      request to verified institutional clients.
    </p>
  </MarketingPage>
);

export default Licences;
