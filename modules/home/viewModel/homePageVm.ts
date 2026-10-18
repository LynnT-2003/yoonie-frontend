"use client";

import * as React from "react";
import { useAuth } from "@/providers/auth-provider";
import {
  useBranchesQuery,
  useRestaurantsQuery,
  useRoomsQuery,
  useServicesQuery,
} from "@/lib/domain/hospitality/hospitality-api";
import type {
  Branch,
  RestaurantItem,
  RoomType,
  ServiceItem,
} from "@/lib/types/hospitality";

export type CartItem =
  | {
      id: string;
      kind: "ROOM";
      title: string;
      roomType: RoomType;
      nights: number;
      pricePerNight: number;
      totalPrice: number;
      checkIn: string;
      checkOut: string;
    }
  | {
      id: string;
      kind: "SERVICE";
      title: string;
      serviceId: string;
      serviceKind: string;
      price: number;
      pax: number;
      totalPrice: number;
      flightNumber?: string;
    }
  | {
      id: string;
      kind: "DINING";
      title: string;
      restaurantId: string;
      shiftCode: string;
      shiftName: string;
      pax: number;
      totalPrice: number;
      diningDate: string;
    };

export function useHomePageVm() {
  const { user, ready } = useAuth();
  const branchesQuery = useBranchesQuery();
  const activeBranch: Branch | undefined = branchesQuery.data?.[0];
  const branchId = activeBranch?._id || "665a1b2c3d4e5f6a7b8c9d0e";

  const roomsQuery = useRoomsQuery(branchId);
  const rooms = React.useMemo(() => roomsQuery.data || [], [roomsQuery.data]);
  const servicesQuery = useServicesQuery(branchId);
  const restaurantsQuery = useRestaurantsQuery(branchId);

  // Compute live room catalog dynamically from backend room inventory and R2 cover images
  const roomCatalog = React.useMemo(() => {
    const specs: Record<
      RoomType,
      {
        type: RoomType;
        title: string;
        tagline: string;
        pricePerNight: number;
        capacity: string;
        features: string[];
        image: string;
      }
    > = {
      STANDARD_KING: {
        type: "STANDARD_KING",
        title: "Standard King Room",
        tagline: "Serene garden & partial river view, plush king bed",
        pricePerNight: 2200,
        capacity: "2 Guests · 32 sqm",
        features: ["King Bed", "Rain Shower", "High-speed WiFi", "Organic Tea Bar"],
        image:
          "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80",
      },
      DELUXE_BALCONY: {
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
      POOL_VILLA: {
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
    };

    if (rooms.length > 0) {
      rooms.forEach((r) => {
        if (specs[r.roomType]) {
          if (r.coverImage) {
            specs[r.roomType].image = r.coverImage;
          } else if (r.images && r.images.length > 0) {
            specs[r.roomType].image = r.images[0];
          }
          if (r.baseRateThb) {
            specs[r.roomType].pricePerNight = r.baseRateThb;
          }
          if (r.amenities && r.amenities.length > 0) {
            specs[r.roomType].features = r.amenities.map((a) =>
              a.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase())
            );
          }
          if (r.maxOccupancy) {
            specs[r.roomType].capacity = `${r.maxOccupancy} Guests`;
          }
        }
      });
    }

    return Object.values(specs);
  }, [rooms]);

  // Search parameters
  const [checkIn, setCheckIn] = React.useState("2026-10-20");
  const [checkOut, setCheckOut] = React.useState("2026-10-22");
  const [adults, setAdults] = React.useState(2);

  // Cart state
  const [cart, setCart] = React.useState<CartItem[]>([]);
  const [holdId, setHoldId] = React.useState<string | null>(null);
  const [holdExpiresAt, setHoldExpiresAt] = React.useState<Date | null>(null);
  const [holdTimeLeft, setHoldTimeLeft] = React.useState<number | null>(null);
  const [isHolding, setIsHolding] = React.useState(false);

  // Booking completion modal
  const [isCheckoutOpen, setIsCheckoutOpen] = React.useState(false);
  const [isConfirmed, setIsConfirmed] = React.useState(false);
  const [confirmedOrderNumber, setConfirmedOrderNumber] = React.useState<string | null>(null);

  // Guided onboarding state
  const [isOnboardingOpen, setIsOnboardingOpen] = React.useState(false);

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const completed = localStorage.getItem("onboardingComplete");
      if (!completed) {
        setIsOnboardingOpen(true);
      }
    }
  }, []);

  const [bookingGuest, setBookingGuest] = React.useState({
    fullName: user?.displayName || "Sarah Jenkins",
    email: user?.email || "sarah.j@example.com",
    phoneE164: "+66812345678",
    lineUserId: "U9876543210abcdef",
    flightNumber: "TG917",
    preferredLanguage: "en",
  });

  // Calculate nights
  const nights = React.useMemo(() => {
    try {
      const d1 = new Date(checkIn);
      const d2 = new Date(checkOut);
      const diff = Math.ceil((d2.getTime() - d1.getTime()) / (1000 * 3600 * 24));
      return diff > 0 ? diff : 1;
    } catch {
      return 2;
    }
  }, [checkIn, checkOut]);

  // Totals
  const subtotal = React.useMemo(
    () => cart.reduce((acc, item) => acc + item.totalPrice, 0),
    [cart]
  );
  const serviceCharge = Math.round(subtotal * 0.1);
  const vat = Math.round((subtotal + serviceCharge) * 0.07);
  const grandTotal = subtotal + serviceCharge + vat;

  // Hold countdown interval
  React.useEffect(() => {
    if (!holdExpiresAt) {
      setHoldTimeLeft(null);
      return;
    }
    const interval = setInterval(() => {
      const diff = Math.max(0, Math.floor((holdExpiresAt.getTime() - Date.now()) / 1000));
      setHoldTimeLeft(diff);
      if (diff <= 0) {
        clearInterval(interval);
        setHoldId(null);
        setHoldExpiresAt(null);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [holdExpiresAt]);

  const addRoomToCart = (roomType: RoomType, title: string, pricePerNight: number) => {
    const existingIdx = cart.findIndex((i) => i.kind === "ROOM");
    const newItem: CartItem = {
      id: `room-${Date.now()}`,
      kind: "ROOM",
      title,
      roomType,
      nights,
      pricePerNight,
      totalPrice: pricePerNight * nights,
      checkIn,
      checkOut,
    };
    if (existingIdx >= 0) {
      const next = [...cart];
      next[existingIdx] = newItem;
      setCart(next);
    } else {
      setCart([...cart, newItem]);
    }
  };

  const addServiceToCart = (service: ServiceItem, flightNum?: string) => {
    const newItem: CartItem = {
      id: `service-${service._id}-${Date.now()}`,
      kind: "SERVICE",
      title: service.name,
      serviceId: service._id,
      serviceKind: service.kind,
      price: service.basePriceThb,
      pax: 2,
      totalPrice: service.basePriceThb * (service.kind === "AIRPORT_TRANSFER" ? 1 : 2),
      flightNumber: flightNum || "TG917",
    };
    setCart((prev) => [...prev, newItem]);
  };

  const addDiningToCart = (restaurant: RestaurantItem, shiftCode: string, shiftName: string) => {
    const newItem: CartItem = {
      id: `dining-${restaurant._id}-${shiftCode}-${Date.now()}`,
      kind: "DINING",
      title: `${restaurant.name} (${shiftName})`,
      restaurantId: restaurant._id,
      shiftCode,
      shiftName,
      pax: 2,
      totalPrice: 1200,
      diningDate: checkIn,
    };
    setCart((prev) => [...prev, newItem]);
  };

  const removeFromCart = (id: string) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const triggerHold = async () => {
    if (cart.length === 0) return;
    setIsHolding(true);
    try {
      const expires = new Date(Date.now() + 15 * 60 * 1000);
      setHoldId(`hold-${Date.now()}`);
      setHoldExpiresAt(expires);
    } finally {
      setIsHolding(false);
    }
  };

  const finalizeBooking = async () => {
    const mockOrderNumber = `TS-${new Date().toISOString().slice(2, 10).replace(/-/g, "")}-${Math.random()
      .toString(36)
      .substring(2, 7)
      .toUpperCase()}`;
    setConfirmedOrderNumber(mockOrderNumber);
    setIsConfirmed(true);
    setIsCheckoutOpen(false);
  };

  const resetBooking = () => {
    setCart([]);
    setHoldId(null);
    setHoldExpiresAt(null);
    setIsConfirmed(false);
    setConfirmedOrderNumber(null);
  };

  return {
    user,
    ready,
    activeBranch,
    branchId,
    roomCatalog,
    rooms,
    services: servicesQuery.data || [],
    restaurants: restaurantsQuery.data || [],
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
    subtotal,
    serviceCharge,
    vat,
    grandTotal,
    holdId,
    holdTimeLeft,
    isHolding,
    triggerHold,
    isCheckoutOpen,
    setIsCheckoutOpen,
    bookingGuest,
    setBookingGuest,
    finalizeBooking,
    isConfirmed,
    confirmedOrderNumber,
    resetBooking,
    isOnboardingOpen,
    setIsOnboardingOpen,
    openOnboarding: () => setIsOnboardingOpen(true),
    closeOnboarding: () => {
      if (typeof window !== "undefined") {
        localStorage.setItem("onboardingComplete", "true");
      }
      setIsOnboardingOpen(false);
    },
  };
}

export type HomePageVm = ReturnType<typeof useHomePageVm>;
