"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { blockSlot } from "@/app/actions/blockSlot";
import { 
  Calendar as CalendarIcon, 
  MapPin, 
  Layers,
  Lock,
  Unlock,
  CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/button";

// Helper to generate next 7 days
const generateDates = () => {
  const dates = [];
  const today = new Date();
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  
  for (let i = 0; i < 7; i++) {
    const nextDate = new Date(today);
    nextDate.setDate(today.getDate() + i);
    dates.push({
      key: nextDate.toISOString().split("T")[0],
      dayName: dayNames[nextDate.getDay()],
      dayNum: nextDate.getDate(),
      month: nextDate.toLocaleString("default", { month: "short" })
    });
  }
  return dates;
};

// Generates time labels for rows
const generateHours = () => {
  const hours = [];
  for (let h = 6; h <= 22; h++) {
    const ampm = h >= 12 ? "PM" : "AM";
    const displayHour = h % 12 === 0 ? 12 : h % 12;
    hours.push({
      val: h,
      label: `${displayHour.toString().padStart(2, "0")}:00 ${ampm}`
    });
  }
  return hours;
};

interface OwnerCalendarProps {
  turf: any;
  slots: any[];
}

export default function OwnerCalendar({ turf, slots }: OwnerCalendarProps) {
  const dates = generateDates();
  const hours = generateHours();
  const [selectedDate, setSelectedDate] = useState(dates[0].key);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleToggleBlock = (slotId: string, currentStatus: string) => {
    if (currentStatus === "BOOKED") return;
    
    const willBlock = currentStatus === "AVAILABLE";
    
    startTransition(async () => {
      const res = await blockSlot(slotId, willBlock);
      if (!res.success) {
        alert("Action failed: " + res.error);
      } else {
        router.refresh();
      }
    });
  };

  const currentSlots = slots.filter(s => s.slot_date === selectedDate);
  const grounds = turf?.grounds || [];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Date Ribbon */}
      <div className="bg-[#1c1c1e] border border-[#2d2d2d] rounded-xl p-4">
        <h2 className="text-sm font-semibold uppercase font-mono tracking-wider text-[#a8a8aa] mb-3 flex items-center gap-2">
          <CalendarIcon size={16} /> Schedule Date
        </h2>
        <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-none">
          {dates.map((date) => {
            const isActive = selectedDate === date.key;
            return (
              <button
                key={date.key}
                onClick={() => setSelectedDate(date.key)}
                className={`flex-none w-16 py-3 rounded-xl border text-center transition-all duration-200 ${
                  isActive
                    ? "bg-white text-black border-white shadow-lg"
                    : "bg-[#0a0a0a] text-[#a8a8aa] border-[#2d2d2d] hover:border-[#404040]"
                }`}
              >
                <span className="block text-xs font-medium uppercase">{date.dayName}</span>
                <span className="block text-lg font-bold mt-0.5">{date.dayNum}</span>
                <span className="block text-[10px] uppercase font-semibold">{date.month}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid Container */}
      <div className="bg-[#1c1c1e] border border-[#2d2d2d] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-[#0a0a0a] text-[#a8a8aa] uppercase font-mono text-[10px] border-b border-[#2d2d2d]">
              <tr>
                <th className="px-4 py-3 sticky left-0 bg-[#0a0a0a] z-10 border-r border-[#2d2d2d]">Time</th>
                {grounds.map((g: any) => (
                  <th key={g.id} className="px-4 py-3 min-w-[140px] text-center border-r border-[#2d2d2d]">
                    {g.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {hours.map((hour) => (
                <tr key={hour.val} className="border-b border-[#2d2d2d] hover:bg-[#2d2d2d]/20 transition-colors">
                  <td className="px-4 py-3 font-mono text-[#a8a8aa] text-xs whitespace-nowrap sticky left-0 bg-[#1c1c1e] border-r border-[#2d2d2d] z-10">
                    {hour.label}
                  </td>
                  {grounds.map((g: any) => {
                    const slot = currentSlots.find(s => {
                      const startHour = new Date(s.start_at).getHours();
                      return s.ground_id === g.id && startHour === hour.val;
                    });

                    if (!slot) {
                      return <td key={g.id} className="p-2 border-r border-[#2d2d2d] text-center text-[#5a5a5c]">—</td>;
                    }

                    const isBooked = slot.status === "BOOKED";
                    const isBlocked = slot.status === "BLOCKED";
                    const isAvailable = slot.status === "AVAILABLE";

                    let cellClass = "bg-[#0a0a0a] border-[#00d4a4] text-[#00d4a4] hover:bg-[#00d4a4]/10"; // Available
                    if (isBooked) cellClass = "bg-red-950/30 border-red-900/50 text-red-500 cursor-not-allowed";
                    if (isBlocked) cellClass = "bg-yellow-950/30 border-yellow-900/50 text-yellow-500 hover:bg-yellow-900/20";

                    return (
                      <td key={g.id} className="p-2 border-r border-[#2d2d2d]">
                        <button
                          disabled={isPending || isBooked}
                          onClick={() => handleToggleBlock(slot.id, slot.status)}
                          className={`w-full py-2.5 rounded-lg border flex flex-col items-center justify-center transition-all ${cellClass}`}
                        >
                          {isAvailable && (
                            <>
                              <Unlock size={14} className="mb-1" />
                              <span className="text-[10px] uppercase font-bold tracking-wide">Available</span>
                            </>
                          )}
                          {isBlocked && (
                            <>
                              <Lock size={14} className="mb-1" />
                              <span className="text-[10px] uppercase font-bold tracking-wide">Blocked</span>
                            </>
                          )}
                          {isBooked && (
                            <>
                              <CheckCircle2 size={14} className="mb-1" />
                              <span className="text-[10px] uppercase font-bold tracking-wide">Booked</span>
                            </>
                          )}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
