import Link from "next/link";
import { Logo } from "./Logo";

const columns = [
  {
    title: "Explore",
    links: [
      ["Destinations", "/destinations"],
      ["National park teams", "/national-parks"],
      ["Culture & heritage", "/culture"],
      ["Tourism services", "/services"],
    ],
  },
  {
    title: "Plan",
    links: [
      ["Book a visit", "/booking"],
      ["Representatives", "/representatives"],
      ["Gallery", "/gallery"],
      ["Articles", "/articles"],
    ],
  },
  {
    title: "About",
    links: [
      ["Our story", "/about"],
      ["Development team", "/development-team"],
      ["Contact us", "/contact"],
      ["Create an account", "/register"],
      ["Sign in", "/login"],
    ],
  },
];

export function Footer() {
  return (
    <footer className="relative z-10 overflow-hidden bg-forest text-cream">
      <div className="pointer-events-none absolute -left-24 top-0 h-72 w-72 rounded-full bg-emerald/20 blur-3xl" />
      <div className="container-x relative py-16">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_2fr]">
          <div>
            <Logo light />
            <p className="mt-6 max-w-sm text-sm leading-relaxed text-cream/65">
              A digital gateway to Rwanda’s national parks, cultural heritage and the people who
              protect and share them. Built and maintained by the Visit Rwanda Academy team.
            </p>
            <div className="mt-6 space-y-1 text-sm text-cream/60">
              <p>Tourism enquiries · Rwanda Development Board</p>
              <p>
                <a className="hover:text-gold-light" href="mailto:info@rdb.rw">
                  info@rdb.rw
                </a>{" "}
                ·{" "}
                <a className="hover:text-gold-light" href="tel:+250727775170">
                  +250 727 775 170
                </a>
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            {columns.map((column) => (
              <div key={column.title}>
                <p className="text-[0.65rem] font-semibold uppercase tracking-[0.24em] text-gold-light/80">
                  {column.title}
                </p>
                <ul className="mt-4 space-y-2.5 text-sm text-cream/70">
                  {column.links.map(([label, href]) => (
                    <li key={href}>
                      <Link href={href} className="transition hover:text-gold-light">
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-4 border-t border-cream/10 pt-7 text-xs text-cream/45 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Visit Rwanda Academy. All rights reserved.</p>
          <p className="max-w-xl">
            Official prices are shown only where they carry a published source and verification date.
            Photography: Wikimedia Commons contributors. Prices and opening information should be
            reconfirmed with the destination before travel.
          </p>
        </div>
      </div>
    </footer>
  );
}
