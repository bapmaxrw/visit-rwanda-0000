"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, ChevronDown, Loader2, Mail, Phone, Reply, Search } from "lucide-react";
import { formatDateTime } from "@/lib/utils";

export type AdminEnquiry = {
  id: string;
  reference: string;
  name: string;
  email: string;
  phone: string | null;
  topic: string;
  subject: string;
  message: string;
  status: string;
  adminReply: string | null;
  repliedAt: Date | string | null;
  createdAt: Date | string;
};

const STATUSES = ["all", "new", "read", "replied", "closed"] as const;

const TOPIC_LABELS: Record<string, string> = {
  general: "General enquiry",
  booking: "Booking or permit support",
  partnership: "Partnership or trade",
  press: "Press and media",
  accessibility: "Accessibility",
};

const badge = (status: string) =>
  status === "new"
    ? "bg-gold/18 text-[#8a6a1c]"
    : status === "replied"
      ? "bg-emerald/12 text-emerald"
      : status === "closed"
        ? "bg-pine/8 text-muted"
        : "bg-pine/8 text-body-soft";

export function EnquiriesManager({ enquiries }: { enquiries: AdminEnquiry[] }) {
  const router = useRouter();
  const [status, setStatus] = useState<(typeof STATUSES)[number]>("new");
  const [query, setQuery] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);
  const [reply, setReply] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const counts = useMemo(() => {
    const map: Record<string, number> = { all: enquiries.length };
    for (const enquiry of enquiries) map[enquiry.status] = (map[enquiry.status] ?? 0) + 1;
    return map;
  }, [enquiries]);

  const filtered = useMemo(
    () =>
      enquiries.filter((enquiry) => {
        if (status !== "all" && enquiry.status !== status) return false;
        if (!query) return true;
        return `${enquiry.reference} ${enquiry.name} ${enquiry.email} ${enquiry.subject}`
          .toLowerCase()
          .includes(query.toLowerCase());
      }),
    [enquiries, status, query]
  );

  const patch = async (
    enquiry: AdminEnquiry,
    payload: { status?: string; adminReply?: string },
    successMessage: string
  ) => {
    setBusyId(enquiry.id);
    setError(null);
    setNotice(null);
    try {
      const response = await fetch(`/api/admin/enquiries/${enquiry.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Could not update this enquiry.");
      setNotice(
        payload.adminReply && payload.status === "replied" && data.delivered === false
          ? "Reply saved. Email delivery is not configured, so the reply was recorded in the platform only."
          : successMessage
      );
      setReply("");
      router.refresh();
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : "Could not update this enquiry.");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <section className="rounded-2xl border border-pine/10 bg-white">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-pine/10 px-5 py-4">
        <div>
          <h2 className="font-display text-xl text-pine">Visitor enquiries</h2>
          <p className="mt-0.5 text-[0.75rem] text-muted">
            {counts.new ?? 0} new · {counts.replied ?? 0} replied · replies are emailed to the visitor.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 rounded-full border border-pine/15 px-3 py-1.5">
            <Search className="h-3.5 w-3.5 text-emerald" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Reference, name, subject"
              className="w-48 bg-transparent text-[0.75rem] outline-none"
              aria-label="Search enquiries"
            />
          </div>
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value as (typeof STATUSES)[number])}
            className="input !w-auto !py-1.5 text-[0.75rem]"
            aria-label="Filter enquiries by status"
          >
            {STATUSES.map((option) => (
              <option key={option} value={option}>
                {option === "all"
                  ? `All (${counts.all})`
                  : `${option[0].toUpperCase() + option.slice(1)} (${counts[option] ?? 0})`}
              </option>
            ))}
          </select>
        </div>
      </header>

      {(error || notice) && (
        <p
          className={`mx-5 mt-4 rounded-lg px-3 py-2 text-[0.75rem] ${
            error ? "bg-[#b23a2e]/10 text-[#b23a2e]" : "bg-emerald/10 text-emerald"
          }`}
        >
          {error ?? notice}
        </p>
      )}

      <div className="divide-y divide-pine/6">
        {filtered.length === 0 && (
          <p className="px-5 py-12 text-center text-[0.85rem] text-faint">
            No enquiries match this filter.
          </p>
        )}
        {filtered.map((enquiry) => {
          const open = openId === enquiry.id;
          return (
            <article key={enquiry.id} className="px-5 py-4">
              <button
                type="button"
                onClick={() => {
                  setOpenId(open ? null : enquiry.id);
                  setReply(enquiry.adminReply ?? "");
                  if (enquiry.status === "new") {
                    void patch(enquiry, { status: "read" }, "Marked as read.");
                  }
                }}
                className="flex w-full items-start justify-between gap-3 text-left"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`rounded-full px-2 py-0.5 text-[0.6rem] font-semibold uppercase tracking-[0.1em] ${badge(enquiry.status)}`}>
                      {enquiry.status}
                    </span>
                    <span className="text-[0.62rem] uppercase tracking-[0.12em] text-faint">
                      {TOPIC_LABELS[enquiry.topic] ?? enquiry.topic}
                    </span>
                    <span className="font-mono text-[0.68rem] text-faintest">{enquiry.reference}</span>
                  </div>
                  <h3 className="mt-1.5 font-display text-lg leading-snug text-pine">{enquiry.subject}</h3>
                  <p className="mt-0.5 truncate text-[0.75rem] text-muted">
                    {enquiry.name} · {enquiry.email} · {formatDateTime(enquiry.createdAt)}
                  </p>
                </div>
                <ChevronDown
                  className={`mt-1 h-4 w-4 shrink-0 text-faint transition ${open ? "rotate-180" : ""}`}
                />
              </button>

              {open && (
                <div className="mt-4 rounded-xl bg-pine/[0.03] p-4">
                  <div className="grid gap-3 text-[0.75rem] sm:grid-cols-2">
                    <div>
                      <p className="text-faint">Contact</p>
                      <a
                        href={`mailto:${enquiry.email}`}
                        className="flex items-center gap-1 font-medium text-emerald hover:underline"
                      >
                        <Mail className="h-3 w-3" /> {enquiry.email}
                      </a>
                      {enquiry.phone && (
                        <a
                          href={`tel:${enquiry.phone}`}
                          className="mt-0.5 flex items-center gap-1 font-medium text-emerald hover:underline"
                        >
                          <Phone className="h-3 w-3" /> {enquiry.phone}
                        </a>
                      )}
                    </div>
                    <div>
                      <p className="text-faint">Received</p>
                      <p className="font-medium text-pine">{formatDateTime(enquiry.createdAt)}</p>
                      {enquiry.repliedAt && (
                        <p className="mt-0.5 text-[0.7rem] text-label">
                          Replied {formatDateTime(enquiry.repliedAt)}
                        </p>
                      )}
                    </div>
                  </div>

                  <p className="mt-3 whitespace-pre-line rounded-lg bg-white p-3 text-[0.78rem] leading-relaxed text-body">
                    {enquiry.message}
                  </p>

                  <div className="mt-3">
                    <label className="field-label" htmlFor={`reply-${enquiry.id}`}>
                      Reply to the visitor (sent by email)
                    </label>
                    <textarea
                      id={`reply-${enquiry.id}`}
                      value={reply}
                      onChange={(event) => setReply(event.target.value)}
                      className="input min-h-24 bg-white"
                      placeholder="Thank you for your message. Gorilla permits for your dates…"
                    />
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      type="button"
                      disabled={busyId === enquiry.id || reply.trim().length < 3}
                      onClick={() =>
                        patch(enquiry, { status: "replied", adminReply: reply.trim() }, "Reply sent.")
                      }
                      className="btn btn-forest !px-4 !py-2 text-xs"
                    >
                      {busyId === enquiry.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Reply className="h-3.5 w-3.5" />
                      )}
                      Send reply
                    </button>
                    <button
                      type="button"
                      disabled={busyId === enquiry.id || enquiry.status === "read"}
                      onClick={() => patch(enquiry, { status: "read" }, "Marked as read.")}
                      className="btn btn-ghost !px-4 !py-2 text-xs"
                    >
                      <Check className="h-3.5 w-3.5" /> Mark read
                    </button>
                    <button
                      type="button"
                      disabled={busyId === enquiry.id || enquiry.status === "closed"}
                      onClick={() => patch(enquiry, { status: "closed" }, "Enquiry closed.")}
                      className="btn btn-ghost !px-4 !py-2 text-xs"
                    >
                      Close
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
