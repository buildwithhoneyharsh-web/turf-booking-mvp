"use server";

import { supabaseAdmin } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

export async function applyPricingRule(
  turfId: string,
  groundId: string | null,
  days: number[],
  startHour: number,
  endHour: number,
  newPrice: number
) {
  try {
    const { data, error } = await supabaseAdmin.rpc("apply_pricing_rule", {
      p_turf_id: turfId,
      p_ground_id: groundId,
      p_days: days,
      p_start_hour: startHour,
      p_end_hour: endHour,
      p_new_price: newPrice,
    });

    if (error) {
      console.error("RPC Error:", error);
      return { success: false, error: error.message };
    }

    // Revalidate dashboard and main page to reflect new prices
    revalidatePath("/dashboard");
    revalidatePath("/");

    return { success: true, updatedCount: data };
  } catch (err: any) {
    console.error("Action Error:", err);
    return { success: false, error: err.message };
  }
}
