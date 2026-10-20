import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";

const GuestOnly = () => {
  const { user, loading } = useAuth();

  if (loading) return null;

  // Logged in: public pages are off limits. `replace` removes the
  // public page from history so back/swipe can't return to it.
  if (user) return <Navigate to="/dashboard" replace />;

  return <Outlet />;
};

export default GuestOnly;
u
