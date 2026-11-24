"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Bell, ChevronDown, Menu, Search, X } from "lucide-react";
import { Logo } from "./Logo";
import { ThemeSwitcher } from "./ThemeSwitcher";
import { greetingName, initials } from "@/lib/utils";
import type { ThemeId } from "@/lib/themes";

const links = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/destinations", label: "Destinations" },
  { href: "/gallery", label: "Gallery" },
  { href: "/articles", label: "Articles" },
  { href: "/booking", label: "Booking" },
  { href: "/contact", label: "Contact" },
];

type NavUser = {
  id: string;
  fullName: string;
  role: string;
  avatarUrl: string | null;
} | null;

export function Nav({
  user,
  pendingCount = 0,
  theme,
}: {
  user: NavUser;
  pendingCount?: number;
  theme: ThemeId;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [accountOpen, setAccountOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
    setAccountOpen(false);
    setNotificationsOpen(false);
    setSearchOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (searchOpen) searchRef.current?.focus();
  }, [searchOpen]);

  const submitSearch = (event: React.FormEvent) => {
    event.preventDefault();
    const q = query.trim();
    setSearchOpen(false);
    router.push(q ? `/search?q=${encodeURIComponent(q)}` : "/search");
  };

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.assign("/");
  };

  const solid = scrolled || open;

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
          solid
            ? "border-b border-pine/10 bg-cream/90 py-2 shadow-[0_12px_40px_-28px_rgba(6,35,28,0.55)] backdrop-blur-xl"
            : "bg-gradient-to-b from-forest/70 to-transparent py-4"
        }`}
      >
        <div className="container-x flex items-center justify-between gap-4">
          <Logo light={!solid} />

          <nav className="hidden items-center gap-1 lg:flex">
            {links.map((link) => {
              const active =
                link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative rounded-full px-3.5 py-2 text-[0.82rem] font-medium transition ${
                    solid
                      ? active
                        ? "text-emerald"
                        : "text-pine/75 hover:text-pine"
                      : active
                        ? "text-gold-light"
                        : "text-cream/85 hover:text-cream"
                  }`}
                >
                  {link.label}
                  {active && (
                    <span className="absolute inset-x-3.5 -bottom-0.5 h-px bg-current opacity-60" />
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-1.5">
            <ThemeSwitcher theme={theme} light={!solid} />

            <button
              type="button"
              onClick={() => setSearchOpen((value) => !value)}
              aria-label="Search the site"
              className={`grid h-10 w-10 place-items-center rounded-full transition ${
                solid ? "text-pine hover:bg-pine/8" : "text-cream hover:bg-white/10"
              }`}
            >
              <Search className="h-[18px] w-[18px]" />
            </button>

            <div className="relative hidden sm:block">
              <button
                type="button"
                onClick={() => {
                  setNotificationsOpen((value) => !value);
                  setAccountOpen(false);
                }}
                aria-label="Notifications"
                className={`relative grid h-10 w-10 place-items-center rounded-full transition ${
                  solid ? "text-pine hover:bg-pine/8" : "text-cream hover:bg-white/10"
                }`}
              >
                <Bell className="h-[18px] w-[18px]" />
                {pendingCount > 0 && (
                  <span className="absolute right-1.5 top-1.5 grid min-h-4 min-w-4 place-items-center rounded-full bg-gold px-1 text-[0.6rem] font-bold text-forest">
                    {pendingCount}
                  </span>
                )}
              </button>
              {notificationsOpen && (
                <div className="absolute right-0 top-12 w-72 overflow-hidden rounded-2xl border border-pine/10 bg-cream shadow-2xl">
                  <div className="border-b border-pine/10 px-4 py-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald">
                      Notifications
                    </p>
                  </div>
                  <div className="space-y-3 p-4 text-sm text-body-soft">
                    {user ? (
                      pendingCount > 0 ? (
                        <p>
                          You have <strong>{pendingCount}</strong> booking request
                          {pendingCount === 1 ? "" : "s"} awaiting review.
                        </p>
                      ) : (
                        <p>No new booking updates. Your requests will appear here.</p>
                      )
                    ) : (
                      <p>Sign in to see updates on your booking requests.</p>
                    )}
                    <Link
                      href={user ? "/dashboard#bookings" : "/login?next=/dashboard"}
                      className="inline-flex text-xs font-semibold text-emerald underline underline-offset-4"
                    >
                      {user ? "Open booking history" : "Sign in"}
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {user ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setAccountOpen((value) => !value);
                    setNotificationsOpen(false);
                  }}
                  className={`flex items-center gap-2 rounded-full border py-1 pl-1 pr-2 transition ${
                    solid ? "border-pine/15 text-pine" : "border-cream/30 text-cream"
                  }`}
                >
                  {user.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={user.avatarUrl}
                      alt=""
                      className="h-8 w-8 rounded-full object-cover"
                    />
                  ) : (
                    <span className="grid h-8 w-8 place-items-center rounded-full bg-gold text-[0.7rem] font-bold text-forest">
                      {initials(user.fullName)}
                    </span>
                  )}
                  <span className="hidden max-w-24 truncate text-xs font-medium sm:block">
                    {greetingName(user.fullName, user.role)}
                  </span>
                  <ChevronDown className="h-3.5 w-3.5 opacity-70" />
                </button>
                {accountOpen && (
                  <div className="absolute right-0 top-12 w-56 overflow-hidden rounded-2xl border border-pine/10 bg-cream py-1.5 shadow-2xl">
                    <div className="px-4 py-2">
                      <p className="truncate text-sm font-semibold text-pine">{user.fullName}</p>
                      <p className="text-[0.7rem] uppercase tracking-wider text-muted">
                        {user.role === "admin" ? "Administrator" : "Visitor"}
                      </p>
                    </div>
                    <Link href="/dashboard" className="block px-4 py-2 text-sm text-body hover:bg-pine/5">
                      My dashboard
                    </Link>
                    {user.role === "admin" && (
                      <Link href="/admin" className="block px-4 py-2 text-sm text-body hover:bg-pine/5">
                        Administrator dashboard
                      </Link>
                    )}
                    <button
                      type="button"
                      onClick={logout}
                      className="block w-full px-4 py-2 text-left text-sm text-[#8a3b2f] hover:bg-[#8a3b2f]/5"
                    >
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden items-center gap-2 sm:flex">
                <Link
                  href="/login"
                  className={`whitespace-nowrap rounded-full px-3 py-2 text-xs font-semibold transition ${
                    solid ? "text-pine hover:bg-pine/8" : "text-cream/90 hover:text-cream"
                  }`}
                >
                  Sign in
                </Link>
                <Link href="/register" className="btn btn-gold !px-4 !py-2 text-xs">
                  Join
                </Link>
              </div>
            )}

            <button
              type="button"
              onClick={() => setOpen((value) => !value)}
              aria-label="Toggle menu"
              className={`grid h-10 w-10 place-items-center rounded-full lg:hidden ${
                solid ? "text-pine" : "text-cream"
              }`}
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {searchOpen && (
          <div className="container-x animate-fade-up pb-3 pt-2">
            <form onSubmit={submitSearch} className="flex items-center gap-2 rounded-2xl border border-pine/15 bg-white px-4 py-2 shadow-xl">
              <Search className="h-4 w-4 text-emerald" />
              <input
                ref={searchRef}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search destinations, parks, museums, articles…"
                className="w-full bg-transparent py-2 text-sm outline-none"
              />
              <button type="submit" className="btn btn-forest !px-4 !py-1.5 text-xs">
                Search
              </button>
            </form>
          </div>
        )}
      </header>

      {open && (
        <div className="fixed inset-0 top-[76px] z-40 bg-forest px-6 py-8 lg:hidden">
          <nav className="flex flex-col">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="border-b border-cream/10 py-4 font-display text-2xl text-cream"
              >
                {link.label}
              </Link>
            ))}
            <Link href="/culture" className="border-b border-cream/10 py-4 font-display text-2xl text-cream">
              Culture & Heritage
            </Link>
            <Link href="/services" className="border-b border-cream/10 py-4 font-display text-2xl text-cream">
              Services
            </Link>
            {!user && (
              <div className="mt-7 flex gap-3">
                <Link href="/login" className="btn btn-outline flex-1">
                  Sign in
                </Link>
                <Link href="/register" className="btn btn-gold flex-1">
                  Create account
                </Link>
              </div>
            )}
            {user && (
              <div className="mt-7 flex gap-3">
                <Link href="/dashboard" className="btn btn-gold flex-1">
                  My dashboard
                </Link>
                <button type="button" onClick={logout} className="btn btn-outline flex-1">
                  Sign out
                </button>
              </div>
            )}
          </nav>
        </div>
      )}
    </>
  );
}
