import Link from "next/link";
import Image from "next/image";
import { asc, desc, eq, and } from "drizzle-orm";
import { ArrowRight, Compass, Leaf, MapPin, ShieldCheck, Sparkles } from "lucide-react";
import { getDb } from "@/lib/db";
import { articles, destinations, galleryImages, institutions, personnel } from "@/lib/db/schema";
import { HeroVideo } from "@/components/site/HeroVideo";
import { SectionHeading } from "@/components/site/SectionHeading";
import { DestinationCard } from "@/components/site/DestinationCard";
import { Reveal } from "@/components/site/Reveal";
import { PersonCard } from "@/components/site/PersonCard";

export const dynamic = "force-dynamic";

const experiences = [
  { label: "Wildlife & Safari", icon: Compass, href: "/destinations?category=National%20Parks" },
  { label: "Culture & Heritage", icon: Sparkles, href: "/culture" },
  { label: "Lakes & Beaches", icon: Leaf, href: "/destinations?category=Lakes%20and%20Beaches" },
  { label: "Hiking & Adventure", icon: MapPin, href: "/services" },
];

export default async function HomePage() {
  const db = await getDb();
  const [featured, culture, gallery, leaders, developers, latestArticles] = await Promise.all([
    db
      .select()
      .from(destinations)
      .where(and(eq(destinations.published, true), eq(destinations.featured, true)))
      .orderBy(asc(destinations.sortOrder))
      .limit(4),
    db.select().from(institutions).where(eq(institutions.published, true)).orderBy(asc(institutions.sortOrder)).limit(3),
    db.select().from(galleryImages).where(eq(galleryImages.published, true)).orderBy(asc(galleryImages.sortOrder)).limit(6),
    db
      .select()
      .from(personnel)
      .where(and(eq(personnel.kind, "leader"), eq(personnel.published, true)))
      .orderBy(desc(personnel.featured), asc(personnel.sortOrder))
      .limit(3),
    db
      .select()
      .from(personnel)
      .where(and(eq(personnel.kind, "developer"), eq(personnel.published, true)))
      .orderBy(asc(personnel.sortOrder)),
    db.select().from(articles).where(eq(articles.published, true)).orderBy(desc(articles.publishedAt)).limit(3),
  ]);

  return (
    <>
      <HeroVideo
        title="Discover the Beauty of Rwanda"
        subtitle="Volcanoes, mountain gorillas, rainforest canopies and lakes — one small country with an extraordinary concentration of life, culture and welcome."
      />

      {/* Experience strip */}
      <section className="border-b border-pine/10 bg-cream">
        <div className="container-x flex flex-wrap items-center justify-between gap-4 py-5">
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.26em] text-emerald">
            Travel by experience
          </p>
          <div className="flex flex-wrap gap-2">
            {experiences.map(({ label, icon: Icon, href }) => (
              <Link
                key={label}
                href={href}
                className="inline-flex items-center gap-2 rounded-full border border-pine/12 bg-white px-4 py-2 text-[0.78rem] font-medium text-pine transition hover:border-emerald/40 hover:text-emerald"
              >
                <Icon className="h-3.5 w-3.5" /> {label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured destinations */}
      <section className="container-x py-20">
        <Reveal>
          <SectionHeading
            eyebrow="Where to go"
            title="Destinations that stay with you"
            description="From the bamboo forests of the Virunga volcanoes to the savannah of Akagera and the beaches of Lake Kivu — explore Rwanda's signature places."
            action={
              <Link href="/destinations" className="btn btn-ghost">
                All destinations <ArrowRight className="h-4 w-4" />
              </Link>
            }
          />
        </Reveal>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {featured.map((destination, index) => (
            <Reveal key={destination.id} delay={index * 90}>
              <DestinationCard destination={destination} priority={index < 2} />
            </Reveal>
          ))}
        </div>
      </section>

      {/* Why Rwanda */}
      <section className="relative overflow-hidden bg-pine py-20 text-cream">
        <div className="absolute inset-0 opacity-25">
          <Image src="/media/hills.jpg" alt="" fill sizes="100vw" className="object-cover" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-forest via-forest/90 to-forest/40" aria-hidden="true" />
        <div className="container-x relative grid gap-12 lg:grid-cols-2 lg:items-center">
          <Reveal>
            <p className="eyebrow text-gold-light">Why Rwanda</p>
            <h2 className="mt-3 font-display text-3xl leading-tight sm:text-4xl lg:text-[2.9rem]">
              A small country with a global conservation story
            </h2>
            <p className="mt-5 max-w-xl text-[0.95rem] leading-relaxed text-cream/75">
              Rwanda has rebuilt its tourism economy around protected landscapes and the communities
              that live beside them. Gorilla permit revenue is shared with local projects, national
              parks are managed through long-term partnerships, and cultural institutions keep the
              country’s history and language alive for visitors and Rwandans alike.
            </p>
            <Link href="/about" className="btn btn-gold mt-8">
              Our story <ArrowRight className="h-4 w-4" />
            </Link>
          </Reveal>

          <div className="grid gap-4 sm:grid-cols-2">
            {[
              ["4", "National parks", "Volcanoes, Akagera, Nyungwe, Gishwati-Mukura"],
              ["3", "Official park rate cards verified", "Sources and dates shown on every published price"],
              ["700+", "Bird species", "From papyrus swamps to montane forest"],
              ["1 hr", "With a gorilla family", "Strictly managed, eight visitors per family"],
            ].map(([value, label, detail], index) => (
              <Reveal key={label} delay={index * 80}>
                <div className="glass-dark rounded-2xl p-5">
                  <p className="font-display text-3xl text-gold-light">{value}</p>
                  <p className="mt-1 text-sm font-medium">{label}</p>
                  <p className="mt-1 text-[0.72rem] leading-relaxed text-cream/55">{detail}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Culture */}
      <section className="container-x py-20">
        <Reveal>
          <SectionHeading
            eyebrow="Culture & heritage"
            title="The museums and places that hold Rwanda's story"
            description="Royal palaces, ethnographic collections, memorials and living arts — presented with the context and respect they deserve."
            action={
              <Link href="/culture" className="btn btn-ghost">
                Explore culture <ArrowRight className="h-4 w-4" />
              </Link>
            }
          />
        </Reveal>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {culture.map((institution, index) => (
            <Reveal key={institution.id} delay={index * 90}>
              <Link
                href={`/culture/${institution.slug}`}
                className="group relative block overflow-hidden rounded-[1.6rem]"
              >
                <div className="relative aspect-[4/5]">
                  <Image
                    src={institution.imageUrl}
                    alt={institution.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover transition duration-[1.2s] group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-forest via-forest/25 to-transparent" />
                </div>
                <div className="absolute inset-x-0 bottom-0 p-6">
                  <p className="text-[0.62rem] font-semibold uppercase tracking-[0.22em] text-gold-light">
                    {institution.category}
                  </p>
                  <h3 className="mt-2 font-display text-2xl text-white">{institution.name}</h3>
                  <p className="mt-2 line-clamp-2 text-[0.8rem] leading-relaxed text-cream/70">
                    {institution.summary}
                  </p>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Leadership */}
      <section className="bg-sand/60 py-20">
        <div className="container-x">
          <Reveal>
            <SectionHeading
              eyebrow="Rwanda tourism leadership"
              title="The institutions guiding tourism and heritage"
              description="Verified public leadership of the Rwanda Development Board and the Rwanda Cultural Heritage Academy. Names, titles and references are published only where officially confirmed."
              action={
                <Link href="/about#leadership" className="btn btn-ghost">
                  All leadership <ArrowRight className="h-4 w-4" />
                </Link>
              }
            />
          </Reveal>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {leaders.map((leader, index) => (
              <Reveal key={leader.id} delay={index * 90}>
                <PersonCard person={leader} />
              </Reveal>
            ))}
          </div>
          <p className="mt-6 inline-flex items-center gap-2 text-[0.7rem] text-muted">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald" />
            Sources: rdb.rw/senior-management · rwandaheritage.gov.rw — verified 18 November 2026.
          </p>
        </div>
      </section>

      {/* Gallery */}
      <section className="container-x py-20">
        <Reveal>
          <SectionHeading
            eyebrow="Gallery"
            title="Rwanda, frame by frame"
            description="Wildlife, landscapes, cities and culture — a visual introduction to the country."
            action={
              <Link href="/gallery" className="btn btn-ghost">
                Open gallery <ArrowRight className="h-4 w-4" />
              </Link>
            }
          />
        </Reveal>
        <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {gallery.map((image, index) => (
            <Reveal key={image.id} delay={index * 60}>
              <figure
                className={`group relative overflow-hidden rounded-2xl ${
                  index === 0 ? "aspect-[4/3] lg:aspect-[4/3]" : "aspect-[4/3]"
                }`}
              >
                <Image
                  src={image.url}
                  alt={image.caption ?? "Rwanda"}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover transition duration-[1.2s] group-hover:scale-105"
                />
                <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-forest/85 to-transparent p-4 text-[0.72rem] text-cream/85 opacity-0 transition group-hover:opacity-100">
                  {image.caption}
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Developer team teaser */}
      <section className="relative overflow-hidden bg-forest py-20 text-cream">
        <div className="container-x">
          <div className="grid gap-12 lg:grid-cols-[1fr_1.1fr] lg:items-center">
            <Reveal>
              <p className="eyebrow text-gold-light">Behind the platform</p>
              <h2 className="mt-3 font-display text-3xl leading-tight sm:text-4xl">
                Meet the developers behind Visit Rwanda Academy
              </h2>
              <p className="mt-5 max-w-lg text-[0.95rem] leading-relaxed text-cream/70">
                A small software team building a digital gateway to Rwanda’s tourism and cultural
                experiences — architecture, interface, integration and testing.
              </p>
              <Link href="/development-team" className="btn btn-gold mt-8">
                Meet the team <ArrowRight className="h-4 w-4" />
              </Link>
            </Reveal>
            <div className="space-y-3">
              {developers.map((developer, index) => (
                <Reveal key={developer.id} delay={index * 90}>
                  <div className="flex items-start gap-4 rounded-2xl border border-cream/12 bg-white/[0.04] p-5">
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gold/15 font-display text-sm text-gold-light ring-1 ring-gold/30">
                      {developer.name
                        ?.split(" ")
                        .slice(-2)
                        .map((part) => part[0])
                        .join("")}
                    </span>
                    <div>
                      <p className="font-medium text-cream">{developer.name}</p>
                      <p className="text-[0.74rem] text-gold-light/90">{developer.title}</p>
                      <p className="mt-1.5 text-[0.76rem] leading-relaxed text-cream/55">
                        {developer.bio}
                      </p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Articles */}
      <section className="container-x py-20">
        <Reveal>
          <SectionHeading
            eyebrow="Journal"
            title="Practical reading before you travel"
            description="Field notes and planning guides written for visitors to Rwanda."
            action={
              <Link href="/articles" className="btn btn-ghost">
                All articles <ArrowRight className="h-4 w-4" />
              </Link>
            }
          />
        </Reveal>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {latestArticles.map((article, index) => (
            <Reveal key={article.id} delay={index * 80}>
              <Link href={`/articles/${article.slug}`} className="group block">
                <div className="relative aspect-[16/11] overflow-hidden rounded-2xl">
                  <Image
                    src={article.coverImage}
                    alt={article.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover transition duration-[1.2s] group-hover:scale-105"
                  />
                </div>
                <p className="mt-4 text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-emerald">
                  {article.category}
                </p>
                <h3 className="mt-2 font-display text-xl leading-snug text-pine group-hover:text-emerald">
                  {article.title}
                </h3>
                <p className="mt-2 line-clamp-2 text-[0.83rem] leading-relaxed text-body-soft">
                  {article.excerpt}
                </p>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="container-x pb-20">
        <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#0f5c43] to-[#06231c] px-7 py-14 text-center sm:px-16">
          <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-gold/15 blur-3xl" />
          <p className="eyebrow text-gold-light">Start planning</p>
          <h2 className="mx-auto mt-3 max-w-2xl font-display text-3xl leading-tight text-cream sm:text-4xl">
            Your Rwandan adventure begins with one booking request
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-[0.9rem] text-cream/65">
            Choose a destination, review the official price and send a request. Our team confirms
            availability and replies with the next steps.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/booking" className="btn btn-gold">
              Plan your visit <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/services" className="btn btn-outline">
              Browse experiences
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
