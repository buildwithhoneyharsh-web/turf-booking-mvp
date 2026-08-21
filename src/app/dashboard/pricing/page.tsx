import { createClient } from "@/lib/supabase/server";
import { PricingForm } from "./pricing-form";

export const metadata = {
  title: "Pricing Rules - Turf Manager",
};

export default async function PricingRulesPage() {
  const supabase = await createClient();
  
  // Hardcoded for MVP
  const turfId = "d0224df0-fa22-4422-9222-1273778848fb";

  const { data: turf } = await supabase
    .from("turfs")
    .select("*, grounds(*)")
    .eq("id", turfId)
    .single();

  if (!turf) {
    return <div className="p-8 text-red-500">Turf not found</div>;
  }

  const grounds = turf.grounds || [];

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dynamic Pricing Engine</h1>
        <p className="text-[#a8a8aa] mt-2">
          Set up off-peak hours and discount rules. This will instantly bulk-update the price of all currently generated future slots.
        </p>
      </div>

      <div className="bg-[#1c1c1e] border border-[#2d2d2d] rounded-xl p-6">
        <h2 className="text-lg font-semibold mb-6">Create New Rule</h2>
        <PricingForm turfId={turf.id} grounds={grounds} />
      </div>
    </div>
  );
}
