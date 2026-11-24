"use client";

import Link from "next/link";
import Image from "next/image";
import { useMemo, useState } from "react";
import {
  ArrowRight,
  BadgeCheck,
  CalendarDays,
  CheckCircle2,
  Clock3,
  ExternalLink,
  Globe,
  Loader2,
  Mail,
  MapPin,
  Minus,
  Phone,
  Plus,
  ShieldAlert,
  Users,
  X,
} from "lucide-react";

export type PublicPrice = {
  id: string;
  label: string;
  activity: string | null;
  visitorCategory: string;
  adultAmount: number | null;
  childAmount: number | null;
  currency: string;
  unit: string | null;
  sourceName: string | null;
  sourceUrl: string | null;
  verifiedAt: string | null;
  verified: boolean;
  notes: string | null;
};

export type PublicDestination = {
  id: string;
  slug: string;
  name: string;
  tagline: string | null;
  category: string;
  province: string | null;
  district: string | null;
  location: string | null;
  description: string;
  longDescription: string | null;
  activities: string[];
  services: string[];
  gallery: string[];
  heroImage: string;
  cardImage: string | null;
  openingHours: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  website: string | null;
  bookingRequirements: string | null;
  importantInfo: string | null;
  prices: PublicPrice[];
};

type BookingUser = {
  fullName: string;
  email: string;
  phone: string;
  nationality: string | null;
} | null;

const CATEGORIES = [
  { value: "international", label: "International visitor (non-resident)" },
  { value: "resident", label: "Foreign resident in Rwanda" },
  { value: "african", label: "African citizen (non-East African)" },
  { value: "east_african", label: "East African citizen" },
  { value: "citizen", label: "Rwandan citizen" },
];

const EXPERIENCE_CATEGORIES = [
  "Wildlife and Safari",
  "National Parks",
  "Cultural Tourism",
  "Adventure",
  "Historical Sites",
  "Lakes and Beaches",
  "Nature and Hiking",
];

const CATEGORY_NAMES = Object.fromEntries(CATEGORIES.map((c) => [c.value, c.label]));

function money(amount: number | null, currency: string) {
  if (amount == null) return "—";
  if (currency === "RWF") return `RWF ${new Intl.NumberFormat("en-US").format(amount)}`;
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${currency} ${amount}`;
  }
}

function prettyDate(value: string) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00`));
}

const tomorrow = () => {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  return date.toISOString().slice(0, 10);
};

