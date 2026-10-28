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
  brandName: string;
  slug: string;
  city: string;
  country: string;
  currency: string;
  timezone: string;
  propertyType: "HOTEL" | "CONDO" | "MIXED";
  totalUnitsEstimated: number;
  floorsEstimated: number;
  contactEmail: string;
  contactPhone: string;
  ownerName: string;
  ownerEmail: string;
  ownerPassword: string;
  logoUrl?: string;
  heroImageUrl?: string;
}

export interface RoomDraftState {
  title: string;
  baseRateThb: number;
  maxAdults: number;
  areaSqm: number;
  bedConfig: string;
  isSingleUnit: boolean;
  singleUnitName: string;
  keyCount: number;
  startRoomNumber: string;
  floor: number;
  coverImage: string;
  amenities: string[];
}

export interface CustomExperienceDraft {
  id: string;
  name: string;
  basePriceThb: number;
  pricingModel: "PER_PAX" | "PER_VEHICLE" | "PER_TREATMENT";
  description: string;
  coverImage: string;
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

export function computeGeneratedRoomKeys(startNumber: string, count: number): string[] {
  const parsed = parseInt(startNumber.replace(/[^0-9]/g, ""), 10);
  const prefix = startNumber.replace(/[0-9]/g, "");
  if (isNaN(parsed)) {
    return Array.from({ length: Math.max(1, count) }, (_, i) => `${startNumber}-${i + 1}`);
  }
  return Array.from({ length: Math.max(1, count) }, (_, i) => `${prefix}${parsed + i}`);
}

export function computeRoomKeysFromDraft(draft: RoomDraftState): string[] {
  if (draft.isSingleUnit) {
    const key = draft.singleUnitName.trim() || draft.title.trim() || "Pool House";
    return [key];
  }
  return computeGeneratedRoomKeys(draft.startRoomNumber, draft.keyCount);
}

export function mapTitleToRoomType(title: string): "STANDARD_KING" | "DELUXE_BALCONY" | "POOL_VILLA" {
  const lower = title.toLowerCase();
  if (lower.includes("villa") || lower.includes("pool") || lower.includes("house") || lower.includes("cottage") || lower.includes("bungalow")) {
    return "POOL_VILLA";
  }
  if (lower.includes("deluxe") || lower.includes("balcony") || lower.includes("suite") || lower.includes("penthouse") || lower.includes("exec")) {
    return "DELUXE_BALCONY";
  }
  return "STANDARD_KING";
}

const DEFAULT_FORM: WorkspaceFormState = {
  hotelName: "Sedona Heritage Resort",
  brandName: "",
  slug: "sedona-resort",
  city: "Bangkok",
  country: "TH",
  currency: "THB",
  timezone: "Asia/Bangkok",
  propertyType: "HOTEL",
  totalUnitsEstimated: 12,
  floorsEstimated: 3,
  contactEmail: "stay@sedonahotel.example",
  contactPhone: "+66812345678",
  ownerName: "Lynn Tan",
  ownerEmail: "lynn@sedonahotel.example",
  ownerPassword: "Password123!",
  logoUrl: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=200",
  heroImageUrl: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1600",
};

export const DEFAULT_ROOM_DRAFT: RoomDraftState = {
  title: "Pool House & Terrace",
  baseRateThb: 3200,
  maxAdults: 2,
  areaSqm: 50,
  bedConfig: "1 King Bed",
  isSingleUnit: true,
  singleUnitName: "Pool House",
  keyCount: 1,
  startRoomNumber: "101",
  floor: 1,
  coverImage: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1600&q=80",
  amenities: ["High-Speed WiFi", "Air Conditioning", "Private Pool", "Private Bathroom"],
};

export function usePlatformPageVm() {
  const queryClient = useQueryClient();
  const { applyAuthResponse } = useAuth();

  const branchesQuery = useQuery({
    queryKey: hospitalityKeys.branches(),
    queryFn: getBranches,
  });

  const [isWizardOpen, setIsWizardOpen] = React.useState(false);
  // 5-Stage Guided Hospitality Studio:
  // 1: Get started (Account & domain)
  // 2: Property details (Location, type, counts)
  // 3: Rooms & inventory (Types, counts)
  // 4: Add-ons & services (Experiences, rentals)
  // 5: Review & submit (Final check & launch)
  const [wizardStep, setWizardStep] = React.useState<1 | 2 | 3 | 4 | 5>(1);
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

  // Room Setup State
  const [roomDraft, setRoomDraft] = React.useState<RoomDraftState>(DEFAULT_ROOM_DRAFT);
  const [customAmenityInput, setCustomAmenityInput] = React.useState("");
  const [isCreatingRoom, setIsCreatingRoom] = React.useState(false);
  const [guidedRoomError, setGuidedRoomError] = React.useState<string | null>(null);
  const [createdRooms, setCreatedRooms] = React.useState<RoomItem[]>([]);

  // Custom Experiences State
  const [customExperiences, setCustomExperiences] = React.useState<CustomExperienceDraft[]>([]);
  const [experienceDraft, setExperienceDraft] = React.useState<CustomExperienceDraft>({
    id: "",
    name: "",
    basePriceThb: 300,
    pricingModel: "PER_PAX",
    description: "",
    coverImage: "",
  });
  const [isCreatingService, setIsCreatingService] = React.useState(false);
  const [guidedServiceError, setGuidedServiceError] = React.useState<string | null>(null);
  const [createdServices, setCreatedServices] = React.useState<ServiceItem[]>([]);

  const [isUploadingImage, setIsUploadingImage] = React.useState(false);

  // Skip Warning Modal State
  const [skipWarning, setSkipWarning] = React.useState<{
    isOpen: boolean;
    type: "ROOMS" | "SERVICE";
  }>({ isOpen: false, type: "ROOMS" });

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

      // Advance to Stage 3: Rooms & inventory
      setWizardStep(3);
    },
    onError: (err: any) => {
      const msg = err?.message || "Failed to provision workspace. Please check your inputs.";
      setOnboardingError(msg);
    },
  });

  const handleAdvanceToRooms = () => {
    if (createdWorkspace) {
      setWizardStep(3);
    } else {
      createWorkspaceMutation.mutate(form);
    }
  };

  // Toggle amenity
  const toggleAmenity = (amenity: string) => {
    setRoomDraft((prev) => {
      const exists = prev.amenities.includes(amenity);
      return {
        ...prev,
        amenities: exists
          ? prev.amenities.filter((a) => a !== amenity)
          : [...prev.amenities, amenity],
      };
    });
  };

  const addCustomAmenity = (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    setRoomDraft((prev) => {
      if (prev.amenities.includes(trimmed)) return prev;
      return { ...prev, amenities: [...prev.amenities, trimmed] };
    });
    setCustomAmenityInput("");
  };

  const removeAmenity = (amenity: string) => {
    setRoomDraft((prev) => ({
      ...prev,
      amenities: prev.amenities.filter((a) => a !== amenity),
    }));
  };

  // Real backend Room creation in batch
  const handleProvisionRoomKeys = async (stayOnStep = false) => {
    if (!createdWorkspace) return;
    setIsCreatingRoom(true);
    setGuidedRoomError(null);
    try {
      const keys = computeRoomKeysFromDraft(roomDraft);
      const roomType = mapTitleToRoomType(roomDraft.title);
      const created: RoomItem[] = [];

      for (const key of keys) {
        const res = await postRequest<RoomItem, Record<string, unknown>>(
          apiPath("rooms"),
          {
            branchId: createdWorkspace.id,
            roomNumber: key,
            roomType,
            baseRateThb: Number(roomDraft.baseRateThb) || 1000,
            maxOccupancy: Number(roomDraft.maxAdults) || 2,
            floor: Number(roomDraft.floor) || 1,
            amenities: roomDraft.amenities,
            coverImage: roomDraft.coverImage,
          }
        );
        created.push(res);
      }

      setCreatedRooms((prev) => [...prev, ...created]);
      void queryClient.invalidateQueries({
        queryKey: hospitalityKeys.rooms(createdWorkspace.id),
      });

      if (stayOnStep) {
        // Reset form for next space
        setRoomDraft({
          title: "",
          baseRateThb: 2500,
          maxAdults: 2,
          areaSqm: 40,
          bedConfig: "1 King Bed",
          isSingleUnit: false,
          singleUnitName: "",
          keyCount: 2,
          startRoomNumber: "201",
          floor: 2,
          coverImage: "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1600&q=80",
          amenities: ["High-Speed WiFi", "Air Conditioning", "Private Bathroom"],
        });
      } else {
        // Move to Stage 4: Add-ons & services
        setWizardStep(4);
      }
    } catch (err: any) {
      setGuidedRoomError(err?.message || "Failed to provision room inventory keys.");
    } finally {
      setIsCreatingRoom(false);
    }
  };

  // Add an experience to the custom list
  const addExperienceToList = () => {
    if (!experienceDraft.name.trim()) return;
    const newItem: CustomExperienceDraft = {
      ...experienceDraft,
      id: "exp-" + Date.now(),
      name: experienceDraft.name.trim(),
      basePriceThb: Number(experienceDraft.basePriceThb) || 0,
      description: experienceDraft.description.trim(),
    };
    setCustomExperiences((prev) => [...prev, newItem]);
    // Reset draft
    setExperienceDraft({
      id: "",
      name: "",
      basePriceThb: 300,
      pricingModel: "PER_PAX",
      description: "",
      coverImage: "",
    });
  };

  const removeExperienceFromList = (id: string) => {
    setCustomExperiences((prev) => prev.filter((item) => item.id !== id));
  };

  // Real backend Experience creation for ALL items in customExperiences
  const handlePublishAllExperiences = async () => {
    if (!createdWorkspace) return;
    setIsCreatingService(true);
    setGuidedServiceError(null);

    try {
      const itemsToPublish = [...customExperiences];
      // If user typed in the draft but did not click "+ Add to Catalog", include it
      if (experienceDraft.name.trim()) {
        itemsToPublish.push({
          ...experienceDraft,
          id: "exp-" + Date.now(),
          name: experienceDraft.name.trim(),
          basePriceThb: Number(experienceDraft.basePriceThb) || 0,
          description: experienceDraft.description.trim(),
        });
      }

      if (itemsToPublish.length === 0) {
        // No experiences to publish, jump straight to review
        setWizardStep(5);
        return;
      }

      const published: ServiceItem[] = [];

      for (let i = 0; i < itemsToPublish.length; i++) {
        const item = itemsToPublish[i];
        const lower = (item.name + " " + item.description).toLowerCase();
        const baseCode = item.name.toUpperCase().replace(/[^A-Z0-9]/g, "-").slice(0, 18) || `EXP-${i + 1}`;
        const code = `${baseCode}-${i + 1}`;

        let category: "TRANSPORT" | "TOURS" | "WELLNESS" = "TOURS";
        let kind: "AIRPORT_TRANSFER" | "SCHEDULED_TOUR" | "SPA_TREATMENT" = "SCHEDULED_TOUR";

        if (
          lower.includes("transfer") ||
          lower.includes("pickup") ||
          lower.includes("shuttle") ||
          lower.includes("taxi") ||
          lower.includes("driver")
        ) {
          category = "TRANSPORT";
          kind = "AIRPORT_TRANSFER";
        } else if (
          lower.includes("spa") ||
          lower.includes("massage") ||
          lower.includes("wellness") ||
          lower.includes("facial") ||
          lower.includes("sauna")
        ) {
          category = "WELLNESS";
          kind = "SPA_TREATMENT";
        } else {
          category = "TOURS";
          kind = "SCHEDULED_TOUR";
        }

        const payload: Record<string, unknown> = {
          branchId: createdWorkspace.id,
          code,
          name: item.name,
          category,
          kind,
          basePriceThb: Number(item.basePriceThb) || 0,
          pricingModel: item.pricingModel || "PER_PAX",
          description: item.description || undefined,
          coverImage: item.coverImage || undefined,
        };

        if (kind === "AIRPORT_TRANSFER") {
          payload.transfer = {
            airportCode: "BKK",
            airportName: "Airport / Transfer Hub",
            leadTimeMin: 60,
            vehicles: [{ plate: "VAN-01", type: "MINIVAN", capacityPax: 6 }],
          };
        } else if (kind === "SCHEDULED_TOUR") {
          payload.tour = {
            capacity: 50,
            minViablePax: 1,
            fixedCostThb: 0,
            departureTimes: ["Flexible"],
            durationMin: 60,
          };
        } else if (kind === "SPA_TREATMENT") {
          payload.wellness = {
            treatmentRooms: 2,
            therapists: 2,
            durationMin: 60,
            startTimes: ["10:00", "14:00", "18:00"],
          };
        }

        const res = await postRequest<ServiceItem, Record<string, unknown>>(
          apiPath("services"),
          payload
        );
        published.push(res);
      }

      setCreatedServices(published);
      void queryClient.invalidateQueries({
        queryKey: hospitalityKeys.services(createdWorkspace.id),
      });

      // Move to Stage 5: Review & submit
      setWizardStep(5);
    } catch (err: any) {
      setGuidedServiceError(err?.message || "Failed to publish experiences.");
    } finally {
      setIsCreatingService(false);
    }
  };

  // File Upload Helper (Uploads ONLY - NO URL input)
  const handleUploadImageFile = async (file: File, target: "room" | "service") => {
    setIsUploadingImage(true);
    try {
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        if (target === "room") {
          setRoomDraft((prev) => ({ ...prev, coverImage: dataUrl }));
        } else {
          setExperienceDraft((prev) => ({ ...prev, coverImage: dataUrl }));
        }
      };
      reader.readAsDataURL(file);
    } finally {
      setIsUploadingImage(false);
    }
  };

  // Skip Navigation Handlers
  const triggerSkipRooms = () => {
    setSkipWarning({ isOpen: true, type: "ROOMS" });
  };

  const confirmSkipRooms = () => {
    setSkipWarning({ isOpen: false, type: "ROOMS" });
    setWizardStep(4);
  };

  const triggerSkipService = () => {
    setSkipWarning({ isOpen: true, type: "SERVICE" });
  };

  const confirmSkipService = () => {
    setSkipWarning({ isOpen: false, type: "SERVICE" });
    setWizardStep(5);
  };

  const resetWizard = () => {
    setIsWizardOpen(false);
    setWizardStep(1);
    setCreatedWorkspace(null);
    setOnboardingError(null);
    setCreatedRooms([]);
    setCreatedServices([]);
    setCustomExperiences([]);
    setSkipWarning({ isOpen: false, type: "ROOMS" });
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
    handleAdvanceToRooms,
    isLaunching: createWorkspaceMutation.isPending,
    onboardingError,
    createdWorkspace,
    resetWizard,

    // Room Setup
    roomDraft,
    setRoomDraft,
    customAmenityInput,
    setCustomAmenityInput,
    toggleAmenity,
    addCustomAmenity,
    removeAmenity,
    handleProvisionRoomKeys,
    isCreatingRoom,
    guidedRoomError,
    createdRooms,

    // Custom Experiences
    customExperiences,
    experienceDraft,
    setExperienceDraft,
    addExperienceToList,
    removeExperienceFromList,
    handlePublishAllExperiences,
    isCreatingService,
    guidedServiceError,
    createdServices,

    isUploadingImage,
    handleUploadImageFile,

    // Skip Warnings
    skipWarning,
    setSkipWarning,
    triggerSkipRooms,
    confirmSkipRooms,
    triggerSkipService,
    confirmSkipService,
  };
}

export type PlatformPageVm = ReturnType<typeof usePlatformPageVm>;
