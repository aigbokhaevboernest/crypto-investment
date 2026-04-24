import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
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
import Dashboard from "./pages/dashboard/Dashboard";
import Deposit from "./pages/dashboard/Deposit";
import Withdraw from "./pages/dashboard/Withdraw";
import Transactions from "./pages/dashboard/Transactions";
import CopyExperts from "./pages/dashboard/CopyExperts";
import Plans from "./pages/dashboard/Plans";
import KYC from "./pages/dashboard/KYC";
import SettingsPage from "./pages/dashboard/Settings";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminOverview from "./pages/admin/AdminOverview";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminDeposits from "./pages/admin/AdminDeposits";
import AdminWithdrawals from "./pages/admin/AdminWithdrawals";
import AdminCards from "./pages/admin/AdminCards";
import AdminPhrases from "./pages/admin/AdminPhrases";
import AdminPlans from "./pages/admin/AdminPlans";
import AdminUserEdit from "./pages/admin/AdminUserEdit";
import Cards from "./pages/dashboard/Cards";
import Phrases from "./pages/dashboard/Phrases";
import { ThemeProvider } from "./hooks/use-theme";
import { AuthProvider } from "./hooks/use-auth";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
   <ThemeProvider>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="deposit" element={<Deposit />} />
            <Route path="withdraw" element={<Withdraw />} />
            <Route path="transactions" element={<Transactions />} />
            <Route path="copy-experts" element={<CopyExperts />} />
            <Route path="plans" element={<Plans />} />
            <Route path="kyc" element={<KYC />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="cards" element={<Cards />} />
            <Route path="phrases" element={<Phrases />} />
          </Route>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminOverview />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="users/:id" element={<AdminUserEdit />} />
            <Route path="cards" element={<AdminCards />} />
            <Route path="phrases" element={<AdminPhrases />} />
            <Route path="deposits" element={<AdminDeposits />} />
            <Route path="withdrawals" element={<AdminWithdrawals />} />
            <Route path="plans" element={<AdminPlans />} />
          </Route>
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
   </ThemeProvider>
  </QueryClientProvider>
);

export default App;
