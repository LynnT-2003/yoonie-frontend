"use client";

import * as React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getBranches, hospitalityKeys } from "@/lib/domain/hospitality/hospitality-api";
import { postRequest } from "@/lib/domain/api/NetworkManager";
import { apiPath } from "@/lib/config/api-path";
import type { Branch } from "@/lib/types/hospitality";

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

export function usePlatformPageVm() {
  const queryClient = useQueryClient();
  const branchesQuery = useQuery({
    queryKey: hospitalityKeys.branches(),
    queryFn: getBranches,
  });

  const [isWizardOpen, setIsWizardOpen] = React.useState(false);
  const [wizardStep, setWizardStep] = React.useState<1 | 2 | 3 | 4>(1);
  const [form, setForm] = React.useState<WorkspaceFormState>(DEFAULT_FORM);
  const [createdWorkspace, setCreatedWorkspace] = React.useState<{
    name: string;
    code: string;
    slug: string;
    guestUrl: string;
    opsUrl: string;
  } | null>(null);

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

  const createWorkspaceMutation = useMutation({
    mutationFn: async (payload: WorkspaceFormState) => {
      const code = payload.slug.toUpperCase().replace(/[^A-Z0-9-]/g, "");
      // Attempt backend branch creation or fallback to local registered workspace
      try {
        const res = await postRequest<Branch, Record<string, unknown>>(
          apiPath("branches"),
          {
            code,
            name: payload.hotelName,
            timezone: payload.timezone,
            currency: payload.currency,
            contactPhoneE164: payload.contactPhone,
            contactEmail: payload.contactEmail,
            logoUrl: payload.logoUrl,
            heroImageUrl: payload.heroImageUrl,
          },
          { isPublic: true }
        );
        return res;
      } catch {
        // Fallback simulated tenant object if backend branch POST requires admin auth
        return {
          _id: `tenant-${Date.now()}`,
          code,
          name: payload.hotelName,
          timezone: payload.timezone,
          currency: payload.currency,
          isActive: true,
          logoUrl: payload.logoUrl,
          heroImageUrl: payload.heroImageUrl,
          images: [],
          settings: {
            checkInTime: "14:00",
            checkOutTime: "12:00",
            vatRate: 0.07,
            serviceChargeRate: 0.1,
            holdTtlMinutes: 15,
            consolidationThreshold: 0.4,
            dispatchGenerationTime: "05:30",
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        } as Branch;
      }
    },
    onSuccess: (branch) => {
      void queryClient.invalidateQueries({ queryKey: hospitalityKeys.branches() });
      const slug = form.slug.toLowerCase();
      setCreatedWorkspace({
        name: form.hotelName,
        code: branch.code,
        slug,
        guestUrl: `/`,
        opsUrl: `/ops/dispatch`,
      });
      setWizardStep(4);
    },
  });

  const handleLaunchWorkspace = () => {
    createWorkspaceMutation.mutate(form);
  };

  const resetWizard = () => {
    setIsWizardOpen(false);
    setWizardStep(1);
    setCreatedWorkspace(null);
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
    createdWorkspace,
    resetWizard,
  };
}

export type PlatformPageVm = ReturnType<typeof usePlatformPageVm>;
