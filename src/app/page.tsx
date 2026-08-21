import Link from "next/link";
import { TopNav } from "@/components/top-nav";
import { createClient } from "@/lib/supabase/server";

export default async function LandingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const TURF_ID = "d0224df0-fa22-4422-9222-1273778848fb"; // Greenfield Arena ID

  return (
    <div className="bg-background text-on-background font-body-md selection:bg-brand-green-soft selection:text-on-primary overflow-x-hidden min-h-screen">
      {/* Top Promo Banner */}
      <div className="bg-primary text-on-primary py-xs px-md flex items-center justify-center text-sm font-body-sm-medium sticky top-0 z-[60]">
        <span className="flex items-center gap-xs">
          ⚡ Fast slot reservation & double-booking prevention. Book your game today.
          <span className="bg-secondary-fixed text-on-secondary-fixed text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ml-2">SAVE</span>
        </span>
      </div>

      <TopNav initialUser={user} />

      {/* Marketing Hero */}
      <section className="gradient-hero pt-hero pb-section px-md relative overflow-hidden flex flex-col items-center text-center">
        <div className="max-w-4xl mx-auto relative z-10 mt-16">
          <h1 className="font-hero-display text-hero-display text-primary mb-md">Book Your Perfect Turf. Instantly.</h1>
          <p className="font-body-md text-body-md text-on-surface-variant max-w-2xl mx-auto mb-xl text-lg">
            Real-time slot availability, instant confirmation, and zero double-bookings. Pick your sport, time, and play.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-md">
            <Link 
              href={`/turf/${TURF_ID}`}
              className="bg-secondary-fixed text-on-secondary-fixed font-body-sm-medium text-body-sm-medium px-xl py-3 rounded-full hover:bg-secondary-fixed-dim transition-colors shadow-sm"
            >
              Find a Turf
            </Link>
            <Link 
              href="/dashboard"
              className="bg-transparent border border-primary text-primary font-body-sm-medium text-body-sm-medium px-xl py-3 rounded-full hover:bg-primary hover:text-on-primary transition-colors"
            >
              List Your Turf
            </Link>
          </div>
        </div>

        {/* Product Mockup */}
        <div className="mt-section w-full max-w-5xl mx-auto relative z-20">
          <div className="bg-surface-container-lowest rounded-xl diffuse-shadow border border-hairline overflow-hidden flex flex-col">
            {/* Mockup Header */}
            <div className="border-b border-hairline p-md flex items-center justify-between bg-surface-container-low/50">
              <div className="flex items-center gap-sm">
                <div className="w-10 h-10 bg-surface-variant rounded-lg flex items-center justify-center">
                  <span className="material-symbols-outlined text-outline">sports_soccer</span>
                </div>
                <div className="text-left">
                  <h3 className="font-heading-3 text-lg font-bold text-primary leading-tight">Greenfield Arena</h3>
                  <p className="font-body-sm-medium text-stone text-sm">Football & Cricket</p>
                </div>
              </div>
              <div className="flex bg-surface-container-low rounded-full p-1 border border-hairline">
                <button className="px-4 py-1.5 rounded-full bg-surface-container-lowest shadow-sm border border-hairline text-sm font-medium">Football</button>
                <button className="px-4 py-1.5 rounded-full text-stone text-sm font-medium hover:text-primary">Cricket</button>
              </div>
            </div>
            
            {/* Mockup Body */}
            <div className="p-xl grid grid-cols-1 md:grid-cols-3 gap-md text-left">
              {/* Date Picker Column */}
              <div className="col-span-1 border-r border-hairline pr-md hidden md:block">
                <div className="flex items-center justify-between mb-md">
                  <h4 className="font-bold text-sm text-primary">October 2024</h4>
                  <div className="flex gap-1">
                    <span className="material-symbols-outlined text-stone cursor-pointer hover:text-primary">chevron_left</span>
                    <span className="material-symbols-outlined text-stone cursor-pointer hover:text-primary">chevron_right</span>
                  </div>
                </div>
                <div className="w-full h-48 bg-surface-container-low rounded-lg border border-hairline border-dashed flex items-center justify-center">
                  <span className="text-stone text-sm">Interactive Calendar</span>
                </div>
              </div>
              
              {/* Slots Column */}
              <div className="col-span-1 md:col-span-2 pl-0 md:pl-md">
                <h4 className="font-bold text-sm mb-md text-primary">Today's Slots</h4>
                <div className="space-y-sm">
                  {/* Available Slot */}
                  <div className="border border-brand-green-soft bg-surface-container-lowest rounded-lg p-sm flex items-center justify-between hover:shadow-sm transition-shadow cursor-pointer relative overflow-hidden group">
                    <div className="absolute inset-y-0 left-0 w-1 bg-brand-green-soft"></div>
                    <div className="pl-2">
                      <div className="font-code-md text-code-md text-primary font-medium">06:00 AM - 07:00 AM</div>
                      <div className="font-body-sm-medium text-xs text-stone mt-1">Available - Rs.1,200</div>
                    </div>
                    <div className="bg-brand-green-soft/20 text-brand-green-soft px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-brand-green-soft"></span>
                      Book Now
                    </div>
                  </div>
                  {/* Booked Slot */}
                  <div className="border border-hairline bg-surface-container-low/50 rounded-lg p-sm flex items-center justify-between opacity-70">
                    <div className="pl-2">
                      <div className="font-code-md text-code-md text-on-surface-variant font-medium line-through">07:00 AM - 08:00 AM</div>
                      <div className="font-body-sm-medium text-xs text-stone mt-1">Rs.1,200</div>
                    </div>
                    <div className="bg-surface-variant text-on-surface-variant px-3 py-1 rounded-full text-xs font-semibold">
                      Booked
                    </div>
                  </div>
                  {/* Available Slot */}
                  <div className="border border-brand-green-soft bg-surface-container-lowest rounded-lg p-sm flex items-center justify-between hover:shadow-sm transition-shadow cursor-pointer relative overflow-hidden group">
                    <div className="absolute inset-y-0 left-0 w-1 bg-brand-green-soft"></div>
                    <div className="pl-2">
                      <div className="font-code-md text-code-md text-primary font-medium">08:00 AM - 09:00 AM</div>
                      <div className="font-body-sm-medium text-xs text-stone mt-1">Available - Rs.1,200</div>
                    </div>
                    <div className="bg-brand-green-soft/20 text-brand-green-soft px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-brand-green-soft"></span>
                      Book Now
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full py-section bg-surface-container border-t border-hairline">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-xl px-xl max-w-7xl mx-auto text-left">
          <div className="col-span-1 md:col-span-1 flex flex-col gap-sm">
            <div className="font-heading-3 text-heading-3 font-bold text-primary">TurfSync</div>
            <p className="font-body-sm-medium text-body-sm-medium text-stone mt-sm">
              The premium platform for booking sports turf instantly. No more double bookings.
            </p>
          </div>
          <div className="col-span-1 flex flex-col gap-sm">
            <h4 className="font-bold text-primary text-sm uppercase tracking-wider mb-2">Explore</h4>
            <a className="text-stone hover:text-primary font-body-sm-medium text-body-sm-medium transition-colors" href="#">Home</a>
            <a className="text-stone hover:text-primary font-body-sm-medium text-body-sm-medium transition-colors" href="#">How it Works</a>
            <a className="text-stone hover:text-primary font-body-sm-medium text-body-sm-medium transition-colors" href="#">Pricing</a>
          </div>
          <div className="col-span-1 flex flex-col gap-sm">
            <h4 className="font-bold text-primary text-sm uppercase tracking-wider mb-2">Venues</h4>
            <Link className="text-stone hover:text-primary font-body-sm-medium text-body-sm-medium transition-colors" href="/dashboard">List your Turf</Link>
            <Link className="text-stone hover:text-primary font-body-sm-medium text-body-sm-medium transition-colors" href="/dashboard">Owner Dashboard</Link>
            <a className="text-stone hover:text-primary font-body-sm-medium text-body-sm-medium transition-colors" href="#">Support</a>
          </div>
          <div className="col-span-1 flex flex-col gap-sm">
            <h4 className="font-bold text-primary text-sm uppercase tracking-wider mb-2">Legal</h4>
            <a className="text-stone underline font-body-sm-medium text-body-sm-medium hover:text-primary transition-colors opacity-80 hover:opacity-100" href="#">Privacy Policy</a>
            <a className="text-stone underline font-body-sm-medium text-body-sm-medium hover:text-primary transition-colors opacity-80 hover:opacity-100" href="#">Terms of Service</a>
            <a className="text-stone underline font-body-sm-medium text-body-sm-medium hover:text-primary transition-colors opacity-80 hover:opacity-100" href="#">Cookie Policy</a>
          </div>
        </div>
        <div className="px-xl max-w-7xl mx-auto mt-xl pt-xl border-t border-hairline">
          <p className="font-body-sm-medium text-body-sm-medium text-stone text-center">
            © 2024 TurfSync Inc. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
