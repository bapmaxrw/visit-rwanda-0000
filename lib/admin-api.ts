import { asc, getTableColumns } from "drizzle-orm";
import { getCurrentUser } from "./auth";
import { apiError } from "./http";
import {
  articles,
  bookings,
  enquiries,
  destinationPrices,
  destinations,
  galleryImages,
  institutions,
  personnel,
  services,
  siteSettings,
  videoAssets,
} from "./db/schema";

export const RESOURCE_TABLES = {
  destinations,
  prices: destinationPrices,
  bookings,
  articles,
  enquiries,
  gallery: galleryImages,
  personnel,
  institutions,
  services,
  videos: videoAssets,
  settings: siteSettings,
} as const;

export type ResourceKey = keyof typeof RESOURCE_TABLES;

export function isResourceKey(value: string): value is ResourceKey {
  return value in RESOURCE_TABLES;
}

export async function guardAdmin() {
  const user = await getCurrentUser();
  if (!user) return { error: apiError("Please sign in.", 401) };
  if (user.role !== "admin") return { error: apiError("Administrator access required.", 403) };
  return { user };
}

/** Whitelists submitted fields against the table's real columns and coerces types. */
export function sanitizeRow(table: object, input: Record<string, unknown>) {
  const columns = getTableColumns(table as never) as Record<
    string,
    { dataType: string; columnType: string }
  >;
  const values: Record<string, unknown> = {};

  for (const [key, column] of Object.entries(columns)) {
    if (!(key in input)) continue;
    if (key === "id" || key === "createdAt" || key === "updatedAt") continue;
    const raw = input[key];

    if (column.columnType.toLowerCase().includes("json")) {
      if (Array.isArray(raw)) values[key] = raw;
      else if (typeof raw === "string") {
        const trimmed = raw.trim();
        if (!trimmed) values[key] = [];
        else if (trimmed.startsWith("[")) {
          try {
            values[key] = JSON.parse(trimmed);
          } catch {
            values[key] = trimmed.split(",").map((part) => part.trim()).filter(Boolean);
          }
        } else {
          values[key] = trimmed.split(",").map((part) => part.trim()).filter(Boolean);
        }
      }
      continue;
    }

    if (raw === "" || raw === null || raw === undefined) {
      values[key] = column.dataType === "boolean" ? false : null;
      continue;
    }

    if (column.dataType === "boolean") {
      values[key] = raw === true || raw === "true" || raw === "on" || raw === 1;
    } else if (column.dataType === "number") {
      const numeric = Number(raw);
      values[key] = Number.isFinite(numeric) ? numeric : null;
    } else {
      values[key] = raw;
    }
  }

  if ("updatedAt" in columns) values.updatedAt = new Date();
  return values;
}

export function listOrder(table: object) {
  const columns = getTableColumns(table as never) as Record<string, unknown>;
  if ("sortOrder" in columns) return asc((table as { sortOrder: never }).sortOrder);
  if ("createdAt" in columns) return asc((table as { createdAt: never }).createdAt);
  return undefined;
}
