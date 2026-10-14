import {
  pgTable,
  serial,
  text,
  integer,
  timestamp,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: text("role").notNull().default("buyer"), // 'creator' | 'buyer'
  avatarUrl: text("avatar_url").notNull().default(""),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  tagline: text("tagline").notNull(),
  description: text("description").notNull(),
  priceCents: integer("price_cents").notNull(),
  category: text("category").notNull(), // 'Automation Tools' | 'Workflows' | 'E-Books' | 'Doc Templates' | 'Preset Kits' | 'Workflow Packs' | 'Digital Packs'
  fileFormat: text("file_format").notNull(), // e.g., '.JSON, .PDF'
  fileSizeMb: text("file_size_mb").notNull(), // e.g., '48.5 MB'
  version: text("version").notNull().default("v1.0.0"),
  coverImage: text("cover_image").notNull(),
  previewUrl: text("preview_url").notNull().default("https://atelierfoundry.io/preview"),
  status: text("status").notNull().default("published"), // 'published' | 'draft' | 'archived'
  salesCount: integer("sales_count").notNull().default(0),
  creatorId: integer("creator_id").references(() => users.id, {
    onDelete: "set null",
  }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  productId: integer("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),
  buyerEmail: text("buyer_email").notNull(),
  buyerName: text("buyer_name").notNull(),
  amountCents: integer("amount_cents").notNull(),
  licenseKey: text("license_key").notNull().unique(), // e.g., 'OTOPZ-982F-441A-89BC'
  status: text("status").notNull().default("completed"), // 'completed' | 'refunded'
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  productId: integer("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),
  authorName: text("author_name").notNull(),
  rating: integer("rating").notNull(), // 1 to 5
  comment: text("comment").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;

export type Order = typeof orders.$inferSelect;
export type NewOrder = typeof orders.$inferInsert;

export type Review = typeof reviews.$inferSelect;
export type NewReview = typeof reviews.$inferInsert;
