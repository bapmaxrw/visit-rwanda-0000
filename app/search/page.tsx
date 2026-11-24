import type { Metadata } from "next";
import Link from "next/link";
import { and, asc, desc, eq, ilike, or, sql } from "drizzle-orm";
import { ArrowUpRight, BookOpen, Compass, Landmark, MapPin, Search } from "lucide-react";
import { getDb } from "@/lib/db";
import { articles, destinations, institutions, services } from "@/lib/db/schema";
import { PageHero } from "@/components/site/PageHero";
import { formatDate } from "@/lib/pricing";
import { likeTerm } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Search",
  description: "Search Rwanda's destinations, parks, cultural institutions, services and travel guides.",
  robots: { index: false, follow: true },
};

type Result = {
  title: string;
  href: string;
  meta?: string;
  excerpt?: string;
};

type Group = {
  label: string;
  icon: typeof MapPin;
  results: Result[];
};

const QUICK_LINKS = [
  { href: "/destinations", label: "Destination directory", detail: "Parks, lakes, museums and heritage sites" },
  { href: "/national-parks", label: "National parks", detail: "Volcanoes, Akagera, Nyungwe and Gishwati-Mukura" },
  { href: "/culture", label: "Culture & heritage", detail: "Institutions, museums and living traditions" },
  { href: "/articles", label: "Travel journal", detail: "Field guides for planning a visit" },
  { href: "/services", label: "Services", detail: "Guides, permits and visitor services" },
  { href: "/booking", label: "Booking", detail: "Request a trip with a destination team" },
];

