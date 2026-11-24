import { asc } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { destinationPrices, destinations } from "@/lib/db/schema";
import { adminResources } from "@/lib/admin-config";
import { ResourceTabs } from "@/components/admin/ResourceManager";

export const dynamic = "force-dynamic";

export default async function AdminDestinationsPage() {
  const db = await getDb();
  const [destinationRows, priceRows] = await Promise.all([
    db.select().from(destinations).orderBy(asc(destinations.sortOrder)),
    db.select().from(destinationPrices).orderBy(asc(destinationPrices.sortOrder)),
  ]);

  const options = destinationRows.map((row) => ({ id: row.id, name: row.name }));

  return (
    <div className="space-y-5">
      <header>
        <p className="eyebrow">Destinations</p>
        <h1 className="mt-1 font-display text-3xl text-pine">Profiles and official prices</h1>
        <p className="mt-1 max-w-2xl text-[0.82rem] text-muted">
          Add official fees with their source URL and verification date. Anything not verified stays
          hidden from visitors.
        </p>
      </header>

      <ResourceTabs
        managers={[
          {
            resource: "destinations",
            label: "Destination profiles",
            description: adminResources.destinations.description,
            fields: adminResources.destinations.fields,
            rows: destinationRows,
          },
          {
            resource: "prices",
            label: "Official prices",
            description: adminResources.prices.description,
            fields: adminResources.prices.fields,
            rows: priceRows,
            destinations: options,
          },
        ]}
      />
    </div>
  );
}
