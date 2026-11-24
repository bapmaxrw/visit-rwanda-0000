import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, MapPin } from "lucide-react";

export type DestinationCardData = {
  slug: string;
  name: string;
  tagline: string | null;
  category: string;
  location: string | null;
  cardImage: string | null;
  heroImage: string;
  province: string | null;
  district: string | null;
  verifiedPrice?: string | null;
};

export function DestinationCard({ destination, priority = false }: { destination: DestinationCardData; priority?: boolean }) {
  return (
    <Link
      href={`/destinations/${destination.slug}`}
      className="group relative flex h-full flex-col overflow-hidden rounded-[1.6rem] border border-pine/10 bg-white shadow-[0_20px_50px_-40px_rgba(6,35,28,0.6)] transition duration-500 hover:-translate-y-1.5 hover:shadow-[0_32px_70px_-40px_rgba(6,35,28,0.55)]"
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <Image
          src={destination.cardImage || destination.heroImage}
          alt={destination.name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          priority={priority}
          className="object-cover transition duration-[1.2s] group-hover:scale-[1.07]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-forest/70 via-transparent to-transparent opacity-80" />
        <span className="absolute left-4 top-4 rounded-full bg-cream/90 px-3 py-1 text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-pine backdrop-blur">
          {destination.category}
        </span>
        <div className="absolute inset-x-4 bottom-4 flex items-end justify-between gap-2">
          <div>
            <h3 className="font-display text-xl leading-tight text-white">{destination.name}</h3>
            <p className="mt-1 flex items-center gap-1 text-[0.72rem] text-white/75">
              <MapPin className="h-3 w-3" /> {destination.district ?? destination.location}
            </p>
          </div>
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gold text-forest transition group-hover:rotate-45">
            <ArrowUpRight className="h-4 w-4" />
          </span>
        </div>
      </div>
      <div className="flex flex-1 flex-col justify-between gap-3 p-5">
        <p className="line-clamp-2 text-[0.85rem] leading-relaxed text-body-soft">
          {destination.tagline}
        </p>
        <div className="flex items-center justify-between border-t border-pine/8 pt-3">
          <span className="text-[0.68rem] uppercase tracking-[0.12em] text-faint">
            {destination.province}
          </span>
          <span className="text-[0.7rem] font-semibold text-emerald">
            {destination.verifiedPrice ?? "View destination →"}
          </span>
        </div>
      </div>
    </Link>
  );
}
