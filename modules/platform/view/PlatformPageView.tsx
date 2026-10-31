/* eslint-disable @next/next/no-img-element */
"use client";

import * as React from "react";
import {
  ArrowRight,
  Bed,
  Building,
  Building2,
  Check,
  CheckCircle2,
  ExternalLink,
  Globe,
  Home,
  Key,
  Layers,
  Lock,
  Plus,
  Sparkles,
  Trash2,
  UploadCloud,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field, Input, InputAffix } from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { YoonieMascot } from "@/components/mascot/YoonieMascot";
import {
  computeGeneratedRoomKeys,
  computeRoomKeysFromDraft,
  type PlatformPageVm,
} from "../viewModel/platformPageVm";

const ESSENTIAL_AMENITIES = [
  "High-Speed WiFi",
  "Air Conditioning",
  "Private Pool",
  "Private Bathroom",
  "Kitchenette",
  "Hot Shower",
];

const ONBOARDING_STAGES = [
  { num: 1, title: "Name & Account", sub: "Website link & owner login" },
  { num: 2, title: "Property & Location", sub: "Destination & property type" },
  { num: 3, title: "Add Your First Room", sub: "Set up 1 room to get started" },
  { num: 4, title: "Services & Extras", sub: "Airport taxi, breakfast & tours" },
  { num: 5, title: "Review & Launch", sub: "Check details & open dashboard" },
];

