import { ReactNode, useEffect, useState } from "react";
import { Link, useLocation, useNavigate, Outlet } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useIdleLogout } from "@/hooks/use-idle-logout";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard, Users, ArrowDownToLine, History, ArrowUpFromLine, ShieldCheck,
  Layers, Settings, LogOut, Menu, X, Wallet,
} from "lucide-react";

const NAV = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/dashboard/copy-experts", label: "Copy Experts", icon: Users },
  { to: "/dashboard/deposit", label: "Deposit", icon: ArrowDownToLine },
  { to: "/dashboard/withdraw", label: "Withdraw", icon: ArrowUpFromLine },
  { to: "/dashboard/connect-wallet", label: "Connect Wallet", icon: Wallet },
  { to: "/dashboard/transactions", label: "Transaction History", icon: History },
  { to: "/dashboard/kyc", label: "AML / KYC", icon: ShieldCheck },
  { to: "/dashboard/plans", label: "Trading Plans", icon: Layers },
  { to: "/dashboard/settings", label: "Settings", icon: Settings },
];

export const DashboardLayout = ({ children }: { children?: ReactNode }) => {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [profile, setProfile] = useState<{ full_name: string; account_level: string } | null>(null);

  useIdleLogout(30 * 60 * 1000);

  useEffect(() => {
    if (!loading && !user) navigate("/login");
  }, [user, loading, navigate]);

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("full_name, account_level").eq("id", user.id).maybeSingle()
      .then(({ data }) => data && setProfile(data));
  }, [user]);

  if (loading || !user) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  const initials = (profile?.full_name || user.email || "U").trim().split(" ").map((s) => s[0]).slice(0, 2).join("").toUpperCase();

  const SidebarInner = (
    <aside className="w-64 shrink-0 border-r border-sidebar-border bg-sidebar text-sidebar-foreground flex flex-col min-h-screen h-full">
      <div className="p-5 border-b border-sidebar-border">
        <Link to="/" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center font-black text-primary-foreground">C</div>
          <span className="font-bold text-lg text-white">CryptoVault</span>
        </Link>
      </div>
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {NAV.map((n) => {
          const active = location.pathname === n.to;
          return (
            <Link
              key={n.to}
              to={n.to}
              onClick={() => setOpen(false)}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                active
                  ? "bg-primary text-primary-foreground shadow-gold"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-white"
              }`}
            >
              <n.icon className="h-4 w-4" /> {n.label}
            </Link>
          );
        })}

        {/* Logout sits directly below Settings with a small visual gap */}
        <div className="pt-3">
          <button
            onClick={async () => { await signOut(); navigate("/"); }}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent hover:text-white transition"
          >
            <LogOut className="h-4 w-4" /> Logout
          </button>
        </div>

      </nav>
    </aside>
  );

  return (
    <div className="min-h-screen flex bg-background">
      <div className="hidden lg:flex">{SidebarInner}</div>

      {/* Mobile drawer with smooth slide transform */}
      <div
        className={`fixed inset-0 z-50 lg:hidden pointer-events-none ${open ? "pointer-events-auto" : ""}`}
        aria-hidden={!open}
      >
        <div
          className={`fixed inset-0 bg-black/60 transition-opacity duration-250 ease-in-out ${open ? "opacity-100" : "opacity-0"}`}
          onClick={() => setOpen(false)}
        />
        <div
          className={`relative h-full transition-transform duration-[250ms] ease-in-out ${open ? "translate-x-0" : "-translate-x-full"}`}
        >
          {SidebarInner}
        </div>
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        <header
          className="h-16 border-b border-border flex items-center justify-between px-4 md:px-6 sticky top-0 z-30"
          style={{ backgroundColor: "#172640", color: "#FFFFFF" }}
        >
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="lg:hidden text-white hover:bg-white/10" onClick={() => setOpen(!open)}>
              {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </Button>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-white/10 border border-white/20 px-3 py-1 text-xs font-bold uppercase tracking-wider text-white">
              {profile?.account_level || "basic"} account
            </span>
            <Button size="sm" onClick={() => navigate("/dashboard/connect-wallet")}>
              <Wallet className="h-4 w-4" /> Connect Wallet
            </Button>
            <div className="h-9 w-9 rounded-full bg-primary text-primary-foreground font-black flex items-center justify-center text-sm">
              {initials}
            </div>
          </div>
        </header>
        <main className="flex-1 p-4 md:p-6">{children ?? <Outlet />}</main>
      </div>
    </div>
  );
};
