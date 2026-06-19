import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";

export type AccountStatus = "active" | "suspended" | "blocked" | string;

// Module-level cache keyed by user id so revisits resolve instantly with no flicker.
const statusCache = new Map<string, AccountStatus>();

export function useProfileStatus() {
  const { user, signOut } = useAuth();
  const cached = user ? statusCache.get(user.id) ?? null : null;
  const [status, setStatus] = useState<AccountStatus | null>(cached);
  const [loading, setLoading] = useState(!cached);

  useEffect(() => {
    let cancelled = false;
    if (!user) { setStatus(null); setLoading(false); return; }
    const c = statusCache.get(user.id);
    if (c) { setStatus(c); setLoading(false); }

    const check = (s: string | null | undefined) => {
      if (cancelled) return;
      const v = (s || "active") as AccountStatus;
      statusCache.set(user.id, v);
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
