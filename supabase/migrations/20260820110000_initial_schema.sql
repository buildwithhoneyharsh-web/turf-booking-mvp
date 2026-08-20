CREATE TYPE "public"."booking_source" AS ENUM('ONLINE', 'PHONE', 'WALK_IN', 'OWNER');
CREATE TYPE "public"."booking_status" AS ENUM('CONFIRMED', 'CANCELLED', 'COMPLETED', 'NO_SHOW', 'EXPIRED');
CREATE TYPE "public"."slot_status" AS ENUM('AVAILABLE', 'BOOKED', 'BLOCKED', 'MAINTENANCE');
CREATE TYPE "public"."user_role" AS ENUM('PLAYER', 'OWNER', 'MANAGER', 'ADMIN');
CREATE TYPE "public"."user_status" AS ENUM('ACTIVE', 'SUSPENDED', 'DELETED');

CREATE TABLE "booking_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"booking_id" uuid NOT NULL,
	"slot_id" uuid NOT NULL,
	"price_snapshot" numeric(10, 2) NOT NULL,
	CONSTRAINT "booking_items_slot_id_unique" UNIQUE("slot_id")
);

CREATE TABLE "bookings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"booking_code" varchar(20) NOT NULL,
	"turf_id" uuid NOT NULL,
	"user_id" uuid,
	"customer_name" varchar(120) NOT NULL,
	"customer_phone" varchar(15) NOT NULL,
	"source" "booking_source" NOT NULL,
	"total_amount" numeric(10, 2) NOT NULL,
	"status" "booking_status" DEFAULT 'CONFIRMED' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "bookings_booking_code_unique" UNIQUE("booking_code")
);

CREATE TABLE "cities" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(80) NOT NULL,
	"state" varchar(80) NOT NULL,
	"timezone" varchar(50) DEFAULT 'Asia/Kolkata' NOT NULL,
	CONSTRAINT "cities_name_unique" UNIQUE("name")
);

CREATE TABLE "grounds" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"turf_id" uuid NOT NULL,
	"name" varchar(80) NOT NULL,
	"code" varchar(20) NOT NULL,
	"surface_type" varchar(50),
	"environment" varchar(20),
	"is_active" boolean DEFAULT true NOT NULL
);

CREATE TABLE "slots" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"turf_id" uuid NOT NULL,
	"ground_id" uuid NOT NULL,
	"sport_id" uuid NOT NULL,
	"slot_date" date NOT NULL,
	"start_at" timestamp with time zone NOT NULL,
	"end_at" timestamp with time zone NOT NULL,
	"base_price" numeric(10, 2) NOT NULL,
	"final_price" numeric(10, 2) NOT NULL,
	"status" "slot_status" DEFAULT 'AVAILABLE' NOT NULL
);

CREATE TABLE "turfs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"city_id" uuid NOT NULL,
	"owner_id" uuid NOT NULL,
	"name" varchar(150) NOT NULL,
	"address" varchar(500) NOT NULL,
	"timezone" varchar(50) DEFAULT 'Asia/Kolkata' NOT NULL
);

CREATE TABLE "users" (
	"id" uuid PRIMARY KEY NOT NULL,
	"phone" varchar(15) NOT NULL,
	"full_name" varchar(120),
	"role" "user_role" DEFAULT 'PLAYER' NOT NULL,
	"status" "user_status" DEFAULT 'ACTIVE' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_phone_unique" UNIQUE("phone")
);

ALTER TABLE "booking_items" ADD CONSTRAINT "booking_items_booking_id_bookings_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_turf_id_turfs_id_fk" FOREIGN KEY ("turf_id") REFERENCES "public"."turfs"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "grounds" ADD CONSTRAINT "grounds_turf_id_turfs_id_fk" FOREIGN KEY ("turf_id") REFERENCES "public"."turfs"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "slots" ADD CONSTRAINT "slots_turf_id_turfs_id_fk" FOREIGN KEY ("turf_id") REFERENCES "public"."turfs"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "slots" ADD CONSTRAINT "slots_ground_id_grounds_id_fk" FOREIGN KEY ("ground_id") REFERENCES "public"."grounds"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "turfs" ADD CONSTRAINT "turfs_city_id_cities_id_fk" FOREIGN KEY ("city_id") REFERENCES "public"."cities"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "turfs" ADD CONSTRAINT "turfs_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;

CREATE INDEX "bookings_phone_idx" ON "bookings" USING btree ("customer_phone");
CREATE INDEX "bookings_turf_created_idx" ON "bookings" USING btree ("turf_id","created_at");
CREATE INDEX "grounds_turf_idx" ON "grounds" USING btree ("turf_id");
CREATE UNIQUE INDEX "slots_ground_start_uidx" ON "slots" USING btree ("ground_id","start_at");
CREATE INDEX "slots_calendar_idx" ON "slots" USING btree ("turf_id","slot_date","status");
