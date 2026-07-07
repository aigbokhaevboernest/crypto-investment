import { useEffect, useRef, useState } from "react";

/**
 * SiteIntro
 * A one-time opening sequence: a cyan price line draws itself across
 * a dark panel while a counter ticks upward, then the line's final
 * peak becomes the logo mark and the panel wipes away to reveal the site.
 *
 * Usage in App.tsx:
 *   const [introDone, setIntroDone] = useState(false);
 *   return (
 *     <>
 *       {!introDone && <SiteIntro onFinish={() => setIntroDone(true)} />}
 *       <YourAppContent />
 *     </>
 *   );
 *
 * Respects prefers-reduced-motion by skipping straight to the reveal.
 */

const NAVY = "#172640";
const CYAN = "#00B8E0";
const BG = "#0B1220";

// A jagged-then-rising path, evocative of a market chart trending up.
const CHART_PATH =
  "M 0,150 L 40,140 L 80,158 L 120,120 L 160,132 L 200,90 L 240,104 L 280,60 L 320,72 L 360,30 L 400,42 L 440,18";

export default function SiteIntro({ onFinish, brandName = "Arvithex" }) {
  const [phase, setPhase] = useState("draw"); // draw -> count -> wipe -> done
  const pathRef = useRef(null);
  const [count, setCount] = useState(0);
  const reduced =
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

  useEffect(() => {
    if (reduced) {
      onFinish?.();
      return;
    }

    const t1 = setTimeout(() => setPhase("count"), 1100);
    const t2 = setTimeout(() => setPhase("wipe"), 2000);
    const t3 = setTimeout(() => onFinish?.(), 2650);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [reduced, onFinish]);

  useEffect(() => {
    if (phase !== "count" && phase !== "wipe") return;
    let raf;
    const start = performance.now();
    const duration = 700;
    const tick = (now) => {
      const p = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setCount(Math.round(eased * 250384));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [phase]);

  if (reduced) return null;

  return (
    <div
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: BG,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        gap: "1.25rem",
        transform: phase === "wipe" ? "translateY(-100%)" : "translateY(0)",
        transition: "transform 650ms cubic-bezier(0.65, 0, 0.35, 1)",
        pointerEvents: "none",
      }}
    >
      <svg
        width="440"
        height="170"
        viewBox="0 0 440 170"
        fill="none"
        style={{ overflow: "visible" }}
      >
        <defs>
          <linearGradient id="fadeStroke" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={CYAN} stopOpacity="0.15" />
            <stop offset="100%" stopColor={CYAN} stopOpacity="1" />
          </linearGradient>
        </defs>
        <path
          ref={pathRef}
          d={CHART_PATH}
          stroke="url(#fadeStroke)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          pathLength="1"
          style={{
            strokeDasharray: 1,
            strokeDashoffset: phase === "draw" ? 1 : 0,
            transition: "stroke-dashoffset 1000ms cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        />
        {/* endpoint marker, arrives once the line finishes drawing */}
        <circle
          cx="440"
          cy="18"
          r="5"
          fill={CYAN}
          style={{
            opacity: phase === "draw" ? 0 : 1,
            transform: phase === "draw" ? "scale(0.4)" : "scale(1)",
            transformOrigin: "440px 18px",
            transition: "opacity 300ms ease 900ms, transform 300ms ease 900ms",
          }}
        />
      </svg>

      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          gap: "0.75rem",
          opacity: phase === "draw" ? 0 : 1,
          transform: phase === "draw" ? "translateY(6px)" : "translateY(0)",
          transition: "opacity 400ms ease, transform 400ms ease",
        }}
      >
        <span
          style={{
            fontFamily: "'JetBrains Mono', ui-monospace, monospace",
            fontSize: "1.05rem",
            letterSpacing: "0.02em",
            color: CYAN,
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {count.toLocaleString()}+
        </span>
        <span
          style={{
            fontFamily: "system-ui, sans-serif",
            fontSize: "0.95rem",
            color: "#8CA0BE",
          }}
        >
          traders onboarded
        </span>
      </div>

      <div
        style={{
          fontFamily: "system-ui, sans-serif",
          fontWeight: 700,
          fontSize: "1.4rem",
          color: "#F4F7FB",
          opacity: phase === "wipe" ? 1 : 0,
          transform: phase === "wipe" ? "translateY(0)" : "translateY(4px)",
          transition: "opacity 350ms ease, transform 350ms ease",
        }}
      >
        {brandName}
      </div>
    </div>
  );
}
