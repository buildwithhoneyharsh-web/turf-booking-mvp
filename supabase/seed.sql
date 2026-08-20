-- 1. Insert seed Users
INSERT INTO "users" (id, phone, full_name, role, status, created_at)
VALUES
  ('e9b89791-cf33-4f9e-a0e2-1273778848fa', '+919999999998', 'Platform Admin', 'ADMIN', 'ACTIVE', NOW()),
  ('f0224df0-fa22-4422-9222-1273778848fb', '+919876543210', 'Amit Sharma', 'OWNER', 'ACTIVE', NOW()),
  ('f0224df0-fa22-4422-9222-1273778848fc', '+919876543211', 'Bhupendra Singh', 'OWNER', 'ACTIVE', NOW()),
  ('f0224df0-fa22-4422-9222-1273778848fd', '+919876543212', 'Harsh Vardhan', 'OWNER', 'ACTIVE', NOW()),
  ('a9b89791-cf33-4f9e-a0e2-1273778848ff', '+919999999999', 'Rahul Verma', 'PLAYER', 'ACTIVE', NOW())
ON CONFLICT (id) DO NOTHING;

-- 2. Insert City (Ratlam)
INSERT INTO "cities" (id, name, state, timezone)
VALUES ('c3b89791-cf33-4f9e-a0e2-1273778848aa', 'Ratlam', 'Madhya Pradesh', 'Asia/Kolkata')
ON CONFLICT (name) DO NOTHING;

-- 3. Insert Turfs/Venues (Turf IDs must use valid hex e.g. starting with 'd022...')
INSERT INTO "turfs" (id, city_id, owner_id, name, address, timezone)
VALUES
  ('d0224df0-fa22-4422-9222-1273778848fb', 'c3b89791-cf33-4f9e-a0e2-1273778848aa', 'f0224df0-fa22-4422-9222-1273778848fb', 'Greenfield Arena', 'Shastri Nagar, Ratlam', 'Asia/Kolkata'),
  ('d0224df0-fa22-4422-9222-1273778848fc', 'c3b89791-cf33-4f9e-a0e2-1273778848aa', 'f0224df0-fa22-4422-9222-1273778848fc', 'KickOff Arena', 'Station Road, Ratlam', 'Asia/Kolkata'),
  ('d0224df0-fa22-4422-9222-1273778848fd', 'c3b89791-cf33-4f9e-a0e2-1273778848aa', 'f0224df0-fa22-4422-9222-1273778848fd', 'SportzZone', 'Kasturba Nagar, Ratlam', 'Asia/Kolkata')
ON CONFLICT (id) DO NOTHING;

-- 4. Insert Grounds (Ground IDs must use valid hex e.g. starting with 'e022...')
INSERT INTO "grounds" (id, turf_id, name, code, surface_type, environment, is_active)
VALUES
  -- Greenfield Arena (2 Courts)
  ('e0224df0-fa22-4422-9222-000000000001', 'd0224df0-fa22-4422-9222-1273778848fb', 'Court 1', 'C1', 'Synthetic Turf', 'Outdoor', true),
  ('e0224df0-fa22-4422-9222-000000000002', 'd0224df0-fa22-4422-9222-1273778848fb', 'Court 2', 'C2', 'Synthetic Turf', 'Outdoor', true),
  
  -- KickOff Arena (2 Grounds)
  ('e0224df0-fa22-4422-9222-000000000003', 'd0224df0-fa22-4422-9222-1273778848fc', 'Main Arena', 'KA1', 'Natural Grass', 'Outdoor', true),
  ('e0224df0-fa22-4422-9222-000000000004', 'd0224df0-fa22-4422-9222-1273778848fc', 'Tennis Court', 'KA2', 'Hard Court', 'Outdoor', true),
  
  -- SportzZone (3 Grounds)
  ('e0224df0-fa22-4422-9222-000000000005', 'd0224df0-fa22-4422-9222-1273778848fd', 'Badminton Court A', 'SZ1', 'Wooden Floor', 'Indoor', true),
  ('e0224df0-fa22-4422-9222-000000000006', 'd0224df0-fa22-4422-9222-1273778848fd', 'Badminton Court B', 'SZ2', 'Wooden Floor', 'Indoor', true),
  ('e0224df0-fa22-4422-9222-000000000007', 'd0224df0-fa22-4422-9222-1273778848fd', 'Basketball Court', 'SZ3', 'Acrylic', 'Outdoor', true)
ON CONFLICT (id) DO NOTHING;

-- 5. Helper Function to generate rolling slots for the next 7 days
DO $$
DECLARE
  v_turf_id UUID;
  v_ground_id UUID;
  v_sport_id UUID;
  v_date DATE;
  v_hour INT;
  v_start TIMESTAMP WITH TIME ZONE;
  v_end TIMESTAMP WITH TIME ZONE;
  v_price NUMERIC(10, 2);
  v_base_price NUMERIC(10, 2);
