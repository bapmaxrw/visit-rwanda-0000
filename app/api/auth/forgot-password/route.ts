import { randomBytes } from "node:crypto";
import { z } from "zod";
import { getDb } from "@/lib/db";
import { passwordResetTokens } from "@/lib/db/schema";
import { findUserByIdentifier, hashToken } from "@/lib/auth";
import { sendMail } from "@/lib/mail";
import { json, serverError, validationError } from "@/lib/http";

const schema = z.object({ identifier: z.string().trim().min(3) });

export async function POST(request: Request) {
  try {
    const parsed = schema.safeParse(await request.json());
    if (!parsed.success) return validationError(parsed.error);

    const user = await findUserByIdentifier(parsed.data.identifier);
    const db = await getDb();

    // Always return the same response so accounts cannot be enumerated.
    if (user) {
      const token = randomBytes(32).toString("base64url");
      await db.insert(passwordResetTokens).values({
        userId: user.id,
        tokenHash: hashToken(token),
        expiresAt: new Date(Date.now() + 60 * 60 * 1000),
      });
      const origin = process.env.NEXT_PUBLIC_SITE_URL ?? new URL(request.url).origin;
      const link = `${origin}/reset-password?token=${token}`;
      const result = await sendMail({
        to: user.email,
        subject: "Reset your Visit Rwanda Academy password",
        html: `<p>Hello ${user.fullName},</p><p>Use the link below to reset your password. It expires in one hour.</p><p><a href="${link}">${link}</a></p><p>If you did not request this, you can ignore this email.</p>`,
      });
      if (!result.delivered) console.info(`[password-reset] ${user.email}: ${link}`);
      const isProduction = process.env.NODE_ENV === "production";
      return json({
        ok: true,
        message: "If an account matches those details, a password reset link has been sent.",
        // Development convenience only: email delivery is not configured locally.
        devResetUrl: isProduction ? undefined : link,
      });
    }

    return json({
      ok: true,
      message: "If an account matches those details, a password reset link has been sent.",
    });
  } catch (error) {
    return serverError(error, "forgot-password");
  }
}
