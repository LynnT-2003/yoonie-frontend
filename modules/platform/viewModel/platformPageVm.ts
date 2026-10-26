"use client";

import * as React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getBranches, hospitalityKeys } from "@/lib/domain/hospitality/hospitality-api";
import { postRequest } from "@/lib/domain/api/NetworkManager";
import { apiPath } from "@/lib/config/api-path";
import { useAuth } from "@/providers/auth-provider";
import type { Branch, RoomItem, ServiceItem } from "@/lib/types/hospitality";
import type { AuthResponse } from "@/lib/types/auth";

export interface WorkspaceFormState {
  hotelName: string;
  slug: string;
  classification: string;
  city: string;
  country: string;
  currency: string;
  timezone: string;
  contactEmail: string;
  contactPhone: string;
  ownerName: string;
  ownerEmail: string;
  ownerPassword: string;
  logoUrl?: string;
  heroImageUrl?: string;
}

export interface DeepDiveRoomState {
  roomType: "STANDARD_KING" | "DELUXE_BALCONY" | "POOL_VILLA";
  title: string;
  baseRateThb: number;
  maxAdults: number;
  maxChildren: number;
  areaSqm: number;
  bedConfig: string;
  floor: number;
  keyCount: number;
  startRoomNumber: string;
  coverImage: string;
  amenities: string[];
}

export interface DeepDiveServiceState {
  type: "TRANSFER" | "TOUR" | "WELLNESS";
  name: string;
  code: string;
  basePriceThb: number;
  pricingModel: "PER_PAX" | "PER_VEHICLE" | "PER_TREATMENT";
  category: "TRANSPORT" | "TOURS" | "WELLNESS";
  kind: "AIRPORT_TRANSFER" | "SCHEDULED_TOUR" | "SPA_TREATMENT";
  description: string;
  coverImage: string;
  airportCode: string;
  airportName: string;
  leadTimeMin: number;
  fleetPlate: string;
  tourCapacity: number;
  minViablePax: number;
  departureTimes: string[];
  spaRooms: number;
  spaTherapists: number;
  durationMin: number;
}

export interface OnboardResponse {
  branch: Branch;
  user: {
    _id: string;
    email: string;
    displayName: string;
    role: string;
    branchIds: string[];
  };
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
}

export const LUXURY_ROOM_PHOTOS = [
  {
    title: "Deluxe Ocean Balcony",
    url: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1600&q=80",
    desc: "Teak terrace with panoramic ocean vista & soaking tub",
  },
  {
    title: "Private Pool Villa",
    url: "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=1600&q=80",
    desc: "Private plunge pool with secluded sun loungers",
  },
  {
    title: "Executive Garden King",
    url: "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1600&q=80",
    desc: "Warm ambient hardwood suite with luxury king bedding",
  },
  {
    title: "Grand Penthouse Suite",
    url: "https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1600&q=80",
    desc: "High-floor expansive master suite with skyline views",
  },
];

export const LUXURY_EXPERIENCE_PHOTOS = [
  {
    title: "VIP Executive Airport Chauffeuring",
    url: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=1600&q=80",
    desc: "Mercedes / Alphard chauffeured meet-and-greet arrival",
  },
  {
    title: "Sunset Scenic Canal Longtail",
    url: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1600&q=80",
    desc: "Private scenic canal voyage with cold refreshments",
  },
  {
    title: "Aromatic Thai Herbal Compress Spa",
    url: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1600&q=80",
    desc: "Traditional therapeutic compress & relaxation pavilion",
  },
];

export function computeGeneratedRoomKeys(startNumber: string, count: number): string[] {
  const parsed = parseInt(startNumber.replace(/[^0-9]/g, ""), 10);
  const prefix = startNumber.replace(/[0-9]/g, "");
  if (isNaN(parsed)) {
    return Array.from({ length: Math.max(1, count) }, (_, i) => `${startNumber}-${i + 1}`);
  }
  return Array.from({ length: Math.max(1, count) }, (_, i) => `${prefix}${parsed + i}`);
}

const DEFAULT_FORM: WorkspaceFormState = {
  hotelName: "Sedona Heritage Resort",
  slug: "sedona-resort",
  classification: "Boutique Luxury Resort",
  city: "Bangkok",
  country: "TH",
  currency: "THB",
  timezone: "Asia/Bangkok",
  contactEmail: "stay@sedonahotel.example",
  contactPhone: "+6628881234",
  ownerName: "Lynn Tan",
  ownerEmail: "lynn@sedonahotel.example",
  ownerPassword: "Password123!",
  logoUrl: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=200",
  heroImageUrl: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1600",
};

