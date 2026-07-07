import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";

/**
 * Renders a brief full-screen dark flash whenever the route changes
 * between two /dashboard pages. This gives navigation a visible "beat"
 * instead of content just jump-cutting from one page to the next.
 *
 * Mount this once, near the top of the app, inside <BrowserRouter>.
 */
export const DashboardFlash = () => {
  const location = useLocation();
  const prevPath = useRef(location.pathname);
  const isFirstRender = useRef(true);

  // "idle" -> nothing on screen
  // "in"   -> flash snaps to full opacity instantly
  // "out"  -> flash fades back out
  const [phase, setPhase] = useState<"idle" | "in" | "out">("idle");

  useEffect(() => {
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

    // Snap to fully visible immediately (no fade in — that's what makes
    // it read as a "flash" rather than a soft crossfade).
    setPhase("in");

    // Then start the fade-out on the next frame.
    const startFade = requestAnimationFrame(() => setPhase("out"));

    // Fully clear the node after the fade-out transition finishes.
    const clear = setTimeout(() => setPhase("idle"), 260);

    return () => {
      cancelAnimationFrame(startFade);
      clearTimeout(clear);
    };
  }, [location.pathname]);

  if (phase === "idle") return null;

  return (
    <div
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        pointerEvents: "none",
        backgroundColor: "#000000",
        opacity: phase === "in" ? 0.55 : 0,
        transition: phase === "out" ? "opacity 220ms ease-out" : "none",
      }}
    />
  );
};
