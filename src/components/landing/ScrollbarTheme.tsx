"use client";

import { useEffect } from "react";

function luminance(rgb: string): number {
  const m = rgb.match(/\d+/g);
  if (!m || m.length < 3) return 1;
  const [r, g, b] = m.map(Number);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
}

export default function ScrollbarTheme() {
  useEffect(() => {
    const root = document.documentElement;
    const sections = Array.from(document.querySelectorAll("section, footer"));

    function update() {
      const mid = window.innerHeight / 2;
      let bg = "#ffffff";
      for (const s of sections) {
        const r = s.getBoundingClientRect();
        if (r.top <= mid && r.bottom >= mid) {
          bg = getComputedStyle(s).backgroundColor || bg;
          break;
        }
      }
      root.style.setProperty("--sb-track", bg);
      const dark = luminance(bg) < 0.5;
      root.style.setProperty("--sb-thumb", dark ? "rgba(255,255,255,0.28)" : "rgba(0,31,63,0.22)");
    }

    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    update();
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  return null;
}
