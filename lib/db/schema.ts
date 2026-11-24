import {
  pgTable,
  text,
  uuid,
  integer,
  boolean,
  timestamp,
  date,
  jsonb,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";

export const users = pgTable(
  "users",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    fullName: text("full_name").notNull(),
    email: text("email").notNull(),
    phone: text("phone").notNull(),
    passwordHash: text("password_hash").notNull(),
    role: text("role").notNull().default("user"), // user | admin
    avatarMediaId: uuid("avatar_media_id"),
    dateOfBirth: date("date_of_birth"),
    nationality: text("nationality"),
    hasNationalId: boolean("has_national_id").notNull().default(false),
    nationalId: text("national_id"), // sensitive, never sent to clients
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
  },
  (t) => [
    uniqueIndex("users_email_unique").on(t.email),
    uniqueIndex("users_phone_unique").on(t.phone),
  ]
);

export const sessions = pgTable(
  "sessions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    tokenHash: text("token_hash").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex("sessions_token_hash_unique").on(t.tokenHash), index("sessions_user_idx").on(t.userId)]
);

export const passwordResetTokens = pgTable(
  "password_reset_tokens",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    tokenHash: text("token_hash").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    usedAt: timestamp("used_at", { withTimezone: true }),
  },
  (t) => [uniqueIndex("password_reset_token_hash_unique").on(t.tokenHash)]
);

export const mediaAssets = pgTable("media_assets", {
  id: uuid("id").primaryKey().defaultRandom(),
  filename: text("filename").notNull(),
  mimeType: text("mime_type").notNull(),
  sizeBytes: integer("size_bytes").notNull(),
  dataBase64: text("data_base64").notNull(),
  uploadedBy: uuid("uploaded_by"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

/** Background films managed from the administrator dashboard, one row per website section. */
export const videoAssets = pgTable(
  "video_assets",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    section: text("section").notNull(), // home | destinations | culture | leadership | developers | gallery
    title: text("title").notNull(),
    description: text("description"),
    videoUrl: text("video_url").notNull(),
    posterUrl: text("poster_url"),
    enabled: boolean("enabled").notNull().default(true),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("video_assets_section_idx").on(t.section)]
);

export const destinations = pgTable(
  "destinations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    slug: text("slug").notNull(),
    name: text("name").notNull(),
    tagline: text("tagline"),
    category: text("category").notNull(), // National Parks, Cultural Tourism, ...
    parkSlug: text("park_slug"), // links a destination to a national park team
    province: text("province"),
    district: text("district"),
    location: text("location"),
    description: text("description").notNull(),
    longDescription: text("long_description"),
    activities: jsonb("activities").$type<string[]>().notNull().default([]),
    services: jsonb("services").$type<string[]>().notNull().default([]),
    openingHours: text("opening_hours"),
    contactEmail: text("contact_email"),
    contactPhone: text("contact_phone"),
    website: text("website"),
    bookingRequirements: text("booking_requirements"),
    importantInfo: text("important_info"),
    heroImage: text("hero_image").notNull(),
    cardImage: text("card_image"),
    videoUrl: text("video_url"),
    gallery: jsonb("gallery").$type<string[]>().notNull().default([]),
    featured: boolean("featured").notNull().default(false),
    published: boolean("published").notNull().default(true),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex("destinations_slug_unique").on(t.slug)]
);

/**
 * Official prices only. A price row is shown to visitors exclusively when
 * `verified` is true and it carries a source URL plus a verification date.
 */
export const destinationPrices = pgTable(
  "destination_prices",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    destinationId: uuid("destination_id")
      .notNull()
      .references(() => destinations.id, { onDelete: "cascade" }),
    label: text("label").notNull(), // "Park entry / day visit", "Gorilla permit"
    activity: text("activity"),
    visitorCategory: text("visitor_category").notNull(), // international | resident | citizen | east_african | african
    adultAmount: integer("adult_amount"),
    childAmount: integer("child_amount"),
    currency: text("currency").notNull().default("USD"),
    unit: text("unit"),
    sourceName: text("source_name"),
    sourceUrl: text("source_url"),
    verifiedAt: date("verified_at"),
    verified: boolean("verified").notNull().default(false),
    notes: text("notes"),
    sortOrder: integer("sort_order").notNull().default(0),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("destination_prices_destination_idx").on(t.destinationId)]
);

