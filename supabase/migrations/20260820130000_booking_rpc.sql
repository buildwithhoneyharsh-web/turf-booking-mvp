CREATE OR REPLACE FUNCTION book_slots(
  p_turf_id UUID,
  p_customer_name VARCHAR,
  p_customer_phone VARCHAR,
  p_source VARCHAR,
  p_slot_ids UUID[],
  p_user_id UUID DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER -- Runs with elevated privileges to bypass RLS for updating slot status and writing booking logs
AS $$
DECLARE
  v_booking_id UUID;
  v_booking_code VARCHAR;
  v_total_amount NUMERIC(10, 2) := 0.00;
  v_slot_count INT;
  v_price_sum NUMERIC(10, 2);
  v_result JSONB;
BEGIN
  -- 1. Lock slots to prevent race conditions (SELECT ... FOR UPDATE)
  -- This blocks any parallel transactions from locking or modifying these rows
  PERFORM 1 FROM slots
  WHERE id = ANY(p_slot_ids)
  FOR UPDATE;

  -- 2. Verify all slots are available and belong to the specified turf
  SELECT COUNT(*), SUM(final_price)
  INTO v_slot_count, v_price_sum
  FROM slots
  WHERE id = ANY(p_slot_ids)
    AND turf_id = p_turf_id
    AND status = 'AVAILABLE';

  IF v_slot_count IS NULL OR v_slot_count <> array_length(p_slot_ids, 1) THEN
    RAISE EXCEPTION 'One or more slots are no longer available or do not belong to this turf.';
  END IF;

  v_total_amount := v_price_sum;

  -- 3. Generate a unique 8-character uppercase alphanumeric booking code (TS-XXXXXX)
  v_booking_code := 'TS-' || UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 6));

  -- 4. Create the parent booking record
  INSERT INTO bookings (
    booking_code,
    turf_id,
    user_id,
    customer_name,
    customer_phone,
    source,
    total_amount,
    status,
    created_at
  ) VALUES (
    v_booking_code,
    p_turf_id,
    p_user_id,
    p_customer_name,
    p_customer_phone,
    p_source::booking_source,
    v_total_amount,
    'CONFIRMED',
    NOW()
  )
  RETURNING id INTO v_booking_id;

  -- 5. Create the child booking items linking to locked slots
  INSERT INTO booking_items (
    booking_id,
    slot_id,
    price_snapshot
  )
  SELECT 
    v_booking_id,
    s.id,
    s.final_price
  FROM slots s
  WHERE s.id = ANY(p_slot_ids);

  -- 6. Update the status of booked slots to 'BOOKED'
  UPDATE slots
  SET status = 'BOOKED'
  WHERE id = ANY(p_slot_ids);

  -- 7. Compile the return json result
  v_result := jsonb_build_object(
    'booking_id', v_booking_id,
    'booking_code', v_booking_code,
    'total_amount', v_total_amount
  );

  RETURN v_result;
END;
$$;
