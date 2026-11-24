import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { and, asc, eq } from "drizzle-orm";
import { ArrowRight, Clock3, Globe, Mail, MapPin, Phone, ShieldCheck } from "lucide-react";
import { getDb } from "@/lib/db";
import { institutions, personnel } from "@/lib/db/schema";
import { PersonCard } from "@/components/site/PersonCard";
import { Reveal } from "@/components/site/Reveal";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const db = await getDb();
  const [institution] = await db.select().from(institutions).where(eq(institutions.slug, slug)).limit(1);
  if (!institution) return { title: "Institution not found" };
  return { title: institution.name, description: institution.summary };
}

export default async function InstitutionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const db = await getDb();
  const [institution] = await db.select().from(institutions).where(eq(institutions.slug, slug)).limit(1);
  if (!institution || !institution.published) notFound();

  const team = await db
    .select()
    .from(personnel)
    .where(
      and(
        eq(personnel.kind, "culture_staff"),
        eq(personnel.scopeSlug, institution.slug),
        eq(personnel.published, true)
      )
    )
    .orderBy(asc(personnel.sortOrder));

  return (
    <>
      <section className="relative flex min-h-[62vh] items-end overflow-hidden pb-12 pt-36">
        <Image src={institution.imageUrl} alt={institution.name} fill priority sizes="100vw" className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-forest via-forest/65 to-forest/25" />
        <div className="container-x relative z-10 max-w-3xl">
          <p className="text-[0.64rem] font-semibold uppercase tracking-[0.3em] text-gold-light">
            {institution.category} · {institution.province}
          </p>
          <h1 className="mt-3 font-display text-4xl leading-tight text-cream sm:text-5xl">{institution.name}</h1>
          <p className="mt-4 max-w-2xl text-[0.95rem] leading-relaxed text-cream/75">{institution.summary}</p>
        </div>
      </section>

      <section className="container-x grid gap-10 py-14 lg:grid-cols-[1.5fr_1fr]">
        <div>
          <div className="prose-rwanda text-[0.93rem]">
            {institution.description.split(/\n\n+/).map((paragraph) => (
              <p key={paragraph.slice(0, 40)}>{paragraph}</p>
            ))}
          </div>

          <div className="mt-8">
            <p className="eyebrow">Services</p>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {institution.services.map((service) => (
                <div key={service} className="flex items-center gap-2 rounded-xl border border-pine/10 bg-white px-4 py-3 text-[0.82rem] text-body">
                  <span className="h-1.5 w-1.5 rounded-full bg-gold" /> {service}
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 rounded-2xl border border-pine/10 bg-white p-5">
            <p className="text-sm font-semibold text-pine">Visiting with respect</p>
            <p className="mt-2 text-[0.82rem] leading-relaxed text-body-soft">
              Memorial sites are places of mourning: dress respectfully, keep voices low, follow staff
              guidance and observe photography restrictions. At museums, do not touch collections unless
              invited to, and ask before photographing people.
            </p>
          </div>
        </div>

        <aside className="space-y-4">
          <div className="rounded-2xl border border-pine/10 bg-white p-5">
            <p className="text-sm font-semibold text-pine">Visitor information</p>
            <div className="mt-3 space-y-2.5 text-[0.8rem] text-body">
              <p className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald" />
                {institution.district}, {institution.province}
              </p>
              {institution.openingHours && (
                <p className="flex items-start gap-2">
                  <Clock3 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald" /> {institution.openingHours}
                </p>
              )}
              {institution.contactEmail && (
                <a href={`mailto:${institution.contactEmail}`} className="flex items-center gap-2 hover:text-emerald">
                  <Mail className="h-3.5 w-3.5 text-emerald" /> {institution.contactEmail}
                </a>
              )}
              {institution.contactPhone && (
                <a
                  href={`tel:${institution.contactPhone.replace(/\s/g, "")}`}
                  className="flex items-center gap-2 hover:text-emerald"
                >
                  <Phone className="h-3.5 w-3.5 text-emerald" /> {institution.contactPhone}
                </a>
              )}
              {institution.website && (
                <a
                  href={institution.website}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="flex items-center gap-2 hover:text-emerald"
                >
                  <Globe className="h-3.5 w-3.5 text-emerald" /> Official website
                </a>
              )}
            </div>
            {institution.verified && (
              <p className="mt-3 inline-flex items-center gap-1 rounded-full bg-emerald/8 px-2.5 py-1 text-[0.64rem] text-emerald">
                <ShieldCheck className="h-3 w-3" /> Institution details sourced
              </p>
            )}
          </div>

          <div className="rounded-2xl bg-pine p-5 text-cream">
            <p className="font-display text-xl">Add it to your trip</p>
            <p className="mt-1.5 text-[0.78rem] leading-relaxed text-cream/65">
              Combine this visit with nearby destinations on the booking page.
            </p>
            <Link href="/booking" className="btn btn-gold mt-4 w-full">
              Plan your visit <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </aside>
      </section>

      {team.length > 0 && (
        <section className="bg-sand/60 py-14">
          <div className="container-x">
            <p className="eyebrow">Management & teams</p>
            <h2 className="mt-2 font-display text-3xl text-pine">Who looks after this place</h2>
            <p className="mt-2 max-w-2xl text-[0.85rem] leading-relaxed text-body-soft">
              Departments are published as verified teams. Individual names appear only when the
              institution has confirmed them.
            </p>
            <div className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {team.map((person, index) => (
                <Reveal key={person.id} delay={index * 60}>
                  <PersonCard person={person} />
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
