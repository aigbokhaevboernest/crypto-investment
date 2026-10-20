import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";

const GuestOnly = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-muted border-t-primary" />
      </div>
    );
  }

  // Logged in: public pages are off limits. `replace` keeps them out of history.
  if (user) return <Navigate to="/dashboard" replace />;

  return <Outlet />;
};

export default GuestOnly;
