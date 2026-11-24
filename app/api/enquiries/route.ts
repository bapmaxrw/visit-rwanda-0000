import { getDb } from "@/lib/db";
import { enquiries, notifications } from "@/lib/db/schema";
import { enquirySchema, ENQUIRY_TOPICS } from "@/lib/validation";
import { enquiryAcknowledgement, sendMail } from "@/lib/mail";
import { apiError, json, normalizePhone, serverError, validationError } from "@/lib/http";

function enquiryReference() {
  const stamp = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const suffix = Math.random().toString(36).slice(2, 7).toUpperCase();
  return `ENQ-${stamp}-${suffix}`;
}

export async function POST(request: Request) {
  try {
    const parsed = enquirySchema.safeParse(await request.json().catch(() => ({})));
    if (!parsed.success) return validationError(parsed.error);

    const data = parsed.data;
    const db = await getDb();
    const reference = enquiryReference();
    const topicLabel =
      ENQUIRY_TOPICS.find((topic) => topic.value === data.topic)?.label ?? "General enquiry";

    const [enquiry] = await db
      .insert(enquiries)
      .values({
        reference,
        name: data.name,
        email: data.email,
        phone: data.phone ? normalizePhone(data.phone) : null,
        topic: data.topic,
        subject: data.subject,
        message: data.message,
        status: "new",
      })
      .returning();

    await db.insert(notifications).values({
      type: "enquiry",
      title: `New enquiry · ${topicLabel}`,
      message: `${data.name} (${data.email}) — ${data.subject}. Reference ${reference}.`,
    });

    const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL;
    if (adminEmail) {
      await sendMail({
        to: adminEmail,
        subject: `New enquiry ${reference} — ${data.subject}`,
        html: `<p><strong>${data.name}</strong> · ${data.email}${
          data.phone ? ` · ${data.phone}` : ""
        }</p><p>Topic: ${topicLabel}</p><p>${data.message.replace(/\n/g, "<br />")}</p>`,
      });
    }

    await sendMail({
      to: data.email,
      subject: `We received your message ${reference} — Visit Rwanda Academy`,
      html: enquiryAcknowledgement({
        name: data.name,
        reference,
        subject: data.subject,
        message: data.message,
      }),
    });

    return json(
      {
        enquiry: {
          id: enquiry.id,
          reference: enquiry.reference,
          status: enquiry.status,
          topic: topicLabel,
        },
      },
      201
    );
  } catch (error) {
    return serverError(error, "enquiry-create");
  }
}

export async function GET() {
  return apiError("Method not allowed.", 405);
}
