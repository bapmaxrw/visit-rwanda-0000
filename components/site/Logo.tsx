import Link from "next/link";
import { BrandMark } from "./BrandMark";

export function Logo({ light = false, compact = false }: { light?: boolean; compact?: boolean }) {
  return (
    <Link href="/" className="group flex items-center gap-2.5" aria-label="Visit Rwanda Academy home">
      <BrandMark className="h-10 w-10 shrink-0 drop-shadow-[0_6px_18px_rgba(11,61,46,0.45)] transition duration-500 group-hover:rotate-[18deg]" />
      <span className="leading-tight">
        <span
          className={`block font-display text-[1.05rem] font-semibold tracking-tight ${
            light ? "text-cream" : "text-pine"
          }`}
        >
          Visit Rwanda
        </span>
        <span
          className={`block text-[0.58rem] font-semibold uppercase tracking-[0.3em] ${
            light ? "text-gold-light/80" : "text-emerald/80"
          }`}
        >
          {compact ? "Academy" : "Academy · Tourism"}
        </span>
      </span>
    </Link>
  );
}
