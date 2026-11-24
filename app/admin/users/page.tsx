import Link from "next/link";
import { desc, ilike, or } from "drizzle-orm";
import { ArrowRight, Search, UserRoundSearch } from "lucide-react";
import { getDb } from "@/lib/db";
import { bookings, users } from "@/lib/db/schema";
import { formatDateTime, initials, likeTerm } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;
  const query = q.trim();
  const term = likeTerm(query);
  const db = await getDb();

  const [rows, bookingRows] = await Promise.all([
    db
      .select({
        id: users.id,
        fullName: users.fullName,
        email: users.email,
        phone: users.phone,
        role: users.role,
        avatarMediaId: users.avatarMediaId,
        nationality: users.nationality,
        createdAt: users.createdAt,
        lastLoginAt: users.lastLoginAt,
      })
      .from(users)
      .where(
        query
          ? or(
              ilike(users.fullName, term),
              ilike(users.email, term),
              ilike(users.phone, term)
            )
          : undefined
      )
      .orderBy(desc(users.createdAt)),
    db
      .select({
        userId: bookings.userId,
        status: bookings.status,
        createdAt: bookings.createdAt,
      })
      .from(bookings),
  ]);

  const stats = new Map<string, { total: number; pending: number; approved: number; latest: Date | null }>();
  bookingRows.forEach((booking) => {
    const entry = stats.get(booking.userId) ?? { total: 0, pending: 0, approved: 0, latest: null };
    entry.total += 1;
    if (booking.status === "pending") entry.pending += 1;
    if (booking.status === "approved") entry.approved += 1;
    const created = new Date(booking.createdAt);
    if (!entry.latest || created > entry.latest) entry.latest = created;
    stats.set(booking.userId, entry);
  });

  const thirtyDaysAgo = Date.now() - 30 * 86400_000;
  const recentCount = rows.filter((row) => new Date(row.createdAt).getTime() >= thirtyDaysAgo).length;
  const withBookings = rows.filter((row) => (stats.get(row.id)?.total ?? 0) > 0).length;
  const pendingRequests = rows.reduce((sum, row) => sum + (stats.get(row.id)?.pending ?? 0), 0);

  const summary = [
    ["Accounts", rows.length],
    ["With booking requests", withBookings],
    ["Awaiting review", pendingRequests],
    ["Joined in 30 days", recentCount],
  ] as const;

  return (
    <div className="space-y-5">
      <header>
        <p className="eyebrow">Visitor accounts</p>
        <h1 className="mt-1 font-display text-3xl text-pine">Registered visitors</h1>
        <p className="mt-1 max-w-2xl text-[0.82rem] text-muted">
          Every account created on the platform, with its booking history. National identity numbers are
          stored only as a provided / not provided flag and are never shown here.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {summary.map(([label, value]) => (
          <div key={label} className="rounded-2xl border border-pine/10 bg-white p-5">
            <p className="text-[0.66rem] uppercase tracking-[0.14em] text-label">{label}</p>
            <p className="mt-2 font-display text-3xl text-pine">{value}</p>
          </div>
        ))}
      </div>

      <form action="/admin/users" method="get" className="flex flex-wrap items-center gap-2 rounded-2xl border border-pine/10 bg-white p-4">
        <div className="flex flex-1 items-center gap-2 rounded-full border border-pine/15 px-3.5 py-2">
          <Search className="h-3.5 w-3.5 text-emerald" />
          <input
            name="q"
            defaultValue={query}
            placeholder="Search by name, email or telephone"
            className="w-full bg-transparent text-[0.8rem] outline-none"
            aria-label="Search visitor accounts"
          />
        </div>
        <button type="submit" className="btn btn-forest !px-5 !py-2 text-xs">
          Search
        </button>
        {query && (
          <Link href="/admin/users" className="text-[0.72rem] font-semibold text-emerald hover:underline">
            Clear
          </Link>
        )}
      </form>

      <section className="overflow-hidden rounded-2xl border border-pine/10 bg-white">
        <header className="flex items-center justify-between border-b border-pine/10 px-5 py-4">
          <h2 className="font-display text-xl text-pine">
            {query ? `Results for “${query}”` : "All accounts"}
          </h2>
          <p className="text-[0.72rem] text-faint">{rows.length} shown</p>
        </header>

        {rows.length === 0 && (
          <p className="px-5 py-12 text-center text-[0.85rem] text-faint">
            No account matches this search.
          </p>
        )}

        {rows.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-left text-[0.8rem]">
              <thead className="bg-pine/[0.03] text-[0.64rem] uppercase tracking-[0.12em] text-label">
                <tr>
                  <th className="px-5 py-2.5 font-semibold">Visitor</th>
                  <th className="px-4 py-2.5 font-semibold">Contact</th>
                  <th className="px-4 py-2.5 font-semibold">Nationality</th>
                  <th className="px-4 py-2.5 font-semibold">Joined</th>
                  <th className="px-4 py-2.5 font-semibold">Last sign-in</th>
                  <th className="px-4 py-2.5 font-semibold">Bookings</th>
                  <th className="px-5 py-2.5" />
                </tr>
              </thead>
              <tbody className="divide-y divide-pine/6">
                {rows.map((row) => {
                  const stat = stats.get(row.id);
                  return (
                    <tr key={row.id} className="align-middle hover:bg-pine/[0.015]">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <span className="grid h-9 w-9 shrink-0 place-items-center overflow-hidden rounded-full bg-forest text-[0.68rem] font-semibold text-cream">
                            {row.avatarMediaId ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={`/api/media/${row.avatarMediaId}`}
                                alt=""
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              initials(row.fullName)
                            )}
                          </span>
                          <div>
                            <p className="font-medium text-pine">{row.fullName}</p>
                            {row.role === "admin" && (
                              <span className="rounded-full bg-emerald/12 px-1.5 py-0.5 text-[0.56rem] font-semibold uppercase tracking-[0.1em] text-emerald">
                                administrator
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-body">{row.email}</p>
                        <p className="text-[0.72rem] text-faint">{row.phone}</p>
                      </td>
                      <td className="px-4 py-3 text-body-soft">{row.nationality ?? "—"}</td>
                      <td className="px-4 py-3 text-body-soft">{formatDateTime(row.createdAt)}</td>
                      <td className="px-4 py-3 text-body-soft">
                        {row.lastLoginAt ? formatDateTime(row.lastLoginAt) : "Never"}
                      </td>
                      <td className="px-4 py-3">
                        {stat ? (
                          <span className="inline-flex items-center gap-1.5">
                            <span className="font-semibold text-pine">{stat.total}</span>
                            {stat.pending > 0 && (
                              <span className="rounded-full bg-gold/20 px-1.5 py-0.5 text-[0.58rem] font-semibold text-[#8a6a1c]">
                                {stat.pending} pending
                              </span>
                            )}
                          </span>
                        ) : (
                          <span className="text-faintest">0</span>
                        )}
                      </td>
                      <td className="px-5 py-3 text-right">
                        <Link
                          href={`/admin/users/${row.id}`}
                          className="inline-flex items-center gap-1 text-[0.72rem] font-semibold text-emerald hover:underline"
                        >
                          Open <ArrowRight className="h-3 w-3" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {rows.length > 0 && (
          <p className="flex items-center gap-1.5 border-t border-pine/8 px-5 py-3 text-[0.7rem] text-faint">
            <UserRoundSearch className="h-3.5 w-3.5 text-emerald" />
            Accounts are created by visitors during registration; the platform never creates them on its own.
          </p>
        )}
      </section>
    </div>
  );
}