export function usePlatformPageVm() {
  const queryClient = useQueryClient();
  const { applyAuthResponse } = useAuth();

  const branchesQuery = useQuery({
    queryKey: hospitalityKeys.branches(),
    queryFn: getBranches,
  });

  const [isWizardOpen, setIsWizardOpen] = React.useState(false);
  // Steps:
  // 1: Property Identity & Subdomain
  // 2: Operational Details & Fiscal
  // 3: GM Executive Account
  // 4: Executive Guidance Decision Gate (Yes/No)
  // 5: Master Room Inventory (Deep Dive)
  // 6: Frontline Guest Experiences (Deep Dive)
  // 7: Production Audit & Verification
  const [wizardStep, setWizardStep] = React.useState<1 | 2 | 3 | 4 | 5 | 6 | 7>(1);
  const [form, setForm] = React.useState<WorkspaceFormState>(DEFAULT_FORM);
  const [onboardingError, setOnboardingError] = React.useState<string | null>(null);

  const [createdWorkspace, setCreatedWorkspace] = React.useState<{
    id: string;
    name: string;
    code: string;
    slug: string;
    guestUrl: string;
    opsUrl: string;
  } | null>(null);

  // Deep Dive Room Inventory State
  const [deepDiveRoom, setDeepDiveRoom] = React.useState<DeepDiveRoomState>({
    roomType: "DELUXE_BALCONY",
    title: "Deluxe Ocean Balcony Suite",
    baseRateThb: 4500,
    maxAdults: 2,
    maxChildren: 1,
    areaSqm: 48,
    bedConfig: "1 Super King Bed (200x200cm)",
    floor: 1,
    keyCount: 4,
    startRoomNumber: "101",
    coverImage: LUXURY_ROOM_PHOTOS[0].url,
    amenities: [
      "High-Speed Fiber WiFi",
      "Air Conditioning",
      "King Bed",
      "Private Balcony",
      "Deep Soaking Tub",
      "Mini Bar",
      "Espresso Machine",
      "In-room Safe",
    ],
  });

  const [isCreatingRoom, setIsCreatingRoom] = React.useState(false);
  const [guidedRoomError, setGuidedRoomError] = React.useState<string | null>(null);
  const [createdRooms, setCreatedRooms] = React.useState<RoomItem[]>([]);

  // Deep Dive Frontline Experience State
  const [deepDiveService, setDeepDiveService] = React.useState<DeepDiveServiceState>({
    type: "TRANSFER",
    name: "VIP Chauffeured Airport Transfer",
    code: "VIP-AIRPORT-TRANSFER",
    basePriceThb: 1200,
    pricingModel: "PER_PAX",
    category: "TRANSPORT",
    kind: "AIRPORT_TRANSFER",
    description: "Private meet-and-greet chauffeured airport arrival with luxury fleet and luggage assistance",
    coverImage: LUXURY_EXPERIENCE_PHOTOS[0].url,
    airportCode: "BKK",
    airportName: "Suvarnabhumi Airport",
    leadTimeMin: 60,
    fleetPlate: "VIP-01",
    tourCapacity: 12,
    minViablePax: 2,
    departureTimes: ["09:00", "14:00"],
    spaRooms: 2,
    spaTherapists: 4,
    durationMin: 60,
  });

  const [isCreatingService, setIsCreatingService] = React.useState(false);
  const [guidedServiceError, setGuidedServiceError] = React.useState<string | null>(null);
  const [createdServices, setCreatedServices] = React.useState<ServiceItem[]>([]);
  const [isUploadingImage, setIsUploadingImage] = React.useState(false);

  // Skip Warning Modal State
  const [skipWarning, setSkipWarning] = React.useState<{
    isOpen: boolean;
    type: "GUIDANCE" | "ROOMS" | "SERVICE";
  }>({ isOpen: false, type: "GUIDANCE" });

  // Auto-slugify
  const handleHotelNameChange = (name: string) => {
    const autoSlug = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    setForm((prev) => ({
      ...prev,
      hotelName: name,
      slug: autoSlug || prev.slug,
    }));
  };

  // Real backend workspace onboarding mutation
  const createWorkspaceMutation = useMutation({
    mutationFn: async (payload: WorkspaceFormState) => {
      setOnboardingError(null);
      const res = await postRequest<OnboardResponse, Record<string, unknown>>(
        apiPath("branches/onboard"),
        {
          hotelName: payload.hotelName.trim(),
          slug: payload.slug.toLowerCase().trim(),
          city: payload.city.trim(),
          country: payload.country.trim(),
          currency: payload.currency,
          timezone: payload.timezone,
          contactPhoneE164: payload.contactPhone.trim(),
          contactEmail: payload.contactEmail.trim(),
          logoUrl: payload.logoUrl,
          heroImageUrl: payload.heroImageUrl,
          ownerName: payload.ownerName.trim(),
          ownerEmail: payload.ownerEmail.toLowerCase().trim(),
          ownerPassword: payload.ownerPassword,
        },
        { isPublic: true }
      );
      return res;
    },
    onSuccess: (data) => {
      void queryClient.invalidateQueries({ queryKey: hospitalityKeys.branches() });

      try {
        applyAuthResponse({
          user: (data.user as unknown) as AuthResponse["user"],
          tokens: data.tokens,
        });
      } catch (err) {
        console.warn("Auto-session application note:", err);
      }

      const slug = data.branch.code.toLowerCase();
      setCreatedWorkspace({
        id: data.branch._id,
        name: data.branch.name,
        code: data.branch.code,
        slug,
        guestUrl: `https://${slug}.yoonie.app`,
        opsUrl: `/ops/rooms`,
      });

      // Advance to Step 4: Executive Guidance Decision Gate
      setWizardStep(4);
    },
    onError: (err: any) => {
      const msg = err?.message || "Failed to provision workspace. Please check your inputs.";
      setOnboardingError(msg);
    },
  });

  const handleLaunchWorkspace = () => {
    createWorkspaceMutation.mutate(form);
  };

  // Switch Room Suite Category Preset
  const selectRoomCategoryPreset = (category: "STANDARD_KING" | "DELUXE_BALCONY" | "POOL_VILLA") => {
    if (category === "STANDARD_KING") {
      setDeepDiveRoom((prev) => ({
        ...prev,
        roomType: "STANDARD_KING",
        title: "Standard King Suite",
        baseRateThb: 2800,
        maxAdults: 2,
        maxChildren: 1,
        areaSqm: 32,
        bedConfig: "1 King Bed (180x200cm)",
        coverImage: LUXURY_ROOM_PHOTOS[2].url,
        amenities: ["High-Speed Fiber WiFi", "Air Conditioning", "King Bed", "Rain Shower", "Mini Bar"],
      }));
    } else if (category === "DELUXE_BALCONY") {
      setDeepDiveRoom((prev) => ({
        ...prev,
        roomType: "DELUXE_BALCONY",
        title: "Deluxe Ocean Balcony Suite",
        baseRateThb: 4500,
        maxAdults: 2,
        maxChildren: 1,
        areaSqm: 48,
        bedConfig: "1 Super King Bed (200x200cm)",
        coverImage: LUXURY_ROOM_PHOTOS[0].url,
        amenities: [
          "High-Speed Fiber WiFi",
          "Air Conditioning",
          "King Bed",
          "Private Balcony",
          "Deep Soaking Tub",
          "Mini Bar",
          "Espresso Machine",
          "In-room Safe",
        ],
      }));
    } else {
      setDeepDiveRoom((prev) => ({
        ...prev,
        roomType: "POOL_VILLA",
        title: "Private Pool Villa Sanctuary",
        baseRateThb: 9200,
        maxAdults: 4,
        maxChildren: 2,
        areaSqm: 95,
        bedConfig: "1 Grand Master King + Twin Loft",
        coverImage: LUXURY_ROOM_PHOTOS[1].url,
        amenities: [
          "Private Plunge Pool",
          "Teak Sun Lounge",
          "High-Speed Fiber WiFi",
          "Air Conditioning",
          "King Bed",
          "Deep Soaking Tub",
          "Mini Bar",
          "Espresso Machine",
          "Express Airport VIP Lane",
        ],
      }));
    }
  };

  // Toggle amenity
  const toggleAmenity = (amenity: string) => {
    setDeepDiveRoom((prev) => {
      const exists = prev.amenities.includes(amenity);
      return {
        ...prev,
        amenities: exists
          ? prev.amenities.filter((a) => a !== amenity)
          : [...prev.amenities, amenity],
      };
    });
  };

  // Real backend Room creation in batch for all physical keys
  const handleProvisionRoomKeys = async () => {
    if (!createdWorkspace) return;
    setIsCreatingRoom(true);
    setGuidedRoomError(null);
    try {
      const keys = computeGeneratedRoomKeys(deepDiveRoom.startRoomNumber, deepDiveRoom.keyCount);
      const created: RoomItem[] = [];
      for (const key of keys) {
        const res = await postRequest<RoomItem, Record<string, unknown>>(
          apiPath("rooms"),
          {
            branchId: createdWorkspace.id,
            roomNumber: key,
            roomType: deepDiveRoom.roomType,
            baseRateThb: Number(deepDiveRoom.baseRateThb),
            maxOccupancy: Number(deepDiveRoom.maxAdults) + Number(deepDiveRoom.maxChildren),
            floor: Number(deepDiveRoom.floor),
            amenities: deepDiveRoom.amenities,
            coverImage: deepDiveRoom.coverImage,
          }
        );
        created.push(res);
      }
      setCreatedRooms(created);
      void queryClient.invalidateQueries({
        queryKey: hospitalityKeys.rooms(createdWorkspace.id),
      });
      // Move to Step 6: Frontline Guest Experiences
      setWizardStep(6);
    } catch (err: any) {
      setGuidedRoomError(err?.message || "Failed to provision room inventory keys.");
    } finally {
      setIsCreatingRoom(false);
    }
  };

  // Switch Experience Preset
  const selectServicePreset = (type: "TRANSFER" | "TOUR" | "WELLNESS") => {
    if (type === "TRANSFER") {
      setDeepDiveService({
        type: "TRANSFER",
        name: "VIP Chauffeured Airport Transfer",
        code: "VIP-AIRPORT-TRANSFER",
        basePriceThb: 1200,
        pricingModel: "PER_PAX",
        category: "TRANSPORT",
        kind: "AIRPORT_TRANSFER",
        description: "Private meet-and-greet chauffeured airport arrival with luxury fleet and luggage assistance",
        coverImage: LUXURY_EXPERIENCE_PHOTOS[0].url,
        airportCode: "BKK",
        airportName: "Suvarnabhumi Airport",
        leadTimeMin: 60,
        fleetPlate: "VIP-01",
        tourCapacity: 12,
        minViablePax: 2,
        departureTimes: ["09:00", "14:00"],
        spaRooms: 2,
        spaTherapists: 4,
        durationMin: 60,
      });
    } else if (type === "TOUR") {
      setDeepDiveService({
        type: "TOUR",
        name: "Sunset Scenic River Longtail Voyage",
        code: "SUNSET-CRUISE",
        basePriceThb: 2500,
        pricingModel: "PER_PAX",
        category: "TOURS",
        kind: "SCHEDULED_TOUR",
        description: "2-hour golden hour scenic canal exploration with private longtail boat and cold drinks",
        coverImage: LUXURY_EXPERIENCE_PHOTOS[1].url,
        airportCode: "BKK",
        airportName: "Suvarnabhumi Airport",
        leadTimeMin: 60,
        fleetPlate: "VIP-01",
        tourCapacity: 12,
        minViablePax: 2,
        departureTimes: ["09:00", "16:30"],
        spaRooms: 2,
        spaTherapists: 4,
        durationMin: 120,
      });
    } else {
      setDeepDiveService({
        type: "WELLNESS",
        name: "Traditional Thai Herbal Spa Massage",
        code: "HERBAL-SPA",
        basePriceThb: 1800,
        pricingModel: "PER_TREATMENT",
        category: "WELLNESS",
        kind: "SPA_TREATMENT",
        description: "90-minute aromatic hot herbal compress and therapeutic muscle rejuvenation",
        coverImage: LUXURY_EXPERIENCE_PHOTOS[2].url,
        airportCode: "BKK",
        airportName: "Suvarnabhumi Airport",
        leadTimeMin: 60,
        fleetPlate: "VIP-01",
        tourCapacity: 12,
        minViablePax: 2,
        departureTimes: ["09:00", "14:00"],
        spaRooms: 2,
        spaTherapists: 4,
        durationMin: 90,
      });
    }
  };

  // Real backend Service creation
  const handlePublishExperience = async () => {
    if (!createdWorkspace) return;
    setIsCreatingService(true);
    setGuidedServiceError(null);
    try {
      const payload: Record<string, unknown> = {
        branchId: createdWorkspace.id,
        code: deepDiveService.code,
        name: deepDiveService.name,
        category: deepDiveService.category,
        kind: deepDiveService.kind,
        basePriceThb: Number(deepDiveService.basePriceThb),
        pricingModel: deepDiveService.pricingModel,
        coverImage: deepDiveService.coverImage,
      };

      if (deepDiveService.kind === "AIRPORT_TRANSFER") {
        payload.transfer = {
          airportCode: deepDiveService.airportCode || "BKK",
          airportName: deepDiveService.airportName || "Suvarnabhumi Airport",
          leadTimeMin: deepDiveService.leadTimeMin || 60,
          vehicles: [{ plate: deepDiveService.fleetPlate || "VIP-01", type: "MINIVAN", capacityPax: 6 }],
        };
      } else if (deepDiveService.kind === "SCHEDULED_TOUR") {
        payload.tour = {
          capacity: deepDiveService.tourCapacity || 12,
          minViablePax: deepDiveService.minViablePax || 2,
          fixedCostThb: 1000,
          departureTimes: deepDiveService.departureTimes || ["09:00", "16:30"],
          durationMin: deepDiveService.durationMin || 120,
        };
      } else if (deepDiveService.kind === "SPA_TREATMENT") {
        payload.wellness = {
          treatmentRooms: deepDiveService.spaRooms || 2,
          therapists: deepDiveService.spaTherapists || 4,
          durationMin: deepDiveService.durationMin || 90,
          startTimes: ["10:00", "13:00", "16:00"],
        };
      }

      const res = await postRequest<ServiceItem, Record<string, unknown>>(
        apiPath("services"),
        payload
      );
      setCreatedServices([res]);
      void queryClient.invalidateQueries({
        queryKey: hospitalityKeys.services(createdWorkspace.id),
      });
      // Move to Step 7: Audit & Verification
      setWizardStep(7);
    } catch (err: any) {
      setGuidedServiceError(err?.message || "Failed to publish experience.");
    } finally {
      setIsCreatingService(false);
    }
  };

  // File Upload Helper
  const handleUploadImageFile = async (file: File, target: "room" | "service") => {
    setIsUploadingImage(true);
    try {
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        if (target === "room") {
          setDeepDiveRoom((prev) => ({ ...prev, coverImage: dataUrl }));
        } else {
          setDeepDiveService((prev) => ({ ...prev, coverImage: dataUrl }));
        }
      };
      reader.readAsDataURL(file);
    } finally {
      setIsUploadingImage(false);
    }
  };

  // Trigger skip warnings
  const triggerSkipGuidance = () => {
    setSkipWarning({ isOpen: true, type: "GUIDANCE" });
  };

  const confirmSkipGuidance = () => {
    setSkipWarning({ isOpen: false, type: "GUIDANCE" });
    setWizardStep(7);
  };

  const triggerSkipRooms = () => {
    setSkipWarning({ isOpen: true, type: "ROOMS" });
  };

  const confirmSkipRooms = () => {
    setSkipWarning({ isOpen: false, type: "ROOMS" });
    setWizardStep(6);
  };

  const triggerSkipService = () => {
    setSkipWarning({ isOpen: true, type: "SERVICE" });
  };

  const confirmSkipService = () => {
    setSkipWarning({ isOpen: false, type: "SERVICE" });
    setWizardStep(7);
  };

  const resetWizard = () => {
    setIsWizardOpen(false);
    setWizardStep(1);
    setCreatedWorkspace(null);
    setOnboardingError(null);
    setCreatedRooms([]);
    setCreatedServices([]);
    setSkipWarning({ isOpen: false, type: "GUIDANCE" });
  };

  return {
    branches: branchesQuery.data || [],
    isLoadingBranches: branchesQuery.isLoading,
    isWizardOpen,
    setIsWizardOpen,
    wizardStep,
    setWizardStep,
    form,
    setForm,
    handleHotelNameChange,
    handleLaunchWorkspace,
    isLaunching: createWorkspaceMutation.isPending,
    onboardingError,
    createdWorkspace,
    resetWizard,

    // Deep Dive Room Inventory
    deepDiveRoom,
    setDeepDiveRoom,
    selectRoomCategoryPreset,
    toggleAmenity,
    handleProvisionRoomKeys,
    isCreatingRoom,
    guidedRoomError,
    createdRooms,

    // Deep Dive Frontline Experiences
    deepDiveService,
    setDeepDiveService,
    selectServicePreset,
    handlePublishExperience,
    isCreatingService,
    guidedServiceError,
    createdServices,
    isUploadingImage,
    handleUploadImageFile,

    // Skip Warnings
    skipWarning,
    setSkipWarning,
    triggerSkipGuidance,
    confirmSkipGuidance,
    triggerSkipRooms,
    confirmSkipRooms,
    triggerSkipService,
    confirmSkipService,
  };
}

export type PlatformPageVm = ReturnType<typeof usePlatformPageVm>;
