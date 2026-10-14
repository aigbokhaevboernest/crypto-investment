import { useCallback, useEffect, useRef, useState } from "react";
import { Globe, Check } from "lucide-react";

const PAGE_LANGUAGE = "en";

const LANGUAGES: { code: string; label: string }[] = [
  { code: "en", label: "English" },
  { code: "es", label: "Español" },
  { code: "fr", label: "Français" },
  { code: "de", label: "Deutsch" },
  { code: "pt", label: "Português" },
  { code: "it", label: "Italiano" },
  { code: "nl", label: "Nederlands" },
  { code: "ru", label: "Русский" },
  { code: "tr", label: "Türkçe" },
  { code: "ar", label: "العربية" },
  { code: "hi", label: "हिन्दी" },
  { code: "id", label: "Bahasa Indonesia" },
  { code: "zh-CN", label: "中文 (简体)" },
  { code: "ja", label: "日本語" },
  { code: "ko", label: "한국어" },
];

const SUPPORTED = new Set(LANGUAGES.map((l) => l.code));
const AUTO_DETECT_FLAG = "lang_autodetect_done";

declare global {
  interface Window {
    googleTranslateElementInit?: () => void;
    google?: {
      translate?: {
        TranslateElement: new (
          options: { pageLanguage: string; includedLanguages?: string; autoDisplay?: boolean },
          elementId: string,
        ) => unknown;
      };
    };
  }
}

/* ---------- cookie helpers (Google reads the googtrans cookie) ---------- */

const getCookieLang = (): string | null => {
  const match = document.cookie.match(/(?:^|;\s*)googtrans=\/[^/]+\/([^;]+)/);
  return match ? decodeURIComponent(match[1]) : null;
};

const cookieDomains = (): (string | null)[] => {
  const host = window.location.hostname;
  const domains: (string | null)[] = [null];
  if (host.includes(".") && !/^\d+\.\d+\.\d+\.\d+$/.test(host)) {
    domains.push(host, `.${host}`);
  }
  return domains;
};

const setGoogTrans = (code: string) => {
  const value = `/${PAGE_LANGUAGE}/${code}`;
  cookieDomains().forEach((d) => {
    document.cookie = `googtrans=${value};path=/;max-age=31536000;SameSite=Lax${d ? `;domain=${d}` : ""}`;
  });
};

const clearGoogTrans = () => {
  cookieDomains().forEach((d) => {
    document.cookie = `googtrans=;path=/;expires=Thu, 01 Jan 1970 00:00:00 GMT${d ? `;domain=${d}` : ""}`;
  });
};

/* ---------- Google script loader ---------- */

let scriptPromise: Promise<void> | null = null;

const loadGoogleTranslateScript = (): Promise<void> => {
  if (scriptPromise) return scriptPromise;
  scriptPromise = new Promise<void>((resolve) => {
    window.googleTranslateElementInit = () => {
      try {
        if (window.google?.translate?.TranslateElement) {
          new window.google.translate.TranslateElement(
            {
              pageLanguage: PAGE_LANGUAGE,
              includedLanguages: LANGUAGES.map((l) => l.code).join(","),
              autoDisplay: false,
            },
            "google_translate_element",
          );
        }
      } catch (err) {
        console.error("Google Translate init failed:", err);
      }
      resolve();
    };
    const s = document.createElement("script");
    s.src = "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
    s.async = true;
    s.onerror = () => {
      scriptPromise = null;
      resolve();
    };
    document.body.appendChild(s);
  });
  return scriptPromise;
};

/** Drive Google's hidden <select class="goog-te-combo">. Resolves true if it worked. */
const applyGoogleLang = async (code: string, timeoutMs = 5000): Promise<boolean> => {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const combo = document.querySelector<HTMLSelectElement>("select.goog-te-combo");
    if (combo && combo.options.length > 1) {
      combo.value = code;
      combo.dispatchEvent(new Event("change"));
      return true;
    }
    await new Promise((r) => setTimeout(r, 250));
  }
  return false;
};

