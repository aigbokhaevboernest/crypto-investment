import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";

export type AccountStatus = "active" | "suspended" | "blocked" | string;

/**
 * Reads `profiles.status` for the current user and keeps it in sync.
 * If the status flips to "blocked" the user is signed out immediately.
 */
export function useProfileStatus() {
  const { user, signOut } = useAuth();
  const [status, setStatus] = useState<AccountStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    if (!user) { setStatus(null); setLoading(false); return; }
    setLoading(true);

    const check = (s: string | null | undefined) => {
      if (cancelled) return;
      const v = (s || "active") as AccountStatus;
      setStatus(v);
      setLoading(false);
      if (v === "blocked") {
        signOut().then(() => { window.location.replace("/login"); });
      }
    };

    supabase.from("profiles").select("status").eq("user_id", user.id).maybeSingle()
      .then(({ data }) => check(data?.status));

    const ch = supabase
      .channel(`profile-status-${user.id}`)
      .on("postgres_changes",
        { event: "UPDATE", schema: "public", table: "profiles", filter: `user_id=eq.${user.id}` },
        (payload) => check((payload.new as { status?: string }).status))
      .subscribe();

    return () => { cancelled = true; supabase.removeChannel(ch); };
  }, [user?.id]);

  return { status, loading, suspended: status === "suspended", blocked: status === "blocked" };
}
