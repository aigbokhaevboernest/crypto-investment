import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";

const AUTH_ROUTES = ["/login", "/signup"];
const DISPLAY_MS = 500;

// Shows a full-screen white loader briefly whenever navigation enters
// or leaves /login or /signup. There's no real async page-load to hook
// into (routes are statically imported), so this masks the transition
// for a fixed duration instead.
export default function AuthNavLoader() {
  const { pathname } = useLocation();
  const prevPathname = useRef(pathname);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const wasAuthRoute = AUTH_ROUTES.includes(prevPathname.current);
    const isAuthRoute = AUTH_ROUTES.includes(pathname);
    const crossingAuthBoundary =
      prevPathname.current !== pathname && (wasAuthRoute || isAuthRoute);

    prevPathname.current = pathname;

    if (!crossingAuthBoundary) return;

    setVisible(true);
    const timer = setTimeout(() => setVisible(false), DISPLAY_MS);
    return () => clearTimeout(timer);
  }, [pathname]);

  if (!visible) return null;

  return (
    <div
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "#ffffff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div className="loader" />
      <style>{`
        .loader {
          width: 60px;
          aspect-ratio: 1;
          display: flex;
          animation: l8-0 2s infinite steps(1);
        }
        .loader::before,
        .loader::after {
          content: "";
          flex: 1;
          animation:
            l8-1 1s infinite linear alternate,
            l8-2 2s infinite steps(1) -.5s;
        }
        .loader::after {
          --s: -1,-1;
        }
        @keyframes l8-0 {
          0%  { transform: scaleX(1)  rotate(0deg); }
          50% { transform: scaleX(-1) rotate(-90deg); }
        }
        @keyframes l8-1 {
          0%, 5%   { transform: scale(var(--s,1)) translate(0px)   perspective(150px) rotateY(0deg); }
          33%      { transform: scale(var(--s,1)) translate(-10px) perspective(150px) rotateX(0deg); }
          66%      { transform: scale(var(--s,1)) translate(-10px) perspective(150px) rotateX(-180deg); }
          95%,100% { transform: scale(var(--s,1)) translate(0px)   perspective(150px) rotateX(-180deg); }
        }
        @keyframes l8-2 {
          0%  { background: #f03355; }
          50% { background: #ffa516; }
        }
      `}</style>
    </div>
  );
}
