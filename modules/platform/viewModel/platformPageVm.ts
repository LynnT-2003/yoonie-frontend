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

export interface GuidedRoomState {
  roomType: "STANDARD_KING" | "DELUXE_BALCONY" | "POOL_VILLA";
  roomNumber: string;
  baseRateThb: number;
  maxOccupancy: number;
  amenities: string[];
}

export interface GuidedServiceState {
  type: "TRANSFER" | "TOUR" | "WELLNESS";
  name: string;
  code: string;
  basePriceThb: number;
  category: "TRANSPORT" | "TOURS" | "WELLNESS";
  kind: "AIRPORT_TRANSFER" | "SCHEDULED_TOUR" | "SPA_TREATMENT";
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

const DEFAULT_FORM: WorkspaceFormState = {
  hotelName: "Sedona Hotel & Resort",
  slug: "sedona",
  city: "Bangkok",
  country: "TH",
  currency: "THB",
  timezone: "Asia/Bangkok",
  contactEmail: "stay@sedonahotel.example",
  contactPhone: "+6628881234",
  ownerName: "Somchai Thanakorn",
  ownerEmail: "owner@sedonahotel.example",
  ownerPassword: "Password123!",
  logoUrl: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=200",
  heroImageUrl: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1600",
};

export const ROOM_PRESETS: Record<GuidedRoomState["roomType"], {
  title: string;
  description: string;
  rate: number;
  occupancy: number;
  amenities: string[];
  defaultNumber: string;
}> = {
  STANDARD_KING: {
    title: "Standard King Room",
    description: "Serene garden & interior view, plush king bed",
    rate: 2200,
    occupancy: 2,
    amenities: ["King Bed", "Rain Shower", "High-speed WiFi", "Organic Tea Bar"],
    defaultNumber: "101",
  },
  DELUXE_BALCONY: {
    title: "Deluxe River Balcony",
    description: "Panoramic scenic views from a private teak terrace",
    rate: 3800,
    occupancy: 3,
    amenities: ["Teak Balcony", "Deep Soaking Tub", "Sofa Daybed", "Sunset Drink"],
    defaultNumber: "201",
  },
  POOL_VILLA: {
    title: "Riverside Private Pool Villa",
    description: "Ultra-luxury sanctuary with private plunge pool and butler service",
    rate: 7500,
    occupancy: 4,
    amenities: ["Private Plunge Pool", "Outdoor Dining", "Twin Loft Suite", "VIP Lane"],
    defaultNumber: "PV1",
  },
};

export const SERVICE_PRESETS: Record<GuidedServiceState["type"], {
  name: string;
  code: string;
  rate: number;
  category: "TRANSPORT" | "TOURS" | "WELLNESS";
  kind: "AIRPORT_TRANSFER" | "SCHEDULED_TOUR" | "SPA_TREATMENT";
  description: string;
}> = {
  TRANSFER: {
    name: "VIP Airport Transfer",
    code: "AIRPORT-PICKUP",
    rate: 1200,
    category: "TRANSPORT",
    kind: "AIRPORT_TRANSFER",
    description: "Private meet-and-greet airport arrival transfer with luggage assistance",
  },
  TOUR: {
    name: "Sunset Scenic River Cruise",
    code: "SUNSET-CRUISE",
    rate: 1500,
    category: "TOURS",
    kind: "SCHEDULED_TOUR",
    description: "2-hour golden hour scenic boat exploration with refreshments",
  },
  WELLNESS: {
    name: "Traditional Herbal Spa Massage",
    code: "HERBAL-SPA",
    rate: 950,
    category: "WELLNESS",
    kind: "SPA_TREATMENT",
    description: "60-minute relaxing therapeutic herbal compress treatment",
  },
};

export function usePlatformPageVm() {
  const queryClient = useQueryClient();
  const { applyAuthResponse } = useAuth();

  const branchesQuery = useQuery({
    queryKey: hospitalityKeys.branches(),
    queryFn: getBranches,
  });

  const [isWizardOpen, setIsWizardOpen] = React.useState(false);
  // Steps: 1 (Essentials), 2 (Location), 3 (Owner Auth), 4 (Add Room), 5 (Add Experience), 6 (Celebration & Links)
  const [wizardStep, setWizardStep] = React.useState<1 | 2 | 3 | 4 | 5 | 6>(1);
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

  // Guided Room State
  const [guidedRoom, setGuidedRoom] = React.useState<GuidedRoomState>({
    roomType: "STANDARD_KING",
    roomNumber: "101",
    baseRateThb: 2200,
    maxOccupancy: 2,
    amenities: ["King Bed", "Rain Shower", "High-speed WiFi", "Organic Tea Bar"],
  });
  const [isCreatingRoom, setIsCreatingRoom] = React.useState(false);
  const [guidedRoomError, setGuidedRoomError] = React.useState<string | null>(null);
  const [createdRooms, setCreatedRooms] = React.useState<RoomItem[]>([]);

  // Guided Experience State
  const [guidedService, setGuidedService] = React.useState<GuidedServiceState>({
    type: "TRANSFER",
    name: "VIP Airport Transfer",
    code: "AIRPORT-PICKUP",
    basePriceThb: 1200,
    category: "TRANSPORT",
    kind: "AIRPORT_TRANSFER",
  });
  const [isCreatingService, setIsCreatingService] = React.useState(false);
  const [guidedServiceError, setGuidedServiceError] = React.useState<string | null>(null);
  const [createdServices, setCreatedServices] = React.useState<ServiceItem[]>([]);

  // Skip Warning Modal State
  const [skipWarning, setSkipWarning] = React.useState<{
    isOpen: boolean;
    step: 4 | 5;
  }>({ isOpen: false, step: 4 });

  // Auto-slugify when hotel name changes
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
      // Invalidate branches query so app recognizes the new tenant immediately
      void queryClient.invalidateQueries({ queryKey: hospitalityKeys.branches() });

      // Automatically authenticate the owner session
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

      // Advance directly to Guided Step 1: Add First Room
      setWizardStep(4);
    },
    onError: (err: any) => {
      const msg = err?.message || "Failed to create workspace. Please check your details.";
      setOnboardingError(msg);
    },
  });

  const handleLaunchWorkspace = () => {
    createWorkspaceMutation.mutate(form);
  };

  // Select a room preset
  const selectRoomPreset = (type: GuidedRoomState["roomType"]) => {
    const p = ROOM_PRESETS[type];
    setGuidedRoom({
      roomType: type,
      roomNumber: p.defaultNumber,
      baseRateThb: p.rate,
      maxOccupancy: p.occupancy,
      amenities: [...p.amenities],
    });
    setGuidedRoomError(null);
  };

  // Toggle amenity on guided room
  const toggleRoomAmenity = (amenity: string) => {
    setGuidedRoom((prev) => {
      const exists = prev.amenities.includes(amenity);
      return {
        ...prev,
        amenities: exists
          ? prev.amenities.filter((a) => a !== amenity)
          : [...prev.amenities, amenity],
      };
    });
  };

  // Real backend Room creation
  const handleCreateGuidedRoom = async () => {
    if (!createdWorkspace) return;
    setIsCreatingRoom(true);
    setGuidedRoomError(null);
    try {
      const res = await postRequest<RoomItem, Record<string, unknown>>(
        apiPath("rooms"),
        {
          branchId: createdWorkspace.id,
          roomNumber: guidedRoom.roomNumber.trim(),
          roomType: guidedRoom.roomType,
          baseRateThb: Number(guidedRoom.baseRateThb),
          maxOccupancy: Number(guidedRoom.maxOccupancy),
          amenities: guidedRoom.amenities,
          floor: 1,
        }
      );
      setCreatedRooms((prev) => [...prev, res]);
      void queryClient.invalidateQueries({
        queryKey: hospitalityKeys.rooms(createdWorkspace.id),
      });
      // Move to Step 5: Guided Experience
      setWizardStep(5);
    } catch (err: any) {
      setGuidedRoomError(err?.message || "Failed to add room suite.");
    } finally {
      setIsCreatingRoom(false);
    }
  };

  // Select a service preset
  const selectServicePreset = (type: GuidedServiceState["type"]) => {
    const p = SERVICE_PRESETS[type];
    setGuidedService({
      type,
      name: p.name,
      code: p.code,
      basePriceThb: p.rate,
      category: p.category,
      kind: p.kind,
    });
    setGuidedServiceError(null);
  };

  // Real backend Service creation
  const handleCreateGuidedService = async () => {
    if (!createdWorkspace) return;
    setIsCreatingService(true);
    setGuidedServiceError(null);
    try {
      const payload: Record<string, unknown> = {
        branchId: createdWorkspace.id,
        code: guidedService.code,
        name: guidedService.name,
        category: guidedService.category,
        kind: guidedService.kind,
        basePriceThb: Number(guidedService.basePriceThb),
        pricingModel:
          guidedService.kind === "SPA_TREATMENT" ? "PER_TREATMENT" : "PER_PAX",
      };

      if (guidedService.kind === "AIRPORT_TRANSFER") {
        payload.transfer = {
          airportCode: "BKK",
          airportName: "Suvarnabhumi Airport",
          leadTimeMin: 60,
          vehicles: [{ plate: "VIP-01", type: "MINIVAN", capacityPax: 6 }],
        };
      } else if (guidedService.kind === "SCHEDULED_TOUR") {
        payload.tour = {
          capacity: 12,
          minViablePax: 2,
          fixedCostThb: 1000,
          departureTimes: ["09:00", "14:00"],
          durationMin: 120,
        };
      } else if (guidedService.kind === "SPA_TREATMENT") {
        payload.wellness = {
          treatmentRooms: 2,
          therapists: 2,
          durationMin: 60,
          startTimes: ["10:00", "13:00", "16:00"],
        };
      }

      const res = await postRequest<ServiceItem, Record<string, unknown>>(
        apiPath("services"),
        payload
      );
      setCreatedServices((prev) => [...prev, res]);
      void queryClient.invalidateQueries({
        queryKey: hospitalityKeys.services(createdWorkspace.id),
      });
      // Move to Step 6: Final Review & Celebration
      setWizardStep(6);
    } catch (err: any) {
      setGuidedServiceError(err?.message || "Failed to add experience.");
    } finally {
      setIsCreatingService(false);
    }
  };

  // Trigger skip confirmation warning
  const triggerSkipRoom = () => {
    setSkipWarning({ isOpen: true, step: 4 });
  };

  const confirmSkipRoom = () => {
    setSkipWarning({ isOpen: false, step: 4 });
    setWizardStep(5);
  };

  const triggerSkipService = () => {
    setSkipWarning({ isOpen: true, step: 5 });
  };

  const confirmSkipService = () => {
    setSkipWarning({ isOpen: false, step: 5 });
    setWizardStep(6);
  };

  const resetWizard = () => {
    setIsWizardOpen(false);
    setWizardStep(1);
    setCreatedWorkspace(null);
    setOnboardingError(null);
    setCreatedRooms([]);
    setCreatedServices([]);
    setSkipWarning({ isOpen: false, step: 4 });
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

    // Guided Setup
    guidedRoom,
    setGuidedRoom,
    selectRoomPreset,
    toggleRoomAmenity,
    handleCreateGuidedRoom,
    isCreatingRoom,
    guidedRoomError,
    createdRooms,

    guidedService,
    setGuidedService,
    selectServicePreset,
    handleCreateGuidedService,
    isCreatingService,
    guidedServiceError,
    createdServices,

    skipWarning,
    setSkipWarning,
    triggerSkipRoom,
    confirmSkipRoom,
    triggerSkipService,
    confirmSkipService,
  };
}

export type PlatformPageVm = ReturnType<typeof usePlatformPageVm>;
