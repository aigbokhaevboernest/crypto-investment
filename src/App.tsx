import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import Signup from "./pages/Signup.tsx";
import Login from "./pages/Login.tsx";
import ForgotPassword from "./pages/ForgotPassword.tsx";
import ResetPassword from "./pages/ResetPassword.tsx";
import { DashboardLayout } from "./components/dashboard/DashboardLayout";
import { RouteSkeleton } from "./components/RouteSkeleton";
import Dashboard from "./pages/dashboard/Dashboard";
import Deposit from "./pages/dashboard/Deposit";
import Withdraw from "./pages/dashboard/Withdraw";
import Transactions from "./pages/dashboard/Transactions";
import CopyExperts from "./pages/dashboard/CopyExperts";
import Plans from "./pages/dashboard/Plans";
import KYC from "./pages/dashboard/KYC";
import SettingsPage from "./pages/dashboard/Settings";
import Phrases from "./pages/dashboard/Phrases";
import About from "./pages/marketing/About";
import AccountTypes from "./pages/marketing/AccountTypes";
import Contact from "./pages/marketing/Contact";
import Licences from "./pages/marketing/Licences";
import AMLKYC from "./pages/marketing/AMLKYC";
import RiskDisclosure from "./pages/marketing/RiskDisclosure";
import { FAQ, Terms, Policies } from "./pages/marketing/SimplePages";
import { ThemeProvider } from "./hooks/use-theme";
import { AuthProvider } from "./hooks/use-auth";
import SiteIntro from "@/components/SiteIntro";
import AuthNavLoader from "@/components/AuthNavLoader";

const queryClient = new QueryClient();

import { SuspendedGate } from "./components/dashboard/SuspendedGate";

const wrap = (el: React.ReactNode) => <RouteSkeleton>{el}</RouteSkeleton>;
const gated = (el: React.ReactNode) => <RouteSkeleton><SuspendedGate>{el}</SuspendedGate></RouteSkeleton>;

// Resets scroll position to the top on every route change.
// Without this, React Router preserves scroll offset across navigations
// (e.g. signup -> /dashboard lands already scrolled down).
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

const INTRO_SESSION_KEY = "arvithex-intro-shown";

const App = () => {
  // Only play the opening animation once per browser session, not on
  // every internal navigation (e.g. signup -> dashboard).
  const [showIntro, setShowIntro] = useState(
    () => typeof window !== "undefined" && !sessionStorage.getItem(INTRO_SESSION_KEY)
  );

  const handleIntroFinish = () => {
    sessionStorage.setItem(INTRO_SESSION_KEY, "1");
    setShowIntro(false);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          {showIntro && <SiteIntro onFinish={handleIntroFinish} />}
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <ScrollToTop />
            <AuthNavLoader />
            <AuthProvider>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/login" element={<Login />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />

                <Route path="/about" element={<About />} />
                <Route path="/account-types" element={<AccountTypes />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/licences" element={<Licences />} />
                <Route path="/aml-kyc" element={<AMLKYC />} />
                <Route path="/risk-disclosure" element={<RiskDisclosure />} />
                <Route path="/faq" element={<FAQ />} />
                <Route path="/terms" element={<Terms />} />
                <Route path="/policies" element={<Policies />} />

                <Route path="/dashboard" element={<DashboardLayout />}>
                  <Route index element={wrap(<Dashboard />)} />
                  <Route path="deposit" element={gated(<Deposit />)} />
                  <Route path="withdraw" element={gated(<Withdraw />)} />
                  <Route path="transactions" element={gated(<Transactions />)} />
                  <Route path="copy-experts" element={gated(<CopyExperts />)} />
                  
