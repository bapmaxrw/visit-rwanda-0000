import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import {
  bookings,
  destinationPrices,
  destinations,
  notifications,
  users,
} from "@/lib/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { bookingSchema } from "@/lib/validation";
import { quoteVisit, formatMoney, formatDate, CATEGORY_LABELS } from "@/lib/pricing";
import { sendMail, bookingAcknowledgement } from "@/lib/mail";
import { bookingReference } from "@/lib/utils";
import { apiError, json, serverError, validationError } from "@/lib/http";

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return apiError("Sign in to submit a booking request.", 401);

    const parsed = bookingSchema.safeParse(await request.json());
    if (!parsed.success) return validationError(parsed.error);

    const data = parsed.data;
    const db = await getDb();

    const [destination] = await db
      .select()
      .from(destinations)
      .where(eq(destinations.id, data.destinationId))
      .limit(1);

    if (!destination || !destination.published) {
      return apiError("That destination is not available.", 404);
    }

    const prices = await db
      .select()
      .from(destinationPrices)
      .where(eq(destinationPrices.destinationId, destination.id));

    // Prices are recomputed here; the browser cannot dictate an amount.
    const quote = quoteVisit(prices, {
      activity: data.activity || null,
      visitorCategory: data.visitorCategory,
      adults: data.adults,
      children: data.children,
    });

    const reference = bookingReference();
    const [booking] = await db
      .insert(bookings)
      .values({
        reference,
        userId: user.id,
        destinationId: destination.id,
        destinationName: destination.name,
        activity: data.activity || null,
        visitorCategory: data.visitorCategory,
        visitDate: data.visitDate,
        adults: data.adults,
        children: data.children,
        unitAdultPrice: quote.adultAmount,
        unitChildPrice: quote.childAmount,
        totalPrice: quote.total,
        currency: quote.currency,
        priceVerified: quote.verified,
        priceSourceUrl: quote.sourceUrl,
        specialRequests: data.specialRequests || null,
        status: "pending",
      })
      .returning();

    const visitors = `${data.adults} adult${data.adults === 1 ? "" : "s"}${
      data.children ? `, ${data.children} child${data.children === 1 ? "" : "ren"}` : ""
    }`;
    const totalLabel = quote.total != null ? formatMoney(quote.total, quote.currency) : "Quoted after verification";
    const categoryLabel = CATEGORY_LABELS[data.visitorCategory] ?? data.visitorCategory;
    const [account] = await db
      .select({ email: users.email, fullName: users.fullName })
      .from(users)
      .where(eq(users.id, user.id))
      .limit(1);

    await db.insert(notifications).values({
      type: "booking",
      title: `New booking request · ${destination.name}`,
      message: `${account?.fullName ?? user.fullName} requested ${visitors} on ${formatDate(
        data.visitDate
      )} (${categoryLabel}). Reference ${reference}. Estimated total: ${totalLabel}.`,
      bookingId: booking.id,
    });

    const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL;
    if (adminEmail) {
      await sendMail({
        to: adminEmail,
        subject: `New booking request ${reference} — ${destination.name}`,
        html: `<p>A new booking request was submitted.</p><p><strong>${reference}</strong> · ${destination.name} · ${formatDate(
          data.visitDate
        )} · ${visitors}</p><p>Estimated total: ${totalLabel}</p>`,
      });
    }

    if (account?.email) {
      await sendMail({
        to: account.email,
        subject: `Booking request ${reference} received — Visit Rwanda Academy`,
        html: bookingAcknowledgement({
          name: account.fullName,
          reference,
          destination: destination.name,
          visitDate: formatDate(data.visitDate),
          visitors,
          total: totalLabel,
          status: "Pending review",
        }),
      });
    }

    return json(
      {
        booking: {
          id: booking.id,
          reference: booking.reference,
          status: booking.status,
          destination: destination.name,
          visitDate: data.visitDate,
          total: quote.total,
          currency: quote.currency,
          verified: quote.verified,
        },
      },
      201
    );
  } catch (error) {
    return serverError(error, "booking-create");
  }
}