export function PlatformPageView({ vm }: { vm: PlatformPageVm }) {
  const {
    branches,
    isWizardOpen,
    setIsWizardOpen,
    wizardStep,
    setWizardStep,
    form,
    setForm,
    handleHotelNameChange,
    handleAdvanceToRooms,
    isLaunching,
    onboardingError,
    isSlugTaken,
    suggestedSlug,
    handleAutoFixSlug,
    createdWorkspace,
    resetWizard,

    // Room Setup
    roomDraft,
    setRoomDraft,
    roomScreen,
    setRoomScreen,
    addFloor,
    removeFloor,
    updateFloorConfig,
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
  } = vm;

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => {
    setMounted(true);
  }, []);

  const getRootDomain = () => {
    if (typeof window === "undefined") return "yoonie.app";
    const host = window.location.host;
    if (host.includes("localhost")) {
      const port = host.split(":")[1] || "3000";
      return `localhost:${port}`;
    }
    const parts = host.split(":")[0].split(".");
    return parts.length > 1 ? parts.slice(-2).join(".") : "yoonie.app";
  };

  const activeRootDomain = mounted ? getRootDomain() : "yoonie.app";

  const getSubdomainUrl = (subdomain: string, path = "") => {
    if (!mounted || typeof window === "undefined") return `https://${subdomain}.yoonie.app${path}`;
    const host = window.location.host;
    const protocol = window.location.protocol;
    if (host.includes("localhost")) {
      const port = host.split(":")[1] || "3000";
      return `${protocol}//${subdomain}.localhost:${port}${path}`;
    }
    const parts = host.split(":")[0].split(".");
    const rootDomain = parts.length > 1 ? parts.slice(-2).join(".") : "yoonie.app";
    return `${protocol}//${subdomain}.${rootDomain}${path}`;
  };

  const currentGeneratedKeys = computeRoomKeysFromDraft(roomDraft);
  const isVilla = form.propertyType === "CONDO";

  return (
    <div className="min-h-screen bg-[#F5EBDD] text-[#303A36] selection:bg-[#E8A45B]/30 font-sans scroll-smooth overflow-x-hidden">
      {/* ─── Top Platform Navigation ────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 border-b border-[#28594E]/10 bg-[#F5EBDD]/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-3 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <img
              src="/brand/mascot/yoonie-calm.png"
              alt="Yoonie"
              className="size-7 sm:size-8 object-contain"
            />
            <span className="font-extrabold text-lg sm:text-xl tracking-tight text-[#28594E]">
              yoonie
            </span>
            <span className="hidden sm:inline-flex rounded-full bg-[#28594E]/10 px-2.5 py-0.5 text-[11px] font-semibold text-[#28594E]">
              Hospitality Multi-Tenant OS
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-[#7A8B84]">
            <button
              onClick={() => scrollTo("features")}
              className="hover:text-[#28594E] transition-colors"
            >
              Why Yoonie
            </button>
            <button
              onClick={() => scrollTo("properties")}
              className="hover:text-[#28594E] transition-colors"
            >
              Live Properties
            </button>
            <button
              onClick={() => scrollTo("pricing")}
              className="hover:text-[#28594E] transition-colors"
            >
              Pricing
            </button>
            <a
              href={getSubdomainUrl("ops")}
              suppressHydrationWarning
              className="hover:text-[#28594E] transition-colors flex items-center gap-1"
            >
              <Lock className="size-3" /> Ops Portal
            </a>
          </nav>

          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            <Button
              size="sm"
              variant="outline"
              asChild
              className="inline-flex text-xs font-bold border-[#28594E]/20 text-[#28594E] hover:bg-[#28594E]/5 px-2.5 sm:px-3 h-8"
            >
              <a href={getSubdomainUrl("ops")} suppressHydrationWarning>Sign In</a>
            </Button>
            <Button
              size="sm"
              onClick={() => setIsWizardOpen(true)}
              className="bg-[#28594E] hover:bg-[#1E433A] text-[#F5EBDD] font-bold text-xs shadow-md whitespace-nowrap px-3 sm:px-4 h-8"
            >
              <span className="sm:hidden">Setup</span>
              <span className="hidden sm:inline">Setup Property</span>
            </Button>
          </div>
        </div>
      </header>

      {/* ─── Hero Section ───────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden pt-12 pb-20 sm:pt-20 sm:pb-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-6 text-left">
              <div className="inline-flex items-center gap-2 rounded-full bg-[#E8A45B]/15 px-3 py-1 text-xs font-semibold text-[#E8A45B]">
                <Sparkles className="size-3.5" /> Direct Booking Engine & Hospitality OS
              </div>

              <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-[#28594E] leading-[1.1]">
                Own your guest relationships.
                <br />
                <span className="text-[#E8A45B]">Zero commissions to OTAs.</span>
              </h1>

              <p className="text-base sm:text-lg text-[#7A8B84] max-w-xl font-normal leading-relaxed">
                Empower your property with a dedicated tenant direct booking engine, central housekeeping board, and instant frontline concierge dispatch.
              </p>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
                <Button
                  size="lg"
                  onClick={() => setIsWizardOpen(true)}
                  className="bg-[#28594E] hover:bg-[#1E433A] text-[#F5EBDD] font-bold text-sm px-8 shadow-lg transition-transform hover:-translate-y-0.5"
                >
                  Create Property Workspace <ArrowRight className="size-4 ml-2" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => scrollTo("properties")}
                  className="text-xs font-bold border-[#28594E]/25 text-[#28594E] hover:bg-[#28594E]/5"
                >
                  Explore Live Properties
                </Button>
              </div>

              <div className="grid grid-cols-3 gap-6 pt-6 border-t border-[#28594E]/10">
                <div>
                  <div className="text-2xl font-extrabold text-[#28594E]">0%</div>
                  <div className="text-xs text-[#7A8B84] font-medium">OTA Commission Loss</div>
                </div>
                <div>
                  <div className="text-2xl font-extrabold text-[#28594E]">100%</div>
                  <div className="text-xs text-[#7A8B84] font-medium">Guest Data Ownership</div>
                </div>
                <div>
                  <div className="text-2xl font-extrabold text-[#28594E]">05:30 AM</div>
                  <div className="text-xs text-[#7A8B84] font-medium">Auto Daily Dispatch</div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-sm rounded-3xl bg-white/80 p-6 shadow-2xl backdrop-blur-xl border border-white/60 space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-black/5">
                  <div className="flex items-center gap-2.5">
                    <img
                      src="/brand/mascot/yoonie-calm.png"
                      alt="Yoonie"
                      className="size-7 object-contain"
                    />
                    <span className="font-bold text-xs text-[#28594E]">
                      Direct Subdomain Setup
                    </span>
                  </div>
                  <span className="rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5">
                    Live Engine
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="p-3.5 rounded-2xl bg-[#F5EBDD]/60 border border-[#28594E]/10 space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#7A8B84]">
                      Dedicated Subdomain
                    </span>
                    <div className="text-sm font-mono font-bold text-[#28594E]">
                      yourhotel.<span className="text-[#E8A45B]">{activeRootDomain}</span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-white border border-[#28594E]/10 space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-[#7A8B84]">Direct Booking Value</span>
                      <span className="font-bold text-[#28594E]">฿12,500</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-[#7A8B84]">OTA Commission Saved</span>
                      <span className="font-bold text-emerald-700">+฿2,500 (20%)</span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-[#28594E] text-[#F5EBDD] space-y-1">
                    <span className="text-[10px] uppercase font-bold text-[#E8A45B]">
                      Frontline Concierge
                    </span>
                    <p className="text-xs text-white/90 font-medium">
                      Airport transfers, excursions, and custom add-ons booked upfront with room reservations.
                    </p>
                  </div>
                </div>

                <Button
                  onClick={() => setIsWizardOpen(true)}
                  className="w-full bg-[#E8A45B] hover:bg-[#d6924b] text-[#303A36] font-extrabold text-xs py-2.5 shadow-sm"
                >
                  Launch Property Studio →
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Live Properties Showcase ───────────────────────────────────────── */}
      <section id="properties" className="py-20 bg-white/50 border-y border-[#28594E]/10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#E8A45B]">
              Active Network
            </span>
            <h2 className="text-3xl font-extrabold text-[#28594E]">
              Boutique Hotels & Properties on Yoonie
            </h2>
            <p className="text-xs sm:text-sm text-[#7A8B84]">
              Each property operates on its own dedicated tenant subdomain with live availability and direct booking.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {branches.map((b) => (
              <Card
                key={b._id}
                className="overflow-hidden rounded-3xl border-[#28594E]/15 bg-white shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="aspect-[16/10] bg-stone-100 relative overflow-hidden flex items-center justify-center">
                    {b.heroImageUrl ? (
                      <img
                        src={b.heroImageUrl}
                        alt={b.name}
                        className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-stone-400 gap-1.5 p-4 text-center select-none">
                        <Building2 className="size-8 stroke-[1.5] text-stone-300" />
                        <span className="text-[11px] font-medium tracking-wide text-stone-400">
                          No cover photo uploaded
                        </span>
                      </div>
                    )}
                    <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-md text-[11px] font-bold text-[#28594E] shadow-xs">
                      {b.code}
                    </div>
                  </div>

                  <div className="p-5 space-y-2">
                    <h3 className="font-extrabold text-lg text-[#28594E] tracking-tight">
                      {b.name}
                    </h3>
                    <p className="text-xs text-[#7A8B84] line-clamp-2">
                      {b.timezone} · {b.currency} · 0% Commission Direct Engine
                    </p>
                  </div>
                </div>

                <div className="p-5 pt-0 flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    asChild
                    className="flex-1 text-xs font-bold border-[#28594E]/20 text-[#28594E] hover:bg-[#28594E]/5"
                  >
                    <a
                      href={getSubdomainUrl(b.code.toLowerCase())}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Visit Direct Door <ExternalLink className="size-3.5 ml-1" />
                    </a>
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Footer ─────────────────────────────────────────────────────────── */}
      <footer className="border-t border-[#28594E]/10 bg-[#F5EBDD] py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#7A8B84]">
          <div className="flex items-center gap-2 font-bold text-[#28594E]">
            <img src="/brand/mascot/yoonie-calm.png" alt="Yoonie" className="size-6 object-contain" />
            <span>yoonie.app</span>
            <span>·</span>
            <span>every booking, closed.</span>
          </div>
          <div>
            Direct booking engine, master guest CDP, and frontline dispatch for boutique properties.
          </div>
        </div>
      </footer>

      {/* ─── FULL YOONIE WHITE-LABEL PROPERTY SETUP STUDIO ─────────────────── */}
      {mounted && isWizardOpen && (
        <div className="fixed inset-0 z-50 bg-[#FAF8F5] flex flex-col overflow-y-auto animate-in fade-in-0 duration-200 text-[#1F2925]">
          {/* Top Bar - Yoonie White-Label Studio */}
          <header className="sticky top-0 z-40 border-b border-[#28594E]/10 bg-white/95 backdrop-blur-md px-6 py-3.5 flex items-center justify-between shadow-2xs">
            <div className="flex items-center gap-3">
              <div className="size-8 rounded-xl bg-[#28594E] flex items-center justify-center text-white shadow-xs">
                <img
                  src="/brand/mascot/yoonie-calm.png"
                  alt="Yoonie"
                  className="size-6 object-contain"
                />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-sm tracking-tight text-[#28594E]">
                    Yoonie Studio
                  </span>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-stone-100 text-stone-700 border border-stone-200">
                    Property Studio
                  </span>
                </div>
                <span className="text-[11px] text-[#7A8B84]">
                  Direct Booking Engine & Automated Frontline Dispatch
                </span>
              </div>
            </div>

            <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-stone-100 border border-stone-200 text-xs font-semibold text-stone-700">
              <span className="size-2 rounded-full bg-[#28594E] animate-pulse" />
              <span>Stage {wizardStep} of 5 · {ONBOARDING_STAGES[wizardStep - 1]?.title}</span>
            </div>

            <Button
              size="sm"
              variant="ghost"
              onClick={resetWizard}
              className="text-xs font-semibold text-stone-500 hover:text-stone-900"
            >
              <X className="size-4 mr-1" /> Exit Studio
            </Button>
          </header>

          {/* Centered Minimal Single-Column Canvas - n8n & Modern SaaS Style */}
          <div className="flex-1 w-full max-w-xl mx-auto px-4 py-6 sm:py-8">
            {/* Minimal Stepper Bar */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((step) => (
                  <div
                    key={step}
                    className={`h-1.5 rounded-full transition-all duration-300 ${step === wizardStep
                        ? "w-8 bg-[#28594E]"
                        : step < wizardStep
                          ? "w-3 bg-[#28594E]/40"
                          : "w-3 bg-stone-200"
                      }`}
                  />
                ))}
              </div>
              <span className="text-xs font-semibold text-stone-500">
                Step {wizardStep} of 5 · {ONBOARDING_STAGES[wizardStep - 1]?.title}
              </span>
            </div>

            <main className="w-full">
              {/* STAGE 1: Property Name & Host Account */}
              {wizardStep === 1 && (
                <div
                  key="stage-1"
                  className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300 ease-out fill-mode-both"
                >
                  <div className="flex items-center gap-3 pb-3 border-b border-stone-200/70">
                    <div className="animate-in zoom-in-90 duration-300 shrink-0">
                      <YoonieMascot mood="happy" size="sm" />
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-stone-900 leading-snug">
                        What is your property called?
                      </h2>
                      <p className="text-xs text-stone-500">
                        Set your property name, booking link, and host login.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Field label="Property name *" htmlFor="hotel-name">
                      <Input
                        id="hotel-name"
                        value={form.hotelName}
                        onChange={(e) => handleHotelNameChange(e.target.value)}
                        placeholder="e.g. Sedona Heritage Resort"
                        required
                        className="rounded-xl text-sm font-medium bg-white"
                      />
                    </Field>

                    <Field label="Brand or chain name (Optional)" htmlFor="brand-name">
                      <Input
                        id="brand-name"
                        value={form.brandName}
                        onChange={(e) => setForm({ ...form, brandName: e.target.value })}
                        placeholder="e.g. Heritage Collection (optional)"
                        className="rounded-xl text-sm bg-white"
                      />
                    </Field>

                    <Field label="Direct booking website link *" htmlFor="hotel-slug">
                      <InputAffix
                        id="hotel-slug"
                        prefix="https://"
                        suffix=".yoonie.app"
                        value={form.slug}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""),
                          })
                        }
                        required
                        className="rounded-xl bg-white"
                      />
                      {isSlugTaken && (
                        <div className="mt-1.5 p-2 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center justify-between gap-2 animate-in fade-in duration-200">
                          <span>Link is already registered.</span>
                          <button
                            type="button"
                            onClick={handleAutoFixSlug}
                            className="font-bold underline text-red-800 hover:text-red-950"
                          >
                            Use "{suggestedSlug}" instead
                          </button>
                        </div>
                      )}
                    </Field>

                    <div className="pt-2 border-t border-stone-200/70 space-y-3">
                      <span className="block text-[11px] font-bold text-stone-700 uppercase tracking-wider">
                        Host Admin Login
                      </span>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <Field label="Your name *" htmlFor="owner-name">
                          <Input
                            id="owner-name"
                            value={form.ownerName}
                            onChange={(e) => setForm({ ...form, ownerName: e.target.value })}
                            placeholder="e.g. Lynn Tan"
                            required
                            className="rounded-xl text-sm bg-white"
                          />
                        </Field>

                        <Field label="Work email *" htmlFor="owner-email">
                          <Input
                            id="owner-email"
                            type="email"
                            value={form.ownerEmail}
                            onChange={(e) => setForm({ ...form, ownerEmail: e.target.value })}
                            placeholder="e.g. lynn@sedonahotel.example"
                            required
                            className="rounded-xl text-sm bg-white"
                          />
                        </Field>
                      </div>

                      <Field label="Password *" htmlFor="owner-pass">
                        <Input
                          id="owner-pass"
                          type="password"
                          value={form.ownerPassword}
                          onChange={(e) => setForm({ ...form, ownerPassword: e.target.value })}
                          required
                          className="rounded-xl text-sm bg-white"
                        />
                      </Field>
                    </div>
                  </div>

                  <div className="flex justify-end pt-3 border-t border-stone-200/70">
                    <Button
                      onClick={() => setWizardStep(2)}
                      disabled={!form.hotelName || !form.slug || isSlugTaken || !form.ownerEmail || !form.ownerPassword}
                      className="rounded-full bg-[#28594E] hover:bg-[#1E433A] text-[#F5EBDD] font-bold px-7 py-2.5 text-xs shadow-sm transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                    >
                      Continue →
                    </Button>
                  </div>
                </div>
              )}

              {/* STAGE 2: Property Type & Location */}
              {wizardStep === 2 && (
                <div
                  key="stage-2"
                  className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300 ease-out fill-mode-both"
                >
                  <div className="flex items-center gap-3 pb-3 border-b border-stone-200/70">
                    <div className="animate-in zoom-in-90 duration-300 shrink-0">
                      <YoonieMascot mood="thinking" size="sm" />
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-stone-900 leading-snug">
                        What is your property like?
                      </h2>
                      <p className="text-xs text-stone-500">
                        Select your format and location.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {/* Format Options */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-stone-900 block">
                        Property format <span className="text-red-500">*</span>
                      </label>
                      <div className="grid grid-cols-3 gap-2.5">
                        {[
                          { id: "HOTEL", label: "Hotel / B&B", sub: "Rooms & floors" },
                          { id: "CONDO", label: "Private Villa", sub: "Rent entire place" },
                          { id: "MIXED", label: "Resort Complex", sub: "Rooms & villas" },
                        ].map((t) => {
                          const active = form.propertyType === t.id;
                          return (
                            <button
                              key={t.id}
                              type="button"
                              onClick={() => setForm({ ...form, propertyType: t.id as any })}
                              className={`p-3.5 rounded-2xl text-left border transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xs active:scale-[0.98] ${active
                                  ? "bg-[#28594E]/10 border-[#28594E] text-[#28594E] font-bold ring-2 ring-[#28594E]/25 shadow-xs"
                                  : "bg-white/80 border-stone-200 text-stone-700 hover:border-stone-300 hover:bg-white font-medium shadow-2xs"
                                }`}
                            >
                              <div className="text-xs font-bold">{t.label}</div>
                              <div className="text-[10px] text-stone-500 font-normal mt-0.5">{t.sub}</div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Country & City */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <Field label="Country *" htmlFor="hotel-country">
                        <Select
                          value={form.country}
                          onValueChange={(val) => setForm({ ...form, country: val })}
                        >
                          <SelectTrigger id="hotel-country" className="rounded-xl bg-white">
                            <SelectValue placeholder="Select Country" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="TH">Thailand (TH)</SelectItem>
                            <SelectItem value="MY">Malaysia (MY)</SelectItem>
                            <SelectItem value="SG">Singapore (SG)</SelectItem>
                            <SelectItem value="ID">Indonesia (ID)</SelectItem>
                            <SelectItem value="VN">Vietnam (VN)</SelectItem>
                            <SelectItem value="JP">Japan (JP)</SelectItem>
                          </SelectContent>
                        </Select>
                      </Field>

                      <Field label="City / Destination *" htmlFor="hotel-city">
                        <Input
                          id="hotel-city"
                          value={form.city}
                          onChange={(e) => setForm({ ...form, city: e.target.value })}
                          placeholder="e.g. Bangkok or Koh Samui"
                          required
                          className="rounded-xl text-sm bg-white"
                        />
                      </Field>
                    </div>

                    {/* Currency & Timezone */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <Field label="Operating currency *" htmlFor="hotel-currency">
                        <Select
                          value={form.currency}
                          onValueChange={(val) => setForm({ ...form, currency: val })}
                        >
                          <SelectTrigger id="hotel-currency" className="rounded-xl bg-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="THB">THB (฿) — Thai Baht</SelectItem>
                            <SelectItem value="MYR">MYR (RM) — Malaysian Ringgit</SelectItem>
                            <SelectItem value="SGD">SGD (S$) — Singapore Dollar</SelectItem>
                            <SelectItem value="USD">USD ($) — US Dollar</SelectItem>
                            <SelectItem value="EUR">EUR (€) — Euro</SelectItem>
                          </SelectContent>
                        </Select>
                      </Field>

                      <Field label="Timezone *" htmlFor="hotel-tz">
                        <Select
                          value={form.timezone}
                          onValueChange={(val) => setForm({ ...form, timezone: val })}
                        >
                          <SelectTrigger id="hotel-tz" className="rounded-xl bg-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Asia/Bangkok">Asia/Bangkok (UTC+7)</SelectItem>
                            <SelectItem value="Asia/Kuala_Lumpur">Asia/Kuala_Lumpur (UTC+8)</SelectItem>
                            <SelectItem value="Asia/Singapore">Asia/Singapore (UTC+8)</SelectItem>
                            <SelectItem value="Asia/Tokyo">Asia/Tokyo (UTC+9)</SelectItem>
                          </SelectContent>
                        </Select>
                      </Field>
                    </div>

                    {/* Error resolution if any */}
                    {onboardingError && (
                      <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-2 animate-in fade-in duration-200">
                        <div className="flex items-center gap-2">
                          <YoonieMascot mood="worried" size="xs" />
                          <span className="font-semibold">{onboardingError}</span>
                        </div>
                        {onboardingError.toLowerCase().includes("slug") && (
                          <div className="pt-2 border-t border-amber-200/80 flex items-center gap-2">
                            <InputAffix
                              id="step2-hotel-slug"
                              prefix="https://"
                              suffix=".yoonie.app"
                              value={form.slug}
                              onChange={(e) =>
                                setForm({
                                  ...form,
                                  slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""),
                                })
                              }
                              className="text-xs rounded-xl bg-white"
                            />
                            <Button
                              size="sm"
                              type="button"
                              onClick={handleAutoFixSlug}
                              className="text-xs rounded-full bg-[#28594E] hover:bg-[#1E433A] text-[#F5EBDD] font-bold shrink-0 h-9 px-3 transition-all duration-150 active:scale-95"
                            >
                              Auto-Fix
                            </Button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex justify-between pt-3 border-t border-stone-200/70">
                    <Button
                      variant="ghost"
                      onClick={() => setWizardStep(1)}
                      className="text-xs font-semibold text-stone-500 hover:text-stone-900 rounded-full transition-all duration-150"
                    >
                      ← Back
                    </Button>
                    <Button
                      onClick={handleAdvanceToRooms}
                      disabled={isLaunching || !form.city || !form.country}
                      className="rounded-full bg-[#28594E] hover:bg-[#1E433A] text-[#F5EBDD] font-bold px-7 py-2.5 text-xs shadow-sm transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                    >
                      {isLaunching ? "Saving..." : "Continue →"}
                    </Button>
                  </div>
                </div>
              )}

              {/* STAGE 3: Rooms & Inventory Setup */}
              {wizardStep === 3 && (
                <div
                  key="stage-3"
                  className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300 ease-out fill-mode-both"
                >
                  {/* Micro-Step Sub-Header */}
                  <div className="flex items-center justify-between pb-3 border-b border-stone-200/70">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#28594E]/10 text-[#28594E]">
                        {isVilla ? "Villa Setup" : `Room Type · Screen ${roomScreen} of 3`}
                      </span>
                      <span className="text-xs text-stone-500 font-medium">
                        {isVilla
                          ? (roomScreen === 1 ? "Basics" : "Photos & Amenities")
                          : (roomScreen === 1
                            ? "Room Type Basics"
                            : roomScreen === 2
                              ? "Rooms & Floors"
                              : "Photos & Amenities")}
                      </span>
                    </div>
                    <div className="animate-in zoom-in-90 duration-300 shrink-0">
                      <YoonieMascot
                        mood={roomScreen === 1 ? "checking" : roomScreen === 2 ? "thinking" : "happy"}
                        size="xs"
                      />
                    </div>
                  </div>

                  {/* Summary of Already Saved Room Types */}
                  {createdRooms.length > 0 && (
                    <div className="p-3 rounded-2xl bg-white/80 border border-stone-200 text-xs flex items-center justify-between shadow-2xs animate-in fade-in duration-200">
                      <div className="flex items-center gap-2 truncate">
                        <CheckCircle2 className="size-4 text-[#28594E] shrink-0" />
                        <span className="font-bold text-stone-900 truncate">
                          {createdRooms.length} room(s) saved in PMS ({Array.from(new Set(createdRooms.map((r) => r.roomType.replace(/_/g, " ")))).join(", ")})
                        </span>
                      </div>
                      <span className="text-[11px] font-semibold text-[#28594E] shrink-0">
                        Adding Next Room Type
                      </span>
                    </div>
                  )}

                  {/* SCREEN 1: Room Basics */}
                  {roomScreen === 1 && (
                    <div
                      key="stage-3-screen-1"
                      className="space-y-4 animate-in fade-in slide-in-from-bottom-3 duration-250 ease-out"
                    >
                      <div>
                        <h2 className="text-base font-bold text-stone-900 leading-snug">
                          {isVilla ? "What is your villa called?" : "Set up your first room"}
                        </h2>
                        <p className="text-xs text-stone-500">
                          {isVilla
                            ? "Enter your villa name and nightly rate."
                            : "Set up your first room! You can add more rooms anytime from your dashboard."}
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <Field label={isVilla ? "Villa name *" : "Room type name *"} htmlFor="room-title">
                          <Input
                            id="room-title"
                            value={roomDraft.title}
                            onChange={(e) =>
                              setRoomDraft((prev) => ({
                                ...prev,
                                title: e.target.value,
                                singleUnitName: isVilla ? e.target.value : prev.singleUnitName,
                              }))
                            }
                            placeholder={isVilla ? "e.g. Sunset Pool Villa" : "e.g. Standard Room"}
                            required
                            className="rounded-xl text-sm font-medium bg-white"
                          />
                        </Field>

                        <Field label={`Nightly rate (${form.currency} ฿) *`} htmlFor="room-rate">
                          <Input
                            id="room-rate"
                            type="number"
                            min={0}
                            value={roomDraft.baseRateThb}
                            onChange={(e) =>
                              setRoomDraft((prev) => ({
                                ...prev,
                                baseRateThb: Number(e.target.value) || 0,
                              }))
                            }
                            required
                            className="rounded-xl text-sm bg-white"
                          />
                        </Field>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <Field label="Max guests *" htmlFor="room-guests">
                          <Input
                            id="room-guests"
                            type="number"
                            min={1}
                            value={roomDraft.maxAdults}
                            onChange={(e) =>
                              setRoomDraft((prev) => ({
                                ...prev,
                                maxAdults: Number(e.target.value) || 1,
                              }))
                            }
                            required
                            className="rounded-xl text-sm bg-white"
                          />
                        </Field>

                        <Field label="Bedding setup" htmlFor="room-bed">
                          <Input
                            id="room-bed"
                            value={roomDraft.bedConfig}
                            onChange={(e) =>
                              setRoomDraft((prev) => ({ ...prev, bedConfig: e.target.value }))
                            }
                            placeholder="e.g. 1 King Bed, 2 Twin Beds"
                            className="rounded-xl text-sm bg-white"
                          />
                        </Field>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-stone-200/70">
                        <Button
                          variant="ghost"
                          onClick={() => setWizardStep(2)}
                          className="text-xs font-semibold text-stone-500 hover:text-stone-900 rounded-full transition-all duration-150"
                        >
                          ← Back
                        </Button>

                        <Button
                          onClick={() => setRoomScreen(isVilla ? 3 : 2)}
                          disabled={!roomDraft.title.trim()}
                          className="rounded-full bg-[#28594E] hover:bg-[#1E433A] text-[#F5EBDD] font-bold px-7 py-2.5 text-xs shadow-sm transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                        >
                          Continue →
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* SCREEN 2: Multi-Floor Builder */}
                  {roomScreen === 2 && !isVilla && (
                    <div
                      key="stage-3-screen-2"
                      className="space-y-4 animate-in fade-in slide-in-from-bottom-3 duration-250 ease-out"
                    >
                      <div>
                        <h2 className="text-base font-bold text-stone-900 leading-snug">
                          How many {roomDraft.title || "Standard"} rooms?
                        </h2>
                        <p className="text-xs text-stone-500">
                          e.g. 2 rooms. Yoonie will number them automatically (101, 102). You can add more rooms later.
                        </p>
                      </div>

                      {/* Multi-Floor List */}
                      <div className="space-y-3">
                        {(roomDraft.floors && roomDraft.floors.length > 0
                          ? roomDraft.floors
                          : [{ floor: roomDraft.floor || 1, keyCount: roomDraft.keyCount || 10, startRoomNumber: roomDraft.startRoomNumber || "101" }]
                        ).map((flConfig) => {
                          const floorKeys = computeGeneratedRoomKeys(flConfig.startRoomNumber, flConfig.keyCount);
                          return (
                            <div
                              key={flConfig.floor}
                              className="p-4 rounded-2xl bg-white/80 backdrop-blur-xs border border-stone-200/80 space-y-3 shadow-2xs transition-all duration-200 hover:border-[#28594E]/40 hover:shadow-xs animate-in fade-in slide-in-from-bottom-2"
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#28594E] text-[#F5EBDD]">
                                    Floor {flConfig.floor}
                                  </span>
                                  <span className="text-xs text-stone-500 font-medium">
                                    {flConfig.keyCount} rooms ({floorKeys[0]}–{floorKeys[floorKeys.length - 1]})
                                  </span>
                                </div>
                                {(roomDraft.floors?.length ?? 1) > 1 && (
                                  <button
                                    type="button"
                                    onClick={() => removeFloor(flConfig.floor)}
                                    className="text-stone-400 hover:text-red-500 transition-colors p-1"
                                    title="Remove floor"
                                  >
                                    <Trash2 className="size-3.5" />
                                  </button>
                                )}
                              </div>

                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <label className="text-[11px] font-bold text-stone-600 block mb-1">
                                    Rooms on this floor
                                  </label>
                                  <Input
                                    type="number"
                                    min={1}
                                    max={100}
                                    value={flConfig.keyCount}
                                    onChange={(e) =>
                                      updateFloorConfig(flConfig.floor, {
                                        keyCount: Math.max(1, parseInt(e.target.value, 10) || 1),
                                      })
                                    }
                                    className="rounded-xl bg-white text-sm"
                                  />
                                </div>
                                <div>
                                  <label className="text-[11px] font-bold text-stone-600 block mb-1">
                                    Starting room #
                                  </label>
                                  <Input
                                    value={flConfig.startRoomNumber}
                                    onChange={(e) =>
                                      updateFloorConfig(flConfig.floor, {
                                        startRoomNumber: e.target.value,
                                      })
                                    }
                                    placeholder="e.g. 101"
                                    className="rounded-xl bg-white text-sm"
                                  />
                                </div>
                              </div>

                              {/* Live Modern Room Pills */}
                              <div className="flex flex-wrap gap-1.5 pt-1">
                                {floorKeys.map((roomNo) => (
                                  <span
                                    key={roomNo}
                                    className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-white border border-stone-200 text-stone-700 shadow-2xs transition-transform duration-150 hover:scale-105"
                                  >
                                    Room {roomNo}
                                  </span>
                                ))}
                              </div>
                            </div>
                          );
                        })}

                        {/* Modern Sleek Add Floor Button */}
                        <Button
                          type="button"
                          variant="outline"
                          onClick={addFloor}
                          className="w-full rounded-full border-dashed border-2 border-stone-300 hover:border-[#28594E] hover:text-[#28594E] py-2.5 text-xs font-bold transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] cursor-pointer bg-white/50"
                        >
                          <Plus className="size-3.5 mr-1" /> Add Floor
                        </Button>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-stone-200/70">
                        <Button
                          variant="ghost"
                          onClick={() => setRoomScreen(1)}
                          className="text-xs font-semibold text-stone-500 hover:text-stone-900 rounded-full transition-all duration-150"
                        >
                          ← Back
                        </Button>

                        <Button
                          onClick={() => setRoomScreen(3)}
                          className="rounded-full bg-[#28594E] hover:bg-[#1E433A] text-[#F5EBDD] font-bold px-7 py-2.5 text-xs shadow-sm transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                        >
                          Continue →
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* SCREEN 3: Photos & Amenities */}
                  {roomScreen === 3 && (
                    <div
                      key="stage-3-screen-3"
                      className="space-y-4 animate-in fade-in slide-in-from-bottom-3 duration-250 ease-out"
                    >
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#28594E] text-[#F5EBDD]">
                            {roomDraft.title || "Room Type"}
                          </span>
                          <span className="text-xs text-stone-500 font-medium">
                            {isVilla
                              ? "Private Unit"
                              : `${computeRoomKeysFromDraft(roomDraft).length} rooms across ${roomDraft.floors?.length || 1} floor(s)`}
                          </span>
                        </div>
                        <h2 className="text-base font-bold text-stone-900 leading-snug">
                          Photo & amenities for {roomDraft.title || "this room type"}
                        </h2>
                        <p className="text-xs text-stone-500">
                          This photo and amenities will represent all {roomDraft.title || "Standard"} rooms on your guest booking engine.
                        </p>
                      </div>

                      {/* Photo Dropzone */}
                      <div>
                        <label className="text-xs font-bold text-stone-900 block mb-1">
                          Photo for {roomDraft.title || "this room type"} <span className="text-stone-400 font-normal">(Optional)</span>
                        </label>
                        {!roomDraft.coverImage ? (
                          <label className="relative flex items-center justify-center gap-3 p-3 border-2 border-dashed border-stone-300 rounded-2xl hover:border-[#28594E] hover:bg-white/60 transition-colors cursor-pointer group bg-white/40">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleUploadImageFile(file, "room");
                              }}
                              disabled={isUploadingImage}
                              className="hidden"
                            />
                            <UploadCloud className="size-5 text-[#28594E] shrink-0" />
                            <div className="text-left">
                              <span className="text-xs font-bold text-stone-800 block">
                                {isUploadingImage ? "Uploading..." : `Upload photo for ${roomDraft.title || "this room type"}`}
                              </span>
                              <span className="text-[10px] text-stone-400">
                                JPG, PNG, WEBP (No placeholder)
                              </span>
                            </div>
                          </label>
                        ) : (
                          <div className="relative aspect-21/9 max-w-sm rounded-2xl overflow-hidden border border-stone-200 group shadow-2xs animate-in zoom-in-95 duration-200">
                            <img
                              src={roomDraft.coverImage}
                              alt={roomDraft.title || "Room Photo"}
                              className="w-full h-full object-cover"
                            />
                            <button
                              type="button"
                              onClick={() => setRoomDraft((prev) => ({ ...prev, coverImage: "" }))}
                              className="absolute top-2 right-2 size-6 rounded-full bg-black/70 hover:bg-red-600 text-white flex items-center justify-center transition-colors shadow-xs"
                              title="Remove photo"
                            >
                              <X className="size-3.5" />
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Modern Amenities Pill Toggles */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-stone-900 block">
                          Amenities for {roomDraft.title || "this room type"} <span className="text-stone-400 font-normal">(Click to toggle)</span>
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {[
                            "High-Speed WiFi",
                            "Air Conditioning",
                            "Private Pool",
                            "Private Bathroom",
                            "Kitchenette",
                            "Hot Shower",
                            ...roomDraft.amenities.filter(
                              (a) =>
                                ![
                                  "High-Speed WiFi",
                                  "Air Conditioning",
                                  "Private Pool",
                                  "Private Bathroom",
                                  "Kitchenette",
                                  "Hot Shower",
                                ].includes(a)
                            ),
                          ].map((amenity) => {
                            const active = roomDraft.amenities.includes(amenity);
                            const isCustom = ![
                              "High-Speed WiFi",
                              "Air Conditioning",
                              "Private Pool",
                              "Private Bathroom",
                              "Kitchenette",
                              "Hot Shower",
                            ].includes(amenity);
                            return (
                              <button
                                key={amenity}
                                type="button"
                                onClick={() => toggleAmenity(amenity)}
                                className={`px-3 py-1 rounded-full text-xs font-medium border transition-all duration-150 inline-flex items-center gap-1.5 hover:scale-105 active:scale-95 cursor-pointer ${active
                                    ? "bg-[#28594E] text-[#F5EBDD] border-[#28594E] shadow-2xs font-semibold"
                                    : "bg-white text-stone-700 border-stone-200 hover:bg-stone-50"
                                  }`}
                              >
                                {amenity}
                                {active && <Check className="size-3" />}
                                {isCustom && (
                                  <span
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      removeAmenity(amenity);
                                    }}
                                    className="ml-1 hover:text-red-300"
                                  >
                                    <X className="size-3" />
                                  </span>
                                )}
                              </button>
                            );
                          })}
                        </div>

                        {/* Custom Amenity Adder */}
                        <div className="flex gap-2 items-center pt-1 max-w-sm">
                          <Input
                            value={customAmenityInput}
                            onChange={(e) => setCustomAmenityInput(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                addCustomAmenity(customAmenityInput);
                              }
                            }}
                            placeholder="Add custom amenity (e.g. Sea View)"
                            className="text-xs h-8 rounded-full bg-white"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => addCustomAmenity(customAmenityInput)}
                            className="text-xs font-bold rounded-full border-stone-200 text-stone-700 shrink-0 h-8 px-3 bg-white hover:bg-stone-50 transition-all duration-150 active:scale-95"
                          >
                            <Plus className="size-3 mr-0.5" /> Add
                          </Button>
                        </div>
                      </div>

                      {guidedRoomError && (
                        <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-center gap-2 animate-in fade-in duration-200">
                          <YoonieMascot mood="worried" size="xs" />
                          <span>{guidedRoomError}</span>
                        </div>
                      )}

                      {/* Action Bar */}
                      <div className="flex items-center justify-between gap-3 pt-3 border-t border-stone-200/70">
                        <Button
                          variant="ghost"
                          onClick={() => setRoomScreen(isVilla ? 1 : 2)}
                          className="text-xs font-semibold text-stone-500 hover:text-stone-900 rounded-full transition-all duration-150"
                        >
                          ← Back
                        </Button>

                        <Button
                          onClick={() => handleProvisionRoomKeys(false)}
                          disabled={isCreatingRoom || !roomDraft.title.trim()}
                          className="rounded-full bg-[#28594E] hover:bg-[#1E433A] text-[#F5EBDD] font-bold px-7 py-2.5 text-xs shadow-sm shrink-0 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                        >
                          {isCreatingRoom ? "Saving..." : "Save & Continue →"}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* STAGE 4: Services & Extras */}
              {wizardStep === 4 && (
                <div
                  key="stage-4"
                  className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300 ease-out fill-mode-both"
                >
                  <div className="flex items-center gap-3 pb-3 border-b border-stone-200/70">
                    <div className="animate-in zoom-in-90 duration-300 shrink-0">
                      <YoonieMascot mood="happy" size="sm" />
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-stone-900 leading-snug">
                        Extra services (Optional)
                      </h2>
                      <p className="text-xs text-stone-500">
                        Add common extras like airport taxi or breakfast.
                      </p>
                    </div>
                  </div>

                  {/* 1-Click Popular Presets */}
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block">
                      Quick Add Popular Extras
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { name: "Airport Transfer", price: 800, model: "PER_VEHICLE" },
                        { name: "Buffet Breakfast", price: 350, model: "PER_PAX" },
                        { name: "Motorbike Rental", price: 300, model: "PER_DAY" },
                      ].map((preset) => (
                        <button
                          key={preset.name}
                          type="button"
                          onClick={() => {
                            setExperienceDraft((prev) => ({
                              ...prev,
                              name: preset.name,
                              basePriceThb: preset.price,
                              pricingModel: preset.model as any,
                            }));
                          }}
                          className="px-3.5 py-1 rounded-full text-xs font-medium bg-white hover:bg-[#28594E]/10 hover:text-[#28594E] text-stone-700 border border-stone-200 transition-all duration-150 hover:scale-105 active:scale-95 shadow-2xs cursor-pointer"
                        >
                          + {preset.name} (฿{preset.price})
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Add Extra Form */}
                  <div className="p-4 rounded-2xl bg-white/80 border border-stone-200/80 space-y-3 shadow-2xs animate-in fade-in slide-in-from-bottom-2 duration-200">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <Field label="Item name *" htmlFor="exp-title">
                        <Input
                          id="exp-title"
                          value={experienceDraft.name}
                          onChange={(e) =>
                            setExperienceDraft((prev) => ({ ...prev, name: e.target.value }))
                          }
                          placeholder="e.g. Airport Transfer"
                          className="rounded-xl text-sm bg-white"
                        />
                      </Field>

                      <div className="grid grid-cols-2 gap-2">
                        <Field label="Price (THB ฿) *" htmlFor="exp-price">
                          <Input
                            id="exp-price"
                            type="number"
                            value={experienceDraft.basePriceThb}
                            onChange={(e) =>
                              setExperienceDraft((prev) => ({
                                ...prev,
                                basePriceThb: Number(e.target.value) || 0,
                              }))
                            }
                            className="rounded-xl text-sm bg-white"
                          />
                        </Field>

                        <Field label="Pricing model" htmlFor="exp-unit">
                          <Select
                            value={experienceDraft.pricingModel}
                            onValueChange={(val: any) =>
                              setExperienceDraft((prev) => ({ ...prev, pricingModel: val }))
                            }
                          >
                            <SelectTrigger id="exp-unit" className="rounded-xl bg-white">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="PER_PAX">Per Guest</SelectItem>
                              <SelectItem value="PER_VEHICLE">Per Vehicle</SelectItem>
                              <SelectItem value="PER_TREATMENT">Per Session</SelectItem>
                              <SelectItem value="PER_BOOKING">Per Stay</SelectItem>
                              <SelectItem value="PER_DAY">Per Day</SelectItem>
                            </SelectContent>
                          </Select>
                        </Field>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={addExperienceToList}
                        disabled={!experienceDraft.name || experienceDraft.basePriceThb <= 0}
                        className="text-xs font-bold rounded-full border-stone-200 text-stone-800 bg-white hover:bg-stone-50 transition-all duration-150 active:scale-95 cursor-pointer"
                      >
                        <Plus className="size-3.5 mr-1" /> Add to List
                      </Button>
                    </div>
                  </div>

                  {/* Added Experiences List */}
                  {customExperiences.length > 0 && (
                    <div className="space-y-2 animate-in fade-in duration-200">
                      <span className="block text-xs font-bold text-stone-900">
                        Services Added ({customExperiences.length})
                      </span>
                      <div className="divide-y divide-stone-100 rounded-2xl border border-stone-200 bg-white/80 shadow-2xs overflow-hidden">
                        {customExperiences.map((exp, idx) => (
                          <div
                            key={idx}
                            className="p-3 bg-white/60 flex items-center justify-between text-xs"
                          >
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-stone-900">{exp.name}</span>
                              <span className="px-2 py-0.5 rounded-full bg-stone-100 text-stone-600 text-[10px] uppercase font-bold">
                                {exp.pricingModel}
                              </span>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="font-mono font-bold text-[#28594E]">
                                ฿{exp.basePriceThb.toLocaleString()}
                              </span>
                              <button
                                type="button"
                                onClick={() => removeExperienceFromList(exp.id)}
                                className="text-stone-400 hover:text-red-600 transition-colors cursor-pointer"
                              >
                                <Trash2 className="size-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {guidedServiceError && (
                    <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-center gap-2.5 animate-in fade-in duration-200">
                      <YoonieMascot mood="worried" size="sm" />
                      <span>{guidedServiceError}</span>
                    </div>
                  )}

                  <div className="flex justify-between pt-3 border-t border-stone-200/70">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        onClick={() => setWizardStep(3)}
                        className="text-xs font-semibold text-stone-500 hover:text-stone-900 rounded-full transition-all duration-150"
                      >
                        ← Back
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={triggerSkipService}
                        className="text-xs font-semibold text-stone-400 hover:text-stone-700 rounded-full transition-all duration-150"
                      >
                        Skip
                      </Button>
                    </div>

                    <Button
                      onClick={handlePublishAllExperiences}
                      disabled={isCreatingService}
                      className="rounded-full bg-[#28594E] hover:bg-[#1E433A] text-[#F5EBDD] font-bold px-7 py-2.5 text-xs shadow-sm transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                    >
                      {isCreatingService ? "Saving..." : "Continue →"}
                    </Button>
                  </div>
                </div>
              )}

              {/* STAGE 5: Review & Launch */}
              {wizardStep === 5 && (createdWorkspace || form.hotelName) && (
                <div
                  key="stage-5"
                  className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300 ease-out fill-mode-both"
                >
                  <div className="text-center space-y-1.5 pb-2">
                    <div className="flex justify-center mb-1 animate-in zoom-in-90 duration-300">
                      <YoonieMascot mood="happy" size="md" />
                    </div>
                    <h2 className="text-xl sm:text-2xl font-bold text-[#1F2925] tracking-tight">
                      {createdWorkspace?.name || form.hotelName} is Ready!
                    </h2>
                    <p className="text-xs text-stone-500">
                      Your direct booking website and frontline PMS are live.
                    </p>
                  </div>

                  {/* Summary Card */}
                  <div className="p-4 rounded-2xl bg-white/80 border border-stone-200 grid grid-cols-2 gap-3 text-xs shadow-2xs">
                    <div>
                      <span className="text-stone-400 block text-[11px]">Property Code</span>
                      <span className="font-mono font-bold text-stone-900">
                        {createdWorkspace?.code || form.slug.toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <span className="text-stone-400 block text-[11px]">Currency</span>
                      <span className="font-bold text-stone-900">{form.currency}</span>
                    </div>
                    <div>
                      <span className="text-stone-400 block text-[11px]">Location</span>
                      <span className="font-bold text-stone-900">{form.city}, {form.country}</span>
                    </div>
                    <div>
                      <span className="text-stone-400 block text-[11px]">Manager</span>
                      <span className="font-bold text-stone-900">{form.ownerName}</span>
                    </div>
                  </div>

                  {/* Inventory Summary */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-stone-900 flex items-center gap-1.5">
                        <Bed className="size-4 text-stone-700" /> Physical Rooms ({createdRooms.length} Keys)
                      </span>
                      <span className="text-[#28594E] font-semibold flex items-center gap-1 text-[11px]">
                        <CheckCircle2 className="size-3.5 text-[#28594E]" /> Live in PMS
                      </span>
                    </div>

                    {createdRooms.length > 0 ? (
                      <div className="overflow-x-auto rounded-2xl border border-stone-200 bg-white/80 shadow-2xs">
                        <table className="w-full text-left text-xs border-collapse">
                          <thead className="bg-stone-50/80 border-b border-stone-200 text-stone-500 font-medium">
                            <tr>
                              <th className="p-2.5">Room #</th>
                              <th className="p-2.5">Type</th>
                              <th className="p-2.5">Rate</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-stone-100">
                            {createdRooms.map((r) => (
                              <tr key={r._id}>
                                <td className="p-2.5 font-mono font-bold text-stone-900">Room {r.roomNumber}</td>
                                <td className="p-2.5">{r.roomType.replace(/_/g, " ")}</td>
                                <td className="p-2.5 font-bold text-stone-900">฿{(r.baseRateThb ?? 0).toLocaleString()}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p className="text-xs text-stone-400">Physical rooms will appear here.</p>
                    )}
                  </div>

                  {/* Launch Actions */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      asChild
                      className="w-full text-xs font-bold rounded-full border-stone-300 text-stone-800 bg-white hover:bg-stone-50 py-3 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                    >
                      <a
                        href={getSubdomainUrl(createdWorkspace?.slug || form.slug)}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Open Direct Booking <ExternalLink className="size-3.5 ml-1.5" />
                      </a>
                    </Button>

                    <Button
                      size="sm"
                      asChild
                      className="w-full text-xs font-bold rounded-full bg-[#28594E] hover:bg-[#1E433A] text-[#F5EBDD] py-3 shadow-sm transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                    >
                      <a href={getSubdomainUrl("ops", "/ops/rooms")}>
                        Enter Ops Hub <ArrowRight className="size-3.5 ml-1.5" />
                      </a>
                    </Button>
                  </div>

                  <div className="pt-2 flex items-center justify-between border-t border-stone-200/70">
                    <Button
                      variant="ghost"
                      onClick={() => setWizardStep(4)}
                      className="text-xs font-semibold text-stone-500 hover:text-stone-900 rounded-full transition-all duration-150"
                    >
                      ← Back
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={resetWizard}
                      className="text-xs text-stone-400 hover:text-stone-700 rounded-full transition-all duration-150"
                    >
                      Done & Exit Studio
                    </Button>
                  </div>
                </div>
              )}
            </main>
          </div>
        </div>
      )}

      {/* ─── Skip Warning Modal ───────────────────────────────────────────── */}
      {skipWarning.isOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in-0">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-stone-200 space-y-4 text-stone-900">
            {skipWarning.type === "SERVICE" ? (
              <>
                <div className="text-center space-y-2">
                  <div className="mx-auto flex justify-center">
                    <YoonieMascot
                      mood="calm"
                      size="md"
                      message="You can launch your property now with rooms only."
                    />
                  </div>
                  <h4 className="text-base font-extrabold text-stone-900 pt-1">
                    Skip Add-on Experiences?
                  </h4>
                  <p className="text-xs text-stone-500 leading-relaxed">
                    Optional extras like scooter rentals, airport transfers, or dining packages can be configured anytime later from your Central Ops Hub.
                  </p>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    onClick={confirmSkipService}
                    variant="outline"
                    className="flex-1 text-xs font-semibold text-stone-600 border-stone-200 hover:bg-stone-50"
                  >
                    Skip to Review →
                  </Button>
                  <Button
                    onClick={() => setSkipWarning({ isOpen: false, type: "SERVICE" })}
                    className="flex-1 text-xs font-bold bg-[#28594E] hover:bg-[#1E433A] text-white"
                  >
                    Keep Adding Extras
                  </Button>
                </div>
              </>
            ) : (
              <>
                <div className="text-center space-y-2">
                  <div className="mx-auto flex justify-center">
                    <YoonieMascot
                      mood="worried"
                      size="md"
                      message="Wait! Are you sure you want to skip configuring room keys?"
                    />
                  </div>
                  <h4 className="text-base font-extrabold text-stone-900 pt-1">
                    Skip Room Key Creation?
                  </h4>
                  <p className="text-xs text-stone-500 leading-relaxed">
                    A property needs at least one room key or space configured for guests to check in and book. You can configure this later in the Central Ops Hub.
                  </p>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    onClick={confirmSkipRooms}
                    variant="outline"
                    className="flex-1 text-xs font-semibold text-stone-600 border-stone-200 hover:bg-stone-50"
                  >
                    Skip Anyway
                  </Button>
                  <Button
                    onClick={() => setSkipWarning({ isOpen: false, type: "ROOMS" })}
                    className="flex-1 text-xs font-bold bg-[#28594E] hover:bg-[#1E433A] text-white"
                  >
                    Keep Setting Up
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
