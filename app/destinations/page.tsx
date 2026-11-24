import type { Metadata } from "next";
import Link from "next/link";
import { and, asc, eq, ilike, or, type SQL } from "drizzle-orm";
import { Search, SlidersHorizontal } from "lucide-react";
import { getDb } from "@/lib/db";
import { destinationPrices, destinations } from "@/lib/db/schema";
import { DestinationCard } from "@/components/site/DestinationCard";
import { PageHero } from "@/components/site/PageHero";
import { formatMoney } from "@/lib/pricing";
import { likeTerm } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Destinations",
  description: "Search Rwanda's national parks, lakes, museums and cultural destinations by province, district and category.",
};

const CATEGORIES = [
  "National Parks",
  "Cultural Tourism",
  "Historical Sites",
  "Lakes and Beaches",
  "Adventure",
  "Wildlife and Safari",
  "Nature and Hiking",
];

export default async function DestinationsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string; province?: string }>;
}) {
  const params = await searchParams;
  const db = await getDb();

  const filters: SQL[] = [eq(destinations.published, true)];
  if (params.q) {
    const term = likeTerm(params.q);
    const matching = or(
      ilike(destinations.name, term),
      ilike(destinations.description, term),
      ilike(destinations.location, term),
      ilike(destinations.category, term)
    );
    if (matching) filters.push(matching);
  }
  if (params.category) filters.push(eq(destinations.category, params.category));
  if (params.province) filters.push(eq(destinations.province, params.province));

  const rows = await db
    .select()
    .from(destinations)
    .where(and(...filters))
    .orderBy(asc(destinations.sortOrder));

  const allProvinces = await db
    .selectDistinct({ province: destinations.province })
    .from(destinations)
    .where(eq(destinations.published, true));

  const prices = rows.length
    ? await db.select().from(destinationPrices).where(eq(destinationPrices.verified, true))
    : [];

  const priceLabel = (destinationId: string) => {
    const cheapest = prices
      .filter((p) => p.destinationId === destinationId && p.adultAmount != null && p.visitorCategory === "international")
      .sort((a, b) => (a.adultAmount ?? 0) - (b.adultAmount ?? 0))[0];
    return cheapest ? `From ${formatMoney(cheapest.adultAmount, cheapest.currency)}` : null;
  };

  return (
    <>
      <PageHero
        eyebrow="Destination directory"
        title="Every corner of Rwanda, one directory"
        description="Filter by province, district or experience. Each destination profile carries its services, official contacts and only the prices we could verify."
      />

      <section className="container-x py-12">
        <form
          action="/destinations"
          method="get"
          className="grid gap-3 rounded-2xl border border-pine/10 bg-white p-4 shadow-[0_20px_50px_-45px_rgba(6,35,28,0.6)] sm:grid-cols-[1.6fr_1fr_1fr_auto]"
        >
          <div className="flex items-center gap-2 rounded-xl border border-pine/15 px-3">
            <Search className="h-4 w-4 text-emerald" />
            <input
              name="q"
              defaultValue={params.q ?? ""}
              placeholder="Search destination, district or experience"
              className="w-full bg-transparent py-2.5 text-sm outline-none"
              aria-label="Search destinations"
            />
          </div>
          <select name="category" defaultValue={params.category ?? ""} className="input" aria-label="Category">
            <option value="">All categories</option>
            {CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          <select name="province" defaultValue={params.province ?? ""} className="input" aria-label="Province">
            <option value="">All provinces</option>
            {allProvinces
              .map((row) => row.province)
              .filter((value): value is string => Boolean(value))
              .map((province) => (
                <option key={province} value={province}>
                  {province}
                </option>
              ))}
          </select>
          <button type="submit" className="btn btn-forest !py-2.5">
            <SlidersHorizontal className="h-4 w-4" /> Filter
          </button>
        </form>

        <div className="mt-8 flex items-end justify-between">
          <p className="text-sm text-body-soft">
            <strong className="text-pine">{rows.length}</strong> destination{rows.length === 1 ? "" : "s"}
            {params.q ? ` matching “${params.q}”` : ""}
          </p>
          {(params.q || params.category || params.province) && (
            <Link href="/destinations" className="text-xs font-semibold text-emerald underline underline-offset-4">
              Clear filters
            </Link>
          )}
        </div>

        {rows.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-dashed border-pine/20 bg-white/60 p-12 text-center">
            <h2 className="font-display text-2xl text-pine">No destinations match those filters</h2>
            <p className="mt-2 text-sm text-body-soft">Try a broader search, or clear the filters to see everything.</p>
          </div>
        ) : (
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {rows.map((destination, index) => (
              <DestinationCard
                key={destination.id}
                destination={{ ...destination, verifiedPrice: priceLabel(destination.id) }}
                priority={index < 3}
              />
            ))}
          </div>
        )}
      </section>
    </>
  );
}
