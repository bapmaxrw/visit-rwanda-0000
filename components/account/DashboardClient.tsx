"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import {
  BadgeCheck,
  CalendarDays,
  Camera,
  CheckCircle2,
  Clock3,
  KeyRound,
  LayoutDashboard,
  Loader2,
  LogOut,
  XCircle,
} from "lucide-react";
import { formatDate, formatMoney, CATEGORY_LABELS } from "@/lib/pricing";
import { formatDateTime, initials } from "@/lib/utils";

type Profile = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: string;
  dateOfBirth: string | null;
  nationality: string | null;
  hasNationalId: boolean;
  avatarUrl: string | null;
  createdAt: Date | string;
  lastLoginAt: Date | string | null;
};

type BookingRow = {
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
  createdAt: Date | string;
};

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-[#c9a44c]/15 text-[#8a6a1c]",
  approved: "bg-emerald/12 text-emerald",
  rejected: "bg-[#b23a2e]/10 text-[#b23a2e]",
  cancelled: "bg-pine/8 text-muted",
};

export function DashboardClient({
  profile,
  bookings,
}: {
  profile: Profile;
  bookings: BookingRow[];
}) {
  const router = useRouter();
  const [tab, setTab] = useState<"profile" | "bookings" | "security">("bookings");
  const [avatarUrl, setAvatarUrl] = useState(profile.avatarUrl);
  const [avatarBusy, setAvatarBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    fullName: profile.fullName,
    phone: profile.phone,
    dateOfBirth: profile.dateOfBirth ?? "",
    nationality: profile.nationality ?? "",
  });
  const [hasNationalId, setHasNationalId] = useState(profile.hasNationalId);
  const [nationalId, setNationalId] = useState("");
  const [saving, setSaving] = useState(false);

  const [passwords, setPasswords] = useState({ currentPassword: "", newPassword: "", confirm: "" });
  const [passwordBusy, setPasswordBusy] = useState(false);
  const [passwordNotice, setPasswordNotice] = useState<string | null>(null);

  const stats = useMemo(
    () => ({
      total: bookings.length,
      pending: bookings.filter((b) => b.status === "pending").length,
      approved: bookings.filter((b) => b.status === "approved").length,
      rejected: bookings.filter((b) => b.status === "rejected").length,
    }),
    [bookings]
  );

  const uploadAvatar = async (file: File) => {
    setAvatarBusy(true);
    setError(null);
    try {
      const body = new FormData();
      body.append("avatar", file);
      const response = await fetch("/api/account/avatar", { method: "POST", body });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Upload failed");
      setAvatarUrl(`${data.url}?v=${Date.now()}`);
      setNotice("Profile picture updated.");
      router.refresh();
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Upload failed");
    } finally {
      setAvatarBusy(false);
    }
  };

  const saveProfile = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setNotice(null);
    setError(null);
    try {
      const response = await fetch("/api/account/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          hasNationalId,
          nationalId: hasNationalId ? nationalId : "",
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.errors?.phone ?? data.error ?? "Could not save your profile.");
      setNotice("Profile updated.");
      router.refresh();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Could not save your profile.");
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async (event: React.FormEvent) => {
    event.preventDefault();
    setPasswordNotice(null);
    setError(null);
    if (passwords.newPassword !== passwords.confirm) {
      setError("New passwords do not match.");
      return;
    }
    setPasswordBusy(true);
    try {
      const response = await fetch("/api/account/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: passwords.currentPassword,
          newPassword: passwords.newPassword,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Could not change your password.");
      setPasswordNotice("Password changed successfully.");
      setPasswords({ currentPassword: "", newPassword: "", confirm: "" });
    } catch (passwordError) {
      setError(passwordError instanceof Error ? passwordError.message : "Could not change your password.");
    } finally {
      setPasswordBusy(false);
    }
  };

  const cancelBooking = async (id: string) => {
    if (!window.confirm("Cancel this pending booking request?")) return;
    setError(null);
    const response = await fetch(`/api/bookings/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "cancel" }),
    });
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      setError(data.error ?? "Could not cancel this booking.");
      return;
    }
    setNotice("Booking cancelled.");
    router.refresh();
  };

  const signOut = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.assign("/");
  };

  return (
    <div className="container-x pb-20">
      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <aside className="rounded-[1.5rem] border border-pine/10 bg-white p-6">
          <div className="flex items-center gap-4">
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatarUrl} alt="" className="h-16 w-16 rounded-2xl object-cover" />
            ) : (
              <span className="grid h-16 w-16 place-items-center rounded-2xl bg-pine/8 font-display text-xl text-pine">
                {initials(profile.fullName)}
              </span>
            )}
            <div className="min-w-0">
              <p className="truncate font-display text-lg text-pine">{profile.fullName}</p>
              <p className="text-[0.68rem] uppercase tracking-[0.14em] text-emerald">
                {profile.role === "admin" ? "Administrator" : "Registered visitor"}
              </p>
            </div>
          </div>

          <label className="mt-4 flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-pine/20 py-2 text-[0.72rem] text-body-soft hover:border-emerald/40">
            {avatarBusy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Camera className="h-3.5 w-3.5" />}
            {avatarBusy ? "Uploading…" : "Change profile picture"}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="sr-only"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) uploadAvatar(file);
              }}
            />
          </label>

          <nav className="mt-6 space-y-1">
            {[
              { key: "bookings" as const, label: "Bookings", icon: CalendarDays },
              { key: "profile" as const, label: "Profile", icon: LayoutDashboard },
              { key: "security" as const, label: "Password", icon: KeyRound },
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                type="button"
                onClick={() => {
                  setTab(key);
                  setNotice(null);
                  setError(null);
                }}
                className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-[0.82rem] font-medium transition ${
                  tab === key ? "bg-pine text-cream" : "text-body-soft hover:bg-pine/5"
                }`}
              >
                <Icon className="h-4 w-4" /> {label}
              </button>
            ))}
            {profile.role === "admin" && (
              <Link
                href="/admin"
                className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-[0.82rem] font-medium text-emerald hover:bg-emerald/5"
              >
                <BadgeCheck className="h-4 w-4" /> Admin dashboard
              </Link>
            )}
            <button
              type="button"
              onClick={signOut}
              className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-[0.82rem] font-medium text-[#8a3b2f] hover:bg-[#8a3b2f]/5"
            >
              <LogOut className="h-4 w-4" /> Sign out
            </button>
          </nav>

          <div className="mt-6 border-t border-pine/10 pt-4 text-[0.68rem] leading-relaxed text-faint">
            <p>Member since {formatDate(profile.createdAt)}</p>
            {profile.lastLoginAt && <p className="mt-1">Last sign-in {formatDateTime(profile.lastLoginAt)}</p>}
          </div>
        </aside>

        <div>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[
              { label: "Total requests", value: stats.total, icon: CalendarDays, tone: "text-pine" },
              { label: "Pending", value: stats.pending, icon: Clock3, tone: "text-[#8a6a1c]" },
              { label: "Approved", value: stats.approved, icon: CheckCircle2, tone: "text-emerald" },
              { label: "Rejected", value: stats.rejected, icon: XCircle, tone: "text-[#b23a2e]" },
            ].map(({ label, value, icon: Icon, tone }) => (
              <div key={label} className="rounded-2xl border border-pine/10 bg-white p-5">
                <div className="flex items-center justify-between">
                  <p className="text-[0.68rem] uppercase tracking-[0.14em] text-label">{label}</p>
                  <Icon className={`h-4 w-4 ${tone}`} />
                </div>
                <p className="mt-2 font-display text-3xl text-pine">{value}</p>
              </div>
            ))}
          </div>

          {(notice || error) && (
            <p
              className={`mt-5 rounded-xl px-4 py-3 text-[0.8rem] ${
                error ? "bg-[#b23a2e]/10 text-[#b23a2e]" : "bg-emerald/8 text-emerald"
              }`}
            >
              {error ?? notice}
            </p>
          )}

          {tab === "bookings" && (
            <section id="bookings" className="mt-6">
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                  <p className="eyebrow">Booking history</p>
                  <h2 className="mt-1 font-display text-2xl text-pine">Your requests</h2>
                </div>
                <Link href="/booking" className="btn btn-forest !px-4 !py-2 text-xs">
                  New booking
                </Link>
              </div>

              {bookings.length === 0 ? (
                <div className="mt-4 rounded-2xl border border-dashed border-pine/20 bg-white/60 p-10 text-center">
                  <p className="font-display text-xl text-pine">No booking requests yet</p>
                  <p className="mt-2 text-[0.85rem] text-body-soft">
                    Explore destinations and send your first request — nothing is charged online.
                  </p>
                  <Link href="/destinations" className="btn btn-gold mt-5">
                    Browse destinations
                  </Link>
                </div>
              ) : (
                <div className="mt-4 space-y-3">
                  {bookings.map((booking) => (
                    <article key={booking.id} className="rounded-2xl border border-pine/10 bg-white p-5">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-display text-lg text-pine">{booking.destinationName}</h3>
                            <span
                              className={`rounded-full px-2.5 py-0.5 text-[0.62rem] font-semibold uppercase tracking-[0.1em] ${
                                STATUS_STYLES[booking.status] ?? "bg-pine/8 text-pine"
                              }`}
                            >
                              {booking.status}
                            </span>
                          </div>
                          <p className="mt-1 font-mono text-[0.72rem] tracking-wide text-label">
                            {booking.reference}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-display text-lg text-pine">
                            {booking.totalPrice != null
                              ? formatMoney(booking.totalPrice, booking.currency ?? "USD")
                              : "Quoted on request"}
                          </p>
                          <p className="text-[0.64rem] text-faint">
                            {booking.priceVerified ? "Officially verified price" : "Price pending verification"}
                          </p>
                        </div>
                      </div>

                      <dl className="mt-3 grid gap-2 border-t border-pine/8 pt-3 text-[0.75rem] sm:grid-cols-4">
                        <div>
                          <dt className="text-faint">Visit date</dt>
                          <dd className="font-medium text-pine">{formatDate(booking.visitDate)}</dd>
                        </div>
                        <div>
                          <dt className="text-faint">Visitors</dt>
                          <dd className="font-medium text-pine">
                            {booking.adults} adult{booking.adults === 1 ? "" : "s"}
                            {booking.children ? `, ${booking.children} child` : ""}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-faint">Category</dt>
                          <dd className="font-medium text-pine">
                            {CATEGORY_LABELS[booking.visitorCategory] ?? booking.visitorCategory}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-faint">Activity</dt>
                          <dd className="font-medium text-pine">{booking.activity ?? "General visit"}</dd>
                        </div>
                      </dl>

                      {booking.adminNote && (
                        <p className="mt-3 rounded-lg bg-sand/60 px-3 py-2 text-[0.75rem] text-body-soft">
                          <strong>Note from the team:</strong> {booking.adminNote}
                        </p>
                      )}

                      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-pine/8 pt-3">
                        <p className="text-[0.66rem] text-faint">Requested {formatDateTime(booking.createdAt)}</p>
                        {booking.status === "pending" && (
                          <button
                            type="button"
                            onClick={() => cancelBooking(booking.id)}
                            className="text-[0.72rem] font-semibold text-[#8a3b2f] hover:underline"
                          >
                            Cancel request
                          </button>
                        )}
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>
          )}

          {tab === "profile" && (
            <section className="mt-6 rounded-2xl border border-pine/10 bg-white p-6">
              <p className="eyebrow">Personal details</p>
              <h2 className="mt-1 font-display text-2xl text-pine">Your profile</h2>

              <dl className="mt-4 grid gap-3 rounded-xl bg-pine/[0.03] p-4 text-[0.8rem] sm:grid-cols-2">
                {[
                  ["Email address", profile.email],
                  ["Telephone", profile.phone],
                  ["Date of birth", profile.dateOfBirth ? formatDate(profile.dateOfBirth) : "Not provided"],
                  ["Nationality", profile.nationality ?? "Not provided"],
                  ["National ID", profile.hasNationalId ? "Provided (protected)" : "Not provided"],
                  ["Account created", formatDate(profile.createdAt)],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between gap-3">
                    <dt className="text-label">{label}</dt>
                    <dd className="text-right font-medium text-pine">{value}</dd>
                  </div>
                ))}
              </dl>

              <form onSubmit={saveProfile} className="mt-6 grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="field-label">Full name</label>
                  <input
                    className="input"
                    value={form.fullName}
                    onChange={(event) => setForm({ ...form, fullName: event.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="field-label">Telephone number</label>
                  <input
                    className="input"
                    value={form.phone}
                    onChange={(event) => setForm({ ...form, phone: event.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="field-label">Date of birth</label>
                  <input
                    type="date"
                    className="input"
                    value={form.dateOfBirth}
                    onChange={(event) => setForm({ ...form, dateOfBirth: event.target.value })}
                  />
                </div>
                <div>
                  <label className="field-label">Nationality</label>
                  <input
                    className="input"
                    value={form.nationality}
                    onChange={(event) => setForm({ ...form, nationality: event.target.value })}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="flex cursor-pointer items-center gap-2 text-[0.8rem] text-body-soft">
                    <input
                      type="checkbox"
                      checked={hasNationalId}
                      onChange={(event) => setHasNationalId(event.target.checked)}
                      className="h-4 w-4 accent-[#12775a]"
                    />
                    I have a national ID on file
                  </label>
                  {hasNationalId && (
                    <div className="mt-2">
                      <input
                        className="input"
                        placeholder={profile.hasNationalId ? "Enter a new national ID to replace the stored one" : "National ID number"}
                        value={nationalId}
                        onChange={(event) => setNationalId(event.target.value)}
                      />
                      <p className="mt-1 text-[0.64rem] text-faint">
                        Stored for identification only and never shown in full. Leave blank to keep the existing value.
                      </p>
                    </div>
                  )}
                </div>
                <div className="sm:col-span-2">
                  <button type="submit" disabled={saving} className="btn btn-forest">
                    {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                    Save changes
                  </button>
                </div>
              </form>
            </section>
          )}

          {tab === "security" && (
            <section className="mt-6 max-w-xl rounded-2xl border border-pine/10 bg-white p-6">
              <p className="eyebrow">Security</p>
              <h2 className="mt-1 font-display text-2xl text-pine">Change your password</h2>
              <p className="mt-2 text-[0.82rem] leading-relaxed text-body-soft">
                Your password is hashed with scrypt and cannot be viewed — only replaced.
              </p>
              <form onSubmit={changePassword} className="mt-5 space-y-4">
                <div>
                  <label className="field-label">Current password</label>
                  <input
                    type="password"
                    autoComplete="current-password"
                    className="input"
                    value={passwords.currentPassword}
                    onChange={(event) => setPasswords({ ...passwords, currentPassword: event.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="field-label">New password</label>
                  <input
                    type="password"
                    autoComplete="new-password"
                    className="input"
                    value={passwords.newPassword}
                    onChange={(event) => setPasswords({ ...passwords, newPassword: event.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="field-label">Confirm new password</label>
                  <input
                    type="password"
                    autoComplete="new-password"
                    className="input"
                    value={passwords.confirm}
                    onChange={(event) => setPasswords({ ...passwords, confirm: event.target.value })}
                    required
                  />
                </div>
                {passwordNotice && <p className="text-[0.78rem] text-emerald">{passwordNotice}</p>}
                <button type="submit" disabled={passwordBusy} className="btn btn-forest">
                  {passwordBusy && <Loader2 className="h-4 w-4 animate-spin" />}
                  Update password
                </button>
              </form>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
