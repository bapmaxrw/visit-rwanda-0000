import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { asc, desc, eq, inArray } from "drizzle-orm";
import { ArrowRight, BadgeCheck, MapPin, ShieldCheck } from "lucide-react";
import { getDb } from "@/lib/db";
import { personnel, siteSettings } from "@/lib/db/schema";
import { PageHero } from "@/components/site/PageHero";
import { SectionHeading } from "@/components/site/SectionHeading";
import { PersonCard } from "@/components/site/PersonCard";
import { Reveal } from "@/components/site/Reveal";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "About",
  description:
    "Visit Rwanda Academy is a digital gateway to Rwanda's tourism, national parks, cultural heritage and the people behind them.",
};

export default async function AboutPage() {
  const db = await getDb();
  const [leaders, developers, settings] = await Promise.all([
    db
      .select()
      .from(personnel)
      .where(eq(personnel.kind, "leader"))
      .orderBy(desc(personnel.featured), asc(personnel.sortOrder)),
    db
      .select()
      .from(personnel)
      .where(eq(personnel.kind, "developer"))
      .orderBy(asc(personnel.sortOrder)),
    db.select().from(siteSettings).where(inArray(siteSettings.key, ["ownerName", "ownerRole", "assistantName", "assistantRole"])),
  ]);

  const setting = (key: string, fallback: string) =>
    settings.find((row) => row.key === key)?.value ?? fallback;

  return (
    <>
      <PageHero
        eyebrow="About the platform"
        title="Rwanda's tourism, culture and people in one place"
        description="Visit Rwanda Academy brings together destination information, official pricing, heritage institutions and the professional teams who make Rwandan tourism work."
      />

      <section className="container-x grid gap-12 py-16 lg:grid-cols-[1.4fr_1fr]">
        <div>
          <p className="eyebrow">Our purpose</p>
          <h2 className="mt-2 font-display text-3xl leading-tight text-pine sm:text-4xl">
            A digital gateway built around trust
          </h2>
          <div className="mt-5 space-y-4 text-[0.93rem] leading-[1.85] text-body">
            <p>
              Rwanda is small enough to cross in a day and varied enough to fill a lifetime: mountain
              gorillas in the Virunga volcanoes, the savannah and lakes of Akagera, the ancient rainforest
              of Nyungwe, the freshwater shoreline of Lake Kivu, and a capital with galleries, memorials
              and some of Africa’s best coffee.
            </p>
            <p>
              This platform exists to present that country accurately. Destination profiles carry
              activities, official contacts and visitor requirements. Fees are published only when they
              come from an official source, and every one of them shows where it came from and when it
              was last checked. Where no official price exists, we say so rather than invent one.
            </p>
            <p>
              The same rule applies to people. Tourism leadership is presented with an official reference.
              Where an individual staff member cannot be verified, you will see the department or team
              that serves visitors instead of a fabricated identity.
            </p>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {[
              ["Official sources", "Prices linked to RDB, park authorities and heritage institutions"],
              ["Verified people", "Named officials only where officially published"],
              ["Real bookings", "Requests stored in PostgreSQL and reviewed by administrators"],
            ].map(([title, detail]) => (
              <div key={title} className="rounded-xl border border-pine/10 bg-white p-4">
                <p className="flex items-center gap-1.5 text-[0.8rem] font-semibold text-pine">
                  <BadgeCheck className="h-3.5 w-3.5 text-emerald" /> {title}
                </p>
                <p className="mt-1 text-[0.72rem] leading-relaxed text-muted">{detail}</p>
              </div>
            ))}
          </div>
        </div>

        <aside className="space-y-5">
          <div className="relative aspect-[4/5] overflow-hidden rounded-[1.6rem]">
            <Image src="/media/culture.jpg" alt="Intore dancers in Rwanda" fill sizes="40vw" className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-forest/80 to-transparent" />
            <p className="absolute inset-x-5 bottom-5 text-[0.78rem] leading-relaxed text-cream/85">
              Culture is not a side attraction in Rwanda — it is the context for every visit.
            </p>
          </div>
          <div className="rounded-[1.6rem] border border-pine/10 bg-white p-6">
            <p className="text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-emerald">Contact</p>
            <p className="mt-2 text-sm font-medium text-pine">Rwanda Development Board — tourism enquiries</p>
            <div className="mt-2 space-y-1 text-[0.8rem] text-body-soft">
              <p>
                <a className="hover:text-emerald" href="mailto:info@rdb.rw">
                  info@rdb.rw
                </a>
              </p>
              <p>
                <a className="hover:text-emerald" href="tel:+250727775170">
                  +250 727 775 170
                </a>
              </p>
              <a
                href="https://www.visitrwanda.com/"
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex items-center gap-1 font-medium text-emerald hover:underline"
              >
                visitrwanda.com <ArrowRight className="h-3 w-3" />
              </a>
            </div>
          </div>
        </aside>
      </section>

      <section id="leadership" className="scroll-mt-24 bg-sand/60 py-16">
        <div className="container-x">
          <Reveal>
            <SectionHeading
              eyebrow="Rwanda tourism leadership"
              title="Verified leadership and institutions"
              description="Public leadership of the Rwanda Development Board and the Rwanda Cultural Heritage Academy. Each profile links to its official source."
            />
          </Reveal>
          <div className="mt-9 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {leaders.map((leader, index) => (
              <Reveal key={leader.id} delay={index * 60}>
                <PersonCard person={leader} />
              </Reveal>
            ))}
          </div>
          <p className="mt-6 inline-flex items-center gap-2 text-[0.7rem] text-muted">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald" />
            Sources: rdb.rw/senior-management · rwandaheritage.gov.rw — verified 18 November 2026. Official
            portraits are not reproduced here; see each individual’s official page.
          </p>
        </div>
      </section>

      <section className="container-x py-16">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-[1.5rem] border border-pine/10 bg-white p-7">
            <p className="text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-emerald">
              Website owner · backend & frontend developer
            </p>
            <h2 className="mt-2 font-display text-2xl text-pine">{setting("ownerName", "Byiringiro Aime Pacifique")}</h2>
            <p className="mt-2 text-[0.85rem] leading-relaxed text-body-soft">
              {setting("ownerRole", "Website Owner · Backend and Frontend Developer")}. Responsible for
              building the Visit Rwanda website’s frontend and backend systems.
            </p>
          </div>
          <div className="rounded-[1.5rem] border border-pine/10 bg-white p-7">
            <p className="text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-emerald">
              Assistant · development support
            </p>
            <h2 className="mt-2 font-display text-2xl text-pine">{setting("assistantName", "Bwigwi Herve Baramy")}</h2>
            <p className="mt-2 text-[0.85rem] leading-relaxed text-body-soft">
              {setting("assistantRole", "Assistant · Development Support")}.
            </p>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-4 rounded-[1.5rem] bg-pine p-7 text-cream">
          <div>
            <p className="text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-gold-light">
              The software team
            </p>
            <h2 className="mt-1 font-display text-2xl">Meet the developers behind Visit Rwanda Academy</h2>
            <p className="mt-1.5 max-w-xl text-[0.8rem] text-cream/65">
              {developers.length} team members building architecture, interface, integration and testing.
            </p>
          </div>
          <Link href="/development-team" className="btn btn-gold">
            Development team <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <section className="container-x pb-20">
        <div className="rounded-[1.5rem] border border-pine/10 bg-white p-7">
          <p className="flex items-center gap-2 text-sm font-semibold text-pine">
            <MapPin className="h-4 w-4 text-emerald" /> Where our information comes from
          </p>
          <ul className="mt-3 grid gap-2 text-[0.8rem] leading-relaxed text-body-soft sm:grid-cols-2">
            <li>Rwanda Development Board — official rates and senior management</li>
            <li>Akagera Management Company — 2026-2027 official park pricing</li>
            <li>Nyungwe National Park — official 2025/2026 activity rates</li>
            <li>Rwanda Cultural Heritage Academy — museums, heritage and leadership</li>
            <li>Official park and destination websites for contacts and access information</li>
            <li>Wikimedia Commons for openly licensed photography, credited in the gallery</li>
          </ul>
        </div>
      </section>
    </>
  );
}
