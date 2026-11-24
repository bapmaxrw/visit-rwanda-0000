"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Palette } from "lucide-react";
import { THEMES, THEME_COOKIE, type ThemeId } from "@/lib/themes";

export function ThemeSwitcher({ theme, light = false }: { theme: ThemeId; light?: boolean }) {
  const [current, setCurrent] = useState<ThemeId>(theme);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const choose = (id: ThemeId) => {
    setCurrent(id);
    document.documentElement.dataset.theme = id;
    document.cookie = `${THEME_COOKIE}=${id}; Path=/; Max-Age=31536000; SameSite=Lax`;
    setOpen(false);
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label="Colour theme"
        aria-haspopup="true"
        aria-expanded={open}
        className={`grid h-10 w-10 place-items-center rounded-full transition ${
          light && open
            ? "bg-white/10 text-cream"
            : light
              ? "text-cream hover:bg-white/10"
              : open
                ? "bg-pine/8 text-pine"
                : "text-pine hover:bg-pine/8"
        }`}
      >
        <Palette className="h-[18px] w-[18px]" />
      </button>

      {open && (
        <div className="absolute right-0 top-12 w-64 overflow-hidden rounded-2xl border border-pine/10 bg-cream shadow-2xl">
          <div className="border-b border-pine/10 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald">
              Colour theme
            </p>
            <p className="mt-1 text-[0.7rem] text-muted">Saved in this browser.</p>
          </div>
          <ul className="p-1.5">
            {THEMES.map((option) => {
              const active = option.id === current;
              return (
                <li key={option.id}>
                  <button
                    type="button"
                    onClick={() => choose(option.id)}
                    aria-pressed={active}
                    className={`flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-left transition ${
                      active ? "bg-pine/8" : "hover:bg-pine/5"
                    }`}
                  >
                    <span
                      className="flex shrink-0 overflow-hidden rounded-full ring-1 ring-black/10"
                      aria-hidden="true"
                    >
                      {option.swatch.map((colour) => (
                        <span key={colour} className="h-4 w-4" style={{ background: colour }} />
                      ))}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[0.82rem] font-medium text-pine">
                        {option.label}
                      </span>
                      <span className="block truncate text-[0.68rem] text-muted">
                        {option.hint}
                      </span>
                    </span>
                    {active && <Check className="h-4 w-4 shrink-0 text-emerald" />}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
