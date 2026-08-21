"use server";

import { supabaseAdmin } from "@/lib/supabase/admin";

export async function blockSlot(slotId: string, block: boolean) {
  const newStatus = block ? "BLOCKED" : "AVAILABLE";

  const { data, error } = await supabaseAdmin
    .from("slots")
    .update({ status: newStatus })
    .eq("id", slotId)
    .select()
    .single();

  if (error) {
    console.error("Failed to block slot:", error);
    return { success: false, error: error.message };
  }

  return { success: true, data };
}
