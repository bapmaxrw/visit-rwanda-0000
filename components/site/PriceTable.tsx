import { ExternalLink, ShieldCheck, ShieldAlert } from "lucide-react";
import { formatDate, formatMoney } from "@/lib/pricing";
import type { DestinationPrice } from "@/lib/db/schema";

const CATEGORY_NAMES: Record<string, string> = {
  international: "International visitor",
  resident: "Foreign resident in Rwanda",
  african: "African citizen",
  east_african: "East African citizen",
  citizen: "Rwandan citizen",
};

export function PriceTable({ prices }: { prices: DestinationPrice[] }) {
  const verified = prices.filter((p) => p.verified && p.sourceUrl && p.verifiedAt);

  if (!verified.length) {
    return (
      <div className="flex items-start gap-3 rounded-2xl border border-[#c9a44c]/35 bg-[#c9a44c]/8 p-5">
        <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-[#9a7726]" />
        <div>
          <p className="text-sm font-semibold text-[#6d5316]">
            Price not officially verified — contact the destination for current pricing.
          </p>
          <p className="mt-1.5 text-[0.8rem] leading-relaxed text-gold-ink">
            We only publish fees that come from an official tourism source with a verification date.
            This destination has no such published rate on this platform yet, so no figure is shown.
          </p>
        </div>
      </div>
    );
  }

  const grouped = new Map<string, DestinationPrice[]>();
  verified.forEach((price) => {
    const key = price.activity ?? price.label;
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key)!.push(price);
  });

  return (
    <div className="overflow-hidden rounded-2xl border border-pine/12 bg-white">
      {[...grouped.entries()].map(([activity, rows], groupIndex) => (
        <div key={activity} className={groupIndex > 0 ? "border-t border-pine/10" : ""}>
          <div className="flex flex-wrap items-center justify-between gap-2 bg-pine/[0.04] px-5 py-3">
            <p className="font-medium text-pine">{activity}</p>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald/10 px-2.5 py-1 text-[0.62rem] font-semibold uppercase tracking-[0.1em] text-emerald">
              <ShieldCheck className="h-3 w-3" /> Officially verified
            </span>
          </div>
          <div className="divide-y divide-pine/8">
            {rows.map((row) => (
              <div key={row.id} className="grid gap-2 px-5 py-3.5 sm:grid-cols-[1.4fr_1fr_auto] sm:items-center">
                <div>
                  <p className="text-sm font-medium text-ink">{CATEGORY_NAMES[row.visitorCategory] ?? row.visitorCategory}</p>
                  <p className="text-[0.7rem] text-label">{row.unit ?? row.label}</p>
                </div>
                <div className="text-sm text-body">
                  {formatMoney(row.adultAmount, row.currency)}
                  <span className="text-[0.7rem] text-faint"> adult</span>
                  {row.childAmount != null && (
                    <span className="ml-3">
                      {formatMoney(row.childAmount, row.currency)}
                      <span className="text-[0.7rem] text-faint"> child</span>
                    </span>
                  )}
                </div>
                <div className="text-[0.68rem] text-label sm:text-right">
                  {row.sourceUrl ? (
                    <a
                      href={row.sourceUrl}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="inline-flex items-center gap-1 font-medium text-emerald hover:underline"
                    >
                      Source <ExternalLink className="h-3 w-3" />
                    </a>
                  ) : (
                    "Source unavailable"
                  )}
                  <p className="mt-0.5">Verified {formatDate(row.verifiedAt)}</p>
                </div>
              </div>
            ))}
          </div>
          {rows[0]?.notes && (
            <p className="border-t border-pine/8 bg-sand/40 px-5 py-2.5 text-[0.7rem] leading-relaxed text-muted">
              {rows[0].notes}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
