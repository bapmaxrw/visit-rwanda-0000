import Link from "next/link";
import { notFound } from "next/navigation";
import { desc, eq } from "drizzle-orm";
import { ArrowLeft, CalendarCheck, Mail, MapPin, Phone, ShieldCheck } from "lucide-react";
import { getDb } from "@/lib/db";
import { bookings, users } from "@/lib/db/schema";
import { CATEGORY_LABELS, formatDate, formatMoney } from "@/lib/pricing";
import { formatDateTime, initials } from "@/lib/utils";

export const dynamic = "force-dynamic";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function AdminUserPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!UUID.test(id)) notFound();

  const db = await getDb();
  const [person] = await db
    .select({
      id: users.id,
      fullName: users.fullName,
      email: users.email,
      phone: users.phone,
      role: users.role,
      avatarMediaId: users.avatarMediaId,
      nationality: users.nationality,
      dateOfBirth: users.dateOfBirth,
      hasNationalId: users.hasNationalId,
      createdAt: users.createdAt,
      lastLoginAt: users.lastLoginAt,
    })
    .from(users)
    .where(eq(users.id, id))
    .limit(1);
  if (!person) notFound();

  const history = await db
    .select()
    .from(bookings)
    .where(eq(bookings.userId, id))
    .orderBy(desc(bookings.createdAt));

  const approved = history.filter((row) => row.status === "approved").length;
  const pending = history.filter((row) => row.status === "pending").length;

  const details = [
    ["Email", person.email],
    ["Telephone", person.phone],
    ["Nationality", person.nationality ?? "—"],
    ["Date of birth", person.dateOfBirth ? formatDate(person.dateOfBirth) : "—"],
    ["National ID", person.hasNationalId ? "Provided (stored, never displayed)" : "Not provided"],
    ["Registered", formatDateTime(person.createdAt)],
    ["Last sign-in", person.lastLoginAt ? formatDateTime(person.lastLoginAt) : "Never"],
    ["Role", person.role === "admin" ? "Administrator" : "Visitor"],
  ] as const;

  return (
    <div className="space-y-5">
      <Link
        href="/admin/users"
        className="inline-flex items-center gap-1.5 text-[0.74rem] font-semibold text-emerald hover:underline"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> All visitor accounts
      </Link>

      <header className="flex flex-wrap items-center gap-4 rounded-2xl border border-pine/10 bg-white p-5">
        <span className="grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-2xl bg-forest font-display text-xl text-cream">
          {person.avatarMediaId ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={`/api/media/${person.avatarMediaId}`}
              alt={`${person.fullName} profile picture`}
              className="h-full w-full object-cover"
            />
          ) : (
            initials(person.fullName)
          )}
        </span>
        <div className="min-w-0 flex-1">
          <p className="eyebrow">{person.role === "admin" ? "Administrator account" : "Visitor account"}</p>
          <h1 className="mt-0.5 font-display text-3xl text-pine">{person.fullName}</h1>
          <p className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-[0.76rem] text-body-soft">
            <a href={`mailto:${person.email}`} className="inline-flex items-center gap-1.5 hover:text-emerald">
              <Mail className="h-3.5 w-3.5 text-emerald" /> {person.email}
            </a>
            <a href={`tel:${person.phone}`} className="inline-flex items-center gap-1.5 hover:text-emerald">
              <Phone className="h-3.5 w-3.5 text-emerald" /> {person.phone}
            </a>
            {person.nationality && (
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-emerald" /> {person.nationality}
              </span>
            )}
          </p>
        </div>
        <div className="flex gap-3">
          <div className="rounded-xl border border-pine/10 px-4 py-2 text-center">
            <p className="font-display text-xl text-pine">{history.length}</p>
            <p className="text-[0.6rem] uppercase tracking-[0.12em] text-faint">Requests</p>
          </div>
          <div className="rounded-xl border border-pine/10 px-4 py-2 text-center">
            <p className="font-display text-xl text-emerald">{approved}</p>
            <p className="text-[0.6rem] uppercase tracking-[0.12em] text-faint">Approved</p>
          </div>
          <div className="rounded-xl border border-pine/10 px-4 py-2 text-center">
            <p className="font-display text-xl text-[#8a6a1c]">{pending}</p>
            <p className="text-[0.6rem] uppercase tracking-[0.12em] text-faint">Pending</p>
          </div>
        </div>
      </header>

      <div className="grid gap-5 xl:grid-cols-[1fr_1.6fr]">
        <section className="rounded-2xl border border-pine/10 bg-white p-5">
          <h2 className="font-display text-lg text-pine">Account details</h2>
          <dl className="mt-3 divide-y divide-pine/6 text-[0.78rem]">
            {details.map(([label, value]) => (
              <div key={label} className="flex items-start justify-between gap-4 py-2">
                <dt className="text-faint">{label}</dt>
                <dd className="text-right font-medium text-pine">{value}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-4 flex items-start gap-1.5 rounded-lg bg-pine/[0.03] p-3 text-[0.68rem] leading-relaxed text-muted">
            <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald" />
            Passwords are stored only as scrypt hashes and identity numbers are never returned to any
            client. This page is read-only; nothing shown here can be exported in bulk.
          </p>
        </section>

        <section className="rounded-2xl border border-pine/10 bg-white">
          <header className="flex items-center justify-between border-b border-pine/10 px-5 py-4">
            <h2 className="inline-flex items-center gap-2 font-display text-lg text-pine">
              <CalendarCheck className="h-4 w-4 text-emerald" /> Booking history
            </h2>
            <Link href="/admin/bookings" className="text-[0.72rem] font-semibold text-emerald hover:underline">
              Manage all
            </Link>
          </header>

          {history.length === 0 ? (
            <p className="px-5 py-12 text-center text-[0.82rem] text-faint">
              This visitor has not submitted a booking request yet.
            </p>
          ) : (
            <div className="divide-y divide-pine/6">
              {history.map((booking) => (
                <article key={booking.id} className="px-5 py-3.5">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-mono text-[0.68rem] tracking-wide text-label">{booking.reference}</p>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[0.58rem] font-semibold uppercase tracking-[0.1em] ${
                            booking.status === "approved"
                              ? "bg-emerald/12 text-emerald"
                              : booking.status === "rejected"
                                ? "bg-[#b23a2e]/10 text-[#b23a2e]"
                                : booking.status === "cancelled"
                                  ? "bg-pine/8 text-muted"
                                  : "bg-gold/18 text-[#8a6a1c]"
                          }`}
                        >
                          {booking.status}
                        </span>
                      </div>
                      <p className="mt-0.5 text-[0.82rem] font-medium text-pine">{booking.destinationName}</p>
                      <p className="text-[0.7rem] text-muted">
                        Visit {formatDate(booking.visitDate)} · {booking.adults} adult
                        {booking.adults === 1 ? "" : "s"}
                        {booking.children ? `, ${booking.children} child` : ""} ·{" "}
                        {CATEGORY_LABELS[booking.visitorCategory] ?? booking.visitorCategory}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[0.8rem] font-medium text-pine">
                        {booking.totalPrice != null
                          ? formatMoney(booking.totalPrice, booking.currency ?? "USD")
                          : "Quoted on request"}
                      </p>
                      <p className="text-[0.62rem] text-faintest">Requested {formatDateTime(booking.createdAt)}</p>
                    </div>
                  </div>
                  {booking.adminNote && (
                    <p className="mt-2 rounded-lg bg-pine/[0.03] px-3 py-2 text-[0.7rem] leading-relaxed text-body-soft">
                      <strong>Administrator note:</strong> {booking.adminNote}
                    </p>
                  )}
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
