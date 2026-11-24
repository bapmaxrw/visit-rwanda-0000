import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { and, desc, eq, ne } from "drizzle-orm";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { getDb } from "@/lib/db";
import { articles } from "@/lib/db/schema";
import { formatDate } from "@/lib/pricing";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const db = await getDb();
  const [article] = await db.select().from(articles).where(eq(articles.slug, slug)).limit(1);
  if (!article) return { title: "Article not found" };
  return { title: article.title, description: article.excerpt };
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const db = await getDb();
  const [article] = await db
    .select()
    .from(articles)
    .where(and(eq(articles.slug, slug), eq(articles.published, true)))
    .limit(1);
  if (!article) notFound();

  const more = await db
    .select()
    .from(articles)
    .where(and(eq(articles.published, true), ne(articles.id, article.id)))
    .orderBy(desc(articles.publishedAt))
    .limit(2);

  return (
    <>
      <section className="relative flex min-h-[58vh] items-end overflow-hidden pb-12 pt-36">
        <Image src={article.coverImage} alt={article.title} fill priority sizes="100vw" className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-forest via-forest/60 to-forest/25" />
        <div className="container-x relative z-10 max-w-3xl">
          <Link href="/articles" className="inline-flex items-center gap-1.5 text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-gold-light">
            <ArrowLeft className="h-3.5 w-3.5" /> Journal
          </Link>
          <h1 className="mt-3 font-display text-3xl leading-tight text-cream sm:text-5xl">{article.title}</h1>
          <p className="mt-3 text-[0.72rem] uppercase tracking-[0.16em] text-cream/60">
            {article.category} · {formatDate(article.publishedAt)} · {article.author}
          </p>
        </div>
      </section>

      <article className="container-x max-w-3xl py-14">
        <p className="font-display text-xl leading-relaxed text-pine">{article.excerpt}</p>
        <div className="prose-rwanda mt-7 text-[0.95rem]">
          {article.body.split(/\n\n+/).map((paragraph) => (
            <p key={paragraph.slice(0, 40)}>{paragraph}</p>
          ))}
        </div>

        <div className="mt-10 rounded-2xl border border-pine/10 bg-white p-6">
          <p className="text-sm font-semibold text-pine">Plan this experience</p>
          <p className="mt-1.5 text-[0.82rem] leading-relaxed text-body-soft">
            Review official prices and submit a booking request for the destinations mentioned here.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link href="/booking" className="btn btn-forest !px-5 !py-2.5 text-xs">
              Book a visit <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            <Link href="/destinations" className="btn btn-ghost !px-5 !py-2.5 text-xs">
              Browse destinations
            </Link>
          </div>
        </div>
      </article>

      {more.length > 0 && (
        <section className="container-x pb-16">
          <h2 className="font-display text-2xl text-pine">Keep reading</h2>
          <div className="mt-5 grid gap-6 sm:grid-cols-2">
            {more.map((item) => (
              <Link key={item.id} href={`/articles/${item.slug}`} className="group flex gap-4">
                <div className="relative h-24 w-32 shrink-0 overflow-hidden rounded-xl">
                  <Image src={item.coverImage} alt="" fill sizes="128px" className="object-cover" />
                </div>
                <div>
                  <p className="text-[0.6rem] uppercase tracking-[0.16em] text-emerald">{item.category}</p>
                  <p className="mt-1 font-display text-lg leading-snug text-pine group-hover:text-emerald">
                    {item.title}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
