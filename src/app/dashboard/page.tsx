import OwnerCalendar from "@/components/owner-calendar";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = await createClient();

  // Mocking Owner Identity for MVP (Greenfield Arena Owner)
  const turfId = "d0224df0-fa22-4422-9222-1273778848fb";

  // Fetch Turf with its grounds
  const { data: turf } = await supabase
    .from("turfs")
    .select("*, grounds(*)")
    .eq("id", turfId)
    .single();

  // Fetch all slots for this turf to populate the calendar
  // We fetch a 7-day window to allow the owner to navigate
  const { data: slots } = await supabase
    .from("slots")
    .select("*")
    .eq("turf_id", turfId)
    .order("start_at", { ascending: true });

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Live Calendar</h1>
          <p className="text-sm text-[#a8a8aa] mt-1">
            Manage your grounds, block out walk-ins, and prevent double-booking.
          </p>
        </div>
        
        <div className="bg-[#1c1c1e] border border-[#2d2d2d] rounded-lg px-4 py-2 flex items-center space-x-3">
          <span className="flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-[#00d4a4] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00d4a4]"></span>
          </span>
          <span className="text-xs font-mono font-bold tracking-wide uppercase text-[#a8a8aa]">
            {turf?.name}
          </span>
        </div>
      </div>

      <OwnerCalendar turf={turf} slots={slots || []} />
    </div>
  );
}
