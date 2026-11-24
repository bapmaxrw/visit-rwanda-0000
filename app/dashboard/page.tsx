import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { desc, eq } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { bookings } from "@/lib/db/schema";
import { DashboardClient } from "@/components/account/DashboardClient";
import { greetingName } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "My dashboard" };

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=%2Fdashboard");

  const db = await getDb();
  const rows = await db
    .select()
    .from(bookings)
    .where(eq(bookings.userId, user.id))
    .orderBy(desc(bookings.createdAt));

  return (
    <>
      <section className="relative overflow-hidden pb-28 pt-36">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url(/media/hills-2.jpg)" }}
          aria-hidden="true"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-forest/85 via-forest/70 to-cream" aria-hidden="true" />
        <div className="container-x relative z-10">
          <p className="text-[0.66rem] font-semibold uppercase tracking-[0.3em] text-gold-light">Your account</p>
          <h1 className="mt-3 font-display text-4xl text-cream sm:text-5xl">Muraho, {greetingName(user.fullName, user.role)}</h1>
          <p className="mt-3 max-w-xl text-[0.9rem] leading-relaxed text-cream/70">
            Manage your profile, review booking requests and follow their approval status.
          </p>
        </div>
      </section>

      <DashboardClient
        profile={{
          id: user.id,
          fullName: user.fullName,
          email: user.email,
          phone: user.phone,
          role: user.role,
          dateOfBirth: user.dateOfBirth,
          nationality: user.nationality,
          hasNationalId: user.hasNationalId,
          avatarUrl: user.avatarUrl,
          createdAt: user.createdAt,
          lastLoginAt: user.lastLoginAt,
        }}
        bookings={rows.map((booking) => ({
          id: booking.id,
          reference: booking.reference,
          destinationName: booking.destinationName,
          activity: booking.activity,
          visitDate: booking.visitDate,
          adults: booking.adults,
          children: booking.children,
          visitorCategory: booking.visitorCategory,
          totalPrice: booking.totalPrice,
          currency: booking.currency,
          priceVerified: booking.priceVerified,
          status: booking.status,
          adminNote: booking.adminNote,
          createdAt: booking.createdAt,
        }))}
      />
    </>
  );
}
