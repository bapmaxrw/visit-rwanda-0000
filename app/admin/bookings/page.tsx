import { desc, eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { bookings, users } from "@/lib/db/schema";
import { BookingsManager } from "@/components/admin/BookingsManager";

export const dynamic = "force-dynamic";

export default async function AdminBookingsPage() {
  const db = await getDb();
  const rows = await db
    .select({
      id: bookings.id,
      reference: bookings.reference,
      destinationName: bookings.destinationName,
      activity: bookings.activity,
      visitDate: bookings.visitDate,
      adults: bookings.adults,
      children: bookings.children,
      visitorCategory: bookings.visitorCategory,
      totalPrice: bookings.totalPrice,
      currency: bookings.currency,
      priceVerified: bookings.priceVerified,
      status: bookings.status,
      adminNote: bookings.adminNote,
      specialRequests: bookings.specialRequests,
      createdAt: bookings.createdAt,
      visitorName: users.fullName,
      visitorEmail: users.email,
      visitorPhone: users.phone,
    })
    .from(bookings)
    .innerJoin(users, eq(users.id, bookings.userId))
    .orderBy(desc(bookings.createdAt));

  return (
    <div className="space-y-5">
      <header>
        <p className="eyebrow">Bookings</p>
        <h1 className="mt-1 font-display text-3xl text-pine">Approve and reject requests</h1>
        <p className="mt-1 text-[0.82rem] text-muted">
          Visitor contact details are visible only inside this administrator area.
        </p>
      </header>
      <BookingsManager bookings={rows} />
    </div>
  );
}
