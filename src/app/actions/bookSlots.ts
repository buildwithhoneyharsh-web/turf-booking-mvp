"use server";

import { createClient } from "@/lib/supabase/server";

export async function bookSlots(
  turfId: string,
  customerName: string,
  customerPhone: string,
  slotIds: string[]
) {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc("book_slots", {
    p_turf_id: turfId,
    p_customer_name: customerName,
    p_customer_phone: customerPhone,
    p_source: "ONLINE",
    p_slot_ids: slotIds,
  });

  if (error) {
    console.error("Booking Error:", error);
    return { success: false, error: error.message };
  }

  return { success: true, data };
}
