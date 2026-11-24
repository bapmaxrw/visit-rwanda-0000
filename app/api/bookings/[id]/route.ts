import { and, eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { bookings, notifications } from "@/lib/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { apiError, json, serverError } from "@/lib/http";

/** Visitors may cancel their own pending requests only. */
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser();
    if (!user) return apiError("Please sign in.", 401);
    const { id } = await params;

    const payload = (await request.json().catch(() => ({}))) as { action?: string };
    if (payload.action !== "cancel") return apiError("Unsupported action.", 400);

    const db = await getDb();
    const [booking] = await db
      .select()
      .from(bookings)
      .where(and(eq(bookings.id, id), eq(bookings.userId, user.id)))
      .limit(1);

    if (!booking) return apiError("Booking not found.", 404);
    if (booking.status !== "pending") {
      return apiError("Only pending booking requests can be cancelled.", 409);
    }

    await db
      .update(bookings)
      .set({ status: "cancelled", updatedAt: new Date() })
      .where(eq(bookings.id, id));

    await db.insert(notifications).values({
      type: "booking",
      title: `Booking cancelled · ${booking.destinationName}`,
      message: `${user.fullName} cancelled booking ${booking.reference}.`,
      bookingId: booking.id,
    });

    return json({ ok: true });
  } catch (error) {
    return serverError(error, "booking-cancel");
  }
}
