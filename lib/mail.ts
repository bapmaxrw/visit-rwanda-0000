/**
 * Transactional email. Uses Resend when RESEND_API_KEY is configured;
 * otherwise messages are logged and kept in the admin notification inbox so
 * no booking is ever silently lost in development.
 */
type MailInput = { to: string; subject: string; html: string; text?: string };

export async function sendMail({ to, subject, html, text }: MailInput) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.MAIL_FROM ?? "Visit Rwanda Academy <onboarding@resend.dev>";

  if (!apiKey) {
    console.info(`[mail:dev] To: ${to} | ${subject}`);
    return { delivered: false, reason: "RESEND_API_KEY not configured" as const };
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from, to: [to], subject, html, text: text ?? html.replace(/<[^>]+>/g, " ") }),
    });
    if (!res.ok) {
      console.error(`[mail] provider error ${res.status}: ${await res.text()}`);
      return { delivered: false, reason: "provider-error" as const };
    }
    return { delivered: true as const };
  } catch (error) {
    console.error("[mail] unexpected failure", error);
    return { delivered: false, reason: "network-error" as const };
  }
}

const shell = (title: string, body: string) => `
  <div style="font-family:Inter,Arial,sans-serif;background:#f6f4ec;padding:32px">
    <div style="max-width:560px;margin:auto;background:#fff;border-radius:18px;overflow:hidden;border:1px solid #e6e1d3">
      <div style="background:#0b3d2e;padding:22px 28px;color:#f4d58d;font-size:18px;letter-spacing:.08em">
        VISIT RWANDA ACADEMY
      </div>
      <div style="padding:28px;color:#12241f;line-height:1.65">
        <h1 style="font-size:21px;margin:0 0 12px;color:#0b3d2e">${title}</h1>
        ${body}
      </div>
      <div style="padding:18px 28px;background:#fbf9f3;color:#6b7d76;font-size:12px">
        Visit Rwanda Academy · Kigali, Rwanda · This is an automated message.
      </div>
    </div>
  </div>`;

export function enquiryAcknowledgement(params: {
  name: string;
  reference: string;
  subject: string;
  message: string;
}) {
  return shell(
    "We have received your message",
    `<p>Dear ${params.name},</p>
     <p>Thank you for contacting Visit Rwanda Academy. Your enquiry has been logged and our tourism team will reply to this address.</p>
     <table style="width:100%;border-collapse:collapse;margin:18px 0;font-size:14px">
       <tr><td style="padding:8px 0;color:#6b7d76">Reference</td><td style="padding:8px 0;font-weight:600">${params.reference}</td></tr>
       <tr><td style="padding:8px 0;color:#6b7d76">Subject</td><td style="padding:8px 0;font-weight:600">${params.subject}</td></tr>
     </table>
     <p style="color:#6b7d76;font-size:13px;white-space:pre-line">${params.message}</p>
     <p style="margin-top:18px">For urgent permit questions, quote your reference when you call the Rwanda Development Board tourism desk.</p>
     <p style="margin-top:22px">Murakoze — thank you.</p>`
  );
}

export function enquiryReply(params: { name: string; reference: string; subject: string; reply: string }) {
  return shell(
    "Reply to your enquiry",
    `<p>Dear ${params.name},</p>
     <p>Our tourism team has replied to your enquiry <strong>${params.reference}</strong> — ${params.subject}.</p>
     <div style="margin:18px 0;padding:16px;background:#f7f5ee;border-left:3px solid #c9a44c;border-radius:8px;white-space:pre-line">${params.reply}</div>
     <p>You can reply directly to this email if you need anything else.</p>
     <p style="margin-top:22px">Murakoze — thank you.</p>`
  );
}

export function bookingAcknowledgement(params: {
  name: string;
  reference: string;
  destination: string;
  visitDate: string;
  visitors: string;
  total: string;
  status: string;
}) {
  return shell(
    "Your booking request has been received",
    `<p>Dear ${params.name},</p>
     <p>Thank you for choosing Rwanda. We have received your booking request and our tourism team will review it shortly.</p>
     <table style="width:100%;border-collapse:collapse;margin:18px 0;font-size:14px">
       <tr><td style="padding:8px 0;color:#6b7d76">Reference</td><td style="padding:8px 0;font-weight:600">${params.reference}</td></tr>
       <tr><td style="padding:8px 0;color:#6b7d76">Destination</td><td style="padding:8px 0;font-weight:600">${params.destination}</td></tr>
       <tr><td style="padding:8px 0;color:#6b7d76">Visit date</td><td style="padding:8px 0;font-weight:600">${params.visitDate}</td></tr>
       <tr><td style="padding:8px 0;color:#6b7d76">Visitors</td><td style="padding:8px 0;font-weight:600">${params.visitors}</td></tr>
       <tr><td style="padding:8px 0;color:#6b7d76">Estimated official price</td><td style="padding:8px 0;font-weight:600">${params.total}</td></tr>
       <tr><td style="padding:8px 0;color:#6b7d76">Status</td><td style="padding:8px 0;font-weight:600">${params.status}</td></tr>
     </table>
     <p>Track the status of this request at any time from your account dashboard.</p>
     <p style="margin-top:22px">Murakoze — thank you.</p>`
  );
}
