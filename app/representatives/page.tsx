import type { Metadata } from "next";
import { and, asc, eq, type SQL } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { destinations, personnel } from "@/lib/db/schema";
import { PageHero } from "@/components/site/PageHero";
import { PersonCard } from "@/components/site/PersonCard";
import { Users } from "lucide-react";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Destination representatives",
  description:
    "Tourism representatives by destination: national parks, museums, culture, lakes, adventure and hospitality.",
};

export default async function RepresentativesPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; destination?: string }>;
}) {
  const params = await searchParams;
  const db = await getDb();

  const filters: SQL[] = [eq(personnel.kind, "representative"), eq(personnel.published, true)];
  if (params.category) filters.push(eq(personnel.category, params.category));
  if (params.destination) filters.push(eq(personnel.scopeSlug, params.destination));

  const [rows, all, destinationRows] = await Promise.all([
    db.select().from(personnel).where(and(...filters)).orderBy(asc(personnel.sortOrder)),
    db
      .select({ category: personnel.category })
      .from(personnel)
      .where(and(eq(personnel.kind, "representative"), eq(personnel.published, true))),
    db
      .select({ slug: destinations.slug, name: destinations.name })
      .from(destinations)
      .orderBy(asc(destinations.sortOrder)),
  ]);

  const categories = [...new Set(all.map((row) => row.category).filter((value): value is string => Boolean(value)))];

  return (
    <>
      <PageHero
        eyebrow="Rwanda destination representatives"
        title="Local desks, real people to ask"
        description="Representatives are organised by destination and sector. Where an individual officer is not publicly confirmed, the institutional desk is shown instead."
      />

      <section className="container-x py-14">
        <form
          action="/representatives"
          method="get"
          className="grid gap-3 rounded-2xl border border-pine/10 bg-white p-4 sm:grid-cols-[1fr_1fr_auto]"
        >
          <div>
            <label className="field-label" htmlFor="rep-category">
              Representative category
            </label>
            <select id="rep-category" name="category" defaultValue={params.category ?? ""} className="input">
              <option value="">All categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="field-label" htmlFor="rep-destination">
              Destination
            </label>
            <select id="rep-destination" name="destination" defaultValue={params.destination ?? ""} className="input">
              <option value="">All destinations</option>
              {destinationRows.map((destination) => (
                <option key={destination.slug} value={destination.slug}>
                  {destination.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <button type="submit" className="btn btn-forest w-full sm:w-auto">
              Filter
            </button>
          </div>
        </form>

        <div className="mt-7 flex items-center justify-between">
          <p className="inline-flex items-center gap-2 text-sm text-body-soft">
            <Users className="h-4 w-4 text-emerald" />
            <strong className="text-pine">{rows.length}</strong> representative{rows.length === 1 ? "" : "s"}
          </p>
          {(params.category || params.destination) && (
            <a href="/representatives" className="text-xs font-semibold text-emerald underline underline-offset-4">
              Clear filters
            </a>
          )}
        </div>

        <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {rows.map((person) => (
            <PersonCard key={person.id} person={person} />
          ))}
        </div>
        {rows.length === 0 && (
          <p className="mt-8 rounded-2xl border border-dashed border-pine/20 bg-white p-10 text-center text-sm text-muted">
            No representatives match this filter yet. Administrators can add verified representatives from
            the dashboard.
          </p>
        )}
      </section>
    </>
  );
}
