import { MarketingPage } from "@/components/MarketingPage";

const Contact = () => (
  <MarketingPage
    title="Contact"
    intro="Our support team is available 24/7."
  >
    <p>
      For account questions, deposits, withdrawals, or anything else, reach us
      through the channels below. Most issues are resolved within a few hours.
    </p>
    <ul className="space-y-2">
      <li><strong className="text-white">Email:</strong> support@cryptovault.app</li>
      <li><strong className="text-white">Live chat:</strong> available inside your dashboard, 24/7</li>
      <li><strong className="text-white">Office hours:</strong> Mon–Fri, 9:00–18:00 UTC</li>
    </ul>
    <p>
      For partnership or institutional inquiries, write to{" "}
      <span className="text-primary font-semibold">partners@cryptovault.app</span>.
    </p>
  </MarketingPage>
);

export default Contact;
