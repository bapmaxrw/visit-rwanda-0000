import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { and, asc, eq, ne } from "drizzle-orm";
import {
  ArrowRight,
  CalendarDays,
  Clock3,
  Globe,
  Mail,
  MapPin,
  Phone,
  ShieldAlert,
  Users,
} from "lucide-react";
import { getDb } from "@/lib/db";
import {
  destinationPrices,
  destinations,
  personnel,
  services,
} from "@/lib/db/schema";
import { PriceTable } from "@/components/site/PriceTable";
import { PersonCard } from "@/components/site/PersonCard";
import { DestinationCard } from "@/components/site/DestinationCard";
import { Reveal } from "@/components/site/Reveal";
import { SceneSetter } from "@/components/site/SceneSetter";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const db = await getDb();
  const [destination] = await db.select().from(destinations).where(eq(destinations.slug, slug)).limit(1);
  if (!destination) return { title: "Destination not found" };
  return { title: destination.name, description: destination.description };
}

export default async function DestinationPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const db = await getDb();

  const [destination] = await db.select().from(destinations).where(eq(destinations.slug, slug)).limit(1);
  if (!destination || !destination.published) notFound();

  const [prices, team, relatedServices, others] = await Promise.all([
    db
      .select()
      .from(destinationPrices)
      .where(eq(destinationPrices.destinationId, destination.id))
      .orderBy(asc(destinationPrices.sortOrder)),
    destination.parkSlug
      ? db
          .select()
          .from(personnel)
          .where(
            and(
              eq(personnel.kind, "park_staff"),
              eq(personnel.scopeSlug, destination.parkSlug),
              eq(personnel.published, true)
            )
          )
          .orderBy(asc(personnel.sortOrder))
      : db
          .select()
          .from(personnel)
          .where(
            and(
              eq(personnel.kind, "culture_staff"),
              eq(personnel.scopeSlug, destination.slug),
              eq(personnel.published, true)
            )
          )
          .orderBy(asc(personnel.sortOrder)),
    db
      .select()
      .from(services)
      .where(and(eq(services.destinationSlug, destination.slug), eq(services.published, true)))
      .orderBy(asc(services.sortOrder)),
    db
      .select()
      .from(destinations)
      .where(and(eq(destinations.published, true), ne(destinations.id, destination.id)))
      .orderBy(asc(destinations.sortOrder))
      .limit(3),
  ]);

  const representatives = await db
    .select()
    .from(personnel)
    .where(
      and(
        eq(personnel.kind, "representative"),
        eq(personnel.scopeSlug, destination.slug),
        eq(personnel.published, true)
      )
    );

  return (
    <>
      <section className="relative flex min-h-[78vh] items-end overflow-hidden pb-14 pt-36">
        <SceneSetter
          scene="destinations"
          video={destination.videoUrl}
          poster={destination.heroImage}
          title={`${destination.name} · ${destination.province}`}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-forest via-forest/55 to-forest/20" aria-hidden="true" />
        <div className="container-x relative z-10">
          <div className="max-w-3xl">
            <p className="text-[0.66rem] font-semibold uppercase tracking-[0.3em] text-gold-light">
              {destination.category} · {destination.province}
            </p>
            <h1 className="mt-3 font-display text-4xl leading-[1.05] text-cream sm:text-5xl lg:text-[4rem]">
              {destination.name}
            </h1>
            <p className="mt-4 max-w-2xl text-[0.98rem] leading-relaxed text-cream/75">
              {destination.tagline ?? destination.description}
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-4 text-[0.78rem] text-cream/70">
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-gold-light" /> {destination.location}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <ShieldAlert className="h-4 w-4 text-gold-light" /> Prices verified only where sourced
              </span>
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href={`/booking?destination=${destination.slug}&book=1`}
                className="btn btn-gold"
              >
                Book this destination <ArrowRight className="h-4 w-4" />
              </Link>
              <a href="#prices" className="btn btn-outline">
                See official prices
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="container-x grid gap-12 py-16 lg:grid-cols-[1.5fr_1fr]">
        <div>
          <p className="eyebrow">About the destination</p>
          <div className="mt-4 space-y-4 text-[0.95rem] leading-[1.85] text-body">
            {(destination.longDescription ?? destination.description).split(/\n\n+/).map((paragraph) => (
              <p key={paragraph.slice(0, 40)}>{paragraph}</p>
            ))}
          </div>

          {destination.gallery.length > 0 && (
            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {destination.gallery.slice(0, 6).map((image, index) => (
                <div key={`${image}-${index}`} className="relative aspect-[4/3] overflow-hidden rounded-xl">
                  <Image src={image} alt="" fill sizes="(max-width: 640px) 50vw, 25vw" className="object-cover" />
                </div>
              ))}
            </div>
          )}

          <div className="mt-10">
            <p className="eyebrow">Available activities</p>
            <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
              {destination.activities.map((activity) => (
                <div
                  key={activity}
                  className="flex items-center gap-2.5 rounded-xl border border-pine/10 bg-white px-4 py-3 text-[0.85rem] text-body"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-gold" />
                  {activity}
                </div>
              ))}
            </div>
          </div>

          {destination.bookingRequirements && (
            <div className="mt-10 rounded-2xl border border-pine/10 bg-white p-6">
              <p className="text-sm font-semibold text-pine">Booking requirements</p>
              <p className="mt-2 text-[0.85rem] leading-relaxed text-body-soft">{destination.bookingRequirements}</p>
            </div>
          )}

          {destination.importantInfo && (
            <div className="mt-4 rounded-2xl border border-gold/30 bg-gold/8 p-6">
              <p className="text-sm font-semibold text-[#6d5316]">Important visitor information</p>
              <p className="mt-2 text-[0.85rem] leading-relaxed text-gold-ink">{destination.importantInfo}</p>
            </div>
          )}

          {relatedServices.length > 0 && (
            <div className="mt-10">
              <p className="eyebrow">Experiences here</p>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {relatedServices.map((service) => (
                  <Link
                    key={service.id}
                    href={`/services#${service.slug}`}
                    className="group flex gap-3 rounded-xl border border-pine/10 bg-white p-4 transition hover:border-emerald/35"
                  >
                    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg">
                      <Image src={service.imageUrl} alt="" fill sizes="64px" className="object-cover" />
                    </div>
                    <div>
                      <p className="text-[0.85rem] font-semibold text-pine group-hover:text-emerald">{service.name}</p>
                      <p className="mt-1 line-clamp-2 text-[0.72rem] leading-relaxed text-muted">
                        {service.description}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        <aside className="space-y-5">
          <div id="prices" className="scroll-mt-28">
            <p className="eyebrow mb-3">Official entrance fees & activity prices</p>
            <PriceTable prices={prices} />
            <p className="mt-2 text-[0.68rem] leading-relaxed text-faint">
              Prices are in the currency published by the source. Categories, age limits and seasonal
              conditions are set by the destination and may change; always reconfirm before travel.
            </p>
          </div>

          <div className="rounded-2xl border border-pine/10 bg-white p-5">
            <p className="text-sm font-semibold text-pine">Destination information</p>
            <dl className="mt-3 space-y-2.5 text-[0.8rem]">
              {[
                ["Category", destination.category],
                ["Province", destination.province],
                ["District", destination.district],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between gap-3">
                  <dt className="text-label">{label}</dt>
                  <dd className="text-right font-medium text-pine">{value ?? "—"}</dd>
                </div>
              ))}
            </dl>

            <div className="mt-4 space-y-2 border-t border-pine/10 pt-3 text-[0.8rem]">
              {destination.contactEmail && (
                <a href={`mailto:${destination.contactEmail}`} className="flex items-center gap-2 text-body hover:text-emerald">
                  <Mail className="h-3.5 w-3.5 text-emerald" /> {destination.contactEmail}
                </a>
              )}
              {destination.contactPhone && (
                <a
                  href={`tel:${destination.contactPhone.replace(/\s/g, "")}`}
                  className="flex items-center gap-2 text-body hover:text-emerald"
                >
                  <Phone className="h-3.5 w-3.5 text-emerald" /> {destination.contactPhone}
                </a>
              )}
              {destination.website && (
                <a
                  href={destination.website}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="flex items-center gap-2 text-body hover:text-emerald"
                >
                  <Globe className="h-3.5 w-3.5 text-emerald" /> Official website
                </a>
              )}
              {destination.openingHours && (
                <p className="flex items-start gap-2 text-body">
                  <Clock3 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald" /> {destination.openingHours}
                </p>
              )}
              {!destination.contactEmail && !destination.contactPhone && !destination.openingHours && (
                <p className="text-[0.75rem] leading-relaxed text-faint">
                  Official contact details and opening hours are not published on this platform yet.
                  Please check the destination’s official website before travelling.
                </p>
              )}
            </div>
          </div>

          <div className="rounded-2xl bg-pine p-6 text-cream">
            <CalendarDays className="h-5 w-5 text-gold-light" />
            <p className="mt-3 font-display text-xl">Ready to visit?</p>
            <p className="mt-1.5 text-[0.8rem] leading-relaxed text-cream/65">
              Send a booking request with your dates and visitor numbers. Nothing is charged online.
            </p>
            <Link href={`/booking?destination=${destination.slug}&book=1`} className="btn btn-gold mt-4 w-full">
              Book this destination
            </Link>
          </div>
        </aside>
      </section>

      {representatives.length > 0 && (
        <section className="bg-sand/50 py-14">
          <div className="container-x">
            <p className="eyebrow">Destination representative</p>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {representatives.map((person) => (
                <PersonCard key={person.id} person={person} />
              ))}
            </div>
          </div>
        </section>
      )}

      {team.length > 0 && (
        <section className="container-x py-16">
          <Reveal>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="eyebrow">Meet the team</p>
                <h2 className="mt-2 font-display text-3xl text-pine sm:text-4xl">The people behind the visit</h2>
                <p className="mt-3 max-w-2xl text-[0.9rem] leading-relaxed text-body-soft">
                  Verified departments at this destination. Named individuals are published only once the
                  institution has confirmed their identity and role.
                </p>
              </div>
              <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-[0.7rem] text-body-soft">
                <Users className="h-3.5 w-3.5 text-emerald" /> {team.length} teams
              </span>
            </div>
          </Reveal>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {team.map((person, index) => (
              <Reveal key={person.id} delay={index * 60}>
                <PersonCard person={person} />
              </Reveal>
            ))}
          </div>
        </section>
      )}

      <section className="container-x pb-20">
        <div className="flex items-end justify-between gap-4">
          <h2 className="font-display text-2xl text-pine sm:text-3xl">Continue exploring</h2>
          <Link href="/destinations" className="text-xs font-semibold text-emerald underline underline-offset-4">
            All destinations
          </Link>
        </div>
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {others.map((other) => (
            <DestinationCard key={other.id} destination={other} />
          ))}
        </div>
      </section>
    </>
  );
}
