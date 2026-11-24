import { desc } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { enquiries } from "@/lib/db/schema";
import { EnquiriesManager } from "@/components/admin/EnquiriesManager";

export const dynamic = "force-dynamic";

export default async function AdminMessagesPage() {
  const db = await getDb();
  const rows = await db.select().from(enquiries).orderBy(desc(enquiries.createdAt));

  return (
    <div className="space-y-5">
      <header>
        <p className="eyebrow">Visitor contact</p>
        <h1 className="mt-1 font-display text-3xl text-pine">Enquiries inbox</h1>
        <p className="mt-1 max-w-2xl text-[0.82rem] text-muted">
          Messages sent from the contact page. Replying stores the answer, emails the visitor and
          keeps the exchange as a record.
        </p>
      </header>

      <EnquiriesManager enquiries={rows} />
    </div>
  );
}
