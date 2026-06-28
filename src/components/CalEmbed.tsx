"use client";

import { useEffect } from "react";

/**
 * Link do evento no Cal.com (username/slug-do-evento).
 * Se o username mudar (ex.: aerisx-br), troque APENAS esta linha.
 */
const CAL_LINK = "aerisx/captacao";
const CAL_NS = "captacao";

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Cal?: any;
  }
}

export default function CalEmbed() {
  useEffect(() => {
    // Loader oficial do Cal.com (embed.js)
    (function (C: Window, A: string, L: string) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const p = function (a: any, ar: any) {
        a.q.push(ar);
      };
      const d = C.document;
      C.Cal =
        C.Cal ||
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        function (...args: any[]) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const cal: any = C.Cal;
          const ar = args;
          if (!cal.loaded) {
            cal.ns = {};
            cal.q = cal.q || [];
            d.head.appendChild(d.createElement("script")).src = A;
            cal.loaded = true;
          }
          if (ar[0] === L) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const api: any = function (...a2: any[]) {
              p(api, a2);
            };
            const namespace = ar[1];
            api.q = api.q || [];
            if (typeof namespace === "string") {
              cal.ns[namespace] = cal.ns[namespace] || api;
              p(cal.ns[namespace], ar);
              p(cal, ["initNamespace", namespace]);
            } else {
              p(cal, ar);
            }
            return;
          }
          p(cal, ar);
        };
    })(window, "https://app.cal.com/embed/embed.js", "init");

    const Cal = window.Cal;
    Cal("init", CAL_NS, { origin: "https://cal.com" });
    Cal.ns[CAL_NS]("inline", {
      elementOrSelector: "#cal-inline",
      config: { layout: "month_view" },
      calLink: CAL_LINK,
    });
    Cal.ns[CAL_NS]("ui", {
      theme: "dark",
      hideEventTypeDetails: false,
      layout: "month_view",
      cssVarsPerTheme: { dark: { "cal-brand": "#38c6e6" } },
    });
  }, []);

  return (
    <div
      id="cal-inline"
      style={{ width: "100%", minHeight: "720px", overflow: "auto" }}
    />
  );
}
