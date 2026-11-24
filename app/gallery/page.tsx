import type { Metadata } from "next";
import Image from "next/image";
import { asc, eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { galleryImages } from "@/lib/db/schema";
import { PageHero } from "@/components/site/PageHero";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Gallery",
  description: "Rwanda in photographs: volcanoes, gorillas, savannah, rainforest, lakes, cities and culture.",
};

export default async function GalleryPage() {
  const db = await getDb();
  const images = await db
    .select()
    .from(galleryImages)
    .where(eq(galleryImages.published, true))
    .orderBy(asc(galleryImages.sortOrder));

  return (
    <>
      <PageHero
        eyebrow="Gallery"
        title="Rwanda, frame by frame"
        description="A visual journey from the Virunga volcanoes to Lake Kivu and the streets of Kigali. Photography is openly licensed and credited."
      />

      <section className="container-x py-14">
        <div className="columns-1 gap-4 sm:columns-2 lg:columns-3 [&>*]:mb-4">
          {images.map((image) => (
            <figure key={image.id} className="group relative overflow-hidden rounded-2xl break-inside-avoid">
              <div className="relative aspect-[4/3]">
                <Image
                  src={image.url}
                  alt={image.caption ?? "Rwanda"}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover transition duration-[1.2s] group-hover:scale-[1.04]"
                />
              </div>
              <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-forest/90 via-forest/40 to-transparent p-4 text-cream">
                <p className="text-[0.78rem] font-medium">{image.caption}</p>
                <p className="mt-0.5 text-[0.62rem] text-cream/60">
                  {image.destination}
                  {image.credit ? ` · ${image.credit}` : ""}
                </p>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>
    </>
  );
}
