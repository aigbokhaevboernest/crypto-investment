import { Link } from "react-router-dom";
import BrandLogo from "@/components/BrandLogo";

const SECTIONS = [
  {
    title: "Platform",
    links: [
      { label: "Plans", to: "/#plans" },
      { label: "Copy Trading", to: "/#traders" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", to: "/about" },
      { label: "Account Types", to: "/account-types" },
      { label: "Contact", to: "/contact" },
      { label: "FAQ", to: "/faq" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Terms & Privacy", to: "/terms" },
      { label: "Licences & Regulation", to: "/licences" },
      { label: "AML/KYC", to: "/aml-kyc" },
      { label: "Risk Disclosure", to: "/risk-disclosure" },
    ],
  },
];

export const Footer = () => (
  <footer className="border-t border-border/40 bg-card/30 py-12 mt-12">
    <div className="container grid md:grid-cols-4 gap-8 text-sm">
      <div>
        <div className="mb-3">
  <BrandLogo className="h-10 w-auto" />
</div>
        <p className="text-muted-foreground">Smart crypto mining, AI trading & copy trading platform.</p>
      </div>
      {SECTIONS.map((s) => (
        <div key={s.title}>
          <h4 className="font-semibold mb-3">{s.title}</h4>
          <ul className="space-y-2 text-muted-foreground">
            {s.links.map((l) => (
              <li key={l.label}>
                <Link to={l.to} className="hover:text-primary transition">{l.label}</Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
    <div className="container mt-8 pt-6 border-t border-border/40 text-xs text-muted-foreground text-center">
      © {new Date().getFullYear()} CryptoVault. All rights reserved. Crypto investments are subject to market risk.
    </div>
  </footer>
);
