import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { asc, eq } from "drizzle-orm";
import { ArrowRight, ExternalLink } from "lucide-react";
import { getDb } from "@/lib/db";
import { destinations, services } from "@/lib/db/schema";
import { PageHero } from "@/components/site/PageHero";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Tourism services",
  description:
    "Gorilla trekking, safaris, canopy walks, cultural experiences, lake cruises and more across Rwanda.",
};

export default async function ServicesPage() {
  const db = await getDb();
  const [rows, destinationRows] = await Promise.all([
    db.select().from(services).where(eq(services.published, true)).orderBy(asc(services.sortOrder)),
    db.select({ slug: destinations.slug, name: destinations.name }).from(destinations),
  ]);

  const groups = new Map<string, typeof rows>();
  rows.forEach((service) => {
    if (!groups.has(service.category)) groups.set(service.category, []);
    groups.get(service.category)!.push(service);
  });

  return (
    <>
      <PageHero
        eyebrow="Explore Rwanda tourism services"
        title="Experiences worth travelling for"
        description="Wildlife, forest, water, culture and adventure services across Rwanda. Where a provider is verified, the official reference is linked."
      />

      <section className="container-x py-16">
        <div className="flex flex-wrap gap-2">
          {[...groups.keys()].map((category) => (
            <a
              key={category}
              href={`#${category.toLowerCase().replace(/[^a-z]+/g, "-")}`}
              className="rounded-full border border-pine/12 bg-white px-3.5 py-1.5 text-[0.72rem] font-medium text-pine hover:border-emerald/40"
            >
              {category}
            </a>
          ))}
        </div>

        {[...groups.entries()].map(([category, items]) => (
          <div key={category} id={category.toLowerCase().replace(/[^a-z]+/g, "-")} className="mt-12 scroll-mt-28">
            <h2 className="font-display text-2xl text-pine sm:text-3xl">{category}</h2>
            <div className="mt-5 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((service) => {
                const destination = destinationRows.find((d) => d.slug === service.destinationSlug);
                return (
                  <article
                    key={service.id}
                    id={service.slug}
                    className="scroll-mt-28 overflow-hidden rounded-[1.4rem] border border-pine/10 bg-white"
                  >
                    <div className="relative aspect-[16/10]">
                      <Image
                        src={service.imageUrl}
                        alt={service.name}
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className="object-cover"
                      />
                    </div>
                    <div className="p-5">
                      <h3 className="font-display text-xl text-pine">{service.name}</h3>
                      <p className="mt-2 text-[0.82rem] leading-relaxed text-body-soft">{service.description}</p>
                      <div className="mt-3 space-y-1 text-[0.7rem] text-label">
                        {destination && (
                          <p>
                            Location:{" "}
                            <Link href={`/destinations/${destination.slug}`} className="font-medium text-emerald hover:underline">
                              {destination.name}
                            </Link>
                          </p>
                        )}
                        {service.provider && <p>Provider: {service.provider}</p>}
                        {service.priceNote && <p className="text-[#9a7726]">{service.priceNote}</p>}
                      </div>
                      <div className="mt-4 flex items-center justify-between border-t border-pine/8 pt-3">
                        {service.destinationSlug ? (
                          <Link
                            href={`/booking?destination=${service.destinationSlug}&book=1`}
                            className="inline-flex items-center gap-1 text-[0.75rem] font-semibold text-emerald"
                          >
                            Booking options <ArrowRight className="h-3.5 w-3.5" />
                          </Link>
                        ) : (
                          <span className="text-[0.72rem] text-faint">Booking via destination</span>
                        )}
                        {service.destinationSlug && (
                          <Link
                            href={`/destinations/${service.destinationSlug}`}
                            className="inline-flex items-center gap-1 text-[0.7rem] text-label hover:text-emerald"
                          >
                            Details <ExternalLink className="h-3 w-3" />
                          </Link>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        ))}
      </section>
    </>
  );
}
