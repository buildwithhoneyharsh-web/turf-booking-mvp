import {
  pgTable, uuid, varchar, timestamp, date, numeric, boolean, pgEnum, uniqueIndex, index
} from "drizzle-orm/pg-core";

export const userRole = pgEnum("user_role", ["PLAYER", "OWNER", "MANAGER", "ADMIN"]);
export const userStatus = pgEnum("user_status", ["ACTIVE", "SUSPENDED", "DELETED"]);
export const slotStatus = pgEnum("slot_status", ["AVAILABLE", "BOOKED", "BLOCKED", "MAINTENANCE"]);
export const bookingStatus = pgEnum("booking_status", ["CONFIRMED", "CANCELLED", "COMPLETED", "NO_SHOW", "EXPIRED"]);
export const bookingSource = pgEnum("booking_source", ["ONLINE", "PHONE", "WALK_IN", "OWNER"]);

export const users = pgTable("users", {
  id: uuid("id").primaryKey(), // Links directly to Supabase Auth UUID
  phone: varchar("phone", { length: 15 }).notNull().unique(),
  fullName: varchar("full_name", { length: 120 }),
  role: userRole("role").notNull().default("PLAYER"),
  status: userStatus("status").notNull().default("ACTIVE"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const cities = pgTable("cities", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 80 }).notNull().unique(),
  state: varchar("state", { length: 80 }).notNull(),
  timezone: varchar("timezone", { length: 50 }).notNull().default("Asia/Kolkata"),
});

export const turfs = pgTable("turfs", {
  id: uuid("id").defaultRandom().primaryKey(),
  cityId: uuid("city_id").notNull().references(() => cities.id),
  ownerId: uuid("owner_id").notNull().references(() => users.id),
  name: varchar("name", { length: 150 }).notNull(),
  address: varchar("address", { length: 500 }).notNull(),
  timezone: varchar("timezone", { length: 50 }).notNull().default("Asia/Kolkata"),
});

// Multi-Ground / Court Support Table
export const grounds = pgTable("grounds", {
  id: uuid("id").defaultRandom().primaryKey(),
  turfId: uuid("turf_id").notNull().references(() => turfs.id),
  name: varchar("name", { length: 80 }).notNull(), // e.g., "Court 1"
  code: varchar("code", { length: 20 }).notNull(), // e.g., "C1"
  surfaceType: varchar("surface_type", { length: 50 }), // e.g., "Synthetic", "Turf", "Wooden"
  environment: varchar("environment", { length: 20 }), // e.g., "Outdoor", "Indoor"
  isActive: boolean("is_active").notNull().default(true),
}, (t) => ({
  turfIdx: index("grounds_turf_idx").on(t.turfId),
}));

export const slots = pgTable("slots", {
  id: uuid("id").defaultRandom().primaryKey(),
  turfId: uuid("turf_id").notNull().references(() => turfs.id), 
  groundId: uuid("ground_id").notNull().references(() => grounds.id), // Links slot to specific pitch/court
  sportId: uuid("sport_id").notNull(), 
  slotDate: date("slot_date").notNull(),
  startAt: timestamp("start_at", { withTimezone: true }).notNull(),
  endAt: timestamp("end_at", { withTimezone: true }).notNull(),
  basePrice: numeric("base_price", { precision: 10, scale: 2 }).notNull(),
  finalPrice: numeric("final_price", { precision: 10, scale: 2 }).notNull(),
  status: slotStatus("status").notNull().default("AVAILABLE"),
}, (t) => ({
  slotIdentity: uniqueIndex("slots_ground_start_uidx").on(t.groundId, t.startAt),
  calendarIdx: index("slots_calendar_idx").on(t.turfId, t.slotDate, t.status),
}));

// Parent Booking Record
export const bookings = pgTable("bookings", {
  id: uuid("id").defaultRandom().primaryKey(),
  bookingCode: varchar("booking_code", { length: 20 }).notNull().unique(),
  turfId: uuid("turf_id").notNull().references(() => turfs.id),
  userId: uuid("user_id").references(() => users.id),
  customerName: varchar("customer_name", { length: 120 }).notNull(),
  customerPhone: varchar("customer_phone", { length: 15 }).notNull(),
  source: bookingSource("source").notNull(),
  totalAmount: numeric("total_amount", { precision: 10, scale: 2 }).notNull(), // Sum of all claimed slots
  status: bookingStatus("status").notNull().default("CONFIRMED"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (t) => ({
  phoneIdx: index("bookings_phone_idx").on(t.customerPhone),
  turfCreatedIdx: index("bookings_turf_created_idx").on(t.turfId, t.createdAt),
}));

// Child Booking Items (Allows selecting multiple courts/slots in 1 booking)
export const bookingItems = pgTable("booking_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  bookingId: uuid("booking_id").notNull().references(() => bookings.id),
  slotId: uuid("slot_id").notNull().unique(), // Unique guard ensures slot cannot belong to 2 booking items
  priceSnapshot: numeric("price_snapshot", { precision: 10, scale: 2 }).notNull(),
});
