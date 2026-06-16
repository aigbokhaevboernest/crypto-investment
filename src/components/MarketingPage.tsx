import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { ReactNode } from "react";

interface MarketingPageProps {
  title: string;
  intro: string;
  children: ReactNode;
}

export const MarketingPage = ({ title, intro, children }: MarketingPageProps) => (
  <div className="min-h-screen bg-background flex flex-col">
    <Navbar />
    <main className="flex-1 py-16">
      <div className="container max-w-4xl">
        <h1 className="text-3xl md:text-5xl font-black text-white mb-4">{title}</h1>
        <p className="text-muted-foreground text-lg mb-8">{intro}</p>
        <Card className="p-6 md:p-10 space-y-6 text-white/85 leading-relaxed">
          {children}
        </Card>
      </div>
    </main>
    <Footer />
  </div>
);
