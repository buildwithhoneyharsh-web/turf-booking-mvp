"use client";

import React, { useState, useTransition } from "react";
import { bookSlots } from "@/app/actions/bookSlots";
import { 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  Star, 
  ChevronRight, 
  AlertCircle, 
  CheckCircle2, 
  User, 
  Phone,
  Layers,
  Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";

// Mock Data matching seed.sql
const MOCK_VENUE = {
  id: "d0224df0-fa22-4422-9222-1273778848fb",
  name: "Greenfield Arena",
  rating: 4.8,
  reviewsCount: 120,
  address: "Shastri Nagar, Ratlam",
  timezone: "Asia/Kolkata",
  sports: [
    { id: "00000000-0000-0000-0000-000000000001", name: "Football 5v5" },
    { id: "00000000-0000-0000-0000-000000000002", name: "Cricket Nets" }
  ],
  grounds: [
    { id: "e0224df0-fa22-4422-9222-000000000001", name: "Court 1", code: "C1", surfaceType: "Synthetic Turf", environment: "Outdoor" },
    { id: "e0224df0-fa22-4422-9222-000000000002", name: "Court 2", code: "C2", surfaceType: "Synthetic Turf", environment: "Outdoor" }
  ]
};

// Generate next 7 days for date ribbon
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

// Mock Slots Generator for selected filters
const generateMockSlots = (groundId: string, sportId: string, dateKey: string) => {
  const slots = [];
  const basePrice = sportId === "00000000-0000-0000-0000-000000000001" ? 800 : 1000;
  
  // Seed status randomly for demo purposes
  const getStatus = (hour: number) => {
    if (hour === 8 || hour === 19) return "BOOKED";
    if (hour === 14) return "BLOCKED";
    return "AVAILABLE";
  };

  for (let hour = 6; hour <= 22; hour++) {
    const isPeak = hour >= 17;
    const finalPrice = isPeak ? basePrice + 400 : basePrice;
    const timeStr = `${hour.toString().padStart(2, "0")}:00`;
    const formatTime = (h: number) => {
      const ampm = h >= 12 ? "PM" : "AM";
      const displayHour = h % 12 === 0 ? 12 : h % 12;
      return `${displayHour.toString().padStart(2, "0")}:00 ${ampm}`;
    };

    slots.push({
      id: `${groundId}-${hour}-${dateKey}`,
      timeLabel: formatTime(hour),
      hour,
      finalPrice,
      status: getStatus(hour)
    });
  }
  return slots;
};

interface SlotMatrixProps {
  initialTurf?: any;
  initialSlots?: any[];
}

export default function SlotMatrix({ initialTurf, initialSlots = [] }: SlotMatrixProps) {
  const dates = generateDates();
  
  // Real or mock data fallbacks
  const venueId = initialTurf?.id || MOCK_VENUE.id;
  const venueName = initialTurf?.name || MOCK_VENUE.name;
  const venueAddress = initialTurf?.address || MOCK_VENUE.address;
  const venueTimezone = initialTurf?.timezone || MOCK_VENUE.timezone;
  const venueGrounds = initialTurf?.grounds?.length > 0 ? initialTurf.grounds : MOCK_VENUE.grounds;
  
  // States
  const [selectedDate, setSelectedDate] = useState(dates[0].key);
  const [selectedSport, setSelectedSport] = useState(MOCK_VENUE.sports[0].id);
  const [selectedGround, setSelectedGround] = useState(venueGrounds[0].id);
  const [selectedSlots, setSelectedSlots] = useState<any[]>([]);
  
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [bookingSuccess, setBookingSuccess] = useState<any | null>(null);
  const [isPending, startTransition] = useTransition();

  const slots = initialSlots.length > 0 
    ? initialSlots
        .filter(s => s.ground_id === selectedGround && s.sport_id === selectedSport && s.slot_date === selectedDate)
        .map(s => {
          const startAt = new Date(s.start_at);
          const hour = startAt.getHours();
          const formatTime = (h: number) => {
            const ampm = h >= 12 ? "PM" : "AM";
            const displayHour = h % 12 === 0 ? 12 : h % 12;
            return `${displayHour.toString().padStart(2, "0")}:00 ${ampm}`;
          };
          return {
            id: s.id,
            timeLabel: formatTime(hour),
            hour,
            finalPrice: Number(s.final_price),
            status: s.status
          }
        })
        .sort((a, b) => a.hour - b.hour)
    : generateMockSlots(selectedGround, selectedSport, selectedDate);

  // Group slots by time of day
  const morningSlots = slots.filter(s => s.hour >= 6 && s.hour < 12);
  const afternoonSlots = slots.filter(s => s.hour >= 12 && s.hour < 16);
  const eveningSlots = slots.filter(s => s.hour >= 16 && s.hour <= 22);

  // Toggle slot selection
  const handleSlotClick = (slot: any) => {
    if (slot.status !== "AVAILABLE") return;
    
    if (selectedSlots.some(s => s.id === slot.id)) {
      setSelectedSlots(selectedSlots.filter(s => s.id !== slot.id));
    } else {
      setSelectedSlots([...selectedSlots, slot]);
    }
  };

  // Pricing calculation
  const baseTotal = selectedSlots.reduce((sum, s) => sum + s.finalPrice, 0);
  const convenienceFee = selectedSlots.length > 0 ? 50 : 0;
  const totalPayable = baseTotal + convenienceFee;

  // Checkout submission
  const handleConfirmBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !customerPhone || selectedSlots.length === 0 || isPending) return;

    startTransition(async () => {
      const slotIds = selectedSlots.map(s => s.id);
      const res = await bookSlots(venueId, customerName, customerPhone, slotIds);
      
      if (res.success) {
        setBookingSuccess({
          code: res.data.booking_code,
          slots: selectedSlots.map(s => s.timeLabel),
          total: totalPayable,
          name: customerName,
          phone: customerPhone
        });
        setSelectedSlots([]);
      } else {
        alert("Booking failed: " + res.error);
      }
    });
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Interactive Slot Selection */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Header Card */}
          <div className="bg-[#1c1c1e] border border-[#2d2d2d] rounded-xl p-6 space-y-3">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-white">{venueName}</h1>
                <div className="flex items-center space-x-2 text-sm text-[#a8a8aa] mt-1">
                  <MapPin size={16} className="text-[#00d4a4]" />
                  <span>{venueAddress}</span>
                </div>
              </div>
              <div className="bg-[#0a0a0a] border border-[#2d2d2d] px-3 py-1.5 rounded-lg flex items-center space-x-1">
                <Star size={16} className="text-yellow-500 fill-yellow-500" />
                <span className="font-semibold text-sm">{MOCK_VENUE.rating}</span>
                <span className="text-xs text-[#a8a8aa]">({MOCK_VENUE.reviewsCount})</span>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2 pt-2">
              <span className="text-xs font-mono px-2.5 py-1 bg-[#2d2d2d] border border-[#3a3a3c] rounded-full text-[#a8a8aa]">
                Timezone: {venueTimezone}
              </span>
              <span className="text-xs font-mono px-2.5 py-1 bg-[#2d2d2d] border border-[#3a3a3c] rounded-full text-[#00d4a4] flex items-center gap-1">
                <Sparkles size={12} /> Double-Booking Locked
              </span>
            </div>
          </div>

          {/* Date Selector Ribbon */}
          <div className="bg-[#1c1c1e] border border-[#2d2d2d] rounded-xl p-4">
            <h2 className="text-sm font-semibold uppercase font-mono tracking-wider text-[#a8a8aa] mb-3 flex items-center gap-2">
              <CalendarIcon size={16} /> Select Date
            </h2>
            <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-none">
              {dates.map((date) => {
                const isActive = selectedDate === date.key;
                return (
                  <button
                    key={date.key}
                    onClick={() => {
                      setSelectedDate(date.key);
                      setSelectedSlots([]);
                    }}
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

          {/* Sport & Ground Selectors */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Sport Tab */}
            <div className="bg-[#1c1c1e] border border-[#2d2d2d] rounded-xl p-4">
              <h3 className="text-sm font-semibold uppercase font-mono tracking-wider text-[#a8a8aa] mb-3">Sport Type</h3>
              <div className="flex gap-2">
                {MOCK_VENUE.sports.map((sport) => {
                  const isActive = selectedSport === sport.id;
                  return (
                    <button
                      key={sport.id}
                      onClick={() => {
                        setSelectedSport(sport.id);
                        setSelectedSlots([]);
                      }}
                      className={`flex-1 py-2.5 rounded-lg border text-sm font-semibold tracking-wide transition-all ${
                        isActive
                          ? "bg-[#00d4a4] text-[#0a0a0a] border-[#00d4a4] font-bold"
                          : "bg-[#0a0a0a] text-[#a8a8aa] border-[#2d2d2d] hover:border-[#404040]"
                      }`}
                    >
                      {sport.name}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Ground Selector Tab */}
            <div className="bg-[#1c1c1e] border border-[#2d2d2d] rounded-xl p-4">
              <h3 className="text-sm font-semibold uppercase font-mono tracking-wider text-[#a8a8aa] mb-3 flex items-center gap-2">
                <Layers size={14} /> Court / Ground
              </h3>
              <div className="flex gap-2">
                {venueGrounds.map((ground: any) => {
                  const isActive = selectedGround === ground.id;
                  return (
                    <button
                      key={ground.id}
                      onClick={() => {
                        setSelectedGround(ground.id);
                        setSelectedSlots([]);
                      }}
                      className={`flex-1 py-2 rounded-lg border text-sm transition-all ${
                        isActive
                          ? "bg-white text-black border-white font-semibold"
                          : "bg-[#0a0a0a] text-[#a8a8aa] border-[#2d2d2d] hover:border-[#404040]"
                      }`}
                    >
                      <span className="block text-sm">{ground.name}</span>
                      <span className="block text-[10px] text-[#a8a8aa] font-mono mt-0.5">
                        {ground.surface_type || ground.surfaceType}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Slots Grid */}
          <div className="bg-[#1c1c1e] border border-[#2d2d2d] rounded-xl p-6 space-y-6">
            
            {/* Time slot renderer helper */}
            {[{ label: "Morning (06:00 AM - 12:00 PM)", data: morningSlots },
              { label: "Afternoon (12:00 PM - 04:00 PM)", data: afternoonSlots },
              { label: "Evening (04:00 PM - 11:00 PM)", data: eveningSlots }
            ].map((section, idx) => (
              <div key={idx} className="space-y-3">
                <h4 className="text-xs font-semibold uppercase font-mono tracking-widest text-[#a8a8aa]">
                  {section.label}
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {section.data.map((slot) => {
                    const isSelected = selectedSlots.some(s => s.id === slot.id);
                    const isBooked = slot.status === "BOOKED";
                    const isBlocked = slot.status === "BLOCKED";
                    
                    let btnClass = "bg-[#0a0a0a] border-[#2d2d2d] text-[#a8a8aa] hover:border-[#404040] hover:text-white";
                    if (isSelected) btnClass = "bg-[#0a0a0a] border-[#00d4a4] text-white border-2";
                    if (isBooked) btnClass = "bg-[#1c1c1e] border-[#2d2d2d]/30 text-[#a8a8aa]/30 cursor-not-allowed line-through";
                    if (isBlocked) btnClass = "bg-[#2d2d2d]/20 border-dashed border-[#2d2d2d] text-[#a8a8aa]/50 cursor-not-allowed";

                    return (
                      <button
                        key={slot.id}
                        disabled={isBooked || isBlocked}
                        onClick={() => handleSlotClick(slot)}
                        className={`py-3 px-2 rounded-lg border text-center transition-all duration-150 flex flex-col items-center justify-between min-h-[70px] ${btnClass}`}
                      >
                        <span className="text-xs font-medium tracking-wide">{slot.timeLabel}</span>
                        {isBooked && <span className="text-[10px] uppercase font-mono font-bold mt-1 text-red-500">Booked</span>}
                        {isBlocked && <span className="text-[10px] uppercase font-mono font-bold mt-1 text-yellow-600">Blocked</span>}
                        {!isBooked && !isBlocked && (
                          <span className={`text-[10px] font-mono font-bold mt-1 ${isSelected ? "text-[#00d4a4]" : "text-[#a8a8aa]"}`}>
                            ₹{slot.finalPrice}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}

          </div>

        </div>

        {/* Right Column: Checkout Panel */}
        <div className="space-y-6">
          
          {/* Booking Summary Card */}
          <div className="bg-[#1c1c1e] border border-[#2d2d2d] rounded-xl p-6 space-y-6 sticky top-8">
            <h2 className="text-lg font-bold tracking-tight text-white border-b border-[#2d2d2d] pb-3 flex items-center justify-between">
              <span>Confirm Booking</span>
              {selectedSlots.length > 0 && (
                <span className="bg-[#00d4a4]/10 text-[#00d4a4] text-xs font-mono font-bold px-2 py-0.5 rounded-full">
                  {selectedSlots.length} Selected
                </span>
              )}
            </h2>

            {selectedSlots.length === 0 ? (
              <div className="py-12 text-center space-y-2 text-[#a8a8aa]">
                <Clock className="mx-auto text-[#2d2d2d]" size={40} />
                <p className="text-sm font-medium">No slots selected yet</p>
                <p className="text-xs text-[#a8a8aa]/75">Click on any available slot on the left to start booking</p>
              </div>
            ) : (
              <form onSubmit={handleConfirmBooking} className="space-y-6">
                
                {/* Selected Slots list */}
                <div className="space-y-2">
                  <span className="text-xs font-semibold uppercase font-mono tracking-widest text-[#a8a8aa]">Selected Slots</span>
                  <div className="max-h-[150px] overflow-y-auto space-y-2 pr-1 scrollbar-none">
                    {selectedSlots.map((slot) => (
                      <div key={slot.id} className="flex justify-between items-center bg-[#0a0a0a] border border-[#2d2d2d] p-2.5 rounded-lg text-sm">
                        <div className="flex items-center space-x-2">
                          <Clock size={14} className="text-[#00d4a4]" />
                          <span className="font-medium text-white">{slot.timeLabel}</span>
                        </div>
                        <span className="font-mono text-xs text-[#a8a8aa]">₹{slot.finalPrice}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Form Inputs */}
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase font-mono tracking-widest text-[#a8a8aa] flex items-center gap-1.5">
                      <User size={12} className="text-[#a8a8aa]" /> Full Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Enter player name"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full bg-[#0a0a0a] border border-[#2d2d2d] rounded-lg px-3 py-2.5 text-sm text-white placeholder-[#5a5a5c] focus:outline-none focus:border-[#00d4a4] transition-all"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase font-mono tracking-widest text-[#a8a8aa] flex items-center gap-1.5">
                      <Phone size={12} className="text-[#a8a8aa]" /> Mobile Number
                    </label>
                    <div className="flex gap-2">
                      <div className="bg-[#0a0a0a] border border-[#2d2d2d] px-3 py-2 rounded-lg text-sm text-[#a8a8aa] flex items-center font-mono">
                        +91
                      </div>
                      <input
                        type="tel"
                        required
                        pattern="[0-9]{10}"
                        placeholder="Enter 10-digit number"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        className="flex-1 bg-[#0a0a0a] border border-[#2d2d2d] rounded-lg px-3 py-2.5 text-sm text-white placeholder-[#5a5a5c] focus:outline-none focus:border-[#00d4a4] transition-all font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* Pricing Summary */}
                <div className="border-t border-[#2d2d2d] pt-4 space-y-2">
                  <div className="flex justify-between text-sm text-[#a8a8aa]">
                    <span>Base Price ({selectedSlots.length} hr)</span>
                    <span className="font-mono">₹{baseTotal}</span>
                  </div>
                  <div className="flex justify-between text-sm text-[#a8a8aa]">
                    <span>Convenience Fee</span>
                    <span className="font-mono">₹{convenienceFee}</span>
                  </div>
                  <div className="flex justify-between text-base font-bold text-white pt-2 border-t border-[#2d2d2d]/50">
                    <span>Total Payable</span>
                    <span className="font-mono text-[#00d4a4]">₹{totalPayable}</span>
                  </div>
                </div>

                {/* Confirm Button */}
                <Button 
                  type="submit" 
                  disabled={isPending}
                  className="w-full bg-[#00d4a4] hover:bg-[#00b48a] text-[#0a0a0a] font-bold py-3.5 rounded-lg text-sm tracking-wide transition-all shadow-md shadow-[#00d4a4]/10 disabled:opacity-50"
                >
                  {isPending ? "Confirming..." : "Confirm Booking (Pay at Venue)"}
                </Button>
              </form>
            )}

          </div>

          {/* Success Dialog Modal */}
          {bookingSuccess && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
              <div className="bg-[#1c1c1e] border border-[#2d2d2d] rounded-2xl w-[448px] max-w-full p-6 text-center space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                <CheckCircle2 className="mx-auto text-[#00d4a4]" size={56} />
                <div className="space-y-1">
                  <h3 className="text-xl font-bold tracking-tight text-white">Booking Confirmed!</h3>
                  <p className="text-xs text-[#a8a8aa]">Instant ticket generated successfully</p>
                </div>
                
                <div className="bg-[#0a0a0a] border border-[#2d2d2d] p-4 rounded-xl space-y-3 text-left">
                  <div className="flex justify-between items-center pb-2 border-b border-[#2d2d2d]">
                    <span className="text-xs text-[#a8a8aa] font-mono">TICKET CODE</span>
                    <span className="font-mono font-bold text-[#00d4a4] text-sm">{bookingSuccess.code}</span>
                  </div>
                  <div className="space-y-1 text-xs text-[#a8a8aa]">
                    <div className="flex justify-between">
                      <span>Venue:</span>
                      <span className="text-white font-medium">{venueName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Customer:</span>
                      <span className="text-white font-medium">{bookingSuccess.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Phone:</span>
                      <span className="text-white font-mono">+91 {bookingSuccess.phone}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Date:</span>
                      <span className="text-white font-medium">{selectedDate}</span>
                    </div>
                    <div className="flex justify-between items-start">
                      <span>Timings:</span>
                      <span className="text-white font-medium text-right max-w-[200px]">
                        {bookingSuccess.slots.join(", ")}
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-[#2d2d2d] text-xs font-bold">
                    <span className="text-white">Total Amount (Pay at Venue):</span>
                    <span className="font-mono text-[#00d4a4] text-sm">₹{bookingSuccess.total}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2 text-[10px] text-[#a8a8aa] bg-[#2d2d2d]/20 px-3 py-2 rounded-lg">
                  <AlertCircle size={14} className="text-[#00d4a4] flex-none" />
                  <span className="text-left leading-normal">
                    A confirmation ticket details WhatsApp message has been simulated to +91 {bookingSuccess.phone}.
                  </span>
                </div>

                <Button 
                  onClick={() => setBookingSuccess(null)}
                  className="w-full bg-white hover:bg-gray-200 text-black font-semibold py-2.5 rounded-lg text-sm transition-all"
                >
                  Back to Calendar
                </Button>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
