import { BadgeCheck, ExternalLink, Mail, Phone } from "lucide-react";
import { initials } from "@/lib/utils";

export type PersonCardData = {
  id: string;
  name: string | null;
  title: string;
  department: string | null;
  organization: string | null;
  bio: string | null;
  photoUrl: string | null;
  responsibilities: string[];
  skills?: string[];
  email: string | null;
  phone: string | null;
  website: string | null;
  verified: boolean;
  featured?: boolean;
};

export function PersonCard({ person }: { person: PersonCardData }) {
  const prominent = Boolean(person.featured);
  return (
    <article
      className={`group relative flex h-full flex-col overflow-hidden rounded-[1.5rem] border p-6 transition duration-500 hover:-translate-y-1 ${
        prominent
          ? "border-gold/45 bg-gradient-to-br from-[#0f3d2f] to-[#06231c] text-cream shadow-[0_30px_60px_-40px_rgba(6,35,28,0.9)]"
          : "border-pine/10 bg-white text-ink shadow-[0_18px_44px_-40px_rgba(6,35,28,0.6)]"
      }`}
    >
      <div className="flex items-start gap-4">
        {person.photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={person.photoUrl}
            alt={person.name ?? person.title}
            className="h-16 w-16 rounded-2xl object-cover"
          />
        ) : (
          <span
            className={`grid h-16 w-16 shrink-0 place-items-center rounded-2xl font-display text-xl ${
              prominent
                ? "bg-gold/20 text-gold-light ring-1 ring-gold/40"
                : "bg-pine/8 text-pine ring-1 ring-pine/10"
            }`}
            aria-hidden="true"
          >
            {initials(person.name ?? person.title)}
          </span>
        )}
        <div className="min-w-0">
          <h3 className={`font-display text-lg leading-tight ${prominent ? "text-cream" : "text-pine"}`}>
            {person.name ?? person.title}
          </h3>
          {person.name && (
            <p className={`mt-0.5 text-[0.78rem] font-medium ${prominent ? "text-gold-light" : "text-emerald"}`}>
              {person.title}
            </p>
          )}
          <p className={`mt-0.5 text-[0.72rem] ${prominent ? "text-cream/60" : "text-muted"}`}>
            {person.organization}
            {person.department && person.name ? ` · ${person.department}` : ""}
          </p>
        </div>
      </div>

      {person.bio && (
        <p className={`mt-4 text-[0.83rem] leading-relaxed ${prominent ? "text-cream/70" : "text-body-soft"}`}>
          {person.bio}
        </p>
      )}

      {person.responsibilities.length > 0 && (
        <ul className={`mt-4 space-y-1.5 text-[0.76rem] ${prominent ? "text-cream/65" : "text-body-soft"}`}>
          {person.responsibilities.slice(0, 5).map((item) => (
            <li key={item} className="flex gap-2">
              <span className={`mt-1.5 h-1 w-1 shrink-0 rounded-full ${prominent ? "bg-gold" : "bg-emerald"}`} />
              {item}
            </li>
          ))}
        </ul>
      )}

      {person.skills && person.skills.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-1.5">
          {person.skills.map((skill) => (
            <span
              key={skill}
              className={`rounded-full px-2.5 py-1 text-[0.65rem] font-medium ${
                prominent ? "bg-cream/10 text-cream/80" : "bg-pine/5 text-pine/75"
              }`}
            >
              {skill}
            </span>
          ))}
        </div>
      )}

      <div className="mt-auto flex flex-wrap items-center gap-3 pt-5 text-[0.7rem]">
        {person.verified && (
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2 py-1 ${
              prominent ? "bg-gold/15 text-gold-light" : "bg-emerald/8 text-emerald"
            }`}
          >
            <BadgeCheck className="h-3 w-3" /> Verified source
          </span>
        )}
        {person.email && (
          <a href={`mailto:${person.email}`} className="inline-flex items-center gap-1 opacity-80 hover:opacity-100">
            <Mail className="h-3 w-3" /> Email
          </a>
        )}
        {person.phone && (
          <a href={`tel:${person.phone.replace(/\s/g, "")}`} className="inline-flex items-center gap-1 opacity-80 hover:opacity-100">
            <Phone className="h-3 w-3" /> Call
          </a>
        )}
        {person.website && (
          <a
            href={person.website}
            target="_blank"
            rel="noreferrer noopener"
            className="inline-flex items-center gap-1 opacity-80 hover:opacity-100"
          >
            <ExternalLink className="h-3 w-3" /> Official page
          </a>
        )}
      </div>
    </article>
  );
}
