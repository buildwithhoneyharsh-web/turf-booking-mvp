-- Enable Row Level Security
ALTER TABLE "users" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "cities" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "turfs" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "grounds" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "slots" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "bookings" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "booking_items" ENABLE ROW LEVEL SECURITY;

-- 1. Users policies
CREATE POLICY "Allow public read access to users"
ON "users" FOR SELECT
USING (true);

CREATE POLICY "Allow users to update their own profile"
ON "users" FOR UPDATE
USING (auth.uid() = id);

CREATE POLICY "Allow users to insert their own profile"
ON "users" FOR INSERT
WITH CHECK (auth.uid() = id);

-- 2. Cities policies
CREATE POLICY "Allow public read access to cities"
ON "cities" FOR SELECT
USING (true);

-- 3. Turfs policies
CREATE POLICY "Allow public read access to turfs"
ON "turfs" FOR SELECT
USING (true);

-- 4. Grounds policies
CREATE POLICY "Allow public read access to grounds"
ON "grounds" FOR SELECT
USING (true);

-- 5. Slots policies
CREATE POLICY "Allow public read access to slots"
ON "slots" FOR SELECT
USING (true);

-- 6. Bookings policies
CREATE POLICY "Allow players to read their own bookings"
ON "bookings" FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Allow players to insert bookings"
ON "bookings" FOR INSERT
WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- 7. Booking Items policies
CREATE POLICY "Allow players to read their own booking items"
ON "booking_items" FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM "bookings" b
    WHERE b.id = booking_id AND (b.user_id = auth.uid())
  )
);

CREATE POLICY "Allow players to insert booking items"
ON "booking_items" FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM "bookings" b
    WHERE b.id = booking_id AND (b.user_id = auth.uid() OR b.user_id IS NULL)
  )
);
