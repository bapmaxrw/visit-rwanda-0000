import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function bookingReference() {
  const date = new Date();
  const stamp = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, "0")}${String(
    date.getDate()
  ).padStart(2, "0")}`;
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 5; i++) code += alphabet[Math.floor(Math.random() * alphabet.length)];
  return `VR-${stamp}-${code}`;
}

/**
 * Words that mark an account name as an organisation or role label rather than a
 * person, such as the seeded "Visit Rwanda Administrator" account. Addressing
 * those accounts by their first word reads as a mistake ("Muraho, Visit").
 */
const ACCOUNT_LABEL_WORDS = new Set([
  "admin",
  "administrator",
  "academy",
  "office",
  "manager",
  "staff",
  "support",
  "team",
]);

const ROLE_LABELS: Record<string, string> = {
  admin: "Administrator",
  visitor: "Visitor",
};

const HONORIFICS = new Set([
  "mr",
  "mrs",
  "ms",
  "miss",
  "dr",
  "prof",
  "eng",
  "hon",
  "sir",
  "madam",
  "rev",
]);

/**
 * The single word to address a signed-in account by in greetings and the nav
 * chip: the given name for a person, or the role label for an organisation name.
 */
export function greetingName(fullName?: string | null, role?: string | null) {
  const parts = (fullName ?? "").trim().split(/\s+/).filter(Boolean);
  const words = parts.filter(
    (part) => !HONORIFICS.has(part.replace(/\./g, "").toLowerCase())
  );
  const isAccountLabel = words.some((part) =>
    ACCOUNT_LABEL_WORDS.has(part.toLowerCase())
  );

  if (words.length === 0 || isAccountLabel) {
    if (!role) return "there";
    return ROLE_LABELS[role] ?? role.charAt(0).toUpperCase() + role.slice(1);
  }

  return words[0];
}

export function initials(name?: string | null) {
  if (!name) return "VR";
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

/**
 * Escapes a user-supplied term for a SQL ILIKE pattern. Without this a literal
 * "%" or "_" is treated as a wildcard and a search for "%" returns every row.
 */
export function likeTerm(value: string) {
  const escaped = value.trim().replace(/[\\%_]/g, (match) => `\\${match}`);
  return `%${escaped}%`;
}

export function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export function formatDateTime(value: Date | string | null | undefined) {
  if (!value) return "—";
  const date = typeof value === "string" ? new Date(value) : value;
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}
