"use client";

import * as React from "react";
import { useAuth } from "@/providers/auth-provider";
import { useQueryClient } from "@tanstack/react-query";
import { ApiError } from "@/lib/domain/api/ApiError";
import {
  createHold,
  createOrder,
  hospitalityKeys,
  releaseHold,
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
      serviceKind: ServiceItem["kind"];
      /** price per unit; transfers are one unit per vehicle, tours and spa one per guest */
      price: number;
      perGuest: boolean;
      pax: number;
      totalPrice: number;
      /** hotel-local date and HH:mm; for transfers this is the flight's landing time */
      date: string;
      time: string;
      /** fixed departures / start times offered by the service, empty means any time */
      timeOptions: string[];
      flightNumber: string;
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

/** Business date in the hotel's timezone (all branches are Bangkok today). */
function hotelDate(offsetDays = 0): string {
  const now = new Date(Date.now() + offsetDays * 86_400_000);
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Bangkok" }).format(now);
}

/** Order lines need a concrete start; dining times are confirmed by the restaurant. */
const hotelMidday = (date: string) => new Date(`${date}T12:00:00+07:00`).toISOString();

const hotelDateTime = (date: string, time: string) => new Date(`${date}T${time}:00+07:00`).toISOString();

/** What a service still needs before it can be held, or null when it's ready. */
export function serviceIssue(
  item: Extract<CartItem, { kind: "SERVICE" }>,
  checkIn: string,
  checkOut: string
): string | null {
  if (item.serviceKind === "AIRPORT_TRANSFER") {
    if (!item.flightNumber.trim()) return "Add your arrival flight number";
    if (!item.time) return "Add your landing time";
    return null;
  }
  if (!item.date || item.date < checkIn || item.date > checkOut) return "Pick a date during your stay";
  if (!item.time) return "Pick a time";
  return null;
}

export function useHomePageVm(branchCode?: string) {
  const queryClient = useQueryClient();
  const { user, ready } = useAuth();
  const branchesQuery = useBranchesQuery();
  const isTenantMode = Boolean(branchCode);
  const activeBranch: Branch | undefined = React.useMemo(() => {
    if (!branchesQuery.data || branchesQuery.data.length === 0) return undefined;
    if (branchCode) {
      const target = branchCode.toLowerCase().trim();
      const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
      const normalizeSingular = (s: string) => normalize(s).replace(/s(?=\d|$)/g, "");

      // 1. Exact match on code (e.g. "LYNN-STAYS-2" === "lynn-stays-2")
      const exactCode = branchesQuery.data.find(
        (b) => b.code.toLowerCase() === target
      );
      if (exactCode) return exactCode;

      // 2. Normalized code match (ignoring hyphens, underscores, casing)
      const normTarget = normalize(target);
      const normalizedCode = branchesQuery.data.find(
        (b) => normalize(b.code) === normTarget
      );
      if (normalizedCode) return normalizedCode;

      // 3. Name slug match (e.g. name "Lynn Stays 2" -> "lynn-stays-2")
      const nameMatch = branchesQuery.data.find((b) => {
        const slugFromName = b.name
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "");
        return slugFromName === target || normalize(b.name) === normTarget;
      });
      if (nameMatch) return nameMatch;

      // 4. Fuzzy singular/plural match (e.g. "lynn-stays-2" <-> "LYNN-STAY-2")
      const singularTarget = normalizeSingular(target);
      const fuzzyMatch = branchesQuery.data.find(
        (b) =>
          normalizeSingular(b.code) === singularTarget ||
          normalizeSingular(b.name) === singularTarget
      );
      if (fuzzyMatch) return fuzzyMatch;

      return undefined;
    }
    return branchesQuery.data[0];
  }, [branchesQuery.data, branchCode]);
  const isNotFound = isTenantMode && !branchesQuery.isLoading && !activeBranch;
  const branchId = activeBranch?._id || "";

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
        title: "Standard King Suite",
        tagline: "Serene garden & partial river view, plush king bed",
        pricePerNight: 2200,
        capacity: "2 Guests · 32 sqm",
        features: ["King Bed", "Rain Shower", "High-speed WiFi", "Organic Tea Bar"],
        image: "",
      },
      DELUXE_BALCONY: {
        type: "DELUXE_BALCONY",
        title: "Deluxe Balcony Suite",
        tagline: "Panoramic scenic views from a private teak terrace",
        pricePerNight: 3800,
        capacity: "3 Guests · 48 sqm",
        features: [
          "Teak Balcony",
          "Deep Soaking Tub",
          "Sofa Daybed",
          "Complimentary Sunset Drink",
        ],
        image: "",
      },
      POOL_VILLA: {
        type: "POOL_VILLA",
        title: "Private Pool Villa",
        tagline: "Ultra-luxury sanctuary with private plunge pool and butler service",
        pricePerNight: 7500,
        capacity: "4 Guests · 95 sqm",
        features: [
          "Private Plunge Pool",
          "Outdoor Dining Lounge",
          "Twin Loft Suite",
          "Express Airport VIP Lane",
        ],
        image: "",
      },
    };

    if (!activeBranch || rooms.length === 0) {
      return [];
    }

    const activeTypes = Array.from(new Set(rooms.map((r) => r.roomType)));
    return activeTypes.map((type) => {
      const matchingRooms = rooms.filter((r) => r.roomType === type);
      const firstRoom = matchingRooms[0];
      const template = specs[type] || {
        type,
        title: type.replace(/_/g, " "),
        tagline: "Spacious private accommodation",
        pricePerNight: firstRoom?.baseRateThb || 2000,
        capacity: `${firstRoom?.maxOccupancy || 2} Guests`,
        features: firstRoom?.amenities || ["King Bed", "High-speed WiFi"],
        image: firstRoom?.coverImage || firstRoom?.images?.[0] || "",
      };

      const customSpec = { ...template };
      if (firstRoom?.coverImage) {
        customSpec.image = firstRoom.coverImage;
      } else if (firstRoom?.images && firstRoom.images.length > 0) {
        customSpec.image = firstRoom.images[0];
      }
      if (firstRoom?.baseRateThb) {
        customSpec.pricePerNight = firstRoom.baseRateThb;
      }
      if (firstRoom?.amenities && firstRoom.amenities.length > 0) {
        customSpec.features = firstRoom.amenities.map((a) =>
          a.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase())
        );
      }
      if (firstRoom?.maxOccupancy) {
        customSpec.capacity = `${firstRoom.maxOccupancy} Guests`;
      }
      return customSpec;
    });
  }, [activeBranch, rooms]);

  // Search parameters
  const [checkIn, setCheckIn] = React.useState(() => hotelDate(0));
  const [checkOut, setCheckOut] = React.useState(() => hotelDate(2));
  const [adults, setAdults] = React.useState(2);

  // Cart state
  const [cart, setCart] = React.useState<CartItem[]>([]);
  const [holdId, setHoldId] = React.useState<string | null>(null);
  const [holdToken, setHoldToken] = React.useState<string | null>(null);
  const [bookingError, setBookingError] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
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
    fullName: user?.displayName || "",
    email: user?.email || "",
    phoneE164: "",
    lineUserId: "",
    preferredLanguage: "en" as "en" | "th",
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

  const addServiceToCart = (service: ServiceItem) => {
    const perGuest = service.kind !== "AIRPORT_TRANSFER";
    const timeOptions = service.tour?.departureTimes ?? service.wellness?.startTimes ?? [];
    const pax = adults;
    const newItem: CartItem = {
      id: `service-${service._id}-${Date.now()}`,
      kind: "SERVICE",
      title: service.name,
      serviceId: service._id,
      serviceKind: service.kind,
      price: service.basePriceThb,
      perGuest,
      pax,
      totalPrice: service.basePriceThb * (perGuest ? pax : 1),
      // transfers meet the arrival flight on check-in day; guests can move other services
      date: checkIn,
      time: timeOptions.length === 1 ? timeOptions[0] : "",
      timeOptions,
      flightNumber: "",
    };
    setCart((prev) => [...prev, newItem]);
    // a new item invalidates any hold taken for the previous cart
    setHoldId(null);
    setHoldExpiresAt(null);
  };

  const updateService = (
    id: string,
    patch: Partial<Pick<Extract<CartItem, { kind: "SERVICE" }>, "date" | "time" | "flightNumber">>
  ) => {
    setCart((prev) =>
      prev.map((item) => (item.id === id && item.kind === "SERVICE" ? { ...item, ...patch } : item))
    );
    // the hold was taken for the old time slot; the guest re-holds with the new one
    setHoldId(null);
    setHoldExpiresAt(null);
  };

  // Keep service guest counts and transfer dates in step with the stay being booked.
  React.useEffect(() => {
    setCart((prev) =>
      prev.map((item) => {
        if (item.kind !== "SERVICE") return item;
        const pax = adults;
        const date =
          item.serviceKind === "AIRPORT_TRANSFER" || item.date < checkIn || item.date > checkOut
            ? checkIn
            : item.date;
        if (pax === item.pax && date === item.date) return item;
        return { ...item, pax, date, totalPrice: item.price * (item.perGuest ? pax : 1) };
      })
    );
  }, [adults, checkIn, checkOut]);

  const serviceIssues = React.useMemo(
    () =>
      cart.flatMap((item) =>
        item.kind === "SERVICE" && serviceIssue(item, checkIn, checkOut) ? [item.id] : []
      ),
    [cart, checkIn, checkOut]
  );

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

  const errorMessage = (err: unknown) =>
    err instanceof ApiError ? err.message : "Something went wrong. Please try again.";

  const triggerHold = async () => {
    if (cart.length === 0) return;
    setIsHolding(true);
    setBookingError(null);
    try {
      const stays = cart.flatMap((item) =>
        item.kind === "ROOM"
          ? [{ roomType: item.roomType, checkInDate: item.checkIn, checkOutDate: item.checkOut }]
          : []
      );
      if (stays.length === 0) {
        setBookingError("Add a room to your reservation first.");
        return;
      }
      if (serviceIssues.length) {
        setBookingError("Complete the details for your services first.");
        return;
      }
      const services = cart.flatMap((item) =>
        item.kind === "SERVICE"
          ? [{ serviceId: item.serviceId, startsAt: hotelDateTime(item.date, item.time), pax: item.pax }]
          : []
      );
      const hold = await createHold({
        branchId,
        cartId: `cart_${crypto.randomUUID()}`,
        stays,
        services,
        ttlMinutes: 15,
      });
      setHoldId(hold._id);
      setHoldToken(hold.holdToken ?? null);
      setHoldExpiresAt(new Date(hold.expiresAt));
    } catch (err) {
      setBookingError(errorMessage(err));
    } finally {
      setIsHolding(false);
    }
  };

  const finalizeBooking = async () => {
    if (!holdId) return;
    setIsSubmitting(true);
    setBookingError(null);
    try {
      const lines = cart.map((item) => {
        if (item.kind === "ROOM") {
          return {
            kind: "STAY",
            title: `${item.title} · ${item.nights} ${item.nights === 1 ? "night" : "nights"}`,
            unitPriceThb: item.totalPrice,
            startsAt: hotelMidday(item.checkIn),
            businessDate: item.checkIn,
            stay: {
              roomType: item.roomType,
              checkInDate: item.checkIn,
              checkOutDate: item.checkOut,
              nights: item.nights,
              adults,
            },
          };
        }
        if (item.kind === "SERVICE") {
          const startsAt = hotelDateTime(item.date, item.time);
          return {
            kind: "SERVICE",
            title: item.title,
            unitPriceThb: item.price,
            startsAt,
            businessDate: item.date,
            service: {
              serviceId: item.serviceId,
              serviceName: item.title,
              serviceKind: item.serviceKind,
              pax: item.pax,
              ...(item.serviceKind === "AIRPORT_TRANSFER" && {
                flight: {
                  number: item.flightNumber.trim().toUpperCase(),
                  direction: "ARRIVAL",
                  scheduledAt: startsAt,
                },
              }),
            },
          };
        }
        const restaurant = restaurantsQuery.data?.find((r) => r._id === item.restaurantId);
        return {
          kind: "DINING",
          title: item.title,
          unitPriceThb: item.totalPrice,
          startsAt: hotelMidday(item.diningDate),
          businessDate: item.diningDate,
          dining: {
            restaurantId: item.restaurantId,
            restaurantName: restaurant?.name ?? item.title,
            shiftCode: item.shiftCode,
            partySize: item.pax,
          },
        };
      });

      const { order } = await createOrder({
        branchId,
        holdId,
        guest: {
          fullName: bookingGuest.fullName.trim(),
          email: bookingGuest.email.trim() || undefined,
          phoneE164: bookingGuest.phoneE164.replace(/[\s-]/g, "") || undefined,
          lineUserId: bookingGuest.lineUserId.trim() || undefined,
          preferredLanguage: bookingGuest.preferredLanguage,
        },
        lines,
        attribution: { channel: "DIRECT_WEB" },
      });

      // The hold is now booked stock; stop the countdown and refresh anything showing rooms.
      setHoldExpiresAt(null);
      void queryClient.invalidateQueries({ queryKey: hospitalityKeys.all });
      setConfirmedOrderNumber(order.orderNumber);
      setIsConfirmed(true);
      setIsCheckoutOpen(false);
    } catch (err) {
      setBookingError(errorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetBooking = () => {
    if (holdId && !isConfirmed) {
      void releaseHold(holdId, holdToken ?? undefined).catch(() => undefined);
    }
    setCart([]);
    setHoldId(null);
    setHoldToken(null);
    setHoldExpiresAt(null);
    setIsConfirmed(false);
    setConfirmedOrderNumber(null);
    setBookingError(null);
  };

  return {
    isNotFound,
    isLoadingTenant: isTenantMode && branchesQuery.isLoading,
    isTenantMode,
    branchCode,
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
    updateService,
    serviceIssues,
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
    isSubmitting,
    bookingError,
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