BEGIN
  -- Define hardcoded sport UUIDs
  -- Football = 00000000-0000-0000-0000-000000000001
  -- Cricket = 00000000-0000-0000-0000-000000000002
  -- Tennis = 00000000-0000-0000-0000-000000000003
  -- Badminton = 00000000-0000-0000-0000-000000000004
  -- Basketball = 00000000-0000-0000-0000-000000000005

  -- Loop through grounds and generate hourly slots
  FOR v_date IN (SELECT GENERATE_SERIES(CURRENT_DATE, CURRENT_DATE + INTERVAL '7 days', '1 day')::DATE) LOOP
    
    -- Ground 1 & 2 (Greenfield Arena) - Football (Court 1) & Cricket (Court 2)
    FOR v_hour IN 6..22 LOOP
      -- Greenfield Court 1 (Football)
      v_start := v_date + (v_hour * INTERVAL '1 hour');
      v_end := v_start + INTERVAL '1 hour';
      -- Peak pricing after 6:00 PM (18:00)
      IF v_hour >= 17 THEN
        v_base_price := 1200.00;
      ELSE
        v_base_price := 800.00;
      END IF;
      
      INSERT INTO "slots" (id, turf_id, ground_id, sport_id, slot_date, start_at, end_at, base_price, final_price, status)
      VALUES (
        gen_random_uuid(),
        'd0224df0-fa22-4422-9222-1273778848fb',
        'e0224df0-fa22-4422-9222-000000000001',
        '00000000-0000-0000-0000-000000000001',
        v_date,
        v_start,
        v_end,
        v_base_price,
        v_base_price,
        'AVAILABLE'
      ) ON CONFLICT (ground_id, start_at) DO NOTHING;

      -- Greenfield Court 2 (Cricket)
      INSERT INTO "slots" (id, turf_id, ground_id, sport_id, slot_date, start_at, end_at, base_price, final_price, status)
      VALUES (
        gen_random_uuid(),
        'd0224df0-fa22-4422-9222-1273778848fb',
        'e0224df0-fa22-4422-9222-000000000002',
        '00000000-0000-0000-0000-000000000002',
        v_date,
        v_start,
        v_end,
        v_base_price + 200.00, -- Cricket is slightly pricier
        v_base_price + 200.00,
        'AVAILABLE'
      ) ON CONFLICT (ground_id, start_at) DO NOTHING;
    END LOOP;

    -- Ground 3 & 4 (KickOff Arena) - Football (Main Arena) & Tennis (Tennis Court)
    FOR v_hour IN 6..22 LOOP
      v_start := v_date + (v_hour * INTERVAL '1 hour');
      v_end := v_start + INTERVAL '1 hour';
      
      -- KickOff Main Arena (Football)
      INSERT INTO "slots" (id, turf_id, ground_id, sport_id, slot_date, start_at, end_at, base_price, final_price, status)
      VALUES (
        gen_random_uuid(),
        'd0224df0-fa22-4422-9222-1273778848fc',
        'e0224df0-fa22-4422-9222-000000000003',
        '00000000-0000-0000-0000-000000000001',
        v_date,
        v_start,
        v_end,
        1500.00,
        1500.00,
        'AVAILABLE'
      ) ON CONFLICT (ground_id, start_at) DO NOTHING;

      -- KickOff Tennis Court (Tennis)
      INSERT INTO "slots" (id, turf_id, ground_id, sport_id, slot_date, start_at, end_at, base_price, final_price, status)
      VALUES (
        gen_random_uuid(),
        'd0224df0-fa22-4422-9222-1273778848fc',
        'e0224df0-fa22-4422-9222-000000000004',
        '00000000-0000-0000-0000-000000000003',
        v_date,
        v_start,
        v_end,
        1000.00,
        1000.00,
        'AVAILABLE'
      ) ON CONFLICT (ground_id, start_at) DO NOTHING;
    END LOOP;

    -- Ground 5, 6 & 7 (SportzZone) - Badminton (A & B) & Basketball
    FOR v_hour IN 6..22 LOOP
      v_start := v_date + (v_hour * INTERVAL '1 hour');
      v_end := v_start + INTERVAL '1 hour';
      
      -- Badminton A
      INSERT INTO "slots" (id, turf_id, ground_id, sport_id, slot_date, start_at, end_at, base_price, final_price, status)
      VALUES (
        gen_random_uuid(),
        'd0224df0-fa22-4422-9222-1273778848fd',
        'e0224df0-fa22-4422-9222-000000000005',
        '00000000-0000-0000-0000-000000000004',
        v_date,
        v_start,
        v_end,
        400.00,
        400.00,
        'AVAILABLE'
      ) ON CONFLICT (ground_id, start_at) DO NOTHING;

      -- Badminton B
      INSERT INTO "slots" (id, turf_id, ground_id, sport_id, slot_date, start_at, end_at, base_price, final_price, status)
      VALUES (
        gen_random_uuid(),
        'd0224df0-fa22-4422-9222-1273778848fd',
        'e0224df0-fa22-4422-9222-000000000006',
        '00000000-0000-0000-0000-000000000004',
        v_date,
        v_start,
        v_end,
        400.00,
        400.00,
        'AVAILABLE'
      ) ON CONFLICT (ground_id, start_at) DO NOTHING;

      -- Basketball
      INSERT INTO "slots" (id, turf_id, ground_id, sport_id, slot_date, start_at, end_at, base_price, final_price, status)
      VALUES (
        gen_random_uuid(),
        'd0224df0-fa22-4422-9222-1273778848fd',
        'e0224df0-fa22-4422-9222-000000000007',
        '00000000-0000-0000-0000-000000000005',
        v_date,
        v_start,
        v_end,
        600.00,
        600.00,
        'AVAILABLE'
      ) ON CONFLICT (ground_id, start_at) DO NOTHING;
    END LOOP;

  END LOOP;
END $$;
