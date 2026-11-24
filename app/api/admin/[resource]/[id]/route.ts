import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { bookings, enquiries, notifications, siteSettings, users } from "@/lib/db/schema";
import { enquiryReply, sendMail } from "@/lib/mail";
import { formatDate, formatMoney, CATEGORY_LABELS } from "@/lib/pricing";
import { apiError, databaseError, json } from "@/lib/http";
import { RESOURCE_TABLES, guardAdmin, isResourceKey, sanitizeRow } from "@/lib/admin-api";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ resource: string; id: string }> }
) {
  try {
    const guard = await guardAdmin();
    if (guard.error) return guard.error;

    const { resource, id } = await params;
    if (!isResourceKey(resource)) return apiError("Unknown resource.", 404);
    const body = (await request.json()) as Record<string, unknown>;
    const db = await getDb();

    if (resource === "settings") {
      const value = String(body.value ?? "").trim();
      await db
        .insert(siteSettings)
        .values({ key: id, value, updatedAt: new Date() })
        .onConflictDoUpdate({ target: siteSettings.key, set: { value, updatedAt: new Date() } });
      return json({ ok: true });
    }

    if (resource === "bookings") {
      return updateBooking(id, body);
    }

    if (resource === "enquiries") {
      return updateEnquiry(id, body);
    }

    const table = RESOURCE_TABLES[resource];
    const values = sanitizeRow(table, body);
    const rows = (await db
      .update(table as never)
      .set(values as never)
      .where(eq((table as unknown as { id: never }).id, id as never))
      .returning()) as Record<string, unknown>[];
    return json({ row: rows[0] });
  } catch (error) {
    return databaseError(error, "admin-update");
  }
}

async function updateEnquiry(id: string, body: Record<string, unknown>) {
  const status = typeof body.status === "string" ? body.status : undefined;
  const reply = typeof body.adminReply === "string" ? body.adminReply.trim() : undefined;

  if (status && !["new", "read", "replied", "closed"].includes(status)) {
    return apiError("Invalid enquiry status.");
  }
  if (reply !== undefined && reply.length > 4000) {
    return apiError("Please keep the reply under 4000 characters.");
  }

  const db = await getDb();
  const [enquiry] = await db.select().from(enquiries).where(eq(enquiries.id, id)).limit(1);
  if (!enquiry) return apiError("Enquiry not found.", 404);

  const shouldReply = Boolean(reply) && status === "replied" && reply !== enquiry.adminReply;

  await db
    .update(enquiries)
    .set({
      ...(status ? { status } : {}),
      ...(reply !== undefined ? { adminReply: reply || null } : {}),
      ...(shouldReply ? { repliedAt: new Date() } : {}),
      updatedAt: new Date(),
    })
    .where(eq(enquiries.id, id));

  if (shouldReply && reply) {
    const delivery = await sendMail({
      to: enquiry.email,
      subject: `Re: ${enquiry.subject} (${enquiry.reference})`,
      html: enquiryReply({
        name: enquiry.name,
        reference: enquiry.reference,
        subject: enquiry.subject,
        reply,
      }),
    });
    return json({ ok: true, delivered: delivery.delivered });
  }

  return json({ ok: true });
}

async function updateBooking(id: string, body: Record<string, unknown>) {
  const status = typeof body.status === "string" ? body.status : undefined;
  const adminNote = typeof body.adminNote === "string" ? body.adminNote : undefined;
  if (status && !["pending", "approved", "rejected", "cancelled"].includes(status)) {
    return apiError("Invalid booking status.");
  }

  const db = await getDb();
  const [booking] = await db.select().from(bookings).where(eq(bookings.id, id)).limit(1);
  if (!booking) return apiError("Booking not found.", 404);

  await db
    .update(bookings)
    .set({
      ...(status ? { status } : {}),
      ...(adminNote !== undefined ? { adminNote } : {}),
      updatedAt: new Date(),
    })
    .where(eq(bookings.id, id));

  if (status && status !== booking.status) {
    const [visitor] = await db
      .select({ email: users.email, fullName: users.fullName })
      .from(users)
      .where(eq(users.id, booking.userId))
      .limit(1);

    await db.insert(notifications).values({
      type: "booking",
      title: `Booking ${status} · ${booking.reference}`,
      message: `${visitor?.fullName ?? "Visitor"} · ${booking.destinationName} · ${formatDate(booking.visitDate)}.`,
      bookingId: booking.id,
      read: true,
    });

    if (visitor?.email) {
      const summary = `${booking.reference} · ${booking.destinationName} · ${formatDate(
        booking.visitDate
      )} · ${booking.adults} adult(s)${booking.children ? `, ${booking.children} child(ren)` : ""} · ${
        CATEGORY_LABELS[booking.visitorCategory] ?? booking.visitorCategory
      }${booking.totalPrice != null ? ` · ${formatMoney(booking.totalPrice, booking.currency)}` : ""}`;
      await sendMail({
        to: visitor.email,
        subject: `Your booking ${booking.reference} is ${status}`,
        html: `<p>Dear ${visitor.fullName},</p><p>Your booking request has been <strong>${status}</strong>.</p><p>${summary}</p>${
          adminNote ? `<p>Note from the team: ${adminNote}</p>` : ""
        }<p>You can review it in your Visit Rwanda Academy dashboard.</p>`,
      });
    }
  }

  return json({ ok: true });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ resource: string; id: string }> }
) {
  try {
    const guard = await guardAdmin();
    if (guard.error) return guard.error;

    const { resource, id } = await params;
    if (!isResourceKey(resource)) return apiError("Unknown resource.", 404);
    const db = await getDb();

    if (resource === "settings") {
      await db.delete(siteSettings).where(eq(siteSettings.key, id));
      return json({ ok: true });
    }
    if (resource === "bookings") return apiError("Bookings are kept as an audit record.", 400);
    if (resource === "enquiries") return apiError("Enquiries are kept as an audit record.", 400);

    const table = RESOURCE_TABLES[resource];
    await db
      .delete(table as never)
      .where(eq((table as unknown as { id: never }).id, id as never));
    return json({ ok: true });
  } catch (error) {
    return databaseError(error, "admin-delete");
  }
}
