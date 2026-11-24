import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { and, asc, eq } from "drizzle-orm";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { getDb } from "@/lib/db";
import { destinations, personnel } from "@/lib/db/schema";
import { PageHero } from "@/components/site/PageHero";
import { PersonCard } from "@/components/site/PersonCard";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "National park teams",
  description:
    "Meet the management, conservation, veterinary, guiding and community teams behind Rwanda's four national parks.",
};

const PARK_ORDER = [
  "volcanoes-national-park",
  "akagera-national-park",
  "nyungwe-national-park",
  "gishwati-mukura-national-park",
];

export default async function NationalParksPage() {
  const db = await getDb();
  const [parks, teams] = await Promise.all([
    db
      .select()
      .from(destinations)
      .where(eq(destinations.category, "National Parks"))
      .orderBy(asc(destinations.sortOrder)),
    db
      .select()
      .from(personnel)
      .where(and(eq(personnel.kind, "park_staff"), eq(personnel.published, true)))
      .orderBy(asc(personnel.sortOrder)),
  ]);

  const ordered = [...parks].sort(
    (a, b) =>
      (PARK_ORDER.indexOf(a.parkSlug ?? a.slug) + 1 || 99) -
      (PARK_ORDER.indexOf(b.parkSlug ?? b.slug) + 1 || 99)
  );

  return (
    <>
      <PageHero
        eyebrow="Meet our national park teams"
        title="The people who protect Rwanda's parks"
        description="Park management, conservation, veterinary, guiding, protection and community teams — presented as verified departments, never with invented identities."
      />

      <section className="container-x py-16">
        <div className="space-y-16">
          {ordered.map((park) => {
            const parkTeams = teams.filter((member) => member.scopeSlug === (park.parkSlug ?? park.slug));
            return (
              <div key={park.id} id={park.slug} className="scroll-mt-28">
                <div className="grid gap-8 lg:grid-cols-[1fr_1.25fr] lg:items-start">
                  <div className="relative aspect-[4/3] overflow-hidden rounded-[1.5rem]">
                    <Image
                      src={park.cardImage ?? park.heroImage}
                      alt={park.name}
                      fill
                      sizes="(max-width: 1024px) 100vw, 40vw"
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-forest/80 to-transparent" />
                    <div className="absolute inset-x-5 bottom-5">
                      <p className="text-[0.6rem] font-semibold uppercase tracking-[0.2em] text-gold-light">
                        {park.province}
                      </p>
                      <h2 className="mt-1 font-display text-3xl text-white">{park.name}</h2>
                    </div>
                  </div>

                  <div>
                    <p className="text-[0.88rem] leading-relaxed text-body">{park.description}</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {park.activities.slice(0, 6).map((activity) => (
                        <span key={activity} className="rounded-full bg-pine/5 px-3 py-1.5 text-[0.7rem] text-pine">
                          {activity}
                        </span>
                      ))}
                    </div>
                    <div className="mt-5 flex flex-wrap gap-3">
                      <Link href={`/destinations/${park.slug}`} className="btn btn-forest !px-5 !py-2.5 text-xs">
                        Destination profile <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                      <Link
                        href={`/booking?destination=${park.slug}&book=1`}
                        className="btn btn-ghost !px-5 !py-2.5 text-xs"
                      >
                        Book a visit
                      </Link>
                    </div>
                  </div>
                </div>

                <div className="mt-7 flex items-center justify-between gap-3">
                  <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-emerald">
                    {parkTeams.length} verified teams
                  </p>
                  <p className="inline-flex items-center gap-1.5 text-[0.65rem] text-faint">
                    <ShieldCheck className="h-3 w-3 text-emerald" />
                    Staff identities published only after official confirmation
                  </p>
                </div>

                <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {parkTeams.map((team) => (
                    <PersonCard key={team.id} person={team} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </>
  );
}
