"use client";

import React, { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { LogIn } from "lucide-react";

export function LoginModal({ isOpen, onClose, onLogin }: { isOpen: boolean; onClose: () => void; onLogin: (user: any) => void }) {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  if (!isOpen) return null;

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || phone.length < 10) {
      setError("Please enter a valid 10-digit phone number.");
      return;
    }

    setLoading(true);
    setError(null);

    // Format phone number with country code for Supabase Auth
    const formattedPhone = `+91${phone.replace(/\D/g, "").slice(-10)}`;

    const { error } = await supabase.auth.signInWithOtp({
      phone: formattedPhone,
    });

    setLoading(false);

    if (error) {
      setError(error.message);
    } else {
      setStep(2);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.length < 6) {
      setError("Please enter a valid 6-digit OTP.");
      return;
    }

    setLoading(true);
    setError(null);

    const formattedPhone = `+91${phone.replace(/\D/g, "").slice(-10)}`;

    const { data, error } = await supabase.auth.verifyOtp({
      phone: formattedPhone,
      token: otp,
      type: "sms",
    });

    setLoading(false);

    if (error) {
      setError(error.message);
    } else {
      if (data.user) {
        onLogin(data.user);
        onClose();
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-[#1c1c1e] border border-[#2d2d2d] rounded-2xl w-[384px] max-w-full overflow-hidden shadow-2xl relative">
        {/* Header */}
        <div className="px-6 py-5 border-b border-[#2d2d2d] flex justify-between items-center bg-[#1c1c1e]">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <LogIn size={20} className="text-[#00d4a4]" />
            {step === 1 ? "Login / Sign Up" : "Enter OTP"}
          </h2>
          <button onClick={onClose} className="text-[#a8a8aa] hover:text-white transition-colors">
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-lg">
              {error}
            </div>
          )}

          {step === 1 ? (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#a8a8aa]">Phone Number</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-[#a8a8aa]">
                    +91
                  </div>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="9999999999"
                    maxLength={10}
                    className="w-full bg-[#0a0a0a] border border-[#2d2d2d] rounded-lg pl-12 pr-4 py-3 text-white placeholder-[#4d4d4d] focus:outline-none focus:border-[#00d4a4] transition-colors"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-lg bg-gradient-to-r from-[#00d4a4] to-[#00b38a] text-black font-semibold transition-all hover:opacity-90 disabled:opacity-50 mt-2"
              >
                {loading ? "Sending OTP..." : "Continue"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#a8a8aa]">6-Digit Code</label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  placeholder="• • • • • •"
                  maxLength={6}
                  className="w-full bg-[#0a0a0a] border border-[#2d2d2d] rounded-lg px-4 py-3 text-center tracking-[0.5em] text-white focus:outline-none focus:border-[#00d4a4] transition-colors text-xl"
                />
                <p className="text-xs text-[#a8a8aa] text-center mt-2">
                  Code sent to +91 {phone}
                  <button type="button" onClick={() => setStep(1)} className="text-[#00d4a4] ml-2 hover:underline">
                    Edit
                  </button>
                </p>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-lg bg-gradient-to-r from-[#00d4a4] to-[#00b38a] text-black font-semibold transition-all hover:opacity-90 disabled:opacity-50 mt-2"
              >
                {loading ? "Verifying..." : "Verify & Login"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
