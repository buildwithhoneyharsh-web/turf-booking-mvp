"use client";

import { useState } from "react";
import { LoginModal } from "./auth/login-modal";
import { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";

export function TopNav({ initialUser }: { initialUser: User | null }) {
  const [user, setUser] = useState<User | null>(initialUser);
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <>
      <header className="border-b border-[#2d2d2d] bg-[#0a0a0a] sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-[#00d4a4] to-[#00b38a] rounded-lg flex items-center justify-center">
              <span className="text-black font-bold text-sm">T</span>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-white">TurfBook</h1>
          </div>

          <div>
            {user ? (
              <div className="flex items-center gap-4">
                <span className="text-sm text-[#a8a8aa] hidden sm:inline-block">
                  {user.phone}
                </span>
                <button
                  onClick={handleLogout}
                  className="text-sm font-medium text-[#a8a8aa] hover:text-white transition-colors"
                >
                  Log out
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsLoginOpen(true)}
                className="px-4 py-2 bg-[#00d4a4] hover:bg-[#00b38a] text-black text-sm font-bold rounded-lg transition-colors"
              >
                Log In
              </button>
            )}
          </div>
        </div>
      </header>

      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onLogin={(u) => setUser(u)}
      />
    </>
  );
}
