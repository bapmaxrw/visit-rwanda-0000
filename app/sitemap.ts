import type { MetadataRoute } from "next";
import { asc, desc, eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { articles, destinations, institutions } from "@/lib/db/schema";

// Rendered per request so the sitemap follows the live database (new
// destinations, drafted or unpublished pages) instead of a build-time snapshot.
export const dynamic = "force-dynamic";

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/+$/, "");

/** Public, indexable pages. Admin, account, auth and the noindex search page are excluded. */
const PAGES: { path: string; priority: number; changeFrequency: "weekly" | "monthly" | "yearly" }[] = [
  { path: "/", priority: 1, changeFrequency: "weekly" },
  { path: "/destinations", priority: 0.9, changeFrequency: "weekly" },
  { path: "/national-parks", priority: 0.8, changeFrequency: "monthly" },
  { path: "/culture", priority: 0.8, changeFrequency: "monthly" },
  { path: "/booking", priority: 0.8, changeFrequency: "monthly" },
  { path: "/gallery", priority: 0.7, changeFrequency: "monthly" },
  { path: "/articles", priority: 0.7, changeFrequency: "weekly" },
  { path: "/services", priority: 0.7, changeFrequency: "monthly" },
  { path: "/representatives", priority: 0.6, changeFrequency: "monthly" },
  { path: "/about", priority: 0.6, changeFrequency: "yearly" },
  { path: "/contact", priority: 0.6, changeFrequency: "yearly" },
  { path: "/development-team", priority: 0.5, changeFrequency: "yearly" },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = PAGES.map((page) => ({
    url: `${SITE_URL}${page.path}`,
    changeFrequency: page.changeFrequency,
    priority: page.priority,
  }));

  try {
    const db = await getDb();
    const [destinationRows, institutionRows, articleRows] = await Promise.all([
      db
        .select({ slug: destinations.slug })
        .from(destinations)
        .where(eq(destinations.published, true))
        .orderBy(asc(destinations.sortOrder)),
      db
        .select({ slug: institutions.slug })
        .from(institutions)
        .where(eq(institutions.published, true))
        .orderBy(asc(institutions.sortOrder)),
      db
        .select({ slug: articles.slug, publishedAt: articles.publishedAt })
        .from(articles)
        .where(eq(articles.published, true))
        .orderBy(desc(articles.publishedAt)),
    ]);

    entries.push(
      ...destinationRows.map((row) => ({
        url: `${SITE_URL}/destinations/${row.slug}`,
        changeFrequency: "monthly" as const,
        priority: 0.8,
      })),
      ...institutionRows.map((row) => ({
        url: `${SITE_URL}/culture/${row.slug}`,
        changeFrequency: "monthly" as const,
        priority: 0.7,
      })),
      ...articleRows.map((row) => ({
        url: `${SITE_URL}/articles/${row.slug}`,
        lastModified: row.publishedAt,
        changeFrequency: "yearly" as const,
        priority: 0.6,
      }))
    );
  } catch {
    // An unavailable database must never break the sitemap: the static pages
    // below still ship and the detail pages return on the next request.
  }

  return entries;
}