const LanguageSwitcher = () => {
  const [current, setCurrent] = useState<string>(PAGE_LANGUAGE);
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const lastApplied = useRef(0);

  const choose = useCallback(async (code: string) => {
    setOpen(false);
    if (code === current) return;

    if (code === PAGE_LANGUAGE) {
      // Going back to the original page text is only reliable with a reload
      clearGoogTrans();
      setCurrent(PAGE_LANGUAGE);
      window.location.reload();
      return;
    }

    setGoogTrans(code);
    setCurrent(code);
    await loadGoogleTranslateScript();
    lastApplied.current = Date.now();
    const ok = await applyGoogleLang(code);
    if (!ok) window.location.reload(); // cookie is set, Google will translate on reload
  }, [current]);

  // On load: restore from cookie, else auto-detect once from the browser language
  useEffect(() => {
    let cancelled = false;

    (async () => {
      await loadGoogleTranslateScript();
      if (cancelled) return;

      const saved = getCookieLang();
      if (saved && SUPPORTED.has(saved)) {
        setCurrent(saved);
        return; // Google translates automatically because the cookie is set
      }

      let alreadyDetected = false;
      try {
        alreadyDetected = localStorage.getItem(AUTO_DETECT_FLAG) === "1";
        localStorage.setItem(AUTO_DETECT_FLAG, "1");
      } catch {
        alreadyDetected = true; // storage blocked: don't auto-switch
      }
      if (alreadyDetected) return;

      const nav = (navigator.language || "en").trim();
      const base = nav.split("-")[0].toLowerCase();
      const code = base === "zh" ? "zh-CN" : base;
      if (code !== PAGE_LANGUAGE && SUPPORTED.has(code)) {
        setGoogTrans(code);
        setCurrent(code);
        lastApplied.current = Date.now();
        const ok = await applyGoogleLang(code);
        if (!ok) window.location.reload();
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  // Keep Google's top bar from shifting the page
  useEffect(() => {
    const id = window.setInterval(() => {
      if (document.body.style.top) document.body.style.top = "0px";
    }, 1000);
    return () => window.clearInterval(id);
  }, []);

  // Re-translate when dialogs / dropdowns (portals) are added to <body>
  useEffect(() => {
    if (current === PAGE_LANGUAGE) return;
    let timer: number | undefined;

    const isPortal = (n: Node) =>
      n instanceof HTMLElement &&
      n.parentElement === document.body &&
      !n.classList.contains("skiptranslate") &&
      !n.id.startsWith("goog") &&
      n.tagName !== "SCRIPT" &&
      n.tagName !== "IFRAME";

    const obs = new MutationObserver((muts) => {
      if (!muts.some((m) => Array.from(m.addedNodes).some(isPortal))) return;
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        if (Date.now() - lastApplied.current < 1500) return;
        lastApplied.current = Date.now();
        applyGoogleLang(current, 1500);
      }, 500);
    });
    obs.observe(document.body, { childList: true });

    return () => {
      obs.disconnect();
      window.clearTimeout(timer);
    };
  }, [current]);

  // Close dropdown on outside click / Escape
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent | TouchEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("touchstart", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("touchstart", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const currentLabel = LANGUAGES.find((l) => l.code === current)?.label ?? "English";

  return (
    <>
      {/* Hidden host Google renders its widget into */}
      <div
        id="google_translate_element"
        aria-hidden="true"
        style={{ position: "absolute", left: -9999, top: 0, width: 1, height: 1, overflow: "hidden" }}
      />

      {/* Sits above the live-earnings popup on mobile (it uses bottom-6 left-6) */}
      <div
        ref={rootRef}
        translate="no"
        className="notranslate fixed z-50 bottom-24 right-4 md:bottom-6 md:right-6"
      >
        {open && (
          <ul
            role="listbox"
            aria-label="Select language"
            className="absolute bottom-full right-0 mb-2 w-52 max-h-72 overflow-y-auto rounded-xl border py-1 shadow-2xl"
            style={{ backgroundColor: "#1c2e4a", borderColor: "rgba(56,217,245,0.2)" }}
          >
            {LANGUAGES.map((l) => (
              <li key={l.code} role="option" aria-selected={l.code === current}>
                <button
                  type="button"
                  onClick={() => choose(l.code)}
                  className="flex w-full items-center justify-between px-4 py-2.5 text-left text-sm text-white/90 hover:bg-white/10"
                >
                  <span>{l.label}</span>
                  {l.code === current && <Check className="h-4 w-4" style={{ color: "#38d9f5" }} />}
                </button>
              </li>
            ))}
          </ul>
        )}

        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-label={`Language: ${currentLabel}. Change language`}
          aria-expanded={open}
          className="flex h-11 items-center gap-2 rounded-full border px-4 text-sm font-medium text-white shadow-xl"
          style={{ backgroundColor: "#172640", borderColor: "rgba(56,217,245,0.35)" }}
        >
          <Globe className="h-4 w-4" style={{ color: "#38d9f5" }} />
          <span>{current === PAGE_LANGUAGE ? "EN" : current.split("-")[0].toUpperCase()}</span>
        </button>
      </div>
    </>
  );
};

export default LanguageSwitcher;
