import { destroyCurrentSession } from "@/lib/auth";
import { json, serverError } from "@/lib/http";

export async function POST() {
  try {
    await destroyCurrentSession();
    return json({ ok: true });
  } catch (error) {
    return serverError(error, "logout");
  }
}
