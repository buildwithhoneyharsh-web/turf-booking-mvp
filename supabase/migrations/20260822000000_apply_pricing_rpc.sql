-- Create a function to bulk update slot prices based on off-peak rules
CREATE OR REPLACE FUNCTION apply_pricing_rule(
  p_turf_id UUID,
  p_ground_id UUID, -- NULL means all grounds for this turf
  p_days INTEGER[], -- Array of days (0=Sunday, 1=Monday, ..., 6=Saturday)
  p_start_hour INTEGER, -- 24h format, e.g. 11 for 11:00 AM
  p_end_hour INTEGER, -- 24h format, e.g. 16 for 4:00 PM
  p_new_price NUMERIC
) RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_updated_count INTEGER;
BEGIN
  UPDATE public.slots
  SET final_price = p_new_price
  WHERE turf_id = p_turf_id
    AND (p_ground_id IS NULL OR ground_id = p_ground_id)
    AND status = 'AVAILABLE'
    AND start_at >= NOW()
    AND EXTRACT(DOW FROM slot_date) = ANY(p_days)
    AND EXTRACT(HOUR FROM start_at) >= p_start_hour
    AND EXTRACT(HOUR FROM start_at) < p_end_hour;
    
  GET DIAGNOSTICS v_updated_count = ROW_COUNT;
  
  RETURN v_updated_count;
END;
$$;
