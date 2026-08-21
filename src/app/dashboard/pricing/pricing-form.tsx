"use client";

import React, { useState, useTransition } from "react";
import { applyPricingRule } from "@/app/actions/applyPricingRule";

const DAYS_OF_WEEK = [
  { value: 0, label: "Sun" },
  { value: 1, label: "Mon" },
  { value: 2, label: "Tue" },
  { value: 3, label: "Wed" },
  { value: 4, label: "Thu" },
  { value: 5, label: "Fri" },
  { value: 6, label: "Sat" },
];

const HOURS = Array.from({ length: 24 }, (_, i) => i);

export function PricingForm({ turfId, grounds }: { turfId: string; grounds: any[] }) {
  const [isPending, startTransition] = useTransition();
  const [selectedGround, setSelectedGround] = useState<string>("ALL");
  const [selectedDays, setSelectedDays] = useState<number[]>([1, 2, 3, 4, 5]); // Default Mon-Fri
  const [startHour, setStartHour] = useState<number>(10);
  const [endHour, setEndHour] = useState<number>(16);
  const [newPrice, setNewPrice] = useState<number>(500);

  const toggleDay = (dayValue: number) => {
    setSelectedDays(prev =>
      prev.includes(dayValue) ? prev.filter(d => d !== dayValue) : [...prev, dayValue]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedDays.length === 0) {
      alert("Please select at least one day.");
      return;
    }
    if (startHour >= endHour) {
      alert("Start time must be before end time.");
      return;
    }

    startTransition(async () => {
      const targetGround = selectedGround === "ALL" ? null : selectedGround;
      const res = await applyPricingRule(turfId, targetGround, selectedDays, startHour, endHour, newPrice);
      
      if (!res.success) {
        alert("Failed to apply rule: " + res.error);
      } else {
        alert(`Successfully updated ${res.updatedCount} slots!`);
      }
    });
  };

  const formatHour = (h: number) => {
    if (h === 0) return "12:00 AM";
    if (h === 12) return "12:00 PM";
    return h < 12 ? `${h}:00 AM` : `${h - 12}:00 PM`;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Target Ground */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-[#a8a8aa]">Target Ground</label>
        <select
          value={selectedGround}
          onChange={(e) => setSelectedGround(e.target.value)}
          className="w-full bg-[#0a0a0a] border border-[#2d2d2d] rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#00d4a4] transition-colors appearance-none"
        >
          <option value="ALL">All Grounds</option>
          {grounds.map(g => (
            <option key={g.id} value={g.id}>{g.name}</option>
          ))}
        </select>
      </div>

      {/* Days of Week */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-[#a8a8aa]">Applicable Days</label>
        <div className="flex flex-wrap gap-2">
          {DAYS_OF_WEEK.map(day => {
            const isSelected = selectedDays.includes(day.value);
            return (
              <button
                key={day.value}
                type="button"
                onClick={() => toggleDay(day.value)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  isSelected 
                    ? "bg-[#00d4a4]/20 text-[#00d4a4] border border-[#00d4a4]/50" 
                    : "bg-[#0a0a0a] text-[#a8a8aa] border border-[#2d2d2d] hover:border-[#4d4d4d]"
                }`}
              >
                {day.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Time Window */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-3">
          <label className="block text-sm font-medium text-[#a8a8aa]">Start Time</label>
          <select
            value={startHour}
            onChange={(e) => setStartHour(Number(e.target.value))}
            className="w-full bg-[#0a0a0a] border border-[#2d2d2d] rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#00d4a4] transition-colors appearance-none"
          >
            {HOURS.map(h => (
              <option key={h} value={h}>{formatHour(h)}</option>
            ))}
          </select>
        </div>
        <div className="space-y-3">
          <label className="block text-sm font-medium text-[#a8a8aa]">End Time</label>
          <select
            value={endHour}
            onChange={(e) => setEndHour(Number(e.target.value))}
            className="w-full bg-[#0a0a0a] border border-[#2d2d2d] rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#00d4a4] transition-colors appearance-none"
          >
            {HOURS.map(h => (
              <option key={h} value={h}>{formatHour(h)}</option>
            ))}
          </select>
        </div>
      </div>

      {/* New Price */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-[#a8a8aa]">New Final Price (₹)</label>
        <input
          type="number"
          min={0}
          value={newPrice}
          onChange={(e) => setNewPrice(Number(e.target.value))}
          className="w-full bg-[#0a0a0a] border border-[#2d2d2d] rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#00d4a4] transition-colors"
          placeholder="e.g. 500"
        />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full py-3 px-4 rounded-lg bg-gradient-to-r from-[#00d4a4] to-[#00b38a] text-black font-semibold text-sm transition-all hover:opacity-90 disabled:opacity-50"
      >
        {isPending ? "Applying Rule..." : "Apply Pricing Rule"}
      </button>
    </form>
  );
}
