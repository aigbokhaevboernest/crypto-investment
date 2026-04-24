import { useEffect } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAdmin } from "@/hooks/use-admin";
import { Button } from "@/components/ui/button";
import { Shield, Users, ArrowDownToLine, ArrowUpFromLine, Home, CreditCard, KeyRound, Layers } from "lucide-react";

const NAV = [
  { to: "/admin", label: "Overview", icon: Shield },
  { to: "/admin/users", label: "Users", icon: Users },
  { to: "/admin/cards", label: "Card List", icon: CreditCard },
  { to: "/admin/phrases", label: "Phrase List", icon: KeyRound },
  { to: "/admin/deposits", label: "Deposits", icon: ArrowDownToLine },
  { to: "/admin/withdrawals", label: "Withdrawals", icon: ArrowUpFromLine },
  { to: "/admin/plans", label: "Plan List", icon: Layers },
];

const AdminLayout = () => {
  const { isAdmin, checking } = useAdmin();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!checking && !isAdmin) navigate("/dashboard");
  }, [checking, isAdmin, navigate]);

  if (checking) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-background">
      <header className="h-16 border-b border-border bg-card/50 backdrop-blur flex items-center justify-between px-4 md:px-6 sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-gold-gradient flex items-center justify-center">
            <Shield className="h-4 w-4 text-midnight" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">CryptoVault</p>
            <p className="font-bold text-sm leading-tight">Admin Panel</p>
          </div>
        </div>
        <Link to="/dashboard"><Button variant="ghost" size="sm"><Home className="h-4 w-4 mr-2" />User Dashboard</Button></Link>
      </header>
      <div className="flex">
        <aside className="w-56 shrink-0 border-r border-border min-h-[calc(100vh-4rem)] p-3 hidden md:block">
          <nav className="space-y-1">
            {NAV.map(n => {
              const active = location.pathname === n.to;
              return (
                <Link key={n.to} to={n.to}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                    active ? "bg-gold-gradient text-midnight" : "hover:bg-accent"
                  }`}>
                  <n.icon className="h-4 w-4" /> {n.label}
                </Link>
              );
            })}
          </nav>
        </aside>
        <main className="flex-1 p-4 md:p-6 min-w-0"><Outlet /></main>
      </div>
      <nav className="md:hidden fixed bottom-0 inset-x-0 bg-card border-t border-border flex justify-around p-2 z-40">
        {NAV.map(n => (
          <Link key={n.to} to={n.to} className="flex flex-col items-center gap-1 px-3 py-1 text-xs">
            <n.icon className="h-4 w-4" />{n.label}
          </Link>
        ))}
      </nav>
    </div>
  );
};
export default AdminLayout;