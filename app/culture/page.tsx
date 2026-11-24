import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { asc, eq } from "drizzle-orm";
import { ArrowUpRight, ShieldCheck } from "lucide-react";
import { getDb } from "@/lib/db";
import { institutions } from "@/lib/db/schema";
import { PageHero } from "@/components/site/PageHero";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Culture & heritage",
  description:
    "Rwanda's museums, memorials and cultural institutions: the King's Palace, Ethnographic Museum, Kigali Genocide Memorial and more.",
};

export default async function CulturePage() {
  const db = await getDb();
  const rows = await db
    .select()
    .from(institutions)
    .where(eq(institutions.published, true))
    .orderBy(asc(institutions.sortOrder));

  return (
    <>
      <PageHero
        eyebrow="Culture & heritage"
        title="The places that hold Rwanda's story"
        description="Royal palaces, ethnographic collections, memorials and living arts. Presented with context, official contacts and respect for the sensitive history they preserve."
      />

      <section className="container-x py-16">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {rows.map((institution) => (
            <Link
              key={institution.id}
              href={`/culture/${institution.slug}`}
              className="group flex flex-col overflow-hidden rounded-[1.5rem] border border-pine/10 bg-white transition hover:-translate-y-1 hover:shadow-[0_30px_60px_-45px_rgba(6,35,28,0.6)]"
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <Image
                  src={institution.imageUrl}
                  alt={institution.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover transition duration-[1.2s] group-hover:scale-105"
                />
                <span className="absolute left-4 top-4 rounded-full bg-cream/90 px-3 py-1 text-[0.6rem] font-semibold uppercase tracking-[0.14em] text-pine">
                  {institution.category}
                </span>
              </div>
              <div className="flex flex-1 flex-col p-5">
                <div className="flex items-start justify-between gap-2">
                  <h2 className="font-display text-xl leading-tight text-pine">{institution.name}</h2>
                  <ArrowUpRight className="mt-1 h-4 w-4 shrink-0 text-emerald transition group-hover:rotate-45" />
                </div>
                <p className="mt-2 line-clamp-3 text-[0.82rem] leading-relaxed text-body-soft">
                  {institution.summary}
                </p>
                <div className="mt-auto flex items-center justify-between gap-2 pt-4 text-[0.68rem] text-faint">
                  <span>{institution.district}, {institution.province}</span>
                  {institution.verified && (
                    <span className="inline-flex items-center gap-1 text-emerald">
                      <ShieldCheck className="h-3 w-3" /> Sourced
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
