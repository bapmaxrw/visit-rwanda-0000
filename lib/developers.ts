import { existsSync } from "node:fs";

/**
 * Developer portrait + profile configuration.
 *
 * The owner supplies the three portraits; each file must sit at the exact path
 * below and is matched by employee name, never by position order, so a photo can
 * never be attached to the wrong developer. Until a file exists the page renders
 * a labelled, framed pending state — never a stock photograph or an invented face.
 *
 * Files (JPG or PNG, at least 900px wide, head-and-shoulders):
 *   public/media/team/tr-ndikumana-eric.jpg        → TR Ndikumana Eric
 *   public/media/team/byiringiro-aime-pacifique.jpg → Byiringiro Aime Pacifique
 *   public/media/team/bwigwi-beramy-herve.jpg      → Bwigwi Beramy Herve
 *
 * Administrators can also upload a portrait per person in Admin → People & teams;
 * a stored photo always takes precedence over this file map.
 */
export const DEVELOPER_PORTRAITS: Record<string, string> = {
  "tr ndikumana eric": "/media/team/tr-ndikumana-eric.jpg",
  "byiringiro aime pacifique": "/media/team/byiringiro-aime-pacifique.jpg",
  "bwigwi beramy herve": "/media/team/bwigwi-beramy-herve.jpg",
};

export const DEVELOPER_SOCIALS: Record<string, { label: string; href: string }[]> = {
  // Filled only when a developer supplies a real profile URL.
};

export function normalizeName(name: string | null | undefined): string {
  return (name ?? "").trim().toLowerCase().replace(/\s+/g, " ");
}

export function portraitFor(name: string | null | undefined, stored?: string | null): string | null {
  if (stored) return stored;
  return DEVELOPER_PORTRAITS[normalizeName(name)] ?? null;
}

/**
 * Server-side resolver: only returns a bundled portrait that actually exists, so
 * the page never renders a broken image while the owner's files are pending.
 */
export function existingPortrait(
  name: string | null | undefined,
  stored?: string | null,
  publicRoot = process.cwd()
): string | null {
  if (stored) return stored;
  const candidate = DEVELOPER_PORTRAITS[normalizeName(name)];
  if (!candidate) return null;
  return existsSync(`${publicRoot}/public${candidate}`) ? candidate : null;
}
