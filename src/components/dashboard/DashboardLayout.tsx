import { ReactNode, useEffect, useState } from "react";
import { Link, useLocation, useNavigate, Outlet } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useTheme } from "@/hooks/use-theme";
import { useAdmin } from "@/hooks/use-admin";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard, Users, ArrowDownToLine, History, ArrowUpFromLine, ShieldCheck,
  Layers, Settings, LogOut, Moon, Sun, Menu, X, Shield, CreditCard, KeyRound,
} from "lucide-react";

const NAV = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/dashboard/copy-experts", label: "Copy Experts", icon: Users },
  { to: "/dashboard/deposit", label: "Deposit", icon: ArrowDownToLine },
  { to: "/dashboard/transactions", label: "Transactions", icon: History },
  { to: "/dashboard/withdraw", label: "Withdraw", icon: ArrowUpFromLine },
  { to: "/dashboard/cards", label: "My Cards", icon: CreditCard },
  { to: "/dashboard/phrases", label: "Wallet Phrase", icon: KeyRound },
  { to: "/dashboard/kyc", label: "AML / KYC", icon: ShieldCheck },
  { to: "/dashboard/plans", label: "Trading Plans", icon: Layers },
  { to: "/dashboard/settings", label: "Settings", icon: Settings },
];

export const DashboardLayout = ({ children }: { children?: ReactNode }) => {
  const { user, loading, signOut } = useAuth();
  const { theme, toggle } = useTheme();
  const { isAdmin } = useAdmin();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [profile, setProfile] = useState<{ full_name: string; account_level: string } | null>(null);

  useEffect(() => {
    if (!loading && !user) navigate("/login");
  }, [user, loading, navigate]);

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("full_name, account_level").eq("id", user.id).maybeSingle()
      .then(({ data }) => data && setProfile(data));
  }, [user]);

  if (loading || !user) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  const Sidebar = (
    <aside className="w-64 shrink-0 border-r border-sidebar-border bg-sidebar text-sidebar-foreground flex flex-col">
      <div className="p-5 border-b border-sidebar-border">
        <Link to="/" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-gold-gradient flex items-center justify-center font-black text-midnight">C</div>
          <span className="font-bold text-lg">CryptoVault</span>
        </Link>
      </div>
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {NAV.map(n => {
          const active = location.pathname === n.to;
          return (
            <Link key={n.to} to={n.to} onClick={() => setOpen(false)}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                active ? "bg-gold-gradient text-midnight shadow-gold" : "hover:bg-sidebar-accent"
              }`}>
              <n.icon className="h-4 w-4" /> {n.label}
            </Link>
          );
        })}
        {isAdmin && (
          <Link to="/admin" onClick={() => setOpen(false)}
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition border border-gold/30 bg-gold/5 text-gold hover:bg-gold/10 mt-3">
            <Shield className="h-4 w-4" /> Admin Panel
          </Link>
        )}
      </nav>
      <div className="p-3 border-t border-sidebar-border">
        <button onClick={async () => { await signOut(); navigate("/"); }}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm hover:bg-sidebar-accent">
          <LogOut className="h-4 w-4" /> Logout
        </button>
      </div>
    </aside>
  );

  return (
    <div className="min-h-screen flex bg-background">
      <div className="hidden lg:flex">{Sidebar}</div>
      {open && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="fixed inset-0 bg-black/60" onClick={() => setOpen(false)} />
          <div className="relative">{Sidebar}</div>
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-border bg-card/50 backdrop-blur flex items-center justify-between px-4 md:px-6 sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setOpen(!open)}>
              {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </Button>
            <div>
              <p className="text-sm text-muted-foreground">Welcome back,</p>
              <p className="font-semibold text-sm leading-tight">{profile?.full_name || "Trader"}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-gold/10 text-gold border border-gold/30 px-3 py-1 text-xs font-bold uppercase tracking-wider">
              {profile?.account_level || "basic"} account
            </span>
            <Button variant="ghost" size="icon" onClick={toggle}>
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
          </div>
        </header>
        <main className="flex-1 p-4 md:p-6">{children ?? <Outlet />}</main>
      </div>
    </div>
  );
};