import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const KEY = "tv:last-activity";
const FORCE = "tv:force-logout";
const EVENTS = [
  "mousemove", "mousedown", "click", "scroll", "keydown",
  "touchstart", "touchmove", "pointerdown",
] as const;

const clearAuth = () => {
  try {
    [localStorage, sessionStorage].forEach((s) => {
      for (let i = s.length - 1; i >= 0; i--) {
        const k = s.key(i);
        if (k && (/supabase\.auth/i.test(k) || /^sb-.*-auth-token$/i.test(k))) {
          s.removeItem(k);
        }
      }
    });
    document.cookie.split(";").forEach((c) => {
      const name = c.split("=")[0].trim();
      if (/supabase|^sb-/i.test(name)) {
        document.cookie = `${name}=; Max-Age=0; path=/`;
      }
    });
  } catch {}
};

export const useIdleLogout = (timeoutMs = 30 * 60 * 1000) => {
  useEffect(() => {
    const stamp = () => {
      try { localStorage.setItem(KEY, Date.now().toString()); } catch {}
    };

    const expire = async () => {
      try { localStorage.setItem(FORCE, "1"); } catch {}
      try { await supabase.auth.signOut({ scope: "global" }); } catch {}
      clearAuth();
      window.location.replace("/login");
    };

    const check = () => {
      let last = 0;
      try { last = Number(localStorage.getItem(KEY) || 0); } catch {}
      if (!last) { stamp(); return; }
      if (Date.now() - last > timeoutMs) expire();
    };

    const onStorage = (e: StorageEvent) => {
      if (e.key === FORCE && e.newValue === "1") {
        clearAuth();
        window.location.replace("/login");
      }
    };

    // On tab becoming visible again, CHECK idle time instead of
    // blindly re-stamping — otherwise backgrounding the tab and
    // returning after 30+ min never triggers logout.
    const onVisibility = () => {
      if (document.visibilityState === "visible") check();
    };

    stamp();
    EVENTS.forEach((ev) => window.addEventListener(ev, stamp, { passive: true }));
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("storage", onStorage);
    const heartbeat = window.setInterval(check, 15_000);

    return () => {
      EVENTS.forEach((ev) => window.removeEventListener(ev, stamp));
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("storage", onStorage);
      window.clearInterval(heartbeat);
    };
  }, [timeoutMs]);
};
