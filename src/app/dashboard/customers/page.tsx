import { createClient } from "@/lib/supabase/server";

export default async function CustomersPage() {
  const supabase = await createClient();

  // Mocking Owner Identity for MVP
  const turfId = "d0224df0-fa22-4422-9222-1273778848fb";

  // Fetch all bookings for this turf
  const { data: bookings } = await supabase
    .from("bookings")
    .select("customer_phone, customer_name, total_amount, created_at")
    .eq("turf_id", turfId)
    .order("created_at", { ascending: false });

  // Aggregate by customer_phone in JS (since PostgREST doesn't support native GROUP BY easily without views)
  const customersMap = new Map();
  
  if (bookings) {
    bookings.forEach((b: any) => {
      const phone = b.customer_phone;
      if (!customersMap.has(phone)) {
        customersMap.set(phone, {
          phone,
          name: b.customer_name, // Latest name used
          totalBookings: 0,
          totalSpent: 0,
          lastBooking: new Date(b.created_at)
        });
      }
      
      const customer = customersMap.get(phone);
      customer.totalBookings += 1;
      customer.totalSpent += Number(b.total_amount);
    });
  }

  // Convert to array and sort by total spent
  const customers = Array.from(customersMap.values()).sort((a, b) => b.totalSpent - a.totalSpent);

  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-in fade-in duration-500">
      <div className="flex flex-col justify-between items-start gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Customers</h1>
        <p className="text-sm text-[#a8a8aa]">
          View your most loyal customers, their total bookings, and lifetime value.
        </p>
      </div>

      <div className="bg-[#1c1c1e] border border-[#2d2d2d] rounded-2xl overflow-hidden mt-8 shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#0a0a0a] border-b border-[#2d2d2d] text-[#a8a8aa] uppercase tracking-wider text-xs">
              <tr>
                <th className="px-6 py-4 font-medium">Customer Name</th>
                <th className="px-6 py-4 font-medium">Phone Number</th>
                <th className="px-6 py-4 font-medium text-right">Total Bookings</th>
                <th className="px-6 py-4 font-medium text-right">Lifetime Value</th>
                <th className="px-6 py-4 font-medium text-right">Last Visit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2d2d2d]">
              {customers.map((c, i) => (
                <tr key={c.phone} className="hover:bg-[#2d2d2d]/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#00d4a4]/20 to-[#00b38a]/20 border border-[#00d4a4]/30 flex items-center justify-center text-[#00d4a4] font-bold text-xs">
                        {c.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-semibold text-white">{c.name}</span>
                      {i === 0 && (
                        <span className="text-[10px] bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 px-2 py-0.5 rounded-full uppercase tracking-wider font-bold ml-2">Top</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-[#a8a8aa] font-mono">{c.phone}</td>
                  <td className="px-6 py-4 text-right">
                    <span className="bg-[#2d2d2d] text-white px-2.5 py-1 rounded-md font-medium">
                      {c.totalBookings}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right font-semibold text-[#00d4a4]">
                    ₹{c.totalSpent.toLocaleString('en-IN')}
                  </td>
                  <td className="px-6 py-4 text-right text-[#a8a8aa]">
                    {c.lastBooking.toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </td>
                </tr>
              ))}
              
              {customers.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-[#a8a8aa]">
                    No customers found yet. Once bookings start coming in, they will appear here.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
