import Link from "next/link";
import { Compass } from "lucide-react";

export default function NotFound() {
  return (
    <section className="grid min-h-[80vh] place-items-center bg-forest px-5 pt-24 text-center text-cream">
      <div>
        <span className="mx-auto grid h-16 w-16 place-items-center rounded-full border border-gold/30 bg-gold/10 text-gold-light">
          <Compass className="h-7 w-7" />
        </span>
        <p className="mt-6 text-[0.68rem] font-semibold uppercase tracking-[0.3em] text-gold-light">404</p>
        <h1 className="mt-3 font-display text-4xl sm:text-5xl">This path leads off the map</h1>
        <p className="mx-auto mt-3 max-w-md text-[0.9rem] text-cream/65">
          The page you were looking for does not exist. Let us take you back to the destinations.
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Link href="/" className="btn btn-gold">
            Return home
          </Link>
          <Link href="/destinations" className="btn btn-outline">
            Explore destinations
          </Link>
        </div>
      </div>
    </section>
  );
}
