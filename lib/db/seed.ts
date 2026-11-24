import type { Database } from "./index";
import { count, eq } from "drizzle-orm";
import {
  articles,
  destinationPrices,
  destinations,
  galleryImages,
  institutions,
  personnel,
  services,
  siteSettings,
  users,
  videoAssets,
} from "./schema";
import { SCENE_ORDER, SCENE_LABELS, SCENES } from "../video-scenes";
import { hashPassword } from "../password";

const VERIFIED_ON = "2026-11-18";

const RDB_CONTACT = {
  contactEmail: "info@rdb.rw",
  contactPhone: "+250 727 775 170",
  website: "https://www.visitrwanda.com",
};

const PARK_ENTRY_REQUIREMENTS =
  "Advance registration at the park reception is required. Bring a passport or national ID matching the visitor category selected, wear closed walking shoes and carry rain protection. Children below the published minimum age cannot join primate tracking.";

export async function ensureSeeded(db: Database) {
  const [row] = await db.select({ value: count() }).from(destinations);
  if (Number(row?.value ?? 0) === 0) {
    await seedContent(db);
  }
  await ensureVideoScenes(db);
  await ensureAdmin(db);
}

/** Seeds the default background films once; administrators manage them afterwards. */
async function ensureVideoScenes(db: Database) {
  const [row] = await db.select({ value: count() }).from(videoAssets);
  if (Number(row?.value ?? 0) > 0) return;

  await db.insert(videoAssets).values(
    SCENE_ORDER.map((section, index) => ({
      section,
      title: SCENE_LABELS[section],
      description: "Default cinematic scene shipped with the platform.",
      videoUrl: SCENES[section].video,
      posterUrl: SCENES[section].poster,
      enabled: true,
      sortOrder: index,
    }))
  );
}

