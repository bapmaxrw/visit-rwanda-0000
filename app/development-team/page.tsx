import type { Metadata } from "next";
import Link from "next/link";
import { asc, eq } from "drizzle-orm";
import {
  ArrowRight,
  Code2,
  Database,
  GitBranch,
  Globe,
  Layers,
  ShieldCheck,
  Terminal,
} from "lucide-react";
import { getDb } from "@/lib/db";
import { personnel } from "@/lib/db/schema";
import { DEVELOPER_SOCIALS, existingPortrait, normalizeName } from "@/lib/developers";
import { DeveloperPortrait } from "@/components/site/DeveloperPortrait";
import { Reveal } from "@/components/site/Reveal";
import { SceneSetter } from "@/components/site/SceneSetter";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Development team",
  description:
    "Meet the developers behind Visit Rwanda Academy — architecture, frontend, backend integration and testing.",
};

const TECHNOLOGIES = [
  { name: "Next.js 15", detail: "App Router, server components and route handlers", icon: Layers },
  { name: "React 19", detail: "Interactive booking, dashboards and admin interfaces", icon: Code2 },
  { name: "TypeScript", detail: "End-to-end type safety across the application", icon: Terminal },
  { name: "Tailwind CSS 4", detail: "The design system, responsive layouts and motion", icon: Globe },
  { name: "PostgreSQL", detail: "Users, sessions, destinations, prices, bookings and content", icon: Database },
  { name: "Drizzle ORM", detail: "Typed schema, migrations and queries", icon: ShieldCheck },
  { name: "Node.js", detail: "Server runtime with scrypt password hashing", icon: Terminal },
  { name: "GitHub", detail: "Source control and collaboration", icon: GitBranch },
];

