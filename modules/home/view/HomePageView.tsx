"use client";

import * as React from "react";
import {
  Calendar,
  Clock,
  Compass,
  MapPin,
  Plane,
  Plus,
  ShieldCheck,
  Sparkles,
  Trash2,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { YoonieMascot } from "@/components/mascot/YoonieMascot";
import type { HomePageVm } from "@/modules/home/viewModel/homePageVm";
import type { RoomType } from "@/lib/types/hospitality";

const ROOM_CATALOG: Array<{
  type: RoomType;
  title: string;
  tagline: string;
  pricePerNight: number;
  capacity: string;
  features: string[];
  image: string;
}> = [
  {
    type: "STANDARD_KING",
    title: "Standard King Room",
    tagline: "Serene garden & partial river view, plush king bed",
    pricePerNight: 2200,
    capacity: "2 Guests · 32 sqm",
    features: ["King Bed", "Rain Shower", "High-speed WiFi", "Organic Tea Bar"],
    image:
      "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80",
  },
  {
    type: "DELUXE_BALCONY",
    title: "Deluxe River Balcony",
    tagline: "Panoramic Chao Phraya views from a private teak terrace",
    pricePerNight: 3800,
    capacity: "3 Guests · 48 sqm",
    features: [
      "Teak Balcony",
      "Deep Soaking Tub",
      "Sofa Daybed",
      "Complimentary Sunset Drink",
    ],
    image:
      "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80",
  },
  {
    type: "POOL_VILLA",
    title: "Riverside Private Pool Villa",
    tagline: "Ultra-luxury sanctuary with private plunge pool and butler service",
    pricePerNight: 7500,
    capacity: "4 Guests · 95 sqm",
    features: [
      "Private Plunge Pool",
      "Outdoor Dining Lounge",
      "Twin Loft Suite",
      "Express Airport VIP Lane",
    ],
    image:
      "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=800&q=80",
  },
];

export function HomePageView({ vm }: { vm: HomePageVm }) {
  const {
    activeBranch,
    services,
    restaurants,
    checkIn,
    setCheckIn,
    checkOut,
    setCheckOut,
    adults,
    setAdults,
    nights,
    cart,
    addRoomToCart,
    addServiceToCart,
    addDiningToCart,
    removeFromCart,
    grandTotal,
    holdId,
    holdTimeLeft,
    triggerHold,
    isCheckoutOpen,
    setIsCheckoutOpen,
    bookingGuest,
    setBookingGuest,
    finalizeBooking,
    isConfirmed,
    confirmedOrderNumber,
    resetBooking,
  } = vm;

  // Determine Yoonie mascot mood and message dynamically
  let mascotMood: "calm" | "happy" | "checking" | "thinking" | "worried" | "sleeping" = "calm";
  let mascotMessage = "Welcome to BKK Riverside! Click me anytime.";

  if (isConfirmed) {
    mascotMood = "happy";
    mascotMessage = "Yoonie is so excited to welcome you to Bangkok!";
  } else if (holdTimeLeft !== null) {
    if (holdTimeLeft < 180) {
      mascotMood = "worried";
      mascotMessage = `Quick! Your hold expires in ${Math.floor(holdTimeLeft / 60)}m ${holdTimeLeft % 60}s!`;
    } else {
      mascotMood = "thinking";
      mascotMessage = `Holding your slots: ${Math.floor(holdTimeLeft / 60)}m ${holdTimeLeft % 60}s left`;
    }
  } else if (cart.length > 0) {
    mascotMood = "checking";
    mascotMessage = "Great choice! Add a sunset cruise or airport transfer below.";
  }

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  return (
    <div className="min-h-screen bg-[#F8F5EE] text-[#303A36] dark:bg-[#17201D] dark:text-[#F5EBDD] pb-32">
      {/* ─── Hero Section ──────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden pt-8 pb-14 px-4 sm:px-6 max-w-6xl mx-auto">
        <div className="relative rounded-3xl bg-linear-to-b from-[#EFE7DA] to-[#F8F5EE] dark:from-[#202C27] dark:to-[#17201D] border border-[#E5DBD0] dark:border-[#2D3D36] p-6 sm:p-10 shadow-xs">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 flex flex-col gap-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#28594E]/10 dark:bg-[#28594E]/30 text-[#28594E] dark:text-[#D8E6DA] text-xs font-bold uppercase tracking-wider w-fit">
                <Sparkles className="size-3.5 text-[#E8A45B]" />
                Direct Boutique Booking · No OTA Commissions
              </div>

              <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-[#28594E] dark:text-[#F5EBDD] font-sans leading-tight">
                Riverside sanctuary on the Chao Phraya.
              </h1>

              <p className="text-base sm:text-lg text-[#6B7B74] dark:text-[#A7B9B0] max-w-xl">
                Stay in handcrafted rooms, dine over water, and arrive effortlessly with private airport transfers — synchronized in a single booking.
              </p>

              <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-[#6B7B74] dark:text-[#A7B9B0] pt-2">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="size-4 text-[#28594E]" /> Best Rate Direct
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="size-4 text-[#28594E]" /> 15-Min Atomic Hold
                </span>
                <span className="flex items-center gap-1.5">
                  <Plane className="size-4 text-[#28594E]" /> Flight-Tracked Transit
                </span>
              </div>
            </div>

            {/* Mascot Showcase Interactive Card */}
            <div className="lg:col-span-5 flex flex-col items-center justify-center p-6 rounded-2xl bg-white/70 dark:bg-[#1A2521]/70 border border-[#E5DBD0] dark:border-[#2D3D36] backdrop-blur-xs text-center shadow-xs">
              <YoonieMascot
                mood={mascotMood}
                size="lg"
                interactive
                message={mascotMessage}
                badge="Concierge"
              />
              <p className="mt-3 text-xs font-bold text-[#28594E] dark:text-[#D8E6DA] tracking-wide">
                Meet Yoonie
              </p>
              <p className="text-[11px] text-[#6B7B74] dark:text-[#8FA299]">
                Your personal boutique stay companion. Click to cycle moods!
              </p>
            </div>
          </div>
        </div>

        {/* ─── Stay Search Bar ────────────────────────────────────────────────── */}
        <div className="mt-6 p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#202C27] border border-[#E5DBD0] dark:border-[#2D3D36] shadow-sm grid grid-cols-1 sm:grid-cols-4 gap-4 items-center">
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-[#6B7B74] dark:text-[#8FA299] flex items-center gap-1">
              <MapPin className="size-3 text-[#28594E]" /> Property
            </label>
            <p className="text-sm font-bold text-[#303A36] dark:text-[#F5EBDD]">
              {activeBranch?.name || "BKK Riverside Boutique Hotel"}
            </p>
          </div>

          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-[#6B7B74] dark:text-[#8FA299] flex items-center gap-1">
              <Calendar className="size-3 text-[#28594E]" /> Check-In
            </label>
            <input
              type="date"
              value={checkIn}
              onChange={(e) => setCheckIn(e.target.value)}
              className="w-full text-sm font-semibold bg-transparent border-0 p-0 text-[#303A36] dark:text-[#F5EBDD] focus:ring-0"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-[#6B7B74] dark:text-[#8FA299] flex items-center gap-1">
              <Calendar className="size-3 text-[#28594E]" /> Check-Out
            </label>
            <input
              type="date"
              value={checkOut}
              onChange={(e) => setCheckOut(e.target.value)}
              className="w-full text-sm font-semibold bg-transparent border-0 p-0 text-[#303A36] dark:text-[#F5EBDD] focus:ring-0"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-[#6B7B74] dark:text-[#8FA299] flex items-center gap-1">
              <Users className="size-3 text-[#28594E]" /> Guests
            </label>
            <select
              value={adults}
              onChange={(e) => setAdults(Number(e.target.value))}
              className="w-full text-sm font-semibold bg-transparent border-0 p-0 text-[#303A36] dark:text-[#F5EBDD] focus:ring-0"
            >
              <option value={1} className="dark:bg-[#202C27]">1 Adult</option>
              <option value={2} className="dark:bg-[#202C27]">2 Adults</option>
              <option value={3} className="dark:bg-[#202C27]">3 Adults</option>
              <option value={4} className="dark:bg-[#202C27]">4 Adults</option>
            </select>
          </div>
        </div>
      </section>

      {/* ─── Room Selection Section ─────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-4 pb-12">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-[#28594E] dark:text-[#F5EBDD]">
              Select Your Sanctuary
            </h2>
            <p className="text-xs text-[#6B7B74] dark:text-[#8FA299]">
              Stay length: {nights} {nights === 1 ? "night" : "nights"} ({checkIn} → {checkOut})
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {ROOM_CATALOG.map((room) => {
            const isSelected = cart.some(
              (i) => i.kind === "ROOM" && i.roomType === room.type
            );
            return (
              <div
                key={room.type}
                className={`flex flex-col justify-between rounded-3xl overflow-hidden bg-white dark:bg-[#202C27] border transition-all duration-300 shadow-xs hover:shadow-md ${
                  isSelected
                    ? "border-[#28594E] ring-2 ring-[#28594E]/20"
                    : "border-[#E5DBD0] dark:border-[#2D3D36]"
                }`}
              >
                <div>
                  <div className="relative h-48 w-full overflow-hidden bg-[#D8E6DA]/30">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={room.image}
                      alt={room.title}
                      className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                    />
                    <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-[#F8F5EE]/90 backdrop-blur-xs text-[10px] font-bold text-[#28594E] shadow-xs">
                      {room.capacity}
                    </span>
                  </div>

                  <div className="p-5 flex flex-col gap-3">
                    <div>
                      <h3 className="text-lg font-bold text-[#303A36] dark:text-[#F5EBDD]">
                        {room.title}
                      </h3>
                      <p className="text-xs text-[#6B7B74] dark:text-[#8FA299] mt-0.5">
                        {room.tagline}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {room.features.map((f) => (
                        <span
                          key={f}
                          className="px-2 py-0.5 rounded-lg bg-[#F8F5EE] dark:bg-[#1A2521] text-[10px] font-medium text-[#28594E] dark:text-[#D8E6DA] border border-[#E5DBD0] dark:border-[#2D3D36]"
                        >
                          {f}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="p-5 pt-0 border-t border-[#E5DBD0]/50 dark:border-[#2D3D36]/50 flex items-center justify-between mt-4">
                  <div>
                    <span className="text-xl font-extrabold text-[#28594E] dark:text-[#D8E6DA]">
                      ฿{room.pricePerNight.toLocaleString()}
                    </span>
                    <span className="text-[11px] text-[#6B7B74] dark:text-[#8FA299]">
                      {" "}
                      / night
                    </span>
                  </div>

                  <Button
                    onClick={() =>
                      addRoomToCart(room.type, room.title, room.pricePerNight)
                    }
                    className={`rounded-xl px-4 py-2 text-xs font-bold tracking-wide transition-all ${
                      isSelected
                        ? "bg-[#D8E6DA] text-[#28594E] hover:bg-[#C8DAD0]"
                        : "bg-[#28594E] text-[#F5EBDD] hover:bg-[#1E433A]"
                    }`}
                  >
                    {isSelected ? "Selected ✓" : "Choose Room"}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ─── Experience Add-Ons (Tours, Transfers & Dining) ───────────────────── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-4 pb-12">
        <div className="mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E8A45B]/15 text-[#303A36] dark:text-[#E8A45B] text-[11px] font-bold uppercase tracking-wider mb-2">
            <Compass className="size-3.5 text-[#E8A45B]" />
            Composite Direct Cart
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-[#28594E] dark:text-[#F5EBDD]">
            Enhance Your Stay in Bangkok
          </h2>
          <p className="text-xs text-[#6B7B74] dark:text-[#8FA299]">
            Book dining and experiences seamlessly in the same reservation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {services.map((svc) => (
            <div
              key={svc._id}
              className="rounded-2xl p-4 bg-white dark:bg-[#202C27] border border-[#E5DBD0] dark:border-[#2D3D36] flex flex-col justify-between shadow-xs hover:border-[#28594E]/40 transition"
            >
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#E8A45B]">
                  {svc.category}
                </span>
                <h4 className="font-bold text-sm text-[#303A36] dark:text-[#F5EBDD] mt-1">
                  {svc.name}
                </h4>
                <p className="text-[11px] text-[#6B7B74] dark:text-[#8FA299] mt-1 line-clamp-2">
                  {svc.kind === "AIRPORT_TRANSFER"
                    ? "Flight-tracked private minivan pickup with bilingual driver card."
                    : svc.tour?.meetingPoint || "Boutique concierge curated experience."}
                </p>
              </div>

              <div className="flex items-center justify-between pt-4 mt-3 border-t border-[#E5DBD0]/50 dark:border-[#2D3D36]/50">
                <span className="font-bold text-sm text-[#28594E] dark:text-[#D8E6DA]">
                  ฿{svc.basePriceThb.toLocaleString()}
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => addServiceToCart(svc)}
                  className="h-7 text-xs rounded-lg border-[#28594E]/30 text-[#28594E] hover:bg-[#D8E6DA]/50 dark:border-[#D8E6DA]/30 dark:text-[#D8E6DA]"
                >
                  <Plus className="size-3 mr-1" /> Add
                </Button>
              </div>
            </div>
          ))}

          {/* Dining Add-on from restaurant */}
          {restaurants[0] ? (
            <div className="rounded-2xl p-4 bg-white dark:bg-[#202C27] border border-[#E5DBD0] dark:border-[#2D3D36] flex flex-col justify-between shadow-xs hover:border-[#28594E]/40 transition">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#E8A45B]">
                  DINING
                </span>
                <h4 className="font-bold text-sm text-[#303A36] dark:text-[#F5EBDD] mt-1">
                  {restaurants[0].name} (Sunset Dinner)
                </h4>
                <p className="text-[11px] text-[#6B7B74] dark:text-[#8FA299] mt-1">
                  Reserved prime riverside table with traditional Thai banquet for two.
                </p>
              </div>

              <div className="flex items-center justify-between pt-4 mt-3 border-t border-[#E5DBD0]/50 dark:border-[#2D3D36]/50">
                <span className="font-bold text-sm text-[#28594E] dark:text-[#D8E6DA]">
                  ฿1,200
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    addDiningToCart(
                      restaurants[0],
                      restaurants[0].shifts[1]?.code || "EVENING",
                      "Evening Sunset Seating"
                    )
                  }
                  className="h-7 text-xs rounded-lg border-[#28594E]/30 text-[#28594E] hover:bg-[#D8E6DA]/50 dark:border-[#D8E6DA]/30 dark:text-[#D8E6DA]"
                >
                  <Plus className="size-3 mr-1" /> Add
                </Button>
              </div>
            </div>
          ) : null}
        </div>
      </section>

      {/* ─── Floating / Sticky Composite Cart Bar ─────────────────────────────── */}
      {cart.length > 0 ? (
        <aside
          aria-label="Reservation Summary"
          className="fixed bottom-4 left-4 right-4 z-50 max-w-4xl mx-auto rounded-3xl bg-[#28594E] text-[#F5EBDD] p-4 sm:p-5 shadow-2xl border border-[#D8E6DA]/30 flex flex-col sm:flex-row items-center justify-between gap-4 animate-in slide-in-from-bottom-6 duration-300"
        >
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <YoonieMascot
              mood={holdTimeLeft !== null ? (holdTimeLeft < 180 ? "worried" : "thinking") : "checking"}
              size="sm"
              className="shrink-0"
            />
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#E8A45B]">
                  {cart.length} {cart.length === 1 ? "Item" : "Items"} in Cart
                </span>
                {holdTimeLeft !== null ? (
                  <span className="px-2 py-0.5 rounded-full bg-[#E8A45B] text-[#303A36] text-[10px] font-bold flex items-center gap-1 animate-pulse">
                    <Clock className="size-2.5" /> Hold: {formatTimer(holdTimeLeft)}
                  </span>
                ) : null}
              </div>
              <p className="text-lg font-extrabold tracking-tight">
                ฿{grandTotal.toLocaleString()}{" "}
                <span className="text-[11px] font-normal text-[#D8E6DA]/80">
                  (incl. 10% svc & 7% vat)
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            {holdId ? (
              <Button
                onClick={() => setIsCheckoutOpen(true)}
                className="w-full sm:w-auto rounded-xl bg-[#E8A45B] hover:bg-[#D9964E] text-[#303A36] font-bold text-xs px-5 py-2.5 shadow-sm"
              >
                Complete Booking →
              </Button>
            ) : (
              <Button
                onClick={triggerHold}
                className="w-full sm:w-auto rounded-xl bg-[#D8E6DA] hover:bg-[#C5D8C7] text-[#28594E] font-bold text-xs px-5 py-2.5 shadow-sm"
              >
                Lock Rate & Hold (15 min)
              </Button>
            )}
          </div>
        </aside>
      ) : null}

      {/* ─── Checkout & Direct Attribution Modal ─────────────────────────────── */}
      {isCheckoutOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-3xl bg-[#F8F5EE] dark:bg-[#1D2723] border border-[#E5DBD0] dark:border-[#2D3D36] p-6 sm:p-8 shadow-2xl text-[#303A36] dark:text-[#F5EBDD] flex flex-col gap-5">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <YoonieMascot mood="checking" size="sm" />
                <div>
                  <h3 className="text-xl font-bold text-[#28594E] dark:text-[#F5EBDD]">
                    Direct Guest Reservation
                  </h3>
                  <p className="text-xs text-[#6B7B74] dark:text-[#8FA299]">
                    Attribution: Direct Web Booking (No OTA fee)
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsCheckoutOpen(false)}
                className="text-xs font-bold text-[#6B7B74] hover:text-[#303A36]"
              >
                ✕
              </button>
            </div>

            {/* Cart summary lines */}
            <div className="rounded-2xl bg-white dark:bg-[#202C27] p-4 border border-[#E5DBD0] dark:border-[#2D3D36] space-y-2 max-h-40 overflow-y-auto">
              {cart.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between text-xs py-1 border-b border-[#E5DBD0]/40 last:border-0"
                >
                  <span className="font-medium">{item.title}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold">฿{item.totalPrice.toLocaleString()}</span>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="size-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Guest Form */}
            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-[#28594E] dark:text-[#D8E6DA]">
                  Full Name
                </label>
                <input
                  type="text"
                  value={bookingGuest.fullName}
                  onChange={(e) =>
                    setBookingGuest({ ...bookingGuest, fullName: e.target.value })
                  }
                  className="mt-1 w-full rounded-xl border border-[#E5DBD0] dark:border-[#2D3D36] bg-white dark:bg-[#202C27] p-2.5 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[#28594E] dark:text-[#D8E6DA]">
                    Email
                  </label>
                  <input
                    type="email"
                    value={bookingGuest.email}
                    onChange={(e) =>
                      setBookingGuest({ ...bookingGuest, email: e.target.value })
                    }
                    className="mt-1 w-full rounded-xl border border-[#E5DBD0] dark:border-[#2D3D36] bg-white dark:bg-[#202C27] p-2.5 font-medium"
                  />
                </div>
                <div>
                  <label className="font-bold text-[#28594E] dark:text-[#D8E6DA]">
                    Phone (E.164)
                  </label>
                  <input
                    type="tel"
                    value={bookingGuest.phoneE164}
                    onChange={(e) =>
                      setBookingGuest({ ...bookingGuest, phoneE164: e.target.value })
                    }
                    className="mt-1 w-full rounded-xl border border-[#E5DBD0] dark:border-[#2D3D36] bg-white dark:bg-[#202C27] p-2.5 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-[#28594E] dark:text-[#D8E6DA]">
                  LINE ID / Transit Updates
                </label>
                <input
                  type="text"
                  value={bookingGuest.lineUserId}
                  onChange={(e) =>
                    setBookingGuest({ ...bookingGuest, lineUserId: e.target.value })
                  }
                  className="mt-1 w-full rounded-xl border border-[#E5DBD0] dark:border-[#2D3D36] bg-white dark:bg-[#202C27] p-2.5 font-medium"
                />
              </div>
            </div>

            <div className="pt-2 border-t border-[#E5DBD0] dark:border-[#2D3D36] flex items-center justify-between">
              <div>
                <p className="text-[10px] text-[#6B7B74]">Total Payable</p>
                <p className="text-xl font-extrabold text-[#28594E] dark:text-[#E8A45B]">
                  ฿{grandTotal.toLocaleString()}
                </p>
              </div>

              <Button
                onClick={finalizeBooking}
                className="rounded-xl bg-[#28594E] hover:bg-[#1E433A] text-[#F5EBDD] font-bold px-6 py-2.5 text-xs shadow-md"
              >
                Confirm & Pay Direct
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      {/* ─── Confirmation Screen Modal ────────────────────────────────────────── */}
      {isConfirmed ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in zoom-in-95 duration-200">
          <div className="w-full max-w-lg rounded-3xl bg-[#F8F5EE] dark:bg-[#1D2723] border border-[#E5DBD0] dark:border-[#2D3D36] p-6 sm:p-8 shadow-2xl text-center flex flex-col items-center gap-4">
            <YoonieMascot
              mood="happy"
              size="lg"
              message="Yay! Your reservation is confirmed!"
            />

            <div>
              <span className="px-3 py-1 rounded-full bg-[#28594E]/10 text-[#28594E] dark:text-[#D8E6DA] text-xs font-bold tracking-wider">
                CONFIRMED · {confirmedOrderNumber}
              </span>
              <h3 className="text-2xl font-extrabold text-[#28594E] dark:text-[#F5EBDD] mt-2">
                Welcome to Bangkok!
              </h3>
              <p className="text-xs text-[#6B7B74] dark:text-[#8FA299] max-w-sm mt-1">
                A confirmation has been sent to {bookingGuest.email}. Direct booking attribution recorded with zero OTA fee.
              </p>
            </div>

            {/* Bilingual airport card sample */}
            <div className="w-full text-left rounded-2xl bg-white dark:bg-[#202C27] border border-[#E5DBD0] dark:border-[#2D3D36] p-4 text-xs space-y-2">
              <div className="flex items-center gap-2 font-bold text-[#28594E] dark:text-[#D8E6DA]">
                <Plane className="size-3.5" /> Airport Pickup Card Generated (EN / TH)
              </div>
              <div className="p-2.5 rounded-xl bg-[#F8F5EE] dark:bg-[#17201D] font-mono text-[11px] text-[#303A36] dark:text-[#D8E6DA]">
                <p>Welcome to BKK Riverside Boutique Hotel, {bookingGuest.fullName}!</p>
                <p>Flight: TG917 | Door 4, Level 1</p>
                <p>Driver: Somchai Rattana (White Minivan 1กก 1234)</p>
                <p className="mt-1 text-[#6B7B74]">ยินดีต้อนรับสู่กรุงเทพฯ คนขับรอรับท่านที่ประตู 4 ชั้น 1</p>
              </div>
            </div>

            <Button
              onClick={resetBooking}
              className="mt-2 rounded-xl bg-[#28594E] hover:bg-[#1E433A] text-[#F5EBDD] font-bold text-xs px-6 py-2.5 shadow-sm"
            >
              Back to Home
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
