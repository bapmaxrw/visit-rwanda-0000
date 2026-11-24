"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, CalendarCheck, MapPinned, Users, Newspaper, Inbox, Film, UserRoundSearch } from "lucide-react";

const items = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/bookings", label: "Bookings", icon: CalendarCheck },
  { href: "/admin/users", label: "Visitor accounts", icon: UserRoundSearch },
  { href: "/admin/messages", label: "Enquiries", icon: Inbox },
  { href: "/admin/destinations", label: "Destinations", icon: MapPinned },
  { href: "/admin/people", label: "People & teams", icon: Users },
  { href: "/admin/content", label: "Content", icon: Newspaper },
  { href: "/admin/videos", label: "Background films", icon: Film },
];

export function AdminNav({ horizontal = false }: { horizontal?: boolean }) {
  const pathname = usePathname();

  if (horizontal) {
    return (
      <nav className="flex gap-2">
        {items.map(({ href, label, icon: Icon }) => {
          const active = href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-2 text-[0.72rem] font-medium ${
                active ? "bg-pine text-cream" : "bg-white text-body-soft"
              }`}
            >
              <Icon className="h-3.5 w-3.5" /> {label}
            </Link>
          );
        })}
      </nav>
    );
  }

  return (
    <nav className="mt-3 space-y-1">
      {items.map(({ href, label, icon: Icon }) => {
        const active = href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-[0.8rem] font-medium transition ${
              active ? "bg-pine text-cream" : "text-body-soft hover:bg-pine/5 hover:text-pine"
            }`}
          >
            <Icon className="h-4 w-4" /> {label}
          </Link>
        );
      })}
    </nav>
  );
}
