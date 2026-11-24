import Link from "next/link";
import { ArrowRight } from "lucide-react";

/**
 * Home hero copy. The film itself lives in the persistent CinematicLayer so it
 * keeps playing while the visitor scrolls instead of restarting per section.
 */
export function HeroVideo({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <section className="relative flex min-h-[100svh] items-center overflow-hidden">
      <div
        className="absolute inset-0 bg-gradient-to-b from-forest/45 via-forest/10 to-forest/95"
        aria-hidden="true"
      />

      <div className="container-x relative z-10 pb-24 pt-32">
        <p className="animate-fade-up text-[0.68rem] font-semibold uppercase tracking-[0.38em] text-gold-light">
          The land of a thousand hills
        </p>
        <h1
          className="mt-5 max-w-4xl animate-fade-up font-display text-[2.9rem] leading-[1.02] text-white sm:text-6xl lg:text-[5.2rem]"
          style={{ animationDelay: "120ms" }}
        >
          {title}
        </h1>
        <p
          className="mt-6 max-w-xl animate-fade-up text-[1rem] leading-relaxed text-cream/80 sm:text-lg"
          style={{ animationDelay: "240ms" }}
        >
          {subtitle}
        </p>

        <div
          className="mt-9 flex animate-fade-up flex-wrap items-center gap-3"
          style={{ animationDelay: "360ms" }}
        >
          <Link href="/booking" className="btn btn-gold !px-7 !py-3.5 text-sm">
            Explore Rwanda <ArrowRight className="h-4 w-4" />
          </Link>
          <Link href="/destinations" className="btn btn-outline !px-6 !py-3.5 text-sm">
            All destinations
          </Link>
        </div>

        <div
          className="mt-14 flex animate-fade-up flex-wrap gap-x-10 gap-y-5 border-t border-white/15 pt-6 text-cream/70"
          style={{ animationDelay: "480ms" }}
        >
          {[
            ["4", "National parks"],
            ["700+", "Bird species"],
            ["11", "Curated destinations"],
            ["1 hr", "With a gorilla family"],
          ].map(([value, label]) => (
            <div key={label}>
              <p className="font-display text-2xl text-gold-light">{value}</p>
              <p className="text-[0.68rem] uppercase tracking-[0.18em]">{label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-forest/80 to-transparent" aria-hidden="true" />
    </section>
  );
}
