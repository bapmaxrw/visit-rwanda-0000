import { asc, desc } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { articles, galleryImages, siteSettings } from "@/lib/db/schema";
import { adminResources } from "@/lib/admin-config";
import { ResourceTabs } from "@/components/admin/ResourceManager";

export const dynamic = "force-dynamic";

export default async function AdminContentPage() {
  const db = await getDb();
  const [articleRows, galleryRows, settings] = await Promise.all([
    db.select().from(articles).orderBy(desc(articles.publishedAt)),
    db.select().from(galleryImages).orderBy(asc(galleryImages.sortOrder)),
    db.select().from(siteSettings).orderBy(asc(siteSettings.key)),
  ]);

  return (
    <div className="space-y-5">
      <header>
        <p className="eyebrow">Website content</p>
        <h1 className="mt-1 font-display text-3xl text-pine">Articles, gallery and homepage</h1>
        <p className="mt-1 max-w-2xl text-[0.82rem] text-muted">
          Update the homepage background video, welcome message, official contact details, articles and
          gallery imagery.
        </p>
      </header>

      <ResourceTabs
        managers={[
          {
            resource: "articles",
            label: "Articles",
            description: adminResources.articles.description,
            fields: adminResources.articles.fields,
            rows: articleRows,
          },
          {
            resource: "gallery",
            label: "Gallery",
            description: adminResources.gallery.description,
            fields: adminResources.gallery.fields,
            rows: galleryRows,
          },
          {
            resource: "settings",
            label: "Homepage & contact",
            description: adminResources.settings.description,
            fields: adminResources.settings.fields,
            rows: settings,
          },
        ]}
      />
    </div>
  );
}
