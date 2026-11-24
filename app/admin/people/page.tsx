import { asc } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { institutions, personnel, services } from "@/lib/db/schema";
import { adminResources } from "@/lib/admin-config";
import { ResourceTabs } from "@/components/admin/ResourceManager";
import { TeamPortraitManager } from "@/components/admin/TeamPortraitManager";

export const dynamic = "force-dynamic";

export default async function AdminPeoplePage() {
  const db = await getDb();
  const [people, culture, experiences] = await Promise.all([
    db.select().from(personnel).orderBy(asc(personnel.kind), asc(personnel.sortOrder)),
    db.select().from(institutions).orderBy(asc(institutions.sortOrder)),
    db.select().from(services).orderBy(asc(services.sortOrder)),
  ]);

  return (
    <div className="space-y-5">
      <header>
        <p className="eyebrow">People & teams</p>
        <h1 className="mt-1 font-display text-3xl text-pine">Directories and institutions</h1>
        <p className="mt-1 max-w-2xl text-[0.82rem] text-muted">
          Publish a person only with a confirming source. Where an individual cannot be verified, leave
          the name blank and present the department instead.
        </p>
      </header>

      <TeamPortraitManager
        developers={people
          .filter((person) => person.kind === "developer")
          .map((person) => ({
            id: person.id,
            name: person.name ?? "Developer",
            title: person.title,
            photoUrl: person.photoUrl,
          }))}
      />

      <ResourceTabs
        managers={[
          {
            resource: "personnel",
            label: "People & teams",
            description: adminResources.personnel.description,
            fields: adminResources.personnel.fields,
            rows: people,
          },
          {
            resource: "institutions",
            label: "Cultural institutions",
            description: adminResources.institutions.description,
            fields: adminResources.institutions.fields,
            rows: culture,
          },
          {
            resource: "services",
            label: "Tourism services",
            description: adminResources.services.description,
            fields: adminResources.services.fields,
            rows: experiences,
          },
        ]}
      />
    </div>
  );
}
