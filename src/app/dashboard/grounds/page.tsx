import { createClient } from "@/lib/supabase/server";
import { GroundsManager } from "@/components/dashboard/grounds-manager";

export default async function GroundsPage() {
  const supabase = await createClient();

  // Mocking Owner Identity for MVP (Greenfield Arena Owner)
  const turfId = "d0224df0-fa22-4422-9222-1273778848fb";

  // Fetch Turf with its grounds
  const { data: turf } = await supabase
    .from("turfs")
    .select("*, grounds(*)")
    .eq("id", turfId)
    .single();

  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Grounds & Setup</h1>
          <p className="text-sm text-[#a8a8aa] mt-1">
            Manage your courts, pitches, and active physical spaces for {turf?.name}.
          </p>
        </div>
      </div>

      <GroundsManager initialGrounds={turf?.grounds || []} turfId={turfId} />
    </div>
  );
}
