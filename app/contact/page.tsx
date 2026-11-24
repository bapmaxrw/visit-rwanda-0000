import type { Metadata } from "next";
import Link from "next/link";
import { Clock, Mail, MapPin, Phone, ShieldCheck } from "lucide-react";
import { PageHero } from "@/components/site/PageHero";
import { ContactForm } from "@/components/site/ContactForm";
import { Reveal } from "@/components/site/Reveal";

export const metadata: Metadata = {
  title: "Contact us",
  description:
    "Contact Visit Rwanda Academy about destinations, permits, bookings, partnerships, press or accessibility support.",
};

const channels = [
  {
    icon: Mail,
    label: "Tourism enquiries",
    value: "info@rdb.rw",
    href: "mailto:info@rdb.rw",
    note: "Rwanda Development Board tourism desk",
  },
  {
    icon: Phone,
    label: "Telephone",
    value: "+250 727 775 170",
    href: "tel:+250727775170",
    note: "Rwanda Development Board",
  },
  {
    icon: MapPin,
    label: "Head office",
    value: "Kigali, Rwanda",
    href: "https://www.rdb.rw",
    note: "Rwanda Development Board",
  },
  {
    icon: Clock,
    label: "Response time",
    value: "Within 2 business days",
    href: null,
    note: "Monday to Friday, East Africa Time",
  },
];

export default function ContactPage() {
  return (
    <>
      <PageHero
        eyebrow="Talk to the tourism team"
        title="How can we help you plan?"
        description="Questions about a destination, permits, an existing booking request or accessibility support — send a message and our team will reply."
      />

      <section className="container-x py-16">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {channels.map(({ icon: Icon, label, value, href, note }, index) => (
            <Reveal key={label} delay={index * 70}>
              <div className="h-full rounded-2xl border border-pine/10 bg-white p-5">
                <Icon className="h-5 w-5 text-emerald" />
                <p className="mt-3 text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-faint">
                  {label}
                </p>
                {href ? (
                  <a
                    href={href}
                    className="mt-1 block text-[0.9rem] font-medium text-pine hover:text-emerald"
                  >
                    {value}
                  </a>
                ) : (
                  <p className="mt-1 text-[0.9rem] font-medium text-pine">{value}</p>
                )}
                <p className="mt-1 text-[0.7rem] text-label">{note}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <div className="mt-12 grid gap-10 lg:grid-cols-[1.2fr_1fr] lg:items-start">
          <div>
            <h2 className="font-display text-2xl text-pine sm:text-3xl">Send us a message</h2>
            <p className="mt-2 max-w-xl text-[0.86rem] leading-relaxed text-body-soft">
              Every message receives a reference number and a copy by email, so you can follow up
              without repeating yourself. If you already have a booking request, include its
              reference (for example <span className="font-mono">VR-20261118-39CU6</span>).
            </p>
            <div className="mt-6">
              <ContactForm />
            </div>
          </div>

          <aside className="space-y-4">
            <div className="rounded-2xl border border-pine/10 bg-sand/50 p-6">
              <h3 className="font-display text-lg text-pine">Before you write</h3>
              <ul className="mt-3 space-y-3 text-[0.8rem] leading-relaxed text-body-soft">
                <li>
                  <strong className="text-pine">Permits and prices.</strong> Gorilla and park permits
                  are issued by the Rwanda Development Board. Only prices marked as officially
                  verified on this site should be treated as current — reconfirm with the destination
                  before paying.
                </li>
                <li>
                  <strong className="text-pine">Booking requests.</strong> Use your dashboard to
                  cancel a pending request, or{" "}
                  <Link href="/dashboard" className="font-semibold text-emerald hover:underline">
                    review its status
                  </Link>
                  .
                </li>
                <li>
                  <strong className="text-pine">Accessibility.</strong> Tell us about mobility,
                  dietary or medical requirements and we will pass them to the destination team.
                </li>
              </ul>
            </div>

            <div className="rounded-2xl border border-pine/10 bg-white p-6">
              <h3 className="flex items-center gap-2 font-display text-lg text-pine">
                <ShieldCheck className="h-4 w-4 text-emerald" /> Official institutions
              </h3>
              <ul className="mt-3 space-y-2 text-[0.8rem]">
                <li>
                  <a
                    href="https://www.rdb.rw"
                    target="_blank"
                    rel="noreferrer"
                    className="font-medium text-emerald hover:underline"
                  >
                    Rwanda Development Board — rdb.rw
                  </a>
                  <span className="block text-[0.7rem] text-label">
                    Tourism, national parks and permits
                  </span>
                </li>
                <li>
                  <a
                    href="https://www.rwandaheritage.gov.rw"
                    target="_blank"
                    rel="noreferrer"
                    className="font-medium text-emerald hover:underline"
                  >
                    Rwanda Cultural Heritage Academy — rwandaheritage.gov.rw
                  </a>
                  <span className="block text-[0.7rem] text-label">
                    Museums, heritage sites and archives
                  </span>
                </li>
              </ul>
            </div>

            <p className="text-[0.7rem] leading-relaxed text-faint">
              Visit Rwanda Academy is an information and booking-request platform. It does not issue
              permits or collect payment on behalf of destinations.
            </p>
          </aside>
        </div>
      </section>
    </>
  );
}
