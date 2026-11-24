import { asc } from "drizzle-orm";
import { Film } from "lucide-react";
import { getDb } from "@/lib/db";
import { videoAssets } from "@/lib/db/schema";
import { adminResources } from "@/lib/admin-config";
import { ResourceManager } from "@/components/admin/ResourceManager";

export const dynamic = "force-dynamic";

export default async function AdminVideosPage() {
  const db = await getDb();
  const films = await db.select().from(videoAssets).orderBy(asc(videoAssets.sortOrder));

  return (
    <div className="space-y-5">
      <header>
        <p className="eyebrow">Cinematic layer</p>
        <h1 className="mt-1 font-display text-3xl text-pine">Background films</h1>
        <p className="mt-1 max-w-2xl text-[0.82rem] text-muted">
          Upload or replace the video behind each website section, choose its poster frame and publish
          or disable it. Visitors only ever load one film at a time.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {["home", "destinations", "culture", "leadership", "developers", "gallery"].map((section) => {
          const active = [...films].reverse().find((film) => film.section === section && film.enabled);
          return (
            <div key={section} className="overflow-hidden rounded-2xl border border-pine/10 bg-white">
              <div className="relative aspect-video bg-forest">
                {active ? (
                  <video
                    src={active.videoUrl}
                    poster={active.posterUrl ?? undefined}
                    muted
                    loop
                    playsInline
                    preload="metadata"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="grid h-full place-items-center text-cream/60">
                    <Film className="h-6 w-6" />
                  </div>
                )}
              </div>
              <div className="flex items-center justify-between gap-2 px-4 py-3">
                <div className="min-w-0">
                  <p className="text-[0.6rem] uppercase tracking-[0.18em] text-faint">{section}</p>
                  <p className="truncate text-[0.82rem] font-semibold text-pine">
                    {active?.title ?? "Shipped default scene"}
                  </p>
                </div>
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-[0.6rem] font-semibold uppercase tracking-wider ${
                    active ? "bg-emerald/12 text-emerald" : "bg-[#8a6a1c]/12 text-[#8a6a1c]"
                  }`}
                >
                  {active ? "Live" : "Default"}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <ResourceManager
        resource="videos"
        label={adminResources.videos.label}
        description={adminResources.videos.description}
        fields={adminResources.videos.fields}
        rows={films}
      />
    </div>
  );
}