function snippet(text: string | null | undefined, max = 160) {
  if (!text) return undefined;
  const clean = text
    .replace(/[#*_`>[\]()!]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (!clean) return undefined;
  return clean.length > max ? `${clean.slice(0, max).trimEnd()}…` : clean;
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const params = await searchParams;
  const q = (params.q ?? "").trim();
  const db = await getDb();
  const term = likeTerm(q);

  let groups: Group[] = [];

  if (q) {
    const [destinationRows, articleRows, institutionRows, serviceRows] = await Promise.all([
      db
        .select({
          name: destinations.name,
          slug: destinations.slug,
          category: destinations.category,
          location: destinations.location,
          description: destinations.description,
        })
        .from(destinations)
        .where(
          and(
            eq(destinations.published, true),
            or(
              ilike(destinations.name, term),
              ilike(destinations.description, term),
              ilike(destinations.location, term),
              ilike(destinations.category, term),
              sql`${destinations.activities}::text ILIKE ${term}`,
              sql`${destinations.services}::text ILIKE ${term}`
            )
          )
        )
        .orderBy(asc(destinations.sortOrder))
        .limit(10),
      db
        .select({
          title: articles.title,
          slug: articles.slug,
          category: articles.category,
          excerpt: articles.excerpt,
          publishedAt: articles.publishedAt,
        })
        .from(articles)
        .where(
          and(
            eq(articles.published, true),
            or(
              ilike(articles.title, term),
              ilike(articles.excerpt, term),
              ilike(articles.body, term),
              ilike(articles.category, term)
            )
          )
        )
        .orderBy(desc(articles.publishedAt))
        .limit(10),
      db
        .select({
          name: institutions.name,
          slug: institutions.slug,
          category: institutions.category,
          summary: institutions.summary,
          district: institutions.district,
        })
        .from(institutions)
        .where(
          and(
            eq(institutions.published, true),
            or(
              ilike(institutions.name, term),
              ilike(institutions.summary, term),
              ilike(institutions.description, term),
              ilike(institutions.category, term),
              sql`${institutions.services}::text ILIKE ${term}`
            )
          )
        )
        .orderBy(asc(institutions.sortOrder))
        .limit(10),
      db
        .select({
          name: services.name,
          slug: services.slug,
          category: services.category,
          description: services.description,
          provider: services.provider,
        })
        .from(services)
        .where(
          and(
            eq(services.published, true),
            or(
              ilike(services.name, term),
              ilike(services.description, term),
              ilike(services.category, term),
              ilike(services.provider, term)
            )
          )
        )
        .orderBy(asc(services.sortOrder))
        .limit(10),
    ]);

    groups = [
      {
        label: "Destinations",
        icon: MapPin,
        results: destinationRows.map((row) => ({
          title: row.name,
          href: `/destinations/${row.slug}`,
          meta: [row.category, row.location].filter(Boolean).join(" · "),
          excerpt: snippet(row.description),
        })),
      },
      {
        label: "Culture & heritage",
        icon: Landmark,
        results: institutionRows.map((row) => ({
          title: row.name,
          href: `/culture/${row.slug}`,
          meta: [row.category, row.district].filter(Boolean).join(" · "),
          excerpt: snippet(row.summary),
        })),
      },
      {
        label: "Articles",
        icon: BookOpen,
        results: articleRows.map((row) => ({
          title: row.title,
          href: `/articles/${row.slug}`,
          meta: [row.category, formatDate(row.publishedAt)].filter(Boolean).join(" · "),
          excerpt: snippet(row.excerpt),
        })),
      },
      {
        label: "Services",
        icon: Compass,
        results: serviceRows.map((row) => ({
          title: row.name,
          href: `/services#${row.slug}`,
          meta: [row.category, row.provider].filter(Boolean).join(" · "),
          excerpt: snippet(row.description),
        })),
      },
    ].filter((group) => group.results.length > 0);
  }

  const total = groups.reduce((sum, group) => sum + group.results.length, 0);

  return (
    <>
      <PageHero
        eyebrow="Search"
        title={q ? `Results for “${q}”` : "Search the platform"}
        description={
          q
            ? `${total} match${total === 1 ? "" : "es"} across destinations, cultural institutions, articles and services.`
            : "Look across every destination profile, cultural institution, travel guide and visitor service on Visit Rwanda Academy."
        }
      />

      <section className="relative z-10 bg-cream pb-20 pt-10">
        <div className="container-x">
        <form
          action="/search"
          method="get"
          className="flex flex-col gap-2 rounded-2xl border border-pine/10 bg-white p-3 shadow-[0_20px_50px_-45px_rgba(6,35,28,0.6)] sm:flex-row sm:items-center"
        >
          <div className="flex flex-1 items-center gap-2 rounded-xl border border-pine/15 px-3">
            <Search className="h-4 w-4 shrink-0 text-emerald" />
            <input
              name="q"
              defaultValue={q}
              autoFocus={!q}
              placeholder="Gorilla trekking, Nyungwe, museums, permits…"
              className="w-full bg-transparent py-2.5 text-sm outline-none"
              aria-label="Search the platform"
            />
          </div>
          <button type="submit" className="btn btn-forest !py-2.5 sm:!px-6">
            <Search className="h-4 w-4" /> Search
          </button>
        </form>

        {!q && (
          <div className="mt-12">
            <p className="eyebrow text-emerald">Jump straight in</p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {QUICK_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="group rounded-2xl border border-pine/10 bg-white p-5 transition hover:border-emerald/40 hover:shadow-[0_24px_60px_-50px_rgba(6,35,28,0.8)]"
                >
                  <p className="flex items-center justify-between text-sm font-semibold text-pine">
                    {link.label}
                    <ArrowUpRight className="h-4 w-4 text-emerald transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </p>
                  <p className="mt-1.5 text-[0.8rem] leading-relaxed text-muted">{link.detail}</p>
                </Link>
              ))}
            </div>
          </div>
        )}

        {q && total === 0 && (
          <div className="mt-10 rounded-2xl border border-dashed border-pine/20 bg-white/70 p-10 text-center">
            <h2 className="font-display text-2xl text-pine">Nothing matched “{q}”</h2>
            <p className="mx-auto mt-2 max-w-xl text-sm leading-relaxed text-body-soft">
              Try a shorter phrase, a district name, or browse the directory directly. Every destination
              profile lists its activities, services and verified prices.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-2.5">
              <Link href="/destinations" className="btn btn-forest !px-4 !py-2 text-xs">
                All destinations
              </Link>
              <Link href="/culture" className="btn btn-outline !px-4 !py-2 text-xs">
                Culture & heritage
              </Link>
              <Link href="/articles" className="btn btn-outline !px-4 !py-2 text-xs">
                Articles
              </Link>
            </div>
          </div>
        )}

        {q && groups.length > 0 && (
          <div className="mt-12 space-y-12">
            {groups.map((group) => {
              const Icon = group.icon;
              return (
                <section key={group.label}>
                  <div className="flex items-center justify-between border-b border-pine/10 pb-3">
                    <h2 className="flex items-center gap-2.5 font-display text-xl text-pine">
                      <Icon className="h-4 w-4 text-emerald" />
                      {group.label}
                    </h2>
                    <span className="text-[0.7rem] uppercase tracking-[0.18em] text-faint">
                      {group.results.length} result{group.results.length === 1 ? "" : "s"}
                    </span>
                  </div>

                  <div className="mt-5 grid gap-4 lg:grid-cols-2">
                    {group.results.map((result) => (
                      <Link
                        key={`${result.href}-${result.title}`}
                        href={result.href}
                        className="group rounded-2xl border border-pine/10 bg-white p-5 transition hover:border-emerald/40 hover:shadow-[0_24px_60px_-50px_rgba(6,35,28,0.85)]"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <h3 className="font-display text-lg leading-snug text-pine group-hover:text-emerald">
                            {result.title}
                          </h3>
                          <ArrowUpRight className="mt-1 h-4 w-4 shrink-0 text-emerald" />
                        </div>
                        {result.meta && (
                          <p className="mt-1 text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-emerald/80">
                            {result.meta}
                          </p>
                        )}
                        {result.excerpt && (
                          <p className="mt-2 text-[0.82rem] leading-relaxed text-body-soft">
                            {result.excerpt}
                          </p>
                        )}
                      </Link>
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        )}
        </div>
      </section>
    </>
  );
}
