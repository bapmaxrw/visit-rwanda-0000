import type { Metadata } from "next";
import { asc, eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { destinationPrices, destinations } from "@/lib/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { BookingExperience, type PublicDestination } from "@/components/booking/BookingExperience";
import { ShieldCheck } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Book your visit",
  description:
    "Explore Rwanda's destinations, review officially verified prices and submit a booking request.",
};

export default async function BookingPage({
  searchParams,
}: {
  searchParams: Promise<{ destination?: string; book?: string }>;
}) {
  const params = await searchParams;
  const db = await getDb();
  const user = await getCurrentUser();

  const [rows, prices] = await Promise.all([
    db.select().from(destinations).where(eq(destinations.published, true)).orderBy(asc(destinations.sortOrder)),
    db.select().from(destinationPrices).orderBy(asc(destinationPrices.sortOrder)),
  ]);

  const data: PublicDestination[] = rows.map((destination) => ({
    id: destination.id,
    slug: destination.slug,
    name: destination.name,
    tagline: destination.tagline,
    category: destination.category,
    province: destination.province,
    district: destination.district,
    location: destination.location,
    description: destination.description,
    longDescription: destination.longDescription,
    activities: destination.activities,
    services: destination.services,
    gallery: destination.gallery,
    heroImage: destination.heroImage,
    cardImage: destination.cardImage,
    openingHours: destination.openingHours,
    contactEmail: destination.contactEmail,
    contactPhone: destination.contactPhone,
    website: destination.website,
    bookingRequirements: destination.bookingRequirements,
    importantInfo: destination.importantInfo,
    prices: prices
      .filter((price) => price.destinationId === destination.id && price.verified)
      .map((price) => ({
        id: price.id,
        label: price.label,
        activity: price.activity,
        visitorCategory: price.visitorCategory,
        adultAmount: price.adultAmount,
        childAmount: price.childAmount,
        currency: price.currency,
        unit: price.unit,
        sourceName: price.sourceName,
        sourceUrl: price.sourceUrl,
        verifiedAt: price.verifiedAt,
        verified: price.verified,
        notes: price.notes,
      })),
  }));

  return (
    <>
      <section className="relative overflow-hidden pb-28 pt-36">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url(/media/volcanoes.jpg)" }}
          aria-hidden="true"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-forest/85 via-forest/65 to-forest/95" aria-hidden="true" />
        <div className="container-x relative z-10 text-center">
          <p className="text-[0.66rem] font-semibold uppercase tracking-[0.34em] text-gold-light">
            Plan your visit
          </p>
          <h1 className="mx-auto mt-4 max-w-4xl font-display text-4xl leading-[1.08] text-cream sm:text-5xl lg:text-[3.6rem]">
            Discover Rwanda — book your next adventure
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-[0.95rem] leading-relaxed text-cream/70">
            Explore Rwanda’s beautiful destinations and book unforgettable experiences. Every price
            shown comes from an official source, with its verification date.
          </p>
          <p className="mx-auto mt-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-[0.7rem] text-cream/70 backdrop-blur">
            <ShieldCheck className="h-3.5 w-3.5 text-gold-light" />
            Browse freely — an account is only needed when you submit a request
          </p>
        </div>
      </section>

      <BookingExperience
        destinations={data}
        user={
          user
            ? {
                fullName: user.fullName,
                email: user.email,
                phone: user.phone,
                nationality: user.nationality,
              }
            : null
        }
        initialSlug={params.destination}
        initialBook={params.book === "1"}
      />
    </>
  );
}