export const destinationImages = pgTable("destination_images", {
  id: uuid("id").primaryKey().defaultRandom(),
  destinationId: uuid("destination_id")
    .notNull()
    .references(() => destinations.id, { onDelete: "cascade" }),
  url: text("url").notNull(),
  caption: text("caption"),
  credit: text("credit"),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const bookings = pgTable(
  "bookings",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    reference: text("reference").notNull(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    destinationId: uuid("destination_id").references(() => destinations.id, { onDelete: "set null" }),
    destinationName: text("destination_name").notNull(),
    activity: text("activity"),
    visitorCategory: text("visitor_category").notNull(),
    visitDate: date("visit_date").notNull(),
    adults: integer("adults").notNull(),
    children: integer("children").notNull().default(0),
    unitAdultPrice: integer("unit_adult_price"),
    unitChildPrice: integer("unit_child_price"),
    totalPrice: integer("total_price"),
    currency: text("currency"),
    priceVerified: boolean("price_verified").notNull().default(false),
    priceSourceUrl: text("price_source_url"),
    specialRequests: text("special_requests"),
    status: text("status").notNull().default("pending"), // pending | approved | rejected | cancelled
    adminNote: text("admin_note"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("bookings_reference_unique").on(t.reference),
    index("bookings_user_idx").on(t.userId),
    index("bookings_status_idx").on(t.status),
  ]
);

export const articles = pgTable(
  "articles",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    slug: text("slug").notNull(),
    title: text("title").notNull(),
    excerpt: text("excerpt").notNull(),
    body: text("body").notNull(),
    coverImage: text("cover_image").notNull(),
    category: text("category").notNull().default("Travel"),
    author: text("author").notNull().default("Visit Rwanda Academy"),
    published: boolean("published").notNull().default(true),
    publishedAt: timestamp("published_at", { withTimezone: true }).notNull().defaultNow(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex("articles_slug_unique").on(t.slug)]
);

export const galleryImages = pgTable("gallery_images", {
  id: uuid("id").primaryKey().defaultRandom(),
  url: text("url").notNull(),
  caption: text("caption"),
  destination: text("destination"),
  credit: text("credit"),
  sortOrder: integer("sort_order").notNull().default(0),
  published: boolean("published").notNull().default(true),
});

/**
 * People and teams: verified tourism leadership, park and heritage staff,
 * destination representatives and the academy development team.
 * `name` stays null when an individual cannot be verified - the department or
 * team is then presented without a fabricated identity.
 */
export const personnel = pgTable(
  "personnel",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    kind: text("kind").notNull(), // leader | park_staff | culture_staff | representative | developer
    name: text("name"),
    title: text("title").notNull(),
    department: text("department"),
    organization: text("organization"),
    scopeSlug: text("scope_slug"), // park slug or institution slug
    category: text("category"),
    bio: text("bio"),
    photoUrl: text("photo_url"),
    responsibilities: jsonb("responsibilities").$type<string[]>().notNull().default([]),
    services: jsonb("services").$type<string[]>().notNull().default([]),
    skills: jsonb("skills").$type<string[]>().notNull().default([]),
    email: text("email"),
    phone: text("phone"),
    website: text("website"),
    verified: boolean("verified").notNull().default(false),
    published: boolean("published").notNull().default(true),
    featured: boolean("featured").notNull().default(false),
    sortOrder: integer("sort_order").notNull().default(0),
  },
  (t) => [index("personnel_kind_idx").on(t.kind), index("personnel_scope_idx").on(t.scopeSlug)]
);

export const institutions = pgTable(
  "institutions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    slug: text("slug").notNull(),
    name: text("name").notNull(),
    category: text("category").notNull().default("Cultural Heritage"),
    summary: text("summary").notNull(),
    description: text("description").notNull(),
    services: jsonb("services").$type<string[]>().notNull().default([]),
    openingHours: text("opening_hours"),
    contactEmail: text("contact_email"),
    contactPhone: text("contact_phone"),
    website: text("website"),
    imageUrl: text("image_url").notNull(),
    district: text("district"),
    province: text("province"),
    verified: boolean("verified").notNull().default(false),
    published: boolean("published").notNull().default(true),
    sortOrder: integer("sort_order").notNull().default(0),
  },
  (t) => [uniqueIndex("institutions_slug_unique").on(t.slug)]
);

export const services = pgTable(
  "services",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    slug: text("slug").notNull(),
    name: text("name").notNull(),
    category: text("category").notNull(),
    description: text("description").notNull(),
    destinationSlug: text("destination_slug"),
    provider: text("provider"),
    priceNote: text("price_note"),
    imageUrl: text("image_url").notNull(),
    published: boolean("published").notNull().default(true),
    sortOrder: integer("sort_order").notNull().default(0),
  },
  (t) => [uniqueIndex("services_slug_unique").on(t.slug)]
);

export const siteSettings = pgTable("site_settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const notifications = pgTable(
  "notifications",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    type: text("type").notNull().default("booking"),
    title: text("title").notNull(),
    message: text("message").notNull(),
    bookingId: uuid("booking_id"),
    read: boolean("read").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("notifications_read_idx").on(t.read)]
);

/**
 * Visitor enquiries submitted from the contact page. Every message is stored
 * so nothing is lost when email delivery is not configured, and the tourism
 * team replies from the administrator inbox.
 */
export const enquiries = pgTable(
  "enquiries",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    reference: text("reference").notNull(),
    name: text("name").notNull(),
    email: text("email").notNull(),
    phone: text("phone"),
    topic: text("topic").notNull().default("general"),
    subject: text("subject").notNull(),
    message: text("message").notNull(),
    status: text("status").notNull().default("new"), // new | read | replied | closed
    adminReply: text("admin_reply"),
    repliedAt: timestamp("replied_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("enquiries_reference_unique").on(t.reference),
    index("enquiries_status_idx").on(t.status),
  ]
);

export type User = typeof users.$inferSelect;
export type Destination = typeof destinations.$inferSelect;
export type DestinationPrice = typeof destinationPrices.$inferSelect;
export type Booking = typeof bookings.$inferSelect;
export type Article = typeof articles.$inferSelect;
export type Personnel = typeof personnel.$inferSelect;
export type VideoAsset = typeof videoAssets.$inferSelect;
export type Institution = typeof institutions.$inferSelect;
export type Service = typeof services.$inferSelect;
export type GalleryImage = typeof galleryImages.$inferSelect;
export type Notification = typeof notifications.$inferSelect;
export type Enquiry = typeof enquiries.$inferSelect;