async function seedContent(db: Database) {
  const inserted = await db
    .insert(destinations)
    .values([
      {
        slug: "volcanoes-national-park",
        name: "Volcanoes National Park",
        tagline: "Mountain gorillas in the mist",
        category: "National Parks",
        parkSlug: "volcanoes-national-park",
        province: "Northern Province",
        district: "Musanze",
        location: "Musanze District, Northern Province",
        description:
          "Rwanda's most famous protected area: five volcanoes, dense bamboo forest and the mountain gorilla families that made Rwanda a global conservation destination.",
        longDescription:
          "Volcanoes National Park protects the Rwandan side of the Virunga massif, a chain of volcanic peaks shared with Uganda and the Democratic Republic of Congo. The park is the reason thousands of visitors travel to Rwanda each year: guided gorilla trekking places small groups in the presence of habituated mountain gorilla families for one carefully managed hour. Golden monkeys move through the bamboo belt, while trails climb Mount Bisoke's crater lake, Mount Muhabura and the slopes around Dian Fossey's former research station. Community tourism enterprises at the park boundary add craft, dance and coffee experiences to a visit.",
        activities: [
          "Mountain gorilla trekking",
          "Golden monkey tracking",
          "Mount Bisoke crater hike",
          "Dian Fossey tomb hike",
          "Guided nature walks",
          "Community cultural experiences",
        ],
        services: [
          "Gorilla permits",
          "Licensed guides and porters",
          "Park reception and registration",
          "Community tourism experiences",
        ],
        contactEmail: RDB_CONTACT.contactEmail,
        contactPhone: RDB_CONTACT.contactPhone,
        website: "https://www.visitrwanda.com/destinations/volcanoes-national-park/",
        bookingRequirements: PARK_ENTRY_REQUIREMENTS,
        importantInfo:
          "Gorilla trekking permits are limited and issued per visitor per day. The minimum age is 15. Trekking can take several hours on steep, muddy ground; porters can be hired at the trailhead.",
        heroImage: "/media/volcanoes.jpg",
        cardImage: "/media/gorilla.jpg",
        gallery: ["/media/volcanoes.jpg", "/media/gorilla.jpg", "/media/bamboo.jpg", "/media/gorilla-portrait.jpg"],
        featured: true,
        sortOrder: 1,
      },
      {
        slug: "akagera-national-park",
        name: "Akagera National Park",
        tagline: "Big Five safari country on the eastern savannah",
        category: "National Parks",
        parkSlug: "akagera-national-park",
        province: "Eastern Province",
        district: "Kayonza",
        location: "Kayonza District, Eastern Province",
        description:
          "Lakes, papyrus swamps and rolling savannah along the Tanzanian border, home to lion, elephant, rhino, buffalo and leopard.",
        longDescription:
          "Akagera is a conservation success story. Managed through a partnership between the Rwanda Development Board and African Parks, the park restored lion and rhino populations and now offers classic East African safari experiences within a three-hour drive of Kigali. Game drives cross open grassland and acacia woodland; boat safaris on Lake Ihema pass hippos, crocodiles and some of the 480 recorded bird species. Community-run camps and lodges sit inside and around the park.",
        activities: [
          "Game drives",
          "Boat safaris on Lake Ihema",
          "Bird watching",
          "Night drives",
          "Wildlife photography",
          "Behind-the-scenes conservation tours",
        ],
        services: ["Safari guides", "Boat safaris", "Park entry permits", "Camping and lodge accommodation"],
        contactEmail: RDB_CONTACT.contactEmail,
        contactPhone: RDB_CONTACT.contactPhone,
        website: "https://www.visitakagera.org/",
        bookingRequirements:
          "Park entry is paid per visitor per day or night inside the park. Self-drive visitors pay a vehicle fee and may hire a park guide. Boat safaris and night drives must be booked with the park operator.",
        importantInfo:
          "The park is malarial: take normal precautions. Gates open for day visitors between sunrise and late afternoon; confirm current gate times with the park before travelling.",
        heroImage: "/media/akagera.jpg",
        cardImage: "/media/giraffe.jpg",
        gallery: ["/media/akagera.jpg", "/media/elephants.jpg", "/media/giraffe.jpg"],
        featured: true,
        sortOrder: 2,
      },
      {
        slug: "nyungwe-national-park",
        name: "Nyungwe National Park",
        tagline: "An ancient rainforest above the clouds",
        category: "National Parks",
        parkSlug: "nyungwe-national-park",
        province: "Western Province",
        district: "Nyamagabe",
        location: "Nyamagabe and Rusizi Districts, South-West Rwanda",
        description:
          "One of Africa's oldest montane rainforests, with chimpanzees, colobus monkeys, a canopy walkway and hundreds of endemic species.",
        longDescription:
          "Nyungwe's mist-covered ridges hold one of the largest remaining montane rainforests in East Africa. Thirteen primate species live here, including chimpanzees and the large troops of Ruwenzori colobus that move through the canopy. Visitors walk the suspended canopy walkway above the treetops, follow forest trails to waterfalls, track chimpanzees at dawn or join specialist birding walks. Tea fields and community cooperatives surround the park.",
        activities: [
          "Canopy walkway",
          "Chimpanzee tracking",
          "Colobus monkey trekking",
          "Waterfall and nature trails",
          "Bird watching",
          "Tea plantation experiences",
        ],
        services: ["Guide services", "Canopy walkway tickets", "Park entry permits", "Research and conservation programmes"],
        contactEmail: RDB_CONTACT.contactEmail,
        contactPhone: RDB_CONTACT.contactPhone,
        website: "https://www.visitnyungwe.org/",
        bookingRequirements:
          "Chimpanzee tracking and canopy walkway places are limited and should be reserved in advance. Comfortable walking shoes and rain protection are essential; the forest is wet throughout the year.",
        importantInfo:
          "Trails vary in difficulty and altitude. Chimpanzee tracking requires a reasonable level of fitness and starts early in the morning.",
        heroImage: "/media/nyungwe.jpg",
        cardImage: "/media/canopy.jpg",
        gallery: ["/media/nyungwe.jpg", "/media/canopy.jpg", "/media/hills-2.jpg"],
        featured: true,
        sortOrder: 3,
      },
      {
        slug: "gishwati-mukura-national-park",
        name: "Gishwati-Mukura National Park",
        tagline: "Rwanda's youngest national park",
        category: "National Parks",
        parkSlug: "gishwati-mukura-national-park",
        province: "Western Province",
        district: "Rutsiro",
        location: "Rutsiro and Nyabihu Districts, Western Province",
        description:
          "A restored forest landscape in Rwanda's Congo Nile Divide, important for chimpanzees, golden monkeys and community-led reforestation.",
        longDescription:
          "Gishwati-Mukura became a national park in 2015, protecting two forest blocks that had been reduced by farming and livestock. Restoration work has reconnected habitat for chimpanzees, golden monkeys and more than 130 bird species. Visits are intimate and guided: forest walks, birding, community experiences and conservation talks with the teams rebuilding the landscape. It is a quieter alternative to the larger parks and a direct investment in Rwandan conservation.",
        activities: ["Guided forest walks", "Bird watching", "Community conservation experiences", "Nature photography"],
        services: ["Guided tours", "Community tourism", "Conservation education"],
        contactEmail: RDB_CONTACT.contactEmail,
        contactPhone: RDB_CONTACT.contactPhone,
        website: "https://www.visitrwanda.com/",
        bookingRequirements:
          "Visits are arranged through the park office and local guides; contact the park in advance to confirm guiding availability and trail conditions.",
        importantInfo:
          "The forest is at high altitude and can be muddy. Visitor facilities are more limited than in the larger parks.",
        heroImage: "/media/gishwati.jpg",
        cardImage: "/media/hills-2.jpg",
        gallery: ["/media/gishwati.jpg", "/media/hills-2.jpg"],
        sortOrder: 4,
      },
      {
        slug: "lake-kivu",
        name: "Lake Kivu",
        tagline: "Freshwater beaches and sunset cruises",
        category: "Lakes and Beaches",
        province: "Western Province",
        district: "Rubavu",
        location: "Rubavu, Karongi and Rusizi Districts, Western Province",
        description:
          "Africa's Great Lakes shoreline in Rwanda: sandy bays, coffee towns, boat trips and some of the country's most relaxed resorts.",
        longDescription:
          "Lake Kivu stretches along Rwanda's western border beneath steep green hills. Gisenyi (Rubavu) has beaches and waterfront restaurants, Kibuye (Karongi) is a quiet lakeside town with islands and coffee cooperatives, and Rusizi sits near Nyungwe. Boat trips reach Napoleon Island's fruit bats and the small islands scattered offshore; kayaking, cycling and lakeside dining fill the rest of a stay.",
        activities: ["Boat trips", "Kayaking", "Beach relaxation", "Coffee tours", "Cycling", "Sunset cruises"],
        services: ["Boat operators", "Lakeside hotels and resorts", "Coffee cooperative tours"],
        website: "https://www.visitrwanda.com/",
        bookingRequirements:
          "Boat trips and water activities are arranged with licensed local operators at the lakeshore. Confirm safety equipment and weather conditions before departure.",
        importantInfo:
          "Swimming is permitted at designated beaches and resort waterfronts. Use licensed boats and life jackets.",
        heroImage: "/media/kivu.jpg",
        cardImage: "/media/kivu-boats.jpg",
        gallery: ["/media/kivu.jpg", "/media/kivu-boats.jpg"],
        featured: true,
        sortOrder: 5,
      },
      {
        slug: "kigali-city",
        name: "Kigali City",
        tagline: "Africa's clean, green capital",
        category: "Historical Sites",
        province: "Kigali City",
        district: "Nyarugenge",
        location: "Kigali City",
        description:
          "A modern, walkable capital of hillside neighbourhoods, galleries, markets, memorials and excellent coffee.",
        longDescription:
          "Kigali is the natural first stop for most visitors and worth more than a transit night. The city spreads across ridges and valleys, with craft cooperatives in Kimironko, contemporary art at Inema and Niyo, the Campaign Against Genocide Museum at Parliament, and the Kigali Genocide Memorial at Gisozi. Restaurants serve Rwandan, East African and international food, and the coffee culture is world class.",
        activities: ["City tours", "Craft markets", "Art galleries", "Coffee tasting", "Memorial visits", "Nightlife and dining"],
        services: ["City guides", "Taxi and shuttle services", "Conference facilities", "Hotels"],
        website: "https://www.visitrwanda.com/",
        importantInfo:
          "Rwanda bans single-use plastic bags. Motorcycle taxis are widely used and helmets are provided.",
        heroImage: "/media/kigali.jpg",
        cardImage: "/media/convention.jpg",
        gallery: ["/media/kigali.jpg", "/media/convention.jpg", "/media/kigali-street.jpg"],
        sortOrder: 6,
      },
      {
        slug: "kings-palace-museum",
        name: "King's Palace Museum",
        tagline: "The royal court of Nyanza",
        category: "Cultural Tourism",
        province: "Southern Province",
        district: "Nyanza",
        location: "Nyanza District, Southern Province",
        description:
          "The reconstructed royal palace of the Rwandan monarchy, with the famous long-horned Inyambo cattle and a living craft tradition.",
        longDescription:
          "The King's Palace Museum in Nyanza preserves the court of the Rwandan monarchy. The traditional palace is built in the shape of a woven beehive, with a separate house for the royal dairy herd. Guides explain the symbolism of the Inyambo cattle, royal rituals and the structure of the pre-colonial kingdom. The wider museum reserve includes colonial-era buildings and craft demonstrations.",
        activities: ["Guided museum tours", "Traditional performances", "Craft demonstrations", "Inyambo cattle visits"],
        services: ["Guided tours", "Cultural exhibitions", "Education programmes"],
        openingHours: "Opening hours are set by the museum; confirm current times with the Rwanda Cultural Heritage Academy before travelling.",
        website: "https://www.rwandaheritage.gov.rw/",
        importantInfo:
          "The museum is a national heritage site. Photography conditions are set by the museum and may vary by area.",
        heroImage: "/media/king-palace.jpg",
        cardImage: "/media/culture.jpg",
        gallery: ["/media/king-palace.jpg", "/media/culture.jpg", "/media/heritage-hut.jpg"],
        sortOrder: 7,
      },
      {
        slug: "ethnographic-museum",
        name: "Ethnographic Museum",
        tagline: "Rwanda's largest museum collection",
        category: "Cultural Tourism",
        province: "Southern Province",
        district: "Huye",
        location: "Huye District, Southern Province",
        description:
          "A landmark museum in Huye with one of the finest ethnographic collections in East Africa, from royal regalia to everyday craft.",
        longDescription:
          "The Ethnographic Museum in Huye presents Rwanda's material culture across galleries of basketry, pottery, hunting tools, royal regalia and musical instruments. The building itself, a gift from Belgium in the 1980s, is a local landmark. Guided tours connect objects to the rituals, agriculture and social organisation of Rwandan life, and the museum is a useful stop on a southern heritage circuit with Nyanza and Murambi.",
        activities: ["Guided museum tours", "Historical education", "Cultural exhibitions", "School and research visits"],
        services: ["Guided tours", "Museum exhibitions", "Educational programmes"],
        openingHours: "Opening hours are set by the museum; confirm current times with the Rwanda Cultural Heritage Academy before travelling.",
        website: "https://www.rwandaheritage.gov.rw/",
        heroImage: "/media/crafts.jpg",
        cardImage: "/media/heritage-hut.jpg",
        gallery: ["/media/crafts.jpg", "/media/heritage-hut.jpg"],
        sortOrder: 8,
      },
      {
        slug: "kigali-genocide-memorial",
        name: "Kigali Genocide Memorial",
        tagline: "A place of remembrance and learning",
        category: "Historical Sites",
        province: "Kigali City",
        district: "Gasabo",
        location: "Gisozi, Kigali",
        description:
          "The national memorial to the 1994 Genocide against the Tutsi, with exhibitions, memorial gardens and education programmes.",
        longDescription:
          "The Kigali Genocide Memorial at Gisozi is the final resting place of more than 250,000 people and Rwanda's principal site of remembrance. Permanent exhibitions trace the history and causes of the 1994 Genocide against the Tutsi, the lives lost, and the long work of reconciliation. Visitors are asked to approach the site with respect: photography may be restricted, and guided visits help contextualise the exhibition.",
        activities: ["Memorial exhibition", "Guided remembrance visits", "Education programmes", "Memorial gardens"],
        services: ["Guided tours", "Documentation centre", "Education programmes"],
        importantInfo:
          "This is a memorial and burial site. Visitors are asked to dress respectfully, keep voices low and follow staff guidance. Some exhibitions contain distressing material.",
        website: "https://kgm.rw/",
        heroImage: "/media/memorial.jpg",
        cardImage: "/media/kigali-street.jpg",
        gallery: ["/media/memorial.jpg"],
        sortOrder: 9,
      },
      {
        slug: "inema-arts-center",
        name: "Inema Arts Center",
        tagline: "Contemporary Rwandan art in Kigali",
        category: "Cultural Tourism",
        province: "Kigali City",
        district: "Kicukiro",
        location: "Kacyiru, Kigali",
        description:
          "A working artists' collective and gallery with residencies, exhibitions, dance and music in a lively courtyard.",
        longDescription:
          "Inema Arts Center brings together painters, sculptors, dancers and musicians in a converted Kigali house. The gallery shows contemporary Rwandan work, artists' studios are open to visitors, and the courtyard hosts dance classes and performances. It is one of the easiest places to meet working artists and buy original work directly from them.",
        activities: ["Art exhibitions", "Artist studio visits", "Traditional dance classes", "Live music"],
        services: ["Gallery visits", "Art workshops", "Cultural performances"],
        website: "https://inemaartscenter.com/",
        heroImage: "/media/inema.jpg",
        cardImage: "/media/culture-2.jpg",
        gallery: ["/media/inema.jpg", "/media/culture-2.jpg"],
        sortOrder: 10,
      },
      {
        slug: "ibyiwacu-cultural-village",
        name: "Iby'Iwacu Cultural Village",
        tagline: "Rwandan village life beside the gorillas",
        category: "Cultural Tourism",
        province: "Northern Province",
        district: "Musanze",
        location: "Kinigi, Musanze District",
        description:
          "A community-run cultural experience near Volcanoes National Park: dance, craft, traditional medicine and village life.",
        longDescription:
          "Iby'Iwacu Cultural Village gives visitors a structured introduction to Rwandan village traditions at the edge of Volcanoes National Park. Former poachers and community members demonstrate drumming and Intore dance, basket weaving, banana beer production, traditional healing and cattle keeping. The experience is run with the surrounding community and is often combined with gorilla trekking.",
        activities: ["Intore dance performances", "Craft workshops", "Traditional medicine demonstrations", "Village walks"],
        services: ["Cultural performances", "Guided village experiences", "Craft demonstrations"],
        importantInfo:
          "Experiences are led by community guides. Agree the programme and contribution directly with the cooperative before the visit.",
        heroImage: "/media/culture-2.jpg",
        cardImage: "/media/culture.jpg",
        gallery: ["/media/culture-2.jpg", "/media/culture.jpg"],
        sortOrder: 11,
      },
    ])
    .returning({ id: destinations.id, slug: destinations.slug });

  const id = (slug: string) => inserted.find((d) => d.slug === slug)!.id;

  await db.insert(destinationPrices).values([
    // Volcanoes National Park - official RDB booking portal
    ...["international", "resident", "citizen", "east_african", "african"].map((category, index) => ({
      destinationId: id("volcanoes-national-park"),
      label: "Mountain gorilla trekking permit",
      activity: "Mountain gorilla trekking",
      visitorCategory: category,
      adultAmount: [1500, 500, 200, 200, 500][index],
      childAmount: null,
      currency: "USD",
      unit: "per person per trek",
      sourceName: "Rwanda Development Board — Mountain gorilla tracking (official booking portal)",
      sourceUrl: "https://visitrwandabookings.rdb.rw/rdbportal/mountain-gorilla-tracking",
      verifiedAt: VERIFIED_ON,
      verified: true,
      notes:
        category === "international"
          ? "Standard international visitor permit. One hour with a habituated gorilla family; minimum age 15."
          : "Promotional rate published by RDB. Promotional rates are not applicable from June to October 2026 — confirm the rate that applies to your dates when booking.",
      sortOrder: index,
    })),
    // Akagera - official AMC 2026-2027 price list
    ...(
      [
        ["international", 100, 50, "USD"],
        ["resident", 50, 30, "USD"],
        ["african", 50, 30, "USD"],
        ["citizen", 15000, 10000, "RWF"],
        ["east_african", 15000, 10000, "RWF"],
      ] as const
    ).map(([category, adult, child, currency], index) => ({
      destinationId: id("akagera-national-park"),
      label: "Park entry — 1 day / 1 night",
      activity: "Park entry",
      visitorCategory: category,
      adultAmount: adult,
      childAmount: child,
      currency,
      unit: "per person, 1 day/night",
      sourceName: "Akagera Management Company — Pricing for Akagera National Park 2026-2027 (official)",
      sourceUrl:
        "https://visitakagera.org/wp-content/uploads/2026/07/Akagera-NP-Pricing-List-2026-2027-1.pdf",
      verifiedAt: VERIFIED_ON,
      verified: true,
      notes:
        "Entry includes self-drive game viewing. Children 6–12 pay the child rate; children 5 and under do not pay entry. Vehicle fees and guided activities are charged separately.",
      sortOrder: index,
    })),
    // Nyungwe - official 2025/2026 rate card
    {
      destinationId: id("nyungwe-national-park"),
      label: "Park entry — day visit / 1 night",
      activity: "Park entry",
      visitorCategory: "international",
      adultAmount: 100,
      childAmount: 50,
      currency: "USD",
      unit: "per person, 1 day/night",
      sourceName: "Nyungwe National Park — official 2025/2026 price list",
      sourceUrl:
        "https://visitnyungwe.org/wp-content/uploads/sites/5/2025/02/2025-2026-Activity-Prices-in-Nyungwe-National-Park.pdf",
      verifiedAt: VERIFIED_ON,
      verified: true,
      notes: "International visitor rate. Children 6–12 pay half; children 5 and under are free.",
      sortOrder: 0,
    },
    ...(
      [
        ["Chimpanzee trekking", 150],
        ["Canopy walkway", 40],
        ["Colobus monkey trekking", 40],
        ["Guided birding walk", 40],
      ] as const
    ).map(([activity, amount], index) => ({
      destinationId: id("nyungwe-national-park"),
      label: activity,
      activity,
      visitorCategory: "international",
      adultAmount: amount,
      childAmount: null,
      currency: "USD",
      unit: "per person",
      sourceName: "Nyungwe National Park — official 2025/2026 price list",
      sourceUrl:
        "https://visitnyungwe.org/wp-content/uploads/sites/5/2025/02/2025-2026-Activity-Prices-in-Nyungwe-National-Park.pdf",
      verifiedAt: VERIFIED_ON,
      verified: true,
      notes: "International visitor rate. Park entry is charged in addition where applicable.",
      sortOrder: index + 1,
    })),
  ]);

  await db.insert(institutions).values([
    {
      slug: "kings-palace-museum",
      name: "King's Palace Museum",
      category: "Royal Heritage",
      summary: "The reconstructed royal palace of the Rwandan monarchy in Nyanza, with Inyambo cattle and living craft traditions.",
      description:
        "The King's Palace Museum preserves the court of the Rwandan monarchy in Nyanza. Guides explain the architecture of the royal compound, the symbolism of the long-horned Inyambo cattle and the rituals of the pre-colonial kingdom. The site is managed within Rwanda's national museum network.",
      services: ["Guided museum tours", "Traditional performances", "Craft demonstrations", "Educational programmes"],
      openingHours: "Confirm current opening hours with the museum before travelling.",
      website: "https://www.rwandaheritage.gov.rw/",
      imageUrl: "/media/king-palace.jpg",
      district: "Nyanza",
      province: "Southern Province",
      verified: true,
      sortOrder: 1,
    },
    {
      slug: "ethnographic-museum",
      name: "Ethnographic Museum",
      category: "Museum",
      summary: "One of East Africa's finest ethnographic collections, in a landmark building in Huye.",
      description:
        "The Ethnographic Museum in Huye holds extensive collections of basketry, pottery, regalia and musical instruments. Guided tours connect the objects to Rwandan social history, agriculture and royal tradition.",
      services: ["Guided museum tours", "Historical education", "Cultural exhibitions", "Research access"],
      openingHours: "Confirm current opening hours with the museum before travelling.",
      website: "https://www.rwandaheritage.gov.rw/",
      imageUrl: "/media/crafts.jpg",
      district: "Huye",
      province: "Southern Province",
      verified: true,
      sortOrder: 2,
    },
    {
      slug: "kigali-genocide-memorial",
      name: "Kigali Genocide Memorial",
      category: "Memorial",
      summary: "The national memorial to the 1994 Genocide against the Tutsi: remembrance, documentation and education.",
      description:
        "The Kigali Genocide Memorial at Gisozi is the final resting place of more than 250,000 victims and the country's principal site of remembrance. Exhibitions document the history and causes of the genocide and the work of reconciliation. Visitors are asked to approach the site with respect.",
      services: ["Memorial exhibition", "Guided remembrance visits", "Documentation centre", "Education programmes"],
      openingHours: "Memorial hours are published by the memorial; confirm before travelling.",
      website: "https://kgm.rw/",
      imageUrl: "/media/memorial.jpg",
      district: "Gasabo",
      province: "Kigali City",
      verified: true,
      sortOrder: 3,
    },
    {
      slug: "campaign-against-genocide-museum",
      name: "Campaign Against Genocide Museum",
      category: "Memorial",
      summary: "A museum at the Parliamentary buildings documenting the campaign that stopped the 1994 Genocide against the Tutsi.",
      description:
        "The Campaign Against Genocide Museum is housed at the former Conseil National de Développement building, where the campaign to stop the genocide was directed. Exhibitions and guides explain the military and political history of April–July 1994.",
      services: ["Guided tours", "Historical exhibitions", "Educational visits"],
      openingHours: "Confirm current opening hours before travelling.",
      website: "https://www.rwandaheritage.gov.rw/",
      imageUrl: "/media/kigali-street.jpg",
      district: "Nyarugenge",
      province: "Kigali City",
      verified: true,
      sortOrder: 4,
    },
    {
      slug: "rwanda-cultural-heritage-academy",
      name: "Rwanda Cultural Heritage Academy",
      category: "Heritage Institution",
      summary: "The public institution responsible for Rwanda's museums, archives, language and cultural heritage.",
      description:
        "Rwanda Cultural Heritage Academy (Inteko y'Umuco) was established in 2020, merging the national museums, archives and library services with the academy of language and culture. It oversees national museums, heritage sites, research and the preservation of Ikinyarwanda.",
      services: ["Museum management", "Heritage preservation", "Research", "Archives and library services"],
      contactEmail: "info@rwandaheritage.gov.rw",
      contactPhone: "+250 795 297 763",
      website: "https://www.rwandaheritage.gov.rw/",
      imageUrl: "/media/heritage-hut.jpg",
      district: "Huye",
      province: "Southern Province",
      verified: true,
      sortOrder: 5,
    },
    {
      slug: "ibyiwacu-cultural-village",
      name: "Iby'Iwacu Cultural Village",
      category: "Community Tourism",
      summary: "A community-run cultural village at the edge of Volcanoes National Park.",
      description:
        "Iby'Iwacu introduces visitors to Rwandan village traditions through dance, craft, traditional medicine and cattle keeping. The experience is run with the local community near Kinigi and is often combined with gorilla trekking.",
      services: ["Intore dance performances", "Craft workshops", "Village walks", "Cultural demonstrations"],
      imageUrl: "/media/culture-2.jpg",
      district: "Musanze",
      province: "Northern Province",
      verified: false,
      sortOrder: 6,
    },
    {
      slug: "inema-arts-center",
      name: "Inema Arts Center",
      category: "Arts Centre",
      summary: "A working artists' collective, gallery and performance space in Kigali.",
      description:
        "Inema Arts Center brings together painters, sculptors, dancers and musicians. The gallery shows contemporary Rwandan work, studios are open to visitors and the courtyard hosts dance and music.",
      services: ["Art exhibitions", "Artist studio visits", "Dance classes", "Live music"],
      website: "https://inemaartscenter.com/",
      imageUrl: "/media/inema.jpg",
      district: "Kicukiro",
      province: "Kigali City",
      verified: true,
      sortOrder: 7,
    },
  ]);

  await db.insert(personnel).values([
    // ---- Verified national tourism leadership ----
    {
      kind: "leader",
      name: "Jean-Guy Afrika",
      title: "Chief Executive Officer",
      organization: "Rwanda Development Board (RDB)",
      bio: "Chief Executive Officer of the Rwanda Development Board, the government institution responsible for investment promotion and tourism development in Rwanda. Leads RDB's senior management team.",
      responsibilities: ["Institutional leadership", "Tourism development", "Investment promotion", "Conservation partnerships"],
      website: "https://rdb.rw/senior-management",
      verified: true,
      featured: true,
      sortOrder: 1,
    },
    {
      kind: "leader",
      name: "Juliana Kangeli Muganza",
      title: "Deputy Chief Executive Officer",
      organization: "Rwanda Development Board (RDB)",
      bio: "Deputy Chief Executive Officer of the Rwanda Development Board, supporting institutional leadership across tourism, investment and corporate services.",
      responsibilities: ["Institutional management", "Tourism and investment coordination"],
      website: "https://rdb.rw/senior-management",
      verified: true,
      sortOrder: 2,
    },
    {
      kind: "leader",
      name: "Irène Murerwa",
      title: "Chief Tourism Officer",
      organization: "Rwanda Development Board (RDB)",
      bio: "Chief Tourism Officer at the Rwanda Development Board, leading the institution's tourism development agenda, destination marketing and conservation partnerships.",
      responsibilities: ["Tourism development", "Destination marketing", "Conservation and tourism partnerships", "Visitor experience"],
      website: "https://rdb.rw/senior-management",
      verified: true,
      featured: true,
      sortOrder: 3,
    },
    {
      kind: "leader",
      name: "Amb. Robert Masozera",
      title: "Director General",
      organization: "Rwanda Cultural Heritage Academy (Inteko y'Umuco)",
      bio: "Director General of the Rwanda Cultural Heritage Academy since November 2020. The Academy preserves Rwanda's national heritage, museums, archives and the Ikinyarwanda language.",
      responsibilities: ["Cultural heritage policy", "National museum network", "Archives and language preservation", "Heritage research"],
      email: "info@rwandaheritage.gov.rw",
      phone: "+250 795 297 763",
      website: "https://www.rwandaheritage.gov.rw/en/about-rha",
      verified: true,
      featured: true,
      sortOrder: 4,
    },
    {
      kind: "leader",
      title: "Tourism Development Department",
      organization: "Rwanda Development Board (RDB)",
      department: "Tourism Development",
      bio: "The RDB department responsible for tourism product development, destination marketing, visitor experience and coordination with national park management. Named individual officers are published only when confirmed by the institution.",
      responsibilities: ["Destination development", "Tourism marketing", "Park coordination", "Visitor services"],
      website: "https://rdb.rw/",
      verified: true,
      sortOrder: 5,
    },
    {
      kind: "leader",
      title: "Museum and Heritage Sites Management Division",
      organization: "Rwanda Cultural Heritage Academy (Inteko y'Umuco)",
      department: "Museum and Heritage Sites Management",
      bio: "The RCHA division that preserves museum collections and manages national heritage sites, including the King's Palace and Ethnographic museums.",
      responsibilities: ["Museum collections", "Heritage site management", "Curatorial standards", "Visitor programmes"],
      website: "https://www.rwandaheritage.gov.rw/",
      verified: true,
      sortOrder: 6,
    },
    // ---- National park teams (verified departments, no invented individuals) ----
    ...parkTeams("volcanoes-national-park", "Volcanoes National Park", [
      ["Park Management Office", "Park Management", ["Park operations", "Permit coordination", "Partnership management"]],
      ["Gorilla Conservation & Monitoring Unit", "Conservation", ["Gorilla family monitoring", "Habituation programmes", "Conservation data"]],
      ["Veterinary & Animal Health Unit", "Veterinary", ["Wildlife health monitoring", "Intervention support", "Disease surveillance"]],
      ["Tourism & Visitor Experience Office", "Tourism", ["Visitor registration", "Trekking briefings", "Visitor experience"]],
      ["Guiding Team", "Guiding", ["Gorilla trek guiding", "Golden monkey tracking", "Nature walks"]],
      ["Community Development Office", "Community", ["Revenue sharing", "Community projects", "Local employment"]],
      ["Research & Biodiversity Unit", "Research", ["Ecological research", "Biodiversity surveys", "Scientific partnerships"]],
      ["Security & Protection Unit", "Protection", ["Park protection", "Patrol coordination", "Visitor safety"]],
    ]),
    ...parkTeams("akagera-national-park", "Akagera National Park", [
      ["Park Management", "Park Management", ["Park operations", "Conservation partnerships", "Revenue management"]],
      ["Wildlife Conservation & Research", "Conservation", ["Wildlife monitoring", "Ecological research", "Species reintroduction support"]],
      ["Ranger & Law Enforcement Teams", "Protection", ["Anti-poaching patrols", "Park protection", "Visitor safety"]],
      ["Safari Guiding Team", "Guiding", ["Game drives", "Birding walks", "Photographic safaris"]],
      ["Veterinary Team", "Veterinary", ["Wildlife health", "Intervention support"]],
      ["Tourism & Hospitality Office", "Tourism", ["Visitor services", "Accommodation coordination", "Boat safari bookings"]],
      ["Community Relations Office", "Community", ["Community engagement", "Benefit sharing", "Local procurement"]],
    ]),
    ...parkTeams("nyungwe-national-park", "Nyungwe National Park", [
      ["Park Management", "Park Management", ["Park operations", "Research partnerships", "Tourism coordination"]],
      ["Forest Conservation Office", "Conservation", ["Forest protection", "Habitat monitoring", "Conservation programmes"]],
      ["Canopy Walk & Trail Guides", "Guiding", ["Canopy walkway guiding", "Nature trails", "Visitor safety"]],
      ["Chimpanzee Tracking Team", "Guiding", ["Chimpanzee tracking", "Primate monitoring", "Visitor briefings"]],
      ["Biodiversity Research Unit", "Research", ["Primate research", "Ornithology", "Biodiversity surveys"]],
      ["Tourism Office", "Tourism", ["Visitor registration", "Permit coordination", "Visitor experience"]],
      ["Forest Ranger Teams", "Protection", ["Forest patrols", "Boundary protection", "Community liaison"]],
    ]),
    ...parkTeams("gishwati-mukura-national-park", "Gishwati-Mukura National Park", [
      ["Park Management", "Park Management", ["Park operations", "Restoration programme", "Partnerships"]],
      ["Conservation Specialists", "Conservation", ["Forest restoration", "Wildlife monitoring", "Habitat connectivity"]],
      ["Forest Ranger Teams", "Protection", ["Forest patrols", "Protection", "Community engagement"]],
      ["Biodiversity Research Unit", "Research", ["Species surveys", "Ecological monitoring"]],
      ["Tourism Guides", "Guiding", ["Forest walks", "Birding", "Conservation education"]],
      ["Community Development Office", "Community", ["Community tourism", "Benefit sharing", "Local employment"]],
    ]),
    // ---- Cultural institution teams ----
    ...cultureTeams("kings-palace-museum", "King's Palace Museum", [
      ["Museum Curatorial Team", "Curation"],
      ["Heritage & Research Team", "Research"],
      ["Guided Tours & Visitor Experience", "Visitor Experience"],
      ["Education & Outreach", "Education"],
    ]),
    ...cultureTeams("ethnographic-museum", "Ethnographic Museum", [
      ["Museum Curatorial Team", "Curation"],
      ["Heritage & Research Team", "Research"],
      ["Guided Tours & Education", "Education"],
    ]),
    ...cultureTeams("kigali-genocide-memorial", "Kigali Genocide Memorial", [
      ["Memorial Management", "Management"],
      ["Documentation & Research", "Research"],
      ["Education Programmes", "Education"],
      ["Visitor Experience & Guiding", "Visitor Experience"],
    ]),
    ...cultureTeams("campaign-against-genocide-museum", "Campaign Against Genocide Museum", [
      ["Museum Management", "Management"],
      ["Curatorial & Research Team", "Curation"],
      ["Guided Tours & Education", "Education"],
    ]),
    ...cultureTeams("rwanda-cultural-heritage-academy", "Rwanda Cultural Heritage Academy", [
      ["Museum and Heritage Sites Management Division", "Heritage Management"],
      ["Language and Culture Preservation Division", "Culture"],
      ["Archives and Library Services", "Archives"],
    ]),
    ...cultureTeams("inema-arts-center", "Inema Arts Center", [
      ["Artists' Collective", "Arts"],
      ["Gallery & Exhibitions Team", "Exhibitions"],
      ["Dance & Performance Team", "Performance"],
    ]),
    // ---- Destination representatives (institutional desks) ----
    {
      kind: "representative",
      name: "Volcanoes National Park Tourism Desk",
      title: "Tourism Information & Permits",
      organization: "Rwanda Development Board",
      scopeSlug: "volcanoes-national-park",
      category: "National Park Representatives",
      bio: "Visitor information for gorilla permits, trekking briefings and park experiences at Volcanoes National Park.",
      services: ["Gorilla permit information", "Trekking briefings", "Visitor support"],
      website: "https://visitrwandabookings.rdb.rw/",
      email: "info@rdb.rw",
      phone: "+250 727 775 170",
      verified: true,
      sortOrder: 1,
    },
    {
      kind: "representative",
      name: "Akagera National Park Tourism Desk",
      title: "Safari & Visitor Services",
      organization: "Akagera Management Company",
      scopeSlug: "akagera-national-park",
      category: "National Park Representatives",
      bio: "Information on game drives, boat safaris, park entry and accommodation inside Akagera National Park.",
      services: ["Park entry information", "Boat safari bookings", "Safari guidance"],
      website: "https://www.visitakagera.org/",
      verified: true,
      sortOrder: 2,
    },
    {
      kind: "representative",
      name: "Nyungwe National Park Tourism Desk",
      title: "Forest Experiences & Permits",
      organization: "Nyungwe National Park",
      scopeSlug: "nyungwe-national-park",
      category: "National Park Representatives",
      bio: "Information on canopy walkway tickets, chimpanzee tracking and forest trails in Nyungwe.",
      services: ["Canopy walkway information", "Chimpanzee tracking", "Guide services"],
      website: "https://www.visitnyungwe.org/",
      verified: true,
      sortOrder: 3,
    },
    {
      kind: "representative",
      name: "King's Palace Museum Visitor Desk",
      title: "Museum Visitor Services",
      organization: "Rwanda Cultural Heritage Academy",
      scopeSlug: "kings-palace-museum",
      category: "Museum Representatives",
      bio: "Visitor information for guided tours of the royal palace and the Inyambo cattle enclosure.",
      services: ["Guided tours", "Cultural performances"],
      website: "https://www.rwandaheritage.gov.rw/",
      verified: true,
      sortOrder: 4,
    },
    {
      kind: "representative",
      name: "Kigali Genocide Memorial Visitor Centre",
      title: "Remembrance & Education",
      organization: "Kigali Genocide Memorial",
      scopeSlug: "kigali-genocide-memorial",
      category: "Museum Representatives",
      bio: "Information for visitors to the memorial, including guided remembrance visits and education programmes.",
      services: ["Guided remembrance visits", "Education programmes"],
      website: "https://kgm.rw/",
      verified: true,
      sortOrder: 5,
    },
    {
      kind: "representative",
      name: "Lake Kivu Waterfront Operators",
      title: "Lake & Water Tourism",
      organization: "Licensed local boat operators",
      scopeSlug: "lake-kivu",
      category: "Lake and Water Tourism Representatives",
      bio: "Licensed boat operators along the Rubavu, Karongi and Rusizi shorelines offer trips to the islands, sunset cruises and kayaking.",
      services: ["Boat trips", "Sunset cruises", "Kayaking"],
      website: "https://www.visitrwanda.com/",
      verified: false,
      sortOrder: 6,
    },
    {
      kind: "representative",
      name: "Iby'Iwacu Community Cooperative",
      title: "Cultural Tourism Representative",
      organization: "Iby'Iwacu Cultural Village",
      scopeSlug: "ibyiwacu-cultural-village",
      category: "Cultural Tourism Representatives",
      bio: "Community guides present Intore dance, craft and village life near Kinigi at the edge of Volcanoes National Park.",
      services: ["Cultural performances", "Craft workshops", "Village walks"],
      verified: false,
      sortOrder: 7,
    },
    {
      kind: "representative",
      name: "Inema Arts Center",
      title: "Arts & Culture Representative",
      organization: "Inema Arts Center",
      scopeSlug: "inema-arts-center",
      category: "Cultural Tourism Representatives",
      bio: "Gallery and performance space representing contemporary Rwandan artists in Kigali.",
      services: ["Art exhibitions", "Dance classes"],
      website: "https://inemaartscenter.com/",
      verified: true,
      sortOrder: 8,
    },
    // ---- Development team (profile details supplied by the project owner) ----
    {
      kind: "developer",
      name: "TR Ndikumana Eric",
      title: "Senior Developer",
      department: "Software Development",
      organization: "Visit Rwanda Academy",
      bio: "Leads the architecture and engineering of the Visit Rwanda Academy platform, from system design through to code quality and integration.",
      responsibilities: [
        "Project architecture",
        "Software engineering",
        "System development",
        "Technical leadership",
        "Code quality and system integration",
      ],
      skills: ["System architecture", "Full-stack engineering", "Database design", "Technical leadership"],
      verified: true,
      featured: true,
      sortOrder: 1,
    },
    {
      kind: "developer",
      name: "Byiringiro Aime Pacifique",
      title: "Intermediate Developer",
      department: "Software Development",
      organization: "Visit Rwanda Academy",
      bio: "Builds and maintains the public-facing experience of the platform, connecting the interface to the data and services behind it.",
      responsibilities: [
        "Frontend development",
        "Website functionality",
        "User interface development",
        "Database integration",
        "Website maintenance",
      ],
      skills: ["Frontend development", "UI implementation", "Database integration", "Website maintenance"],
      verified: true,
      sortOrder: 2,
    },
    {
      kind: "developer",
      name: "Bwigwi Beramy Herve",
      title: "Intermediate Developer",
      department: "Software Development",
      organization: "Visit Rwanda Academy",
      bio: "Works across frontend and backend integration, keeping the platform tested, maintainable and reliable.",
      responsibilities: [
        "Frontend development",
        "Backend integration",
        "Website functionality",
        "Testing and debugging",
        "System maintenance",
      ],
      skills: ["Frontend development", "Backend integration", "Testing", "Debugging"],
      verified: true,
      sortOrder: 3,
    },
  ]);

  await db.insert(services).values([
    {
      slug: "gorilla-trekking",
      name: "Gorilla Trekking",
      category: "Gorilla Trekking",
      description:
        "Trek with licensed guides into the bamboo forest of Volcanoes National Park to spend one hour with a habituated mountain gorilla family.",
      destinationSlug: "volcanoes-national-park",
      provider: "Rwanda Development Board — park guides",
      priceNote: "Official permit price is published by RDB; see the destination price table.",
      imageUrl: "/media/gorilla.jpg",
      sortOrder: 1,
    },
    {
      slug: "safari-game-drives",
      name: "Safari Game Drives",
      category: "Safari Experiences",
      description:
        "Guided game drives across Akagera's savannah in search of lion, elephant, buffalo, rhino, giraffe and antelope.",
      destinationSlug: "akagera-national-park",
      provider: "Akagera National Park guides",
      imageUrl: "/media/giraffe.jpg",
      sortOrder: 2,
    },
    {
      slug: "boat-safari-lake-ihema",
      name: "Boat Safari on Lake Ihema",
      category: "Wildlife Tourism",
      description:
        "A slow boat safari past hippos, crocodiles and waterbirds on Akagera's largest lake.",
      destinationSlug: "akagera-national-park",
      provider: "Akagera boat safari operators",
      imageUrl: "/media/akagera.jpg",
      sortOrder: 3,
    },
    {
      slug: "nyungwe-canopy-walk",
      name: "Nyungwe Canopy Walk",
      category: "Forest Exploration",
      description:
        "Walk a suspended bridge above the rainforest canopy for views across Nyungwe's ridges and valleys.",
      destinationSlug: "nyungwe-national-park",
      provider: "Nyungwe National Park guides",
      priceNote: "Official walkway price is listed in the destination price table.",
      imageUrl: "/media/canopy.jpg",
      sortOrder: 4,
    },
    {
      slug: "chimpanzee-tracking",
      name: "Chimpanzee Tracking",
      category: "Wildlife Tourism",
      description:
        "An early-morning forest trek with Nyungwe's tracking team to find a habituated chimpanzee community.",
      destinationSlug: "nyungwe-national-park",
      provider: "Nyungwe National Park tracking team",
      imageUrl: "/media/nyungwe.jpg",
      sortOrder: 5,
    },
    {
      slug: "lake-kivu-boat-cruise",
      name: "Lake Kivu Boat Cruise",
      category: "Lake Tourism",
      description:
        "Cruise the shoreline and islands of Lake Kivu with a licensed operator, or paddle a kayak at sunset.",
      destinationSlug: "lake-kivu",
      provider: "Licensed lakeshore operators",
      imageUrl: "/media/kivu-boats.jpg",
      sortOrder: 6,
    },
    {
      slug: "culture-heritage-trail",
      name: "Royal Heritage Trail",
      category: "Historical Education",
      description:
        "A guided journey through Nyanza's royal palace and the Ethnographic Museum in Huye, connecting Rwanda's monarchy to its living culture.",
      destinationSlug: "kings-palace-museum",
      provider: "Rwanda Cultural Heritage Academy museums",
      imageUrl: "/media/king-palace.jpg",
      sortOrder: 7,
    },
    {
      slug: "intore-dance-experience",
      name: "Intore Dance Experience",
      category: "Cultural Tourism",
      description:
        "Drumming, Intore dance and craft demonstrations with community performers near Volcanoes National Park.",
      destinationSlug: "ibyiwacu-cultural-village",
      provider: "Iby'Iwacu community cooperative",
      imageUrl: "/media/culture.jpg",
      sortOrder: 8,
    },
    {
      slug: "kigali-city-tour",
      name: "Kigali City Tour",
      category: "Hospitality and Accommodation",
      description:
        "A guided half-day across Kigali: craft markets, coffee, galleries, hilltop viewpoints and the memorial.",
      destinationSlug: "kigali-city",
      provider: "Licensed Kigali city guides",
      imageUrl: "/media/kigali-street.jpg",
      sortOrder: 9,
    },
    {
      slug: "bird-watching-rwanda",
      name: "Bird Watching",
      category: "Bird Watching",
      description:
        "Rwanda records more than 700 bird species; specialist guides lead birding walks in Akagera, Nyungwe and Gishwati-Mukura.",
      destinationSlug: "nyungwe-national-park",
      provider: "Park birding guides",
      imageUrl: "/media/hills-2.jpg",
      sortOrder: 10,
    },
    {
      slug: "volcano-hiking",
      name: "Volcano Hiking",
      category: "Hiking and Adventure",
      description:
        "Climb Mount Bisoke's crater rim or take on the higher Virunga peaks with park guides and porters.",
      destinationSlug: "volcanoes-national-park",
      provider: "Volcanoes National Park guides",
      imageUrl: "/media/volcanoes.jpg",
      sortOrder: 11,
    },
    {
      slug: "art-and-culture-kigali",
      name: "Contemporary Art & Culture",
      category: "Cultural Tourism",
      description:
        "Visit working artists' studios and gallery exhibitions at Inema Arts Center in Kigali.",
      destinationSlug: "inema-arts-center",
      provider: "Inema Arts Center",
      imageUrl: "/media/inema.jpg",
      sortOrder: 12,
    },
  ]);

  await db.insert(articles).values([
    {
      slug: "gorilla-trekking-what-to-expect",
      title: "Gorilla trekking in Rwanda: what to expect",
      excerpt:
        "Permits, fitness, footwear and the etiquette of the hour you spend with a mountain gorilla family in Volcanoes National Park.",
      body: `Gorilla trekking is the experience that defines a visit to Rwanda for many travellers. It is also tightly managed, which is why the forest and its gorillas remain healthy.\n\nPermits are issued per visitor per day and are linked to a specific trek. On the morning of your trek you register at the park reception, are allocated to a gorilla family based on fitness and preference, and receive a briefing from your guides. Treks can last from under an hour to several hours depending on where the family slept the night before.\n\nWear closed shoes with grip, long trousers and a light rain jacket. Porters can be hired at the trailhead and are worth it on the muddy sections. When you reach the gorillas, keep your voice low, move slowly and keep the required distance. You will have one hour with the family.\n\nDo not trek if you have a cold or fever: human respiratory illness is a serious risk to gorillas. The minimum age is 15.`,
      coverImage: "/media/gorilla.jpg",
      category: "Wildlife",
      publishedAt: new Date("2026-09-12T09:00:00Z"),
    },
    {
      slug: "akagera-safari-planning",
      title: "Planning an Akagera safari from Kigali",
      excerpt:
        "How to structure a two-day safari in Rwanda's eastern savannah, from gate times to boat safaris and where to sleep.",
      body: `Akagera is the easiest Big Five safari in Rwanda to reach: about two and a half hours by road from Kigali. A single day is possible, but two nights inside the park gives you early-morning and late-afternoon game drives when wildlife is most active.\n\nEnter through the southern gate near Kayonza and exit north, or reverse the route. A park guide can join your vehicle and will dramatically improve your chances of finding lion, leopard and rhino. Boat safaris on Lake Ihema are a calm counterpoint to the game drives and excellent for birds.\n\nBring binoculars, sun protection, water and cash for park fees and guides. Fuel up before the gate. If you are self-driving, check the current vehicle fee and road conditions with the park before you travel.`,
      coverImage: "/media/giraffe.jpg",
      category: "Safari",
      publishedAt: new Date("2026-08-28T09:00:00Z"),
    },
    {
      slug: "nyungwe-forest-guide",
      title: "Nyungwe: rainforest trails, chimpanzees and the canopy",
      excerpt:
        "A practical guide to Rwanda's great rainforest, where the canopy walkway and chimpanzee tracking reward an early start.",
      body: `Nyungwe sits high on the Congo-Nile Divide, where cloud forest holds chimpanzees, colobus monkeys and more than 300 bird species. The air is cool and the trails are often wet.\n\nChimpanzee tracking starts early. Groups are small and sightings depend on where the chimps nested, so fitness and patience matter. The canopy walkway is a shorter, more accessible experience with views over the forest, and several waterfall trails suit half-day walks.\n\nStay in or near the park to avoid long drives from Kigali. Bring a rain jacket, sturdy shoes and layers: mornings can be cold at altitude.`,
      coverImage: "/media/canopy.jpg",
      category: "Nature",
      publishedAt: new Date("2026-07-19T09:00:00Z"),
    },
    {
      slug: "rwanda-cultural-heritage-circuit",
      title: "A cultural heritage circuit through southern Rwanda",
      excerpt:
        "Nyanza's royal palace, the Ethnographic Museum in Huye and the memorial sites that shaped modern Rwanda.",
      body: `Southern Rwanda holds the country's densest concentration of museums and heritage sites. Start at the King's Palace Museum in Nyanza, where guides explain the royal court and the long-horned Inyambo cattle. Continue to Huye for the Ethnographic Museum's collections of basketry, regalia and craft.\n\nAllow time for reflection at the memorial sites in the region, including Murambi. These are places of mourning and learning rather than attractions; visitors should follow staff guidance and dress respectfully.\n\nA two-day circuit from Kigali works well, with an overnight in Huye or Nyanza. Arrange a guide in advance if you want deeper historical context.`,
      coverImage: "/media/king-palace.jpg",
      category: "Culture",
      publishedAt: new Date("2026-06-05T09:00:00Z"),
    },
  ]);

  await db.insert(galleryImages).values([
    { url: "/media/volcanoes.jpg", caption: "The Virunga volcanoes above Volcanoes National Park", destination: "Volcanoes National Park", credit: "Wikimedia Commons", sortOrder: 1 },
    { url: "/media/gorilla.jpg", caption: "Mountain gorilla mother and infant", destination: "Volcanoes National Park", credit: "Wikimedia Commons", sortOrder: 2 },
    { url: "/media/elephants.jpg", caption: "Elephants in Akagera National Park", destination: "Akagera National Park", credit: "Wikimedia Commons", sortOrder: 3 },
    { url: "/media/giraffe.jpg", caption: "Giraffe gathering on the Akagera plains", destination: "Akagera National Park", credit: "Wikimedia Commons", sortOrder: 4 },
    { url: "/media/canopy.jpg", caption: "The Nyungwe canopy walkway", destination: "Nyungwe National Park", credit: "Wikimedia Commons", sortOrder: 5 },
    { url: "/media/nyungwe.jpg", caption: "Sunrise over Nyungwe forest", destination: "Nyungwe National Park", credit: "Wikimedia Commons", sortOrder: 6 },
    { url: "/media/kivu.jpg", caption: "Lake Kivu at dawn", destination: "Lake Kivu", credit: "Wikimedia Commons", sortOrder: 7 },
    { url: "/media/kivu-boats.jpg", caption: "Tour boats on Lake Kivu", destination: "Lake Kivu", credit: "Wikimedia Commons", sortOrder: 8 },
    { url: "/media/hills.jpg", caption: "The hills of Nyamagabe", destination: "Southern Province", credit: "Wikimedia Commons", sortOrder: 9 },
    { url: "/media/culture.jpg", caption: "Intore dancers performing in Rwanda", destination: "Cultural experiences", credit: "Wikimedia Commons", sortOrder: 10 },
    { url: "/media/kigali.jpg", caption: "Kigali's skyline", destination: "Kigali City", credit: "Wikimedia Commons", sortOrder: 11 },
    { url: "/media/king-palace.jpg", caption: "The King's Palace Museum, Nyanza", destination: "Nyanza", credit: "Wikimedia Commons", sortOrder: 12 },
  ]);

  await db.insert(siteSettings).values([
    { key: "heroVideo", value: "/media/hero.mp4" },
    { key: "heroPoster", value: "/media/hero-poster.jpg" },
    { key: "heroTitle", value: "Discover the Beauty of Rwanda" },
    {
      key: "heroSubtitle",
      value:
        "Volcanoes, mountain gorillas, rainforest and lakes — one small country with an extraordinary concentration of life.",
    },
    { key: "ownerName", value: "Byiringiro Aime Pacifique" },
    { key: "ownerRole", value: "Website Owner · Backend and Frontend Developer" },
    { key: "assistantName", value: "Bwigwi Herve Baramy" },
    { key: "assistantRole", value: "Assistant · Development Support" },
    { key: "contactEmail", value: "info@rdb.rw" },
    { key: "contactPhone", value: "+250 727 775 170" },
  ]);
}

