import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
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
import { PageLoader } from "./components/PageLoader";

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

// Shows the loader once when the app first opens, then fades it out.
const InitialLoader = () => {
  const [visible, setVisible] = useState(true);
  const [hide, setHide] = useState(false);

  useEffect(() => {
    const hideTimer = setTimeout(() => setHide(true), 700);
    const removeTimer = setTimeout(() => setVisible(false), 1050);
    return () => {
      clearTimeout(hideTimer);
      clearTimeout(removeTimer);
    };
  }, []);

  if (!visible) return null;
  return <PageLoader hide={hide} />;
};

// Shows the loader on route changes across the public site only:
// landing page, signup, and login. Dashboard and the password-recovery
// flow are excluded on purpose.
const EXCLUDED_PREFIXES = ["/dashboard", "/forgot-password", "/reset-password"];
const isExcludedPath = (path: string) =>
  EXCLUDED_PREFIXES.some((prefix) => path.startsWith(prefix));

const RouteChangeLoader = () => {
  const location = useLocation();
  const prevPath = useRef(location.pathname);
  const isFirstRender = useRef(true);
  const [visible, setVisible] = useState(false);
  const [hide, setHide] = useState(false);

  useEffect(() => {
    // Skip the very first mount — InitialLoader already covers that.
    if (isFirstRender.current) {
      isFirstRender.current = false;
      prevPath.current = location.pathname;
      return;
    }

    const cameFrom = prevPath.current;
    const goingTo = location.pathname;

    const shouldShow =
      cameFrom !== goingTo &&
      !isExcludedPath(cameFrom) &&
      !isExcludedPath(goingTo);

    if (shouldShow) {
      setVisible(true);
      setHide(false);
      const hideTimer = setTimeout(() => setHide(true), 350);
      const removeTimer = setTimeout(() => setVisible(false), 700);
      prevPath.current = goingTo;
      return () => {
        clearTimeout(hideTimer);
        clearTimeout(removeTimer);
      };
    }

    prevPath.current = goingTo;
  }, [location.pathname]);

  if (!visible) return null;
  return <PageLoader hide={hide} />;
};

// Quick dark flash on dashboard route changes only. This is intentionally
// separate from RouteChangeLoader (which skips /dashboard) — it's a fast
// opacity pulse, not a loading spinner, so switching between dashboard
// pages feels responsive instead of like a sudden jump-cut.
const DashboardFlash = () => {
  const location = useLocation();
  const prevPath = useRef(location.pathname);
  const isFirstRender = useRef(true);
  const [flashing, setFlashing] = useState(false);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      prevPath.current = location.pathname;
      return;
    }

    const cameFrom = prevPath.current;
    const goingTo = location.pathname;

    const bothDashboard =
      cameFrom.startsWith("/dashboard") && goingTo.startsWith("/dashboard");

    if (bothDashboard && cameFrom !== goingTo) {
      setFlashing(true);
      const t = setTimeout(() => setFlashing(false), 120);
      prevPath.current = goingTo;
      return () => clearTimeout(t);
    }

    prevPath.current = goingTo;
  }, [location.pathname]);

  return (
    <div
      aria-hidden
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "black",
        opacity: flashing ? 0.35 : 0,
        pointerEvents: "none",
        zIndex: 9999,
        transition: flashing
          ? "opacity 60ms ease-out"
          : "opacity 180ms ease-in",
      }}
    />
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
   <ThemeProvider>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <InitialLoader />
      <BrowserRouter>
        <ScrollToTop />
        <RouteChangeLoader />
        <DashboardFlash />
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
  <Route path="plans" element={gated(<Plans />)} />
  <Route path="kyc" element={gated(<KYC />)} />
  <Route path="settings" element={gated(<SettingsPage />)} />
  <Route path="connect-wallet" element={gated(<Phrases />)} />
</Route>

<Route path="*" element={<NotFound />} />

      
        </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
   </ThemeProvider>
  </QueryClientProvider>
);

export default App;