export default async function DevelopmentTeamPage() {
  const db = await getDb();
  const team = await db
    .select()
    .from(personnel)
    .where(eq(personnel.kind, "developer"))
    .orderBy(asc(personnel.sortOrder));

  const senior = team.find((member) => member.featured) ?? team[0];
  const others = team.filter((member) => member.id !== senior?.id);

  return (
    <>
      <section className="relative flex min-h-[88svh] items-end overflow-hidden pb-24 pt-36">
        <SceneSetter scene="developers" title="Software, data and digital innovation" />
        <div
          className="absolute inset-0 bg-gradient-to-t from-forest via-forest/60 to-forest/25"
          aria-hidden="true"
        />
        <div className="container-x relative z-10">
          <Reveal>
            <p className="text-[0.66rem] font-semibold uppercase tracking-[0.34em] text-gold-light">
              Software development · Kigali
            </p>
            <h1 className="mt-5 max-w-5xl font-display text-[2.3rem] uppercase leading-[1.04] text-cream sm:text-5xl lg:text-[4rem]">
              Meet the developers behind Visit Rwanda Academy
            </h1>
            <p className="mt-6 max-w-2xl text-[1rem] leading-relaxed text-cream/75">
              The innovative minds building a digital gateway to Rwanda&rsquo;s tourism, culture, and
              unforgettable experiences.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <a href="#team" className="btn btn-gold">
                Meet the team <ArrowRight className="h-4 w-4" />
              </a>
              <Link href="/destinations" className="btn btn-outline">
                Explore the platform
              </Link>
            </div>
            <dl className="mt-14 flex flex-wrap gap-x-12 gap-y-5 border-t border-white/15 pt-6 text-cream/70">
              {[
                ["3", "Developers"],
                ["6", "Cinematic scenes"],
                ["1", "National tourism platform"],
              ].map(([value, label]) => (
                <div key={label}>
                  <dt className="font-display text-2xl text-gold-light">{value}</dt>
                  <dd className="text-[0.66rem] uppercase tracking-[0.18em]">{label}</dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>
      </section>

      <section id="team" className="relative scroll-mt-20 py-20">
        <div className="container-x">
          <Reveal>
            <div className="max-w-2xl">
              <p className="eyebrow text-gold-light">The team</p>
              <h2 className="mt-3 font-display text-3xl leading-tight text-cream sm:text-4xl">
                Three developers, one national brief
              </h2>
              <p className="mt-4 text-[0.92rem] leading-relaxed text-cream/70">
                A compact software team owns this platform end to end: architecture and technical
                leadership, interface development, database integration, testing and maintenance.
                Portraits are published only from the photographs supplied by each developer.
              </p>
            </div>
          </Reveal>

          {senior && (
            <Reveal className="mt-10">
              <article className="group relative overflow-hidden rounded-[1.9rem] border border-gold/35 bg-forest/70 shadow-[0_40px_120px_-60px_rgba(0,0,0,0.9)] backdrop-blur-md">
                <span className="pointer-events-none absolute inset-0 rounded-[1.9rem] ring-1 ring-inset ring-white/5" aria-hidden="true" />
                <div className="grid gap-0 md:grid-cols-[300px_1fr] lg:grid-cols-[360px_1fr]">
                  <div className="relative">
                    <DeveloperPortrait
                      name={senior.name ?? "Senior developer"}
                      photo={existingPortrait(senior.name, senior.photoUrl)}
                      className="aspect-[4/5] w-full md:h-full"
                      sizes="(max-width: 768px) 100vw, 360px"
                    />
                    <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-forest/90 to-transparent md:hidden" aria-hidden="true" />
                    <span className="absolute left-4 top-4 rounded-full bg-gold px-3 py-1 text-[0.6rem] font-bold uppercase tracking-[0.16em] text-forest shadow-lg">
                      Team lead
                    </span>
                  </div>

                  <div className="p-6 sm:p-8 lg:p-10">
                    <p className="text-[0.6rem] font-semibold uppercase tracking-[0.24em] text-gold-light/80">
                      {senior.department}
                    </p>
                    <h3 className="mt-2 font-display text-3xl leading-tight text-cream sm:text-4xl">
                      {senior.name}
                    </h3>
                    <p className="mt-1 text-[0.85rem] font-medium text-gold-light">{senior.title}</p>
                    <p className="mt-4 max-w-2xl text-[0.9rem] leading-relaxed text-cream/75">
                      {senior.bio}
                    </p>

                    <div className="mt-7 grid gap-7 sm:grid-cols-2">
                      <div>
                        <p className="text-[0.6rem] uppercase tracking-[0.2em] text-cream/45">
                          Responsibilities
                        </p>
                        <ul className="mt-3 space-y-2 text-[0.82rem] text-cream/75">
                          {senior.responsibilities.map((item) => (
                            <li key={item} className="flex gap-2.5">
                              <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-gold" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <p className="text-[0.6rem] uppercase tracking-[0.2em] text-cream/45">
                          Technical skills
                        </p>
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {senior.skills.map((skill) => (
                            <span
                              key={skill}
                              className="rounded-full border border-cream/12 bg-white/[0.06] px-2.5 py-1 text-[0.66rem] text-cream/80"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                        {(DEVELOPER_SOCIALS[normalizeName(senior.name)] ?? []).length > 0 && (
                          <div className="mt-4 flex flex-wrap gap-3">
                            {DEVELOPER_SOCIALS[normalizeName(senior.name)].map((social) => (
                              <a
                                key={social.href}
                                href={social.href}
                                className="text-[0.7rem] font-semibold text-gold-light underline underline-offset-4"
                              >
                                {social.label}
                              </a>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            </Reveal>
          )}

          <div className="mt-6 grid gap-6 md:grid-cols-2">
            {others.map((developer, index) => (
              <Reveal key={developer.id} delay={index * 110}>
                <article className="group flex h-full flex-col overflow-hidden rounded-[1.6rem] border border-cream/15 bg-forest/60 backdrop-blur-md transition duration-500 hover:border-gold/45 hover:bg-forest/75">
                  <DeveloperPortrait
                    name={developer.name ?? "Developer"}
                    photo={existingPortrait(developer.name, developer.photoUrl)}
                    className="aspect-[16/11] w-full transition duration-700 group-hover:scale-[1.02]"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                  <div className="flex flex-1 flex-col p-6 sm:p-7">
                    <p className="text-[0.58rem] font-semibold uppercase tracking-[0.22em] text-gold-light/75">
                      {developer.department}
                    </p>
                    <h3 className="mt-2 font-display text-2xl text-cream">{developer.name}</h3>
                    <p className="mt-0.5 text-[0.8rem] font-medium text-gold-light">{developer.title}</p>
                    <p className="mt-3 text-[0.82rem] leading-relaxed text-cream/70">{developer.bio}</p>

                    <p className="mt-5 text-[0.58rem] uppercase tracking-[0.2em] text-cream/40">
                      Responsibilities
                    </p>
                    <ul className="mt-2 grid gap-1.5 text-[0.78rem] text-cream/70">
                      {developer.responsibilities.map((item) => (
                        <li key={item} className="flex gap-2">
                          <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-emerald" />
                          {item}
                        </li>
                      ))}
                    </ul>

                    <div className="mt-auto flex flex-wrap gap-1.5 pt-5">
                      {developer.skills.map((skill) => (
                        <span
                          key={skill}
                          className="rounded-full border border-cream/10 bg-white/[0.05] px-2.5 py-1 text-[0.63rem] text-cream/75"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>

          <Reveal className="mt-8">
            <p className="flex items-center gap-2 text-[0.68rem] text-cream/45">
              <ShieldCheck className="h-3.5 w-3.5 text-gold-light" />
              Names, positions and responsibilities are published as supplied by the project owner.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="relative z-10 bg-cream py-20">
        <div className="container-x">
          <p className="eyebrow">Built with</p>
          <h2 className="mt-2 font-display text-3xl text-pine">Technologies actually used in the project</h2>
          <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {TECHNOLOGIES.map(({ name, detail, icon: Icon }) => (
              <div key={name} className="rounded-2xl border border-pine/10 bg-white p-5">
                <Icon className="h-5 w-5 text-emerald" />
                <p className="mt-3 text-sm font-semibold text-pine">{name}</p>
                <p className="mt-1 text-[0.74rem] leading-relaxed text-muted">{detail}</p>
              </div>
            ))}
          </div>

          <div className="mt-10 grid gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border border-pine/10 bg-white p-6">
              <p className="flex items-center gap-2 text-sm font-semibold text-pine">
                <ShieldCheck className="h-4 w-4 text-emerald" /> Engineering priorities
              </p>
              <ul className="mt-3 space-y-2 text-[0.83rem] leading-relaxed text-body-soft">
                <li>Server-authoritative pricing — totals are recomputed in the API, never trusted from the browser.</li>
                <li>scrypt password hashing, HttpOnly session cookies and database-backed session revocation.</li>
                <li>Role-based access control for every administrator endpoint.</li>
                <li>Source and verification dates stored alongside every official price.</li>
                <li>One persistent background film per visit, cross-faded between scenes and paused off-screen.</li>
              </ul>
            </div>
            <div className="rounded-2xl bg-pine p-6 text-cream">
              <p className="text-sm font-semibold text-gold-light">Collaboration</p>
              <p className="mt-2 text-[0.84rem] leading-relaxed text-cream/70">
                For technical collaboration, corrections to destination information or verified tourism data,
                contact the Visit Rwanda Academy team through the platform administrators.
              </p>
              <Link href="/about" className="btn btn-gold mt-5">
                About the platform <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
