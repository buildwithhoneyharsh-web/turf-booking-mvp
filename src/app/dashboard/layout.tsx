import { Layers, CalendarDays, Settings, Users, LogOut } from "lucide-react";
import Link from "next/link";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans flex">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-[#1c1c1e] border-r border-[#2d2d2d] hidden md:flex flex-col">
        <div className="p-6 border-b border-[#2d2d2d]">
          <h2 className="text-lg font-bold text-white tracking-tight">Turf Manager</h2>
          <p className="text-xs text-[#a8a8aa] mt-1 font-mono">Owner Portal</p>
        </div>
        
        <nav className="flex-1 p-4 space-y-1">
          <Link href="/dashboard" className="flex items-center space-x-3 px-3 py-2.5 rounded-lg bg-[#0a0a0a] border border-[#00d4a4] text-[#00d4a4] font-medium text-sm transition-colors">
            <CalendarDays size={18} />
            <span>Live Calendar</span>
          </Link>
          
          <Link href="/dashboard/grounds" className="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-[#a8a8aa] hover:bg-[#2d2d2d]/30 hover:text-white font-medium text-sm transition-colors">
            <Layers size={18} />
            <span>Grounds & Setup</span>
          </Link>
          
          <Link href="/dashboard/customers" className="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-[#a8a8aa] hover:bg-[#2d2d2d]/30 hover:text-white font-medium text-sm transition-colors">
            <Users size={18} />
            <span>Customers</span>
          </Link>
          
          <Link href="/dashboard/pricing" className="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-[#a8a8aa] hover:bg-[#2d2d2d]/30 hover:text-white font-medium text-sm transition-colors">
            <Settings size={18} />
            <span>Pricing Rules</span>
          </Link>
        </nav>
        
        <div className="p-4 border-t border-[#2d2d2d]">
          <button className="flex items-center space-x-3 px-3 py-2.5 w-full rounded-lg text-[#a8a8aa] hover:bg-[#2d2d2d]/30 hover:text-white font-medium text-sm transition-colors">
            <LogOut size={18} />
            <span>Log out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Header Mobile (optional) */}
        <header className="md:hidden bg-[#1c1c1e] border-b border-[#2d2d2d] p-4 flex justify-between items-center">
          <h2 className="font-bold">Turf Manager</h2>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
