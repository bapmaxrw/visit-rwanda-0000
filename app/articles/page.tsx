import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { desc, eq } from "drizzle-orm";
import { ArrowUpRight } from "lucide-react";
import { getDb } from "@/lib/db";
import { articles } from "@/lib/db/schema";
import { PageHero } from "@/components/site/PageHero";
import { formatDate } from "@/lib/pricing";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Articles",
  description: "Practical guides to gorilla trekking, safaris, Nyungwe and Rwanda's cultural heritage circuit.",
};

export default async function ArticlesPage() {
  const db = await getDb();
  const rows = await db
    .select()
    .from(articles)
    .where(eq(articles.published, true))
    .orderBy(desc(articles.publishedAt));

  const [lead, ...rest] = rows;

  return (
    <>
      <PageHero
        eyebrow="Journal"
        title="Notes for the journey"
        description="Field guides and practical reading for visitors to Rwanda, written by the Visit Rwanda Academy editorial team."
      />

      <section className="container-x py-14">
        {lead && (
          <Link
            href={`/articles/${lead.slug}`}
            className="group grid gap-7 overflow-hidden rounded-[1.6rem] border border-pine/10 bg-white lg:grid-cols-2"
          >
            <div className="relative aspect-[16/10] lg:aspect-auto lg:min-h-[360px]">
              <Image
                src={lead.coverImage}
                alt={lead.title}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover transition duration-[1.2s] group-hover:scale-105"
              />
            </div>
            <div className="flex flex-col justify-center p-7 lg:p-10">
              <p className="text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-emerald">
                {lead.category} · {formatDate(lead.publishedAt)}
              </p>
              <h2 className="mt-3 font-display text-3xl leading-tight text-pine group-hover:text-emerald">
                {lead.title}
              </h2>
              <p className="mt-3 text-[0.88rem] leading-relaxed text-body-soft">{lead.excerpt}</p>
              <span className="mt-5 inline-flex items-center gap-1.5 text-[0.78rem] font-semibold text-emerald">
                Read the article <ArrowUpRight className="h-3.5 w-3.5" />
              </span>
            </div>
          </Link>
        )}

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {rest.map((article) => (
            <Link key={article.id} href={`/articles/${article.slug}`} className="group">
              <div className="relative aspect-[16/11] overflow-hidden rounded-2xl">
                <Image
                  src={article.coverImage}
                  alt={article.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover transition duration-[1.2s] group-hover:scale-105"
                />
              </div>
              <p className="mt-4 text-[0.6rem] font-semibold uppercase tracking-[0.18em] text-emerald">
                {article.category} · {formatDate(article.publishedAt)}
              </p>
              <h2 className="mt-2 font-display text-xl leading-snug text-pine group-hover:text-emerald">
                {article.title}
              </h2>
              <p className="mt-2 line-clamp-3 text-[0.82rem] leading-relaxed text-body-soft">{article.excerpt}</p>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
