import { ReactNode, useEffect, useState } from "react";
import { Link, useLocation, useNavigate, Outlet } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useIdleLogout } from "@/hooks/use-idle-logout";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard, Users, ArrowDownToLine, History, ArrowUpFromLine, ShieldCheck,
  Layers, Settings, LogOut, Menu, X, Wallet, UserCircle2,
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
    supabase.from("profiles").select("full_name, account_level").eq("user_id", user.id).maybeSingle()
      .then(({ data }) => data && setProfile({ full_name: data.full_name || "", account_level: data.account_level || "basic" }));
  }, [user]);

  // Close mobile drawer on route change
  useEffect(() => { setOpen(false); }, [location.pathname]);

  if (loading || !user) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  const SidebarInner = (
    <aside
      onClick={(e) => e.stopPropagation()}
      className="w-64 shrink-0 border-r border-sidebar-border bg-sidebar text-sidebar-foreground flex flex-col min-h-screen h-full"
    >
      <div className="p-5 border-b border-sidebar-border">
        <Link to="/" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center font-black text-black">C</div>
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
                  ? "bg-primary text-black shadow-gold"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-white"
              }`}
            >
              <n.icon className="h-4 w-4" /> {n.label}
            </Link>
          );
        })}
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

      {/* Mobile drawer */}
      <div
        className={`fixed inset-0 z-50 lg:hidden ${open ? "" : "pointer-events-none"}`}
        aria-hidden={!open}
        onClick={() => setOpen(false)}
      >
        <div
          className={`absolute inset-0 bg-black/60 transition-opacity duration-200 ${open ? "opacity-100" : "opacity-0"}`}
        />
        <div
          className={`relative h-full transition-transform duration-200 ease-in-out ${open ? "translate-x-0" : "-translate-x-full"}`}
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
            <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-white/10 border border-white/20 px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-white/85">
              {profile?.account_level || "basic"} account
            </span>
            <Button size="sm" onClick={() => navigate("/dashboard/connect-wallet")}>
              <Wallet className="h-4 w-4" /> Connect Wallet
            </Button>
            <div
              className="h-9 w-9 rounded-full border border-white/30 flex items-center justify-center"
              style={{ backgroundColor: "transparent" }}
              aria-label="Account"
            >
              <UserCircle2 className="h-7 w-7" style={{ color: "#999999" }} />
            </div>
          </div>
        </header>
        <main className="flex-1 p-4 md:p-6">{children ?? <Outlet />}</main>
      </div>
    </div>
  );
};
