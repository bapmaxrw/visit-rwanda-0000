import Link from "next/link";
import { count, desc, eq } from "drizzle-orm";
import { ArrowRight, Bell, CalendarCheck, Film, Inbox, MapPinned, Users } from "lucide-react";
import { getDb } from "@/lib/db";
import { bookings, destinations, enquiries, notifications, personnel, users, videoAssets } from "@/lib/db/schema";
import { formatDate, formatMoney } from "@/lib/pricing";
import { formatDateTime } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminOverviewPage() {
  const db = await getDb();
  const [
    usersCount,
    destinationsCount,
    peopleCount,
    bookingRows,
    recentBookings,
    recentNotifications,
    openEnquiries,
    filmRows,
  ] = await Promise.all([
    db.select({ value: count() }).from(users),
    db.select({ value: count() }).from(destinations),
    db.select({ value: count() }).from(personnel),
    db.select({ status: bookings.status }).from(bookings),
    db
      .select({
        id: bookings.id,
        reference: bookings.reference,
        destinationName: bookings.destinationName,
        visitDate: bookings.visitDate,
        status: bookings.status,
        totalPrice: bookings.totalPrice,
        currency: bookings.currency,
        createdAt: bookings.createdAt,
        visitor: users.fullName,
      })
      .from(bookings)
      .innerJoin(users, eq(users.id, bookings.userId))
      .orderBy(desc(bookings.createdAt))
      .limit(6),
    db.select().from(notifications).orderBy(desc(notifications.createdAt)).limit(5),
    db.select({ status: enquiries.status }).from(enquiries),
    db.select({ enabled: videoAssets.enabled }).from(videoAssets),
  ]);

  const byStatus = (status: string) => bookingRows.filter((row) => row.status === status).length;

  const awaitingReply = openEnquiries.filter((row) => row.status === "new").length;

  const stats = [
    { label: "Registered users", value: usersCount[0]?.value ?? 0, icon: Users, href: "/admin/users" },
    { label: "Destinations", value: destinationsCount[0]?.value ?? 0, icon: MapPinned, href: "/admin/destinations" },
    { label: "Booking requests", value: bookingRows.length, icon: CalendarCheck, href: "/admin/bookings" },
    { label: "People & team profiles", value: peopleCount[0]?.value ?? 0, icon: Bell, href: "/admin/people" },
    { label: "Enquiries awaiting reply", value: awaitingReply, icon: Inbox, href: "/admin/messages" },
    {
      label: "Background films live",
      value: filmRows.filter((row) => row.enabled).length,
      icon: Film,
      href: "/admin/videos",
    },
  ];

  const statuses = [
    ["Pending", byStatus("pending"), "#8a6a1c"],
    ["Approved", byStatus("approved"), "#12775a"],
    ["Rejected", byStatus("rejected"), "#b23a2e"],
    ["Cancelled", byStatus("cancelled"), "var(--color-muted)"],
  ] as const;

  return (
    <div className="space-y-6">
      <header>
        <p className="eyebrow">Administrator dashboard</p>
        <h1 className="mt-1 font-display text-3xl text-pine">Platform overview</h1>
        <p className="mt-1 text-[0.82rem] text-muted">
          Live activity from the Visit Rwanda Academy database.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
        {stats.map(({ label, value, icon: Icon, href }) => {
          const body = (
            <div className="rounded-2xl border border-pine/10 bg-white p-5 transition hover:-translate-y-0.5">
              <div className="flex items-center justify-between">
                <p className="text-[0.66rem] uppercase tracking-[0.14em] text-label">{label}</p>
                <Icon className="h-4 w-4 text-emerald" />
              </div>
              <p className="mt-2 font-display text-3xl text-pine">{value}</p>
            </div>
          );
          return href ? (
            <Link key={label} href={href}>
              {body}
            </Link>
          ) : (
            <div key={label}>{body}</div>
          );
        })}
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        {statuses.map(([label, value, color]) => (
          <div key={label} className="rounded-xl border border-pine/10 bg-white px-4 py-3">
            <p className="text-[0.65rem] uppercase tracking-[0.12em] text-faint">{label}</p>
            <p className="mt-1 text-xl font-semibold" style={{ color }}>
              {value}
            </p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <section className="rounded-2xl border border-pine/10 bg-white">
          <header className="flex items-center justify-between border-b border-pine/10 px-5 py-4">
            <h2 className="font-display text-lg text-pine">Latest booking requests</h2>
            <Link href="/admin/bookings" className="inline-flex items-center gap-1 text-[0.72rem] font-semibold text-emerald">
              Manage <ArrowRight className="h-3 w-3" />
            </Link>
          </header>
          <div className="divide-y divide-pine/6">
            {recentBookings.length === 0 && (
              <p className="px-5 py-10 text-center text-[0.82rem] text-faint">No booking requests yet.</p>
            )}
            {recentBookings.map((booking) => (
              <div key={booking.id} className="flex flex-wrap items-center justify-between gap-2 px-5 py-3">
                <div>
                  <p className="text-[0.82rem] font-medium text-pine">{booking.destinationName}</p>
                  <p className="text-[0.68rem] text-faint">
                    {booking.reference} · {booking.visitor} · {formatDate(booking.visitDate)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[0.78rem] font-medium text-pine">
                    {booking.totalPrice != null ? formatMoney(booking.totalPrice, booking.currency ?? "USD") : "—"}
                  </p>
                  <p className="text-[0.62rem] uppercase tracking-[0.1em] text-faint">{booking.status}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-pine/10 bg-white">
          <header className="border-b border-pine/10 px-5 py-4">
            <h2 className="font-display text-lg text-pine">Administrator inbox</h2>
            <p className="text-[0.68rem] text-faint">New bookings and status changes</p>
          </header>
          <div className="divide-y divide-pine/6">
            {recentNotifications.length === 0 && (
              <p className="px-5 py-10 text-center text-[0.82rem] text-faint">Nothing new.</p>
            )}
            {recentNotifications.map((item) => (
              <div key={item.id} className="px-5 py-3">
                <p className="text-[0.78rem] font-medium text-pine">{item.title}</p>
                <p className="mt-0.5 text-[0.72rem] leading-relaxed text-muted">{item.message}</p>
                <p className="mt-1 text-[0.62rem] text-faintest">{formatDateTime(item.createdAt)}</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="rounded-2xl border border-[#c9a44c]/30 bg-[#c9a44c]/8 p-5 text-[0.8rem] leading-relaxed text-[#6d5316]">
        <strong>Pricing integrity:</strong> a price is shown to visitors only when it is marked verified,
        has a source URL and carries a verification date. Unverified rows remain internal and the public
        site displays “Price not officially verified”.
      </section>
    </div>
  );
}
