import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

const AuthContext = createContext<{
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
}>({ user: null, session: null, loading: true, signOut: async () => {} });

async function enforceBlockedStatus(userId: string | undefined): Promise<boolean> {
  if (!userId) return false;
  const { data } = await supabase.from("profiles").select("status").eq("user_id", userId).maybeSingle();
  if (data?.status === "blocked") {
    await supabase.auth.signOut();
    if (typeof window !== "undefined") window.location.replace("/login");
    return true;
  }
  return false;
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user?.id) {
        // Defer to avoid deadlocking the auth callback
        setTimeout(() => { void enforceBlockedStatus(s.user.id); }, 0);
      }
    });
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      setUser(s?.user ?? null);
      setLoading(false);
      if (s?.user?.id) void enforceBlockedStatus(s.user.id);
    });
    return () => subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, session, loading, signOut: async () => { await supabase.auth.signOut(); } }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