export function BookingExperience({
  destinations,
  user,
  initialSlug,
  initialBook,
}: {
  destinations: PublicDestination[];
  user: BookingUser;
  initialSlug?: string;
  initialBook?: boolean;
}) {
  const initial = destinations.find((d) => d.slug === initialSlug) ?? destinations[0] ?? null;
  const [experience, setExperience] = useState<string>("");
  const [destinationId, setDestinationId] = useState<string>(initial?.id ?? "");
  const [visitDate, setVisitDate] = useState<string>("");
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [visitorCategory, setVisitorCategory] = useState("international");
  const [activity, setActivity] = useState<string>(initial?.prices.find((p) => p.activity)?.activity ?? "");
  const [requests, setRequests] = useState("");
  const [bookingOpen, setBookingOpen] = useState(Boolean(initialBook && initialSlug && user));
  const [authPrompt, setAuthPrompt] = useState(Boolean(initialBook && initialSlug && !user));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [confirmation, setConfirmation] = useState<{
    reference: string;
    destination: string;
    visitDate: string;
    status: string;
    total: number | null;
    currency: string;
    verified: boolean;
  } | null>(null);

  const destination = destinations.find((d) => d.id === destinationId) ?? null;
  const pool = useMemo(() => {
    if (!experience) return destinations;
    const filtered = destinations.filter((d) => d.category === experience);
    return filtered.length ? filtered : destinations;
  }, [destinations, experience]);

  const activities = useMemo(() => {
    if (!destination) return [];
    const priced = new Set(
      destination.prices.filter((p) => p.verified && p.activity).map((p) => p.activity as string)
    );
    return [...new Set([...priced, ...destination.activities])];
  }, [destination]);

  const quote = useMemo(() => {
    if (!destination) return null;
    const usable = destination.prices.filter(
      (p) => p.verified && p.sourceUrl && p.verifiedAt && p.visitorCategory === visitorCategory
    );
    const match =
      (activity ? usable.find((p) => p.activity === activity) : null) ??
      usable.find((p) => !activity || p.activity === null) ??
      usable[0] ??
      null;
    if (!match || match.adultAmount == null) {
      return { verified: false as const, total: null, match: null, childPublished: false };
    }
    const childPublished = match.childAmount != null;
    return {
      verified: true as const,
      total: match.adultAmount * adults + (childPublished ? match.childAmount! * children : 0),
      match,
      childPublished,
    };
  }, [destination, visitorCategory, activity, adults, children]);

  const selectDestination = (id: string) => {
    setDestinationId(id);
    setBookingOpen(false);
    setError(null);
    const next = destinations.find((d) => d.id === id);
    setActivity(next?.prices.find((p) => p.verified && p.activity)?.activity ?? "");
    window.setTimeout(() => {
      document.getElementById("destination-panel")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 40);
  };

  const bookDestination = () => {
    if (!destination) return;
    if (!user) {
      setAuthPrompt(true);
      return;
    }
    setBookingOpen(true);
    window.setTimeout(() => {
      document.getElementById("booking-form")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 40);
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setErrors({});
    if (!destination) return;

    if (!visitDate) {
      setErrors({ visitDate: "Select your preferred visiting date." });
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          destinationId: destination.id,
          activity,
          visitDate,
          adults,
          children,
          visitorCategory,
          specialRequests: requests,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        setErrors(data.errors ?? {});
        setError(data.error ?? "We could not submit your request.");
        return;
      }
      setConfirmation({
        reference: data.booking.reference,
        destination: data.booking.destination,
        visitDate: data.booking.visitDate,
        status: data.booking.status,
        total: data.booking.total,
        currency: data.booking.currency ?? "USD",
        verified: data.booking.verified,
      });
      setBookingOpen(false);
      window.setTimeout(() => {
        document.getElementById("booking-confirmation")?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 60);
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const redirect = destination ? `/booking?destination=${destination.slug}&book=1` : "/booking";

  return (
    <div className="relative -mt-20 pb-24">
      <div className="container-x">
        {/* Search card */}
        <form
          onSubmit={(event) => {
            event.preventDefault();
            if (destinationId) selectDestination(destinationId);
            else if (pool[0]) selectDestination(pool[0].id);
          }}
          className="relative z-20 rounded-[1.8rem] border border-white/60 bg-white p-5 shadow-[0_40px_90px_-50px_rgba(6,35,28,0.65)] sm:p-7"
        >
          <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr_1fr_1fr_auto] lg:items-end">
            <div>
              <label className="field-label" htmlFor="destination">
                Destination
              </label>
              <select
                id="destination"
                className="input"
                value={destinationId}
                onChange={(event) => {
                  setDestinationId(event.target.value);
                  const next = destinations.find((d) => d.id === event.target.value);
                  setActivity(next?.prices.find((p) => p.verified && p.activity)?.activity ?? "");
                }}
              >
                <option value="">Select a destination</option>
                {pool.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name} — {item.district ?? item.province}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="field-label" htmlFor="visit">
                Visit date
              </label>
              <input
                id="visit"
                type="date"
                min={tomorrow()}
                value={visitDate}
                onChange={(event) => setVisitDate(event.target.value)}
                className="input"
              />
            </div>

            <div>
              <span className="field-label">Visitors</span>
              <div className="flex items-center gap-1.5">
                <div className="flex flex-1 items-center justify-between rounded-xl border border-pine/15 bg-white px-2 py-1.5">
                  <span className="pl-1 text-[0.7rem] text-label">Adults</span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      aria-label="Fewer adults"
                      onClick={() => setAdults((value) => Math.max(1, value - 1))}
                      className="grid h-6 w-6 place-items-center rounded-full bg-pine/5 text-pine hover:bg-pine/10"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="w-5 text-center text-sm font-semibold">{adults}</span>
                    <button
                      type="button"
                      aria-label="More adults"
                      onClick={() => setAdults((value) => Math.min(60, value + 1))}
                      className="grid h-6 w-6 place-items-center rounded-full bg-pine/5 text-pine hover:bg-pine/10"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>
                </div>
                <div className="flex flex-1 items-center justify-between rounded-xl border border-pine/15 bg-white px-2 py-1.5">
                  <span className="pl-1 text-[0.7rem] text-label">Children</span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      aria-label="Fewer children"
                      onClick={() => setChildren((value) => Math.max(0, value - 1))}
                      className="grid h-6 w-6 place-items-center rounded-full bg-pine/5 text-pine hover:bg-pine/10"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="w-5 text-center text-sm font-semibold">{children}</span>
                    <button
                      type="button"
                      aria-label="More children"
                      onClick={() => setChildren((value) => Math.min(40, value + 1))}
                      className="grid h-6 w-6 place-items-center rounded-full bg-pine/5 text-pine hover:bg-pine/10"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label className="field-label" htmlFor="experience">
                Experience category
              </label>
              <select
                id="experience"
                className="input"
                value={experience}
                onChange={(event) => {
                  setExperience(event.target.value);
                  setDestinationId("");
                }}
              >
                <option value="">All experiences</option>
                {EXPERIENCE_CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <button type="submit" className="btn btn-gold h-[46px] whitespace-nowrap !px-6">
              Search destinations
            </button>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-pine/8 pt-3 text-[0.7rem] text-label">
            <p className="inline-flex items-center gap-1.5">
              <BadgeCheck className="h-3.5 w-3.5 text-emerald" />
              Only officially sourced prices are shown · server re-checks every total
            </p>
            <p>
              {adults + children} visitor{adults + children === 1 ? "" : "s"} selected
            </p>
          </div>
        </form>

        {/* Destination panel */}
        {destination && (
          <div id="destination-panel" className="mt-10 scroll-mt-28">
            <div className="grid gap-8 lg:grid-cols-[1.35fr_1fr]">
              <div>
                <div className="relative aspect-[16/10] overflow-hidden rounded-[1.6rem]">
                  <Image
                    src={destination.heroImage}
                    alt={destination.name}
                    fill
                    sizes="(max-width: 1024px) 100vw, 60vw"
                    priority
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-forest/75 via-transparent to-transparent" />
                  <div className="absolute inset-x-5 bottom-5">
                    <span className="rounded-full bg-cream/90 px-3 py-1 text-[0.6rem] font-semibold uppercase tracking-[0.16em] text-pine">
                      {destination.category}
                    </span>
                    <h2 className="mt-2 font-display text-3xl text-white sm:text-4xl">{destination.name}</h2>
                    <p className="mt-1 flex items-center gap-1.5 text-xs text-white/80">
                      <MapPin className="h-3.5 w-3.5" /> {destination.location}
                    </p>
                  </div>
                </div>

                {destination.gallery.length > 1 && (
                  <div className="mt-3 grid grid-cols-4 gap-2">
                    {destination.gallery.slice(0, 4).map((image, index) => (
                      <div key={`${image}-${index}`} className="relative aspect-[4/3] overflow-hidden rounded-xl">
                        <Image src={image} alt="" fill sizes="20vw" className="object-cover" />
                      </div>
                    ))}
                  </div>
                )}

                <div className="mt-6 space-y-5 text-[0.9rem] leading-relaxed text-body">
                  <p>{destination.longDescription ?? destination.description}</p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {destination.openingHours && (
                      <div className="rounded-xl border border-pine/10 bg-white p-4 text-[0.8rem]">
                        <p className="mb-1 flex items-center gap-1.5 font-semibold text-pine">
                          <Clock3 className="h-3.5 w-3.5" /> Opening information
                        </p>
                        <p className="text-body-soft">{destination.openingHours}</p>
                      </div>
                    )}
                    {(destination.contactEmail || destination.contactPhone || destination.website) && (
                      <div className="rounded-xl border border-pine/10 bg-white p-4 text-[0.8rem]">
                        <p className="mb-1 font-semibold text-pine">Official contact</p>
                        <div className="space-y-1 text-body-soft">
                          {destination.contactEmail && (
                            <a className="flex items-center gap-1.5 hover:text-emerald" href={`mailto:${destination.contactEmail}`}>
                              <Mail className="h-3 w-3" /> {destination.contactEmail}
                            </a>
                          )}
                          {destination.contactPhone && (
                            <a className="flex items-center gap-1.5 hover:text-emerald" href={`tel:${destination.contactPhone.replace(/\s/g, "")}`}>
                              <Phone className="h-3 w-3" /> {destination.contactPhone}
                            </a>
                          )}
                          {destination.website && (
                            <a
                              className="flex items-center gap-1.5 hover:text-emerald"
                              href={destination.website}
                              target="_blank"
                              rel="noreferrer noopener"
                            >
                              <Globe className="h-3 w-3" /> Official website
                            </a>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {destination.activities.length > 0 && (
                    <div>
                      <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-emerald">Available activities</p>
                      <div className="flex flex-wrap gap-2">
                        {destination.activities.map((item) => (
                          <span key={item} className="rounded-full bg-pine/5 px-3 py-1.5 text-[0.75rem] text-pine">
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {destination.importantInfo && (
                    <div className="rounded-xl border border-gold/30 bg-gold/5 p-4 text-[0.8rem] text-[#6d5316]">
                      <p className="mb-1 font-semibold">Important visitor information</p>
                      {destination.importantInfo}
                    </div>
                  )}
                </div>
              </div>

              {/* Pricing + booking rail */}
              <div className="lg:sticky lg:top-28 lg:self-start">
                <div className="rounded-[1.6rem] border border-pine/10 bg-white p-6 shadow-[0_24px_60px_-45px_rgba(6,35,28,0.55)]">
                  <p className="eyebrow">Official pricing</p>
                  <h3 className="mt-2 font-display text-2xl text-pine">Plan the numbers</h3>

                  <div className="mt-4 space-y-3">
                    <div>
                      <label className="field-label" htmlFor="activity">
                        Activity
                      </label>
                      <select id="activity" className="input" value={activity} onChange={(e) => setActivity(e.target.value)}>
                        <option value="">General visit</option>
                        {activities.map((item) => (
                          <option key={item} value={item}>
                            {item}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="field-label" htmlFor="category">
                        Visitor nationality / residency
                      </label>
                      <select
                        id="category"
                        className="input"
                        value={visitorCategory}
                        onChange={(e) => setVisitorCategory(e.target.value)}
                      >
                        {CATEGORIES.map((category) => (
                          <option key={category.value} value={category.value}>
                            {category.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {quote?.verified && quote.match ? (
                    <div className="mt-5 rounded-xl bg-pine/[0.04] p-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-body-soft">
                          {quote.match.label} · {CATEGORY_NAMES[visitorCategory]}
                        </span>
                      </div>
                      <div className="mt-2 flex items-baseline justify-between">
                        <span className="text-[0.75rem] text-label">
                          {money(quote.match.adultAmount, quote.match.currency)} × {adults} adult{adults === 1 ? "" : "s"}
                          {children > 0 && quote.childPublished
                            ? ` + ${money(quote.match.childAmount, quote.match.currency)} × ${children}`
                            : ""}
                        </span>
                        <span className="font-display text-2xl text-pine">{money(quote.total, quote.match.currency)}</span>
                      </div>
                      {children > 0 && !quote.childPublished && (
                        <p className="mt-2 text-[0.68rem] leading-relaxed text-[#9a7726]">
                          No official child rate is published for this category — children are quoted on
                          request and are not included in this estimate.
                        </p>
                      )}
                      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-pine/10 pt-2 text-[0.65rem] text-label">
                        <span className="inline-flex items-center gap-1 text-emerald">
                          <BadgeCheck className="h-3 w-3" /> Officially verified
                        </span>
                        {quote.match.sourceUrl && (
                          <a
                            href={quote.match.sourceUrl}
                            target="_blank"
                            rel="noreferrer noopener"
                            className="inline-flex items-center gap-1 text-emerald hover:underline"
                          >
                            Source <ExternalLink className="h-2.5 w-2.5" />
                          </a>
                        )}
                        <span>Verified {quote.match.verifiedAt}</span>
                      </div>
                      {quote.match.notes && (
                        <p className="mt-2 text-[0.65rem] leading-relaxed text-faint">{quote.match.notes}</p>
                      )}
                    </div>
                  ) : (
                    <div className="mt-5 flex gap-2 rounded-xl border border-gold/35 bg-gold/8 p-4 text-[0.78rem] leading-relaxed text-[#6d5316]">
                      <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
                      <p>
                        Price not officially verified — contact the destination for current pricing.
                        You can still submit a request and the team will confirm the amount.
                      </p>
                    </div>
                  )}

                  <button type="button" onClick={bookDestination} className="btn btn-forest mt-5 w-full">
                    Book this destination <ArrowRight className="h-4 w-4" />
                  </button>

                  {destination.contactEmail && (
                    <p className="mt-3 text-center text-[0.68rem] text-label">
                      Questions? <a className="text-emerald underline" href={`mailto:${destination.contactEmail}`}>Email the destination</a>
                    </p>
                  )}

                  {destination.bookingRequirements && (
                    <p className="mt-4 border-t border-pine/10 pt-3 text-[0.68rem] leading-relaxed text-faint">
                      {destination.bookingRequirements}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Booking form */}
        {bookingOpen && destination && user && (
          <div id="booking-form" className="mt-10 scroll-mt-28">
            <form onSubmit={submit} className="rounded-[1.6rem] border border-pine/12 bg-white p-6 shadow-[0_30px_70px_-55px_rgba(6,35,28,0.6)] sm:p-8">
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                  <p className="eyebrow">Step 2 · your details</p>
                  <h3 className="mt-1 font-display text-2xl text-pine">Complete your booking request</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setBookingOpen(false)}
                  className="inline-flex items-center gap-1 text-xs text-label hover:text-pine"
                >
                  <X className="h-3.5 w-3.5" /> Close
                </button>
              </div>

              <div className="mt-6 grid gap-5 lg:grid-cols-[1.4fr_1fr]">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="field-label">Full name</label>
                    <input className="input bg-sand/40" value={user.fullName} readOnly />
                  </div>
                  <div>
                    <label className="field-label">Email address</label>
                    <input className="input bg-sand/40" value={user.email} readOnly />
                  </div>
                  <div>
                    <label className="field-label">Phone number</label>
                    <input className="input bg-sand/40" value={user.phone} readOnly />
                  </div>
                  <div>
                    <label className="field-label">Selected destination</label>
                    <input className="input bg-sand/40" value={destination.name} readOnly />
                  </div>
                  <div>
                    <label className="field-label" htmlFor="booking-activity">
                      Selected activity
                    </label>
                    <select id="booking-activity" className="input" value={activity} onChange={(e) => setActivity(e.target.value)}>
                      <option value="">General visit</option>
                      {activities.map((item) => (
                        <option key={item} value={item}>
                          {item}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="field-label" htmlFor="booking-date">
                      Visiting date
                    </label>
                    <input
                      id="booking-date"
                      type="date"
                      min={tomorrow()}
                      className="input"
                      value={visitDate}
                      onChange={(event) => setVisitDate(event.target.value)}
                    />
                    {errors.visitDate && <p className="mt-1 text-[0.7rem] text-[#b23a2e]">{errors.visitDate}</p>}
                  </div>
                  <div>
                    <label className="field-label">Number of visitors</label>
                    <div className="flex gap-2">
                      <label className="flex flex-1 items-center gap-2 rounded-xl border border-pine/15 px-3 py-2">
                        <Users className="h-4 w-4 text-emerald" />
                        <input
                          type="number"
                          min={1}
                          max={60}
                          value={adults}
                          onChange={(event) => setAdults(Math.max(1, Number(event.target.value) || 1))}
                          className="w-full bg-transparent text-sm outline-none"
                          aria-label="Adults"
                        />
                        <span className="text-[0.7rem] text-label">adults</span>
                      </label>
                      <label className="flex flex-1 items-center gap-2 rounded-xl border border-pine/15 px-3 py-2">
                        <Users className="h-4 w-4 text-emerald/60" />
                        <input
                          type="number"
                          min={0}
                          max={40}
                          value={children}
                          onChange={(event) => setChildren(Math.max(0, Number(event.target.value) || 0))}
                          className="w-full bg-transparent text-sm outline-none"
                          aria-label="Children"
                        />
                        <span className="text-[0.7rem] text-label">children</span>
                      </label>
                    </div>
                  </div>
                  <div>
                    <label className="field-label" htmlFor="booking-category">
                      Visitor category
                    </label>
                    <select
                      id="booking-category"
                      className="input"
                      value={visitorCategory}
                      onChange={(event) => setVisitorCategory(event.target.value)}
                    >
                      {CATEGORIES.map((category) => (
                        <option key={category.value} value={category.value}>
                          {category.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="field-label" htmlFor="requests">
                      Additional requests
                    </label>
                    <textarea
                      id="requests"
                      className="input min-h-24"
                      maxLength={2000}
                      placeholder="Accessibility needs, preferred guide language, special occasions…"
                      value={requests}
                      onChange={(event) => setRequests(event.target.value)}
                    />
                  </div>
                </div>

                <aside className="rounded-2xl bg-pine/[0.04] p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald">Booking summary</p>
                  <dl className="mt-4 space-y-2.5 text-[0.82rem]">
                    {[
                      ["Destination", destination.name],
                      ["Activity", activity || "General visit"],
                      ["Date", visitDate ? prettyDate(visitDate) : "Select a date"],
                      ["Visitors", `${adults} adult${adults === 1 ? "" : "s"}${children ? `, ${children} child${children === 1 ? "" : "ren"}` : ""}`],
                      ["Category", CATEGORY_NAMES[visitorCategory]],
                    ].map(([label, value]) => (
                      <div key={label} className="flex justify-between gap-3">
                        <dt className="text-label">{label}</dt>
                        <dd className="text-right font-medium text-pine">{value}</dd>
                      </div>
                    ))}
                  </dl>
                  <div className="mt-4 border-t border-pine/10 pt-3">
                    <p className="text-[0.7rem] uppercase tracking-[0.12em] text-label">Estimated official price</p>
                    <p className="mt-1 font-display text-2xl text-pine">
                      {quote?.verified ? money(quote.total, quote.match?.currency ?? "USD") : "Quoted on request"}
                    </p>
                    {quote?.verified && quote.match?.sourceUrl && (
                      <a
                        href={quote.match.sourceUrl}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="mt-1 inline-flex items-center gap-1 text-[0.65rem] text-emerald hover:underline"
                      >
                        Official source · verified {quote.match.verifiedAt} <ExternalLink className="h-2.5 w-2.5" />
                      </a>
                    )}
                    {!quote?.verified && (
                      <p className="mt-2 text-[0.68rem] leading-relaxed text-[#9a7726]">
                        No officially verified price for this selection. Submit the request and the team will
                        confirm the amount before any payment.
                      </p>
                    )}
                  </div>

                  {error && <p className="mt-3 rounded-lg bg-[#b23a2e]/10 p-2 text-[0.75rem] text-[#b23a2e]">{error}</p>}

                  <button type="submit" disabled={submitting} className="btn btn-gold mt-5 w-full">
                    {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <CalendarDays className="h-4 w-4" />}
                    {submitting ? "Submitting…" : "Submit booking request"}
                  </button>
                  <p className="mt-2 text-center text-[0.65rem] leading-relaxed text-faint">
                    No payment is taken online. Requests start as pending and are reviewed by the team.
                  </p>
                </aside>
              </div>
            </form>
          </div>
        )}

        {/* Confirmation */}
        {confirmation && (
          <div id="booking-confirmation" className="mt-10 scroll-mt-28">
            <div className="rounded-[1.6rem] border border-emerald/25 bg-white p-8 text-center shadow-[0_30px_70px_-55px_rgba(6,35,28,0.6)]">
              <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-emerald/10 text-emerald">
                <CheckCircle2 className="h-7 w-7" />
              </span>
              <h3 className="mt-4 font-display text-2xl text-pine">Booking request submitted</h3>
              <p className="mx-auto mt-2 max-w-xl text-[0.88rem] leading-relaxed text-body-soft">
                Your request for <strong>{confirmation.destination}</strong> on{" "}
                {prettyDate(confirmation.visitDate)} has been saved with status{" "}
                <strong className="capitalize">{confirmation.status}</strong>. An acknowledgement has been
                sent to your email, and the administrator has been notified.
              </p>
              <div className="mx-auto mt-5 inline-flex flex-col items-center rounded-xl border border-dashed border-emerald/40 bg-emerald/[0.04] px-6 py-3">
                <span className="text-[0.65rem] uppercase tracking-[0.18em] text-label">Booking reference</span>
                <span className="font-display text-xl tracking-wide text-pine">{confirmation.reference}</span>
              </div>
              <p className="mt-3 text-[0.75rem] text-label">
                {confirmation.verified && confirmation.total != null
                  ? `Estimated total: ${money(confirmation.total, confirmation.currency)} (officially verified)`
                  : "Price to be confirmed by the destination team."}
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <Link href="/dashboard#bookings" className="btn btn-forest">
                  Track this booking
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setConfirmation(null);
                    setBookingOpen(false);
                    setVisitDate("");
                  }}
                  className="btn btn-ghost"
                >
                  Book another destination
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Auth prompt */}
      {authPrompt && (
        <div className="fixed inset-0 z-[80] grid place-items-center bg-forest/70 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-[1.6rem] bg-cream p-7 shadow-2xl">
            <div className="flex items-start justify-between">
              <div>
                <p className="eyebrow">One more step</p>
                <h3 className="mt-1 font-display text-2xl text-pine">Sign in to book</h3>
              </div>
              <button
                type="button"
                onClick={() => setAuthPrompt(false)}
                aria-label="Close"
                className="grid h-8 w-8 place-items-center rounded-full hover:bg-pine/5"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="mt-3 text-[0.85rem] leading-relaxed text-body-soft">
              You can explore destinations and prices without an account. To submit this request for{" "}
              <strong>{destination?.name}</strong>, sign in or create an account — we will bring you straight
              back here.
            </p>
            <div className="mt-6 space-y-2.5">
              <Link href={`/login?next=${encodeURIComponent(redirect)}`} className="btn btn-forest w-full">
                Sign in
              </Link>
              <Link href={`/register?next=${encodeURIComponent(redirect)}`} className="btn btn-gold w-full">
                Create account
              </Link>
              <button type="button" onClick={() => setAuthPrompt(false)} className="btn btn-ghost w-full">
                Keep exploring
              </button>
            </div>
            <p className="mt-4 text-center text-[0.65rem] text-faint">
              Your selected destination, date and visitor numbers are kept while you sign in.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
