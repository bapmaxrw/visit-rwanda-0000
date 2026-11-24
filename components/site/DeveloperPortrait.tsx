"use client";

import { useState } from "react";
import { UserRound } from "lucide-react";
import { initials } from "@/lib/utils";

/**
 * Shows the developer's supplied portrait when the file is available and falls
 * back to a clearly labelled framed state otherwise. A failed image never
 * displays another person's photograph.
 */
export function DeveloperPortrait({
  name,
  photo,
  className = "",
  sizes,
}: {
  name: string;
  photo: string | null;
  className?: string;
  sizes?: string;
}) {
  const [failed, setFailed] = useState(!photo);

  if (failed || !photo) {
    return (
      <div
        className={`relative flex flex-col items-center justify-center overflow-hidden bg-[linear-gradient(160deg,#0d3b2d,#061a15)] ring-1 ring-inset ring-gold/25 ${className}`}
        aria-label={`${name} — portrait pending`}
      >
        <span className="pointer-events-none absolute inset-3 rounded-[inherit] border border-gold/20" aria-hidden="true" />
        <span className="font-display text-4xl text-gold-light/90">{initials(name)}</span>
        <span className="mt-3 flex items-center gap-1.5 px-3 text-center text-[0.58rem] uppercase tracking-[0.22em] text-cream/45">
          <UserRound className="h-3 w-3" /> Portrait pending
        </span>
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={photo}
      alt={`${name}, Visit Rwanda Academy developer`}
      sizes={sizes}
      loading="lazy"
      decoding="async"
      onError={() => setFailed(true)}
      className={`bg-forest object-cover object-top ${className}`}
    />
  );
}
