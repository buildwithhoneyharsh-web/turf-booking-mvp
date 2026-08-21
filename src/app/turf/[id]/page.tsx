import SlotMatrix from "@/components/slot-matrix";
import { createClient } from "@/lib/supabase/server";
import { TopNav } from "@/components/top-nav";

export default async function TurfBookingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const supabase = await createClient();
  const { id } = await params;

  // Fetch current user
  const { data: { user } } = await supabase.auth.getUser();

  // Fetch the specific turf
  const { data: turf } = await supabase
    .from("turfs")
    .select("*, grounds(*)")
    .eq("id", id)
    .single();

  // Fetch slots for this turf
  const { data: slots } = await supabase
    .from("slots")
    .select("*")
    .eq("turf_id", id);

  return (
    <main>
      <TopNav initialUser={user} />
      <SlotMatrix 
        initialTurf={turf || undefined} 
        initialSlots={slots || []} 
      />
    </main>
  );
}
