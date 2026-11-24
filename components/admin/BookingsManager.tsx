"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Check, Loader2, Mail, Phone, Search, X } from "lucide-react";
import { formatDate, formatMoney, CATEGORY_LABELS } from "@/lib/pricing";
import { formatDateTime } from "@/lib/utils";

export type AdminBooking = {
  id: string;
  reference: string;
  destinationName: string;
  activity: string | null;
  visitDate: string;
  adults: number;
  children: number;
  visitorCategory: string;
  totalPrice: number | null;
  currency: string | null;
  priceVerified: boolean;
  status: string;
  adminNote: string | null;
  specialRequests: string | null;
  createdAt: Date | string;
  visitorName: string | null;
  visitorEmail: string | null;
  visitorPhone: string | null;
};

const STATUS = ["all", "pending", "approved", "rejected", "cancelled"] as const;

export function BookingsManager({ bookings }: { bookings: AdminBooking[] }) {
  const router = useRouter();
  const [status, setStatus] = useState<(typeof STATUS)[number]>("pending");
  const [query, setQuery] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const filtered = useMemo(
    () =>
      bookings.filter((booking) => {
        if (status !== "all" && booking.status !== status) return false;
        if (!query) return true;
        const haystack = `${booking.reference} ${booking.destinationName} ${booking.visitorName ?? ""} ${
          booking.visitorEmail ?? ""
        }`.toLowerCase();
        return haystack.includes(query.toLowerCase());
      }),
    [bookings, status, query]
  );

  const update = async (booking: AdminBooking, nextStatus: string) => {
    setBusyId(booking.id);
    setError(null);
    try {
      const response = await fetch(`/api/admin/bookings/${booking.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus, adminNote: note || booking.adminNote || "" }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Could not update this booking.");
      setNote("");
      router.refresh();
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : "Could not update this booking.");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <section className="rounded-2xl border border-pine/10 bg-white">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-pine/10 px-5 py-4">
        <div>
          <h2 className="font-display text-xl text-pine">Booking requests</h2>
          <p className="mt-0.5 text-[0.75rem] text-muted">
            {bookings.length} total · approving or rejecting emails the visitor automatically.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 rounded-full border border-pine/15 px-3 py-1.5">
            <Search className="h-3.5 w-3.5 text-emerald" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Reference, name, destination"
              className="w-52 bg-transparent text-[0.75rem] outline-none"
              aria-label="Search bookings"
            />
          </div>
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value as (typeof STATUS)[number])}
            className="input !w-auto !py-1.5 text-[0.75rem]"
            aria-label="Filter by status"
          >
            {STATUS.map((option) => (
              <option key={option} value={option}>
                {option === "all" ? "All statuses" : option[0].toUpperCase() + option.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </header>

      {error && <p className="mx-5 mt-4 rounded-lg bg-[#b23a2e]/10 px-3 py-2 text-[0.75rem] text-[#b23a2e]">{error}</p>}

      <div className="divide-y divide-pine/6">
        {filtered.length === 0 && (
          <p className="px-5 py-12 text-center text-[0.85rem] text-faint">No booking requests match this filter.</p>
        )}
        {filtered.map((booking) => {
          const open = openId === booking.id;
          return (
            <article key={booking.id} className="px-5 py-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-mono text-[0.72rem] tracking-wide text-label">{booking.reference}</p>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[0.6rem] font-semibold uppercase tracking-[0.1em] ${
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
                    {!booking.priceVerified && (
                      <span className="rounded-full bg-[#b23a2e]/8 px-2 py-0.5 text-[0.6rem] text-[#b23a2e]">
                        price unverified
                      </span>
                    )}
                  </div>
                  <h3 className="mt-1 font-display text-lg text-pine">{booking.destinationName}</h3>
                  <p className="text-[0.75rem] text-muted">
                    {booking.visitorName} · {formatDate(booking.visitDate)} · {booking.adults} adult
                    {booking.adults === 1 ? "" : "s"}
                    {booking.children ? `, ${booking.children} child` : ""} ·{" "}
                    {CATEGORY_LABELS[booking.visitorCategory] ?? booking.visitorCategory}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-display text-lg text-pine">
                    {booking.totalPrice != null
                      ? formatMoney(booking.totalPrice, booking.currency ?? "USD")
                      : "Quoted on request"}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setOpenId(open ? null : booking.id);
                      setNote(booking.adminNote ?? "");
                    }}
                    className="text-[0.72rem] font-semibold text-emerald hover:underline"
                  >
                    {open ? "Hide details" : "View details"}
                  </button>
                </div>
              </div>

              {open && (
                <div className="mt-4 rounded-xl bg-pine/[0.03] p-4">
                  <div className="grid gap-3 text-[0.75rem] sm:grid-cols-2 lg:grid-cols-4">
                    <div>
                      <p className="text-faint">Visitor</p>
                      <p className="font-medium text-pine">{booking.visitorName ?? "—"}</p>
                    </div>
                    <div>
                      <p className="text-faint">Contact</p>
                      <div className="flex flex-col">
                        {booking.visitorEmail && (
                          <a href={`mailto:${booking.visitorEmail}`} className="flex items-center gap-1 text-emerald hover:underline">
                            <Mail className="h-3 w-3" /> {booking.visitorEmail}
                          </a>
                        )}
                        {booking.visitorPhone && (
                          <a href={`tel:${booking.visitorPhone}`} className="flex items-center gap-1 text-emerald hover:underline">
                            <Phone className="h-3 w-3" /> {booking.visitorPhone}
                          </a>
                        )}
                      </div>
                    </div>
                    <div>
                      <p className="text-faint">Activity</p>
                      <p className="font-medium text-pine">{booking.activity ?? "General visit"}</p>
                    </div>
                    <div>
                      <p className="text-faint">Requested</p>
                      <p className="font-medium text-pine">{formatDateTime(booking.createdAt)}</p>
                    </div>
                  </div>

                  {booking.specialRequests && (
                    <p className="mt-3 rounded-lg bg-white p-3 text-[0.75rem] leading-relaxed text-body">
                      <strong>Visitor requests:</strong> {booking.specialRequests}
                    </p>
                  )}

                  <div className="mt-3">
                    <label className="field-label" htmlFor={`note-${booking.id}`}>
                      Administrator note (included in the visitor email)
                    </label>
                    <textarea
                      id={`note-${booking.id}`}
                      value={note}
                      onChange={(event) => setNote(event.target.value)}
                      className="input min-h-16 bg-white"
                      placeholder="e.g. Permit availability confirmed for this date."
                    />
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      type="button"
                      disabled={busyId === booking.id || booking.status === "approved"}
                      onClick={() => update(booking, "approved")}
                      className="btn btn-forest !px-4 !py-2 text-xs"
                    >
                      {busyId === booking.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                      Approve
                    </button>
                    <button
                      type="button"
                      disabled={busyId === booking.id || booking.status === "rejected"}
                      onClick={() => update(booking, "rejected")}
                      className="btn !bg-[#8a3b2f] !px-4 !py-2 text-xs !text-cream"
                    >
                      <X className="h-3.5 w-3.5" /> Reject
                    </button>
                    <button
                      type="button"
                      disabled={busyId === booking.id || booking.status === "pending"}
                      onClick={() => update(booking, "pending")}
                      className="btn btn-ghost !px-4 !py-2 text-xs"
                    >
                      Reset to pending
                    </button>
                  </div>
                </div>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}
