import GuestOnly from "@/components/GuestOnly";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  BrowserRouter,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router-dom";
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
import { DashboardFlash } from "./components/DashboardFlash";
import LanguageSwitcher from "./components/LanguageSwitcher";
import { SuspendedGate } from "./components/dashboard/SuspendedGate";

const queryClient = new QueryClient();

const wrap = (el: React.ReactNode) => <RouteSkeleton>{el}</RouteSkeleton>;
const gated = (el: React.ReactNode) => (
  <RouteSkeleton>
    <SuspendedGate>{el}</SuspendedGate>
  </RouteSkeleton>
);

// Resets scroll position to the top on every route change.
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

// Keeps a logged-in user inside /dashboard when pressing back / swiping back.
// Only mounted while the dashboard is rendered, so it disappears on logout
// (DashboardLayout redirects to login once the session is gone).
const DashboardBackLock = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Sentinel entry so "back" has somewhere to land that is still the dashboard.
    window.history.pushState({ dashboardLock: true }, "", window.location.href);

    const onPopState = () => {
      if (!window.location.pathname.startsWith("/dashboard")) {
        navigate("/dashboard", { replace: true });
      } else {
        // Still inside the dashboard: re-add the sentinel so the
        // history stack never runs out and exits the app.
        window.history.pushState(
          { dashboardLock: true },
          "",
          window.location.href
        );
      }
    };

    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [navigate]);

  return null;
};

const DashboardShell = () => (
  <>
    <DashboardBackLock />
    <DashboardLayout />
  </>
);

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

// Shows the loader on route changes across the public site only.
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
          <LanguageSwitcher />
          <AuthProvider>
            <Routes>
              {/* Public only: logged-in users are redirected to /dashboard */}
              <Route element={<GuestOnly />}>
                <Route path="/" element={<Index />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/login" element={<Login />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />

                <Route path="/about" element={<About />} />
                <Route path="/account-types" element={<AccountTypes />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/licences" element={<Licences />} />
                <Route path="/aml-kyc" element={<AMLKYC />} />
                <Route path="/risk-disclosure" element={<RiskDisclosure />} />
                <Route path="/faq" element={<FAQ />} />
                <Route path="/terms" element={<Terms />} />
                <Route path="/policies" element={<Policies />} />
              </Route>

              {/* Recovery sessions count as logged in, so keep this outside GuestOnly */}
              <Route path="/reset-password" element={<ResetPassword />} />

              {/* Authenticated app: NOT inside GuestOnly */}
              <Route path="/dashboard" element={<DashboardShell />}>
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
