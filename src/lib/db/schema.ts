import {
  pgTable, uuid, varchar, timestamp, date, numeric, pgEnum, uniqueIndex, index
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

export const slots = pgTable("slots", {
  id: uuid("id").defaultRandom().primaryKey(),
  turfId: uuid("turf_id").notNull().references(() => turfs.id),
  turfSportId: uuid("turf_sport_id").notNull(),
  slotDate: date("slot_date").notNull(),
  startAt: timestamp("start_at", { withTimezone: true }).notNull(),
  endAt: timestamp("end_at", { withTimezone: true }).notNull(),
  basePrice: numeric("base_price", { precision: 10, scale: 2 }).notNull(),
  finalPrice: numeric("final_price", { precision: 10, scale: 2 }).notNull(),
  status: slotStatus("status").notNull().default("AVAILABLE"),
}, (t) => ({
  slotIdentity: uniqueIndex("slots_sport_start_uidx").on(t.turfSportId, t.startAt),
  calendarIdx: index("slots_calendar_idx").on(t.turfId, t.slotDate, t.status),
}));

export const bookings = pgTable("bookings", {
  id: uuid("id").defaultRandom().primaryKey(),
  bookingCode: varchar("booking_code", { length: 20 }).notNull().unique(),
  slotId: uuid("slot_id").notNull().unique(), // The ultimate Double-Booking prevention guard
  turfId: uuid("turf_id").notNull().references(() => turfs.id),
  userId: uuid("user_id").references(() => users.id),
  customerName: varchar("customer_name", { length: 120 }).notNull(),
  customerPhone: varchar("customer_phone", { length: 15 }).notNull(),
  source: bookingSource("source").notNull(),
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(), // Snapshot of finalPrice
  status: bookingStatus("status").notNull().default("CONFIRMED"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (t) => ({
  phoneIdx: index("bookings_phone_idx").on(t.customerPhone),
  turfCreatedIdx: index("bookings_turf_created_idx").on(t.turfId, t.createdAt),
}));
