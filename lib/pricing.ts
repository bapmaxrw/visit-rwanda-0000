import { and, eq, inArray } from "drizzle-orm";
import type { Database } from "./db";
import { destinationPrices, type DestinationPrice } from "./db/schema";

export const VISITOR_CATEGORIES = [
  { value: "international", label: "International visitor (non-resident)" },
  { value: "resident", label: "Foreign resident in Rwanda" },
  { value: "african", label: "African citizen (non-East African)" },
  { value: "east_african", label: "East African citizen" },
  { value: "citizen", label: "Rwandan citizen" },
] as const;

export type VisitorCategory = (typeof VISITOR_CATEGORIES)[number]["value"];

export const CATEGORY_LABELS: Record<string, string> = Object.fromEntries(
  VISITOR_CATEGORIES.map((c) => [c.value, c.label])
);

export function isVisitorCategory(value: string): value is VisitorCategory {
  return VISITOR_CATEGORIES.some((c) => c.value === value);
}

export type PriceQuote = {
  verified: boolean;
  priceId: string | null;
  activity: string | null;
  currency: string;
  adultAmount: number | null;
  childAmount: number | null;
  total: number | null;
  adults: number;
  children: number;
  childRatePublished: boolean;
  sourceName: string | null;
  sourceUrl: string | null;
  verifiedAt: string | null;
  notes: string | null;
  reason?: string;
};

/** Official price rows a visitor is allowed to see: verified + sourced. */
export function publicPriceFilter() {
  return and(eq(destinationPrices.verified, true));
}

export function isPublishablePrice(price: DestinationPrice): boolean {
  return Boolean(price.verified && price.sourceUrl && price.verifiedAt);
}

/**
 * Server-side price authority. The client never dictates the amount: the
 * booking price is always recomputed here from the database.
 */
export function quoteVisit(
  prices: DestinationPrice[],
  params: { activity?: string | null; visitorCategory: VisitorCategory; adults: number; children: number }
): PriceQuote {
  const usable = prices.filter(
    (p) => isPublishablePrice(p) && p.visitorCategory === params.visitorCategory
  );
  const match =
    (params.activity ? usable.find((p) => p.activity === params.activity) : null) ??
    usable.find((p) => !params.activity || p.activity === null) ??
    usable[0];

  if (!match || match.adultAmount == null) {
    return {
      verified: false,
      priceId: null,
      activity: params.activity ?? null,
      currency: "USD",
      adultAmount: null,
      childAmount: null,
      total: null,
      adults: params.adults,
      children: params.children,
      childRatePublished: false,
      sourceName: null,
      sourceUrl: null,
      verifiedAt: null,
      notes: null,
      reason: "No officially verified price is published for this selection.",
    };
  }

  const childRatePublished = match.childAmount != null;
  const total =
    match.adultAmount * params.adults + (childRatePublished ? match.childAmount! * params.children : 0);

  return {
    verified: true,
    priceId: match.id,
    activity: match.activity ?? null,
    currency: match.currency,
    adultAmount: match.adultAmount,
    childAmount: match.childAmount,
    total,
    adults: params.adults,
    children: params.children,
    childRatePublished,
    sourceName: match.sourceName,
    sourceUrl: match.sourceUrl,
    verifiedAt: match.verifiedAt,
    notes: match.notes,
  };
}

export async function pricedDestinations(db: Database, destinationIds: string[]) {
  if (!destinationIds.length) return [];
  return db
    .select()
    .from(destinationPrices)
    .where(and(inArray(destinationPrices.destinationId, destinationIds), eq(destinationPrices.verified, true)));
}

export function formatMoney(amount: number | null | undefined, currency: string | null | undefined) {
  if (amount == null) return "—";
  const cur = (currency ?? "USD").toUpperCase();
  if (cur === "RWF") {
    return `RWF ${new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(amount)}`;
  }
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: cur === "USD" ? "USD" : cur,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(value: string | Date | null | undefined) {
  if (!value) return "—";
  // Accept plain dates (YYYY-MM-DD), ISO timestamps and Date instances.
  const dateOnly = typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value);
  const date =
    typeof value === "string"
      ? new Date(dateOnly ? `${value}T00:00:00Z` : value)
      : value;
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    // A date-only value has no time zone: format it in UTC so a visitor west of
    // UTC is not shown the previous day (client components call this too).
    ...(dateOnly ? { timeZone: "UTC" } : {}),
  }).format(date);
}
