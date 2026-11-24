export type AdminField = {
  key: string;
  label: string;
  type: "text" | "textarea" | "number" | "checkbox" | "select" | "date" | "list" | "media" | "destination";
  options?: { value: string; label: string }[];
  /** Media field kind: images by default, or video files for the cinematic layer. */
  accept?: "image" | "video";
  list?: boolean;
  required?: boolean;
  help?: string;
  wide?: boolean;
};

export type AdminResourceKey =
  | "destinations"
  | "prices"
  | "bookings"
  | "articles"
  | "gallery"
  | "personnel"
  | "institutions"
  | "services"
  | "videos"
  | "settings";

export const adminResources: Record<
  AdminResourceKey,
  { label: string; description: string; fields: AdminField[]; readOnly?: boolean }
> = {
  destinations: {
    label: "Destinations",
    description: "Profiles, imagery, contacts, opening information and activities.",
    fields: [
      { key: "name", label: "Name", type: "text", required: true, list: true },
      { key: "slug", label: "URL slug", type: "text", required: true, list: true },
      { key: "category", label: "Category", type: "select", required: true, options: [
        { value: "National Parks", label: "National Parks" },
        { value: "Cultural Tourism", label: "Cultural Tourism" },
        { value: "Historical Sites", label: "Historical Sites" },
        { value: "Lakes and Beaches", label: "Lakes and Beaches" },
        { value: "Adventure", label: "Adventure" },
        { value: "Wildlife and Safari", label: "Wildlife and Safari" },
        { value: "Nature and Hiking", label: "Nature and Hiking" },
      ] },
      { key: "tagline", label: "Tagline", type: "text" },
      { key: "province", label: "Province", type: "text", list: true },
      { key: "district", label: "District", type: "text", list: true },
      { key: "location", label: "Full location", type: "text" },
      { key: "parkSlug", label: "Park team slug", type: "text", help: "Links this destination to a national park staff directory." },
      { key: "description", label: "Short description", type: "textarea", required: true, wide: true },
      { key: "longDescription", label: "Long description", type: "textarea", wide: true },
      { key: "activities", label: "Activities (comma separated)", type: "list", wide: true },
      { key: "services", label: "Services (comma separated)", type: "list", wide: true },
      { key: "gallery", label: "Gallery image URLs (comma separated)", type: "list", wide: true },
      { key: "openingHours", label: "Opening hours (official only)", type: "text", wide: true },
      { key: "contactEmail", label: "Contact email (official)", type: "text" },
      { key: "contactPhone", label: "Contact telephone (official)", type: "text" },
      { key: "website", label: "Official website", type: "text" },
      { key: "bookingRequirements", label: "Booking requirements", type: "textarea", wide: true },
      { key: "importantInfo", label: "Important visitor information", type: "textarea", wide: true },
      { key: "heroImage", label: "Hero image", type: "media", required: true },
      { key: "cardImage", label: "Card image", type: "media" },
      { key: "videoUrl", label: "Background video URL", type: "text" },
      { key: "featured", label: "Featured on homepage", type: "checkbox", list: true },
      { key: "published", label: "Published", type: "checkbox", list: true },
      { key: "sortOrder", label: "Sort order", type: "number" },
    ],
  },
  prices: {
    label: "Official prices",
    description: "Only verified rows with a source URL and verification date are shown to visitors.",
    fields: [
      { key: "destinationId", label: "Destination", type: "destination", required: true, list: true },
      { key: "label", label: "Price label", type: "text", required: true, list: true },
      { key: "activity", label: "Activity", type: "text", list: true },
      { key: "visitorCategory", label: "Visitor category", type: "select", required: true, list: true, options: [
        { value: "international", label: "International visitor" },
        { value: "resident", label: "Foreign resident in Rwanda" },
        { value: "african", label: "African citizen" },
        { value: "east_african", label: "East African citizen" },
        { value: "citizen", label: "Rwandan citizen" },
      ] },
      { key: "adultAmount", label: "Adult amount", type: "number", list: true },
      { key: "childAmount", label: "Child amount", type: "number" },
      { key: "currency", label: "Currency", type: "select", options: [
        { value: "USD", label: "USD" },
        { value: "RWF", label: "RWF" },
        { value: "EUR", label: "EUR" },
      ], list: true },
      { key: "unit", label: "Unit (e.g. per person / day)", type: "text" },
      { key: "sourceName", label: "Source name", type: "text", wide: true },
      { key: "sourceUrl", label: "Source URL", type: "text", wide: true },
      { key: "verifiedAt", label: "Verified on", type: "date", list: true },
      { key: "verified", label: "Officially verified", type: "checkbox", list: true, help: "Unverified rows are never shown publicly." },
      { key: "notes", label: "Notes", type: "textarea", wide: true },
      { key: "sortOrder", label: "Sort order", type: "number" },
    ],
  },
  bookings: {
    label: "Booking requests",
    description: "Review, approve or reject visitor requests. Status changes email the visitor.",
    readOnly: true,
    fields: [
      { key: "reference", label: "Reference", type: "text", list: true },
      { key: "destinationName", label: "Destination", type: "text", list: true },
      { key: "visitDate", label: "Visit date", type: "date", list: true },
      { key: "status", label: "Status", type: "select", list: true, options: [
        { value: "pending", label: "Pending" },
        { value: "approved", label: "Approved" },
        { value: "rejected", label: "Rejected" },
        { value: "cancelled", label: "Cancelled" },
      ] },
      { key: "adminNote", label: "Administrator note", type: "textarea", wide: true },
    ],
  },
  videos: {
    label: "Background films",
    description:
      "Cinematic scene videos shown behind the website. Each section uses the last enabled film; disable a film to fall back to the shipped default.",
    fields: [
      { key: "section", label: "Website section", type: "select", required: true, list: true, options: [
        { value: "home", label: "Home — Rwanda aerial" },
        { value: "destinations", label: "Destinations — parks, lakes, mountains" },
        { value: "culture", label: "Culture — dance and heritage" },
        { value: "leadership", label: "Leadership — institutions and conservation" },
        { value: "developers", label: "Development team — technology" },
        { value: "gallery", label: "Gallery — cinematography" },
      ] },
      { key: "title", label: "Title", type: "text", required: true, list: true },
      { key: "videoUrl", label: "Video file", type: "media", accept: "video", required: true, list: true, help: "MP4 or WebM up to 24 MB, or a hosted video URL." },
      { key: "posterUrl", label: "Poster image (fallback frame)", type: "media", accept: "image" },
      { key: "description", label: "Description", type: "textarea", wide: true },
      { key: "enabled", label: "Enabled", type: "checkbox", list: true },
      { key: "sortOrder", label: "Sort order", type: "number", list: true },
    ],
  },
  articles: {
    label: "Articles",
    description: "Tourism information and journal stories.",
    fields: [
      { key: "title", label: "Title", type: "text", required: true, list: true },
      { key: "slug", label: "URL slug", type: "text", required: true, list: true },
      { key: "category", label: "Category", type: "text", list: true },
      { key: "author", label: "Author", type: "text" },
      { key: "excerpt", label: "Excerpt", type: "textarea", required: true, wide: true },
      { key: "body", label: "Body (blank line between paragraphs)", type: "textarea", required: true, wide: true },
      { key: "coverImage", label: "Cover image", type: "media", required: true },
      { key: "published", label: "Published", type: "checkbox", list: true },
    ],
  },
  gallery: {
    label: "Gallery",
    description: "Homepage and gallery photography.",
    fields: [
      { key: "url", label: "Image", type: "media", required: true, list: true },
      { key: "caption", label: "Caption", type: "text", list: true },
      { key: "destination", label: "Destination", type: "text" },
      { key: "credit", label: "Photo credit", type: "text" },
      { key: "sortOrder", label: "Sort order", type: "number" },
      { key: "published", label: "Published", type: "checkbox", list: true },
    ],
  },
  personnel: {
    label: "People & teams",
    description: "Tourism leadership, park teams, heritage teams, representatives and developers.",
    fields: [
      { key: "kind", label: "Type", type: "select", required: true, list: true, options: [
        { value: "leader", label: "Tourism leadership" },
        { value: "park_staff", label: "National park team" },
        { value: "culture_staff", label: "Culture & heritage team" },
        { value: "representative", label: "Destination representative" },
        { value: "developer", label: "Development team" },
      ] },
      { key: "name", label: "Full name (leave blank for a team)", type: "text", list: true },
      { key: "title", label: "Title / role", type: "text", required: true, list: true },
      { key: "department", label: "Department", type: "text" },
      { key: "organization", label: "Organisation", type: "text", list: true },
      { key: "scopeSlug", label: "Park / institution slug", type: "text" },
      { key: "category", label: "Representative category", type: "text" },
      { key: "bio", label: "Biography", type: "textarea", wide: true },
      { key: "photoUrl", label: "Photograph", type: "media" },
      { key: "responsibilities", label: "Responsibilities (comma separated)", type: "list", wide: true },
      { key: "skills", label: "Skills (comma separated)", type: "list", wide: true },
      { key: "email", label: "Public email", type: "text" },
      { key: "phone", label: "Public telephone", type: "text" },
      { key: "website", label: "Official reference URL", type: "text" },
      { key: "verified", label: "Verified", type: "checkbox", list: true },
      { key: "featured", label: "Featured", type: "checkbox" },
      { key: "published", label: "Published", type: "checkbox", list: true },
      { key: "sortOrder", label: "Sort order", type: "number" },
    ],
  },
  institutions: {
    label: "Cultural institutions",
    description: "Museums, memorials and heritage institutions.",
    fields: [
      { key: "name", label: "Name", type: "text", required: true, list: true },
      { key: "slug", label: "URL slug", type: "text", required: true, list: true },
      { key: "category", label: "Category", type: "text", required: true, list: true },
      { key: "summary", label: "Summary", type: "textarea", required: true, wide: true },
      { key: "description", label: "Description", type: "textarea", required: true, wide: true },
      { key: "services", label: "Services (comma separated)", type: "list", wide: true },
      { key: "openingHours", label: "Opening information", type: "text", wide: true },
      { key: "contactEmail", label: "Contact email", type: "text" },
      { key: "contactPhone", label: "Contact telephone", type: "text" },
      { key: "website", label: "Official website", type: "text" },
      { key: "imageUrl", label: "Image", type: "media", required: true },
      { key: "district", label: "District", type: "text" },
      { key: "province", label: "Province", type: "text" },
      { key: "verified", label: "Verified", type: "checkbox" },
      { key: "published", label: "Published", type: "checkbox", list: true },
    ],
  },
  services: {
    label: "Tourism services",
    description: "Experiences and services visitors can book.",
    fields: [
      { key: "name", label: "Name", type: "text", required: true, list: true },
      { key: "slug", label: "URL slug", type: "text", required: true, list: true },
      { key: "category", label: "Category", type: "text", required: true, list: true },
      { key: "description", label: "Description", type: "textarea", required: true, wide: true },
      { key: "destinationSlug", label: "Destination slug", type: "text" },
      { key: "provider", label: "Service provider", type: "text" },
      { key: "priceNote", label: "Price note", type: "text" },
      { key: "imageUrl", label: "Image", type: "media", required: true },
      { key: "published", label: "Published", type: "checkbox", list: true },
    ],
  },
  settings: {
    label: "Website content",
    description: "Homepage video, welcome message and official contact details.",
    fields: [
      { key: "key", label: "Setting key", type: "text", required: true, list: true },
      { key: "value", label: "Value", type: "textarea", required: true, list: true, wide: true },
    ],
  },
};

export const adminSections: {
  href: string;
  label: string;
  resources: AdminResourceKey[];
  description: string;
}[] = [
  { href: "/admin", label: "Overview", resources: [], description: "Platform activity at a glance." },
  {
    href: "/admin/bookings",
    label: "Bookings",
    resources: ["bookings"],
    description: "Every visitor request, with approve and reject controls.",
  },
  {
    href: "/admin/destinations",
    label: "Destinations",
    resources: ["destinations", "prices"],
    description: "Destination profiles and official pricing with sources.",
  },
  {
    href: "/admin/people",
    label: "People & teams",
    resources: ["personnel", "institutions", "services"],
    description: "Leadership, park and heritage teams, representatives and the development team.",
  },
  {
    href: "/admin/content",
    label: "Content",
    resources: ["articles", "gallery", "settings"],
    description: "Articles, gallery imagery, homepage video and contact details.",
  },
];