function parkTeams(slug: string, parkName: string, teams: [string, string, string[]][]) {
  return teams.map(([title, department, responsibilities], index) => ({
    kind: "park_staff",
    name: null,
    title,
    department,
    organization: parkName,
    scopeSlug: slug,
    bio: `${department} team at ${parkName}. Individual staff identities are published once confirmed by the park authority.`,
    responsibilities,
    verified: true,
    sortOrder: index,
  }));
}

function cultureTeams(slug: string, institutionName: string, teams: [string, string][]) {
  return teams.map(([title, department], index) => ({
    kind: "culture_staff",
    name: null,
    title,
    department,
    organization: institutionName,
    scopeSlug: slug,
    bio: `${department} team at ${institutionName}. Named officers are published only after institutional confirmation.`,
    verified: true,
    sortOrder: index,
  }));
}

/**
 * Creates the initial administrator from ADMIN_EMAIL / ADMIN_PASSWORD.
 * No credentials are ever committed; the dashboard stays inaccessible until
 * one of these exists.
 */
export async function ensureAdmin(db: Database) {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) return;

  const existing = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);
  if (existing.length) return;

  // The administrator may have been moved to another address (or promoted by
  // hand). Never insert a second one: its seeded telephone number is unique.
  const [anyAdmin] = await db.select({ id: users.id }).from(users).where(eq(users.role, "admin")).limit(1);
  if (anyAdmin) return;

  await db.insert(users).values({
    fullName: process.env.ADMIN_NAME?.trim() || "Visit Rwanda Administrator",
    email,
    phone: process.env.ADMIN_PHONE?.trim() || "+250700000000",
    passwordHash: await hashPassword(password),
    role: "admin",
    nationality: "Rwanda",
    hasNationalId: false,
  });
}
