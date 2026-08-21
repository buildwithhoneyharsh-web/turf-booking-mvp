"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function addGround(turfId: string, formData: any) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("grounds")
    .insert([
      {
        turf_id: turfId,
        name: formData.name,
        code: formData.code,
        surface_type: formData.surface_type,
        environment: formData.environment,
        is_active: true
      }
    ])
    .select()
    .single();

  if (error) {
    console.error("Error adding ground:", error);
    return null;
  }

  revalidatePath("/dashboard/grounds");
  revalidatePath(`/turf/${turfId}`);
  return data;
}

export async function toggleGroundStatus(groundId: string, isActive: boolean) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("grounds")
    .update({ is_active: isActive })
    .eq("id", groundId);

  if (error) {
    console.error("Error toggling ground status:", error);
    return false;
  }

  revalidatePath("/dashboard/grounds");
  // Also revalidate the main turf booking page so it removes/adds the column
  revalidatePath(`/turf/[id]`, "page");
  return true;
}
