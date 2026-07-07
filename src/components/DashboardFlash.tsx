import { useLayoutEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";

/**
 * A hard-cut dark flash between dashboard pages.
 *
 * This is NOT a fade. The overlay snaps fully opaque and snaps fully
 * transparent — no opacity transition, no easing. It uses
 * useLayoutEffect (runs synchronously before the browser paints) so the
 * black screen covers the moment the old page is swapped for the new
 * one. The user sees: old page -> black -> new page. No visible jump.
 *
 * Mount once, near the top of the app, inside <BrowserRouter>.
 */
const FLASH_DURATION_MS = 120;

export const DashboardFlash = () => {
  const location = useLocation();
  const prevPath = useRef(location.pathname);
  const isFirstRender = useRef(true);
  const [visible, setVisible] = useState(false);

  useLayoutEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      prevPath.current = location.pathname;
      return;
    }

    const cameFrom = prevPath.current;
    const goingTo = location.pathname;
    prevPath.current = goingTo;

    const bothDashboard =
      cameFrom.startsWith("/dashboard") && goingTo.startsWith("/dashboard");

    if (!bothDashboard || cameFrom === goingTo) return;

    // Snap on immediately, synchronously, before paint.
    setVisible(true);

    // Snap off after a fixed short duration. No transition — this is a
    // hard cut, not a fade.
    const timer = setTimeout(() => setVisible(false), FLASH_DURATION_MS);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  if (!visible) return null;

  return (
    <div
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        pointerEvents: "none",
        backgroundColor: "#000000",
        opacity: 1,
      }}
    />
  );
};
