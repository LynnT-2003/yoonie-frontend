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
  { num: 1, title: "Workspace & Domain", sub: "Subdomain & executive login" },
  { num: 2, title: "Property & Location", sub: "Destination, format & rules" },
  { num: 3, title: "Rooms & Inventory", sub: "Room categories, rates & keys" },
  { num: 4, title: "Curated Add-ons", sub: "Transfers, tours & rentals" },
  { num: 5, title: "Review & Launch", sub: "Inventory verification & live door" },
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
    if (typeof window === "undefined") return `https://${subdomain}.yoonie.app${path}`;
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

  return (
    <div className="min-h-screen bg-[#F5EBDD] text-[#303A36] selection:bg-[#E8A45B]/30 font-sans scroll-smooth">
      {/* ─── Top Platform Navigation ────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 border-b border-[#28594E]/10 bg-[#F5EBDD]/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <img
              src="/brand/mascot/yoonie-calm.png"
              alt="Yoonie"
              className="size-8 object-contain"
            />
            <span className="font-extrabold text-xl tracking-tight text-[#28594E]">
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
              className="hover:text-[#28594E] transition-colors flex items-center gap-1"
            >
              <Lock className="size-3" /> Ops Portal
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <Button
              size="sm"
              variant="outline"
              asChild
              className="hidden sm:inline-flex text-xs font-bold border-[#28594E]/20 text-[#28594E] hover:bg-[#28594E]/5"
            >
              <a href={getSubdomainUrl("ops")}>Sign In</a>
            </Button>
            <Button
              size="sm"
              onClick={() => setIsWizardOpen(true)}
              className="bg-[#28594E] hover:bg-[#1E433A] text-[#F5EBDD] font-bold text-xs shadow-md"
            >
              Setup Your Property
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
                  <div className="aspect-[16/10] bg-black/5 relative overflow-hidden">
                    <img
                      src={
                        b.heroImageUrl ||
                        "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800"
                      }
                      alt={b.name}
                      className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                    />
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
      {isWizardOpen && (
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

          {/* 3-Column Studio Body */}
          <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* ─── LEFT COLUMN: Vertical Stepper ─────────────────────────── */}
              <aside className="lg:col-span-3">
                <div className="sticky top-20 bg-white rounded-2xl p-5 border border-stone-200/80 shadow-xs space-y-6">
                  <div className="space-y-4">
                    {ONBOARDING_STAGES.map((s) => {
                      const isPast = wizardStep > s.num;
                      const isCurrent = wizardStep === s.num;
                      const isClickable = isPast;
                      return (
                        <div
                          key={s.num}
                          onClick={() => {
                            if (isClickable) setWizardStep(s.num as any);
                          }}
                          className={`flex items-start gap-3 relative p-2 -m-2 rounded-xl transition-all ${
                            isClickable
                              ? "cursor-pointer hover:bg-stone-100/70 group"
                              : ""
                          }`}
                        >
                          {/* Stepper Node */}
                          <div
                            className={`size-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 transition-all ${
                              isCurrent
                                ? "bg-[#28594E] text-[#F5EBDD] shadow-sm ring-4 ring-[#D8E6DA]/70"
                                : isPast
                                ? "bg-[#28594E]/15 text-[#28594E] font-bold group-hover:bg-[#28594E] group-hover:text-white"
                                : "bg-stone-100 text-stone-400 border border-stone-200"
                            }`}
                          >
                            {isPast ? <Check className="size-3.5" /> : s.num}
                          </div>

                          {/* Stepper Labels */}
                          <div className="space-y-0.5 pt-0.5 flex-1">
                            <div className="flex items-center justify-between">
                              <span
                                className={`block text-xs font-bold leading-none ${
                                  isCurrent
                                    ? "text-[#28594E]"
                                    : isPast
                                    ? "text-stone-800 group-hover:text-[#28594E]"
                                    : "text-stone-400"
                                }`}
                              >
                                {s.title}
                              </span>
                              {isPast && (
                                <span className="text-[10px] text-stone-400 font-semibold group-hover:text-[#28594E] opacity-0 group-hover:opacity-100 transition-opacity">
                                  Edit
                                </span>
                              )}
                            </div>
                            <span className="block text-[11px] text-stone-500 font-normal">
                              {isCurrent ? "In progress" : isPast ? "Complete · Click to edit" : s.sub}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Left Rail Mascot Helper */}
                  <div className="pt-4 border-t border-stone-100 flex items-center gap-2.5 text-xs text-stone-600">
                    <img
                      src="/brand/mascot/yoonie-calm.png"
                      alt="Yoonie"
                      className="size-7 object-contain shrink-0"
                    />
                    <span className="text-[11px] leading-tight text-stone-500">
                      Need help? Yoonie guides every step of your property setup.
                    </span>
                  </div>
                </div>
              </aside>

              {/* ─── CENTER COLUMN: Minimal & Frictionless Forms ────────────── */}
              <main className="lg:col-span-6 space-y-6">
                {/* STAGE 1: Workspace & Domain */}
                {wizardStep === 1 && (
                  <div className="bg-white p-6 sm:p-8 rounded-2xl border border-stone-200/80 shadow-xs space-y-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <h2 className="text-2xl font-bold text-[#1F2925] tracking-tight">
                          Workspace & Dedicated Domain
                        </h2>
                        <p className="text-xs text-stone-500 mt-1">
                          Set up your property identity and master executive credentials.
                        </p>
                      </div>
                      <YoonieMascot mood="calm" size="sm" />
                    </div>

                    <div className="space-y-4">
                      <Field label="Property name *" htmlFor="hotel-name">
                        <Input
                          id="hotel-name"
                          value={form.hotelName}
                          onChange={(e) => handleHotelNameChange(e.target.value)}
                          placeholder="e.g. Sedona Heritage Resort or The Pool House"
                          required
                          className="text-sm font-medium"
                        />
                      </Field>

                      <Field label="Brand / chain name" htmlFor="brand-name" hint="Enter parent management brand, or leave blank if independent.">
                        <Input
                          id="brand-name"
                          value={form.brandName}
                          onChange={(e) => setForm({ ...form, brandName: e.target.value })}
                          placeholder="e.g. Heritage Collection (optional)"
                          className="text-sm"
                        />
                      </Field>

                      <Field
                        label="Dedicated tenant subdomain *"
                        htmlFor="hotel-slug"
                        hint="Guests book rooms directly here with 0% OTA commissions."
                      >
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
                        />
                      </Field>

                      <div className="pt-2 border-t border-stone-100 space-y-3">
                        <span className="block text-xs font-bold text-stone-900 uppercase tracking-wider">
                          General Manager Executive Account
                        </span>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <Field label="Full name *" htmlFor="owner-name">
                            <Input
                              id="owner-name"
                              value={form.ownerName}
                              onChange={(e) => setForm({ ...form, ownerName: e.target.value })}
                              placeholder="e.g. Lynn Tan"
                              required
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
                            />
                          </Field>
                        </div>

                        <Field label="Master password *" htmlFor="owner-pass">
                          <Input
                            id="owner-pass"
                            type="password"
                            value={form.ownerPassword}
                            onChange={(e) => setForm({ ...form, ownerPassword: e.target.value })}
                            required
                          />
                        </Field>
                      </div>
                    </div>

                    <div className="flex justify-end pt-2">
                      <Button
                        onClick={() => setWizardStep(2)}
                        disabled={!form.hotelName || !form.slug || !form.ownerEmail || !form.ownerPassword}
                        className="bg-[#28594E] hover:bg-[#1E433A] text-[#F5EBDD] font-bold px-7 py-2.5 text-xs shadow-sm"
                      >
                        Continue to Property Details →
                      </Button>
                    </div>
                  </div>
                )}

                {/* STAGE 2: Property & White-Label Details */}
                {wizardStep === 2 && (
                  <div className="bg-white p-6 sm:p-8 rounded-2xl border border-stone-200/80 shadow-xs space-y-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <h2 className="text-2xl font-bold text-[#1F2925] tracking-tight">
                          Property Details & Format
                        </h2>
                        <p className="text-xs text-stone-500 mt-1">
                          Configure destination, operating currency, and property format.
                        </p>
                      </div>
                      <YoonieMascot mood="thinking" size="sm" />
                    </div>

                    <div className="space-y-4">
                      {/* Country & City */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <Field label="Country *" htmlFor="hotel-country">
                          <Select
                            value={form.country}
                            onValueChange={(val) => setForm({ ...form, country: val })}
                          >
                            <SelectTrigger id="hotel-country">
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
                            <SelectTrigger id="hotel-currency">
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

                        <Field label="Property timezone *" htmlFor="hotel-tz">
                          <Select
                            value={form.timezone}
                            onValueChange={(val) => setForm({ ...form, timezone: val })}
                          >
                            <SelectTrigger id="hotel-tz">
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

                      {/* Property Format: Minimal Segmented Pill Buttons (NO CHUNKY CARDS) */}
                      <div className="space-y-1.5 pt-1">
                        <label className="text-xs font-bold text-stone-900 block">
                          Property format <span className="text-red-500">*</span>
                        </label>
                        <div className="grid grid-cols-3 gap-2 p-1 bg-stone-100 rounded-xl border border-stone-200/80">
                          {[
                            { id: "HOTEL", label: "Boutique Hotel", sub: "Multi-room hospitality" },
                            { id: "CONDO", label: "Private Villa", sub: "Pool house or villa" },
                            { id: "MIXED", label: "Resort & Suites", sub: "Mixed rooms & suites" },
                          ].map((t) => {
                            const active = form.propertyType === t.id;
                            return (
                              <button
                                key={t.id}
                                type="button"
                                onClick={() =>
                                  setForm({ ...form, propertyType: t.id as any })
                                }
                                className={`p-3 rounded-lg text-left transition-all ${
                                  active
                                    ? "bg-white text-[#28594E] shadow-xs font-bold border border-stone-200"
                                    : "text-stone-600 hover:text-stone-900 hover:bg-white/50 font-medium"
                                }`}
                              >
                                <div className="text-xs font-bold">{t.label}</div>
                                <div className="text-[10px] text-stone-500 font-normal mt-0.5">{t.sub}</div>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Total rooms & Number of floors */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                        <Field label="Total units / rooms estimate *" htmlFor="total-units">
                          <Input
                            id="total-units"
                            type="number"
                            min={1}
                            value={form.totalUnitsEstimated}
                            onChange={(e) =>
                              setForm({
                                ...form,
                                totalUnitsEstimated: Math.max(1, parseInt(e.target.value, 10) || 1),
                              })
                            }
                            required
                          />
                        </Field>

                        <Field label="Number of floors" htmlFor="floor-count">
                          <Input
                            id="floor-count"
                            type="number"
                            min={1}
                            value={form.floorsEstimated}
                            onChange={(e) =>
                              setForm({
                                ...form,
                                floorsEstimated: Math.max(1, parseInt(e.target.value, 10) || 1),
                              })
                            }
                          />
                        </Field>
                      </div>

                      {/* Error if Onboarding Fails */}
                      {onboardingError && (
                        <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-center gap-2.5">
                          <YoonieMascot mood="worried" size="sm" />
                          <span>{onboardingError}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex justify-between pt-2">
                      <Button
                        variant="ghost"
                        onClick={() => setWizardStep(1)}
                        className="text-xs font-semibold text-stone-500 hover:text-stone-900"
                      >
                        ← Back
                      </Button>
                      <Button
                        onClick={handleAdvanceToRooms}
                        disabled={isLaunching || !form.city || !form.country}
                        className="bg-[#28594E] hover:bg-[#1E433A] text-[#F5EBDD] font-bold px-7 py-2.5 text-xs shadow-sm"
                      >
                        {isLaunching ? "Saving Property..." : "Continue to Rooms & Inventory →"}
                      </Button>
                    </div>
                  </div>
                )}

                {/* STAGE 3: Rooms & Inventory */}
                {wizardStep === 3 && (
                  <div className="bg-white p-6 sm:p-8 rounded-2xl border border-stone-200/80 shadow-xs space-y-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <h2 className="text-2xl font-bold text-[#1F2925] tracking-tight">
                          Rooms & Physical Keys
                        </h2>
                        <p className="text-xs text-stone-500 mt-1">
                          Define your room types, set nightly rates, and generate physical keys.
                        </p>
                      </div>
                      <YoonieMascot mood="checking" size="sm" />
                    </div>

                    {/* Banner of Already Added Rooms */}
                    {createdRooms.length > 0 && (
                      <div className="p-3.5 rounded-xl bg-[#D8E6DA]/50 border border-[#28594E]/20 text-xs space-y-1.5">
                        <div className="font-bold text-[#28594E] flex items-center gap-1.5">
                          <CheckCircle2 className="size-4 text-[#28594E]" />
                          {createdRooms.length} Key(s) Provisioned in Database:
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {createdRooms.map((r) => (
                            <span
                              key={r._id}
                              className="px-2.5 py-1 rounded-md bg-white border border-[#28594E]/30 font-mono font-medium text-[#28594E] text-xs"
                            >
                              Room {r.roomNumber} ({r.roomType}) · ฿{(r.baseRateThb ?? 0).toLocaleString()}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="space-y-4">
                      {/* Room Type Title & Base Rate */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <Field label="Room type name *" htmlFor="room-title">
                          <Input
                            id="room-title"
                            value={roomDraft.title}
                            onChange={(e) =>
                              setRoomDraft((prev) => ({ ...prev, title: e.target.value }))
                            }
                            placeholder="e.g. Deluxe Pool Suite or Entire Villa"
                            required
                            className="text-sm font-medium"
                          />
                        </Field>

                        <Field label="Nightly base rate (THB ฿) *" htmlFor="room-rate">
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
                          />
                        </Field>
                      </div>

                      {/* Occupancy & Bedding */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <Field label="Max adult guests *" htmlFor="room-guests">
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
                          />
                        </Field>

                        <Field label="Bedding configuration" htmlFor="room-bed">
                          <Input
                            id="room-bed"
                            value={roomDraft.bedConfig}
                            onChange={(e) =>
                              setRoomDraft((prev) => ({ ...prev, bedConfig: e.target.value }))
                            }
                            placeholder="e.g. 1 King Bed, 2 Twin Beds, Single Bunk"
                          />
                        </Field>
                      </div>

                      {/* Single Unit vs Multi-Key Toggle: Sleek Segmented Pill Switch (NO CHUNKY CARDS) */}
                      <div className="space-y-1.5 pt-1">
                        <label className="text-xs font-bold text-stone-900 block">
                          Inventory mode <span className="text-red-500">*</span>
                        </label>
                        <div className="grid grid-cols-2 gap-2 p-1 bg-stone-100 rounded-xl border border-stone-200/80">
                          <button
                            type="button"
                            onClick={() =>
                              setRoomDraft((prev) => ({
                                ...prev,
                                isSingleUnit: true,
                                keyCount: 1,
                                singleUnitName: prev.singleUnitName || prev.title || "Pool House",
                              }))
                            }
                            className={`p-3 rounded-lg text-left transition-all ${
                              roomDraft.isSingleUnit
                                ? "bg-white text-[#28594E] shadow-xs font-bold border border-stone-200"
                                : "text-stone-600 hover:text-stone-900 hover:bg-white/50 font-medium"
                            }`}
                          >
                            <div className="flex items-center gap-1.5 text-xs font-bold">
                              <Home className="size-3.5 text-[#28594E]" /> Standalone Villa / Pool House
                            </div>
                            <div className="text-[10px] text-stone-500 font-normal mt-0.5">
                              Single unit (1 key, no room numbering clutter)
                            </div>
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              setRoomDraft((prev) => ({
                                ...prev,
                                isSingleUnit: false,
                                keyCount: Math.max(2, prev.keyCount || 2),
                              }))
                            }
                            className={`p-3 rounded-lg text-left transition-all ${
                              !roomDraft.isSingleUnit
                                ? "bg-white text-[#28594E] shadow-xs font-bold border border-stone-200"
                                : "text-stone-600 hover:text-stone-900 hover:bg-white/50 font-medium"
                            }`}
                          >
                            <div className="flex items-center gap-1.5 text-xs font-bold">
                              <Layers className="size-3.5 text-[#28594E]" /> Multi-Room Hotel / Resort
                            </div>
                            <div className="text-[10px] text-stone-500 font-normal mt-0.5">
                              Multiple keys with room numbers (101, 102...)
                            </div>
                          </button>
                        </div>

                        {/* Inventory inputs */}
                        {roomDraft.isSingleUnit ? (
                          <div className="pt-2">
                            <Field
                              label="Unit identifier / key name *"
                              htmlFor="single-unit-name"
                              hint="Assigned directly to your housekeeping board and direct booking engine."
                            >
                              <Input
                                id="single-unit-name"
                                value={roomDraft.singleUnitName}
                                onChange={(e) =>
                                  setRoomDraft((prev) => ({
                                    ...prev,
                                    singleUnitName: e.target.value,
                                  }))
                                }
                                placeholder="e.g. Pool House or Villa 1"
                                required
                              />
                            </Field>
                            <div className="text-xs text-stone-600 mt-1.5 flex items-center gap-2">
                              <span>Generated PMS Key:</span>
                              <span className="font-mono font-bold px-2 py-0.5 bg-stone-100 rounded-md text-[#28594E]">
                                {roomDraft.singleUnitName.trim() || roomDraft.title.trim() || "Pool House"}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <div className="grid grid-cols-2 gap-3 pt-2">
                            <Field label="Key count (Quantity) *" htmlFor="multi-key-count">
                              <Input
                                id="multi-key-count"
                                type="number"
                                min={1}
                                max={50}
                                value={roomDraft.keyCount}
                                onChange={(e) =>
                                  setRoomDraft((prev) => ({
                                    ...prev,
                                    keyCount: Math.max(1, parseInt(e.target.value, 10) || 1),
                                  }))
                                }
                                required
                              />
                            </Field>

                            <Field label="Starting room number *" htmlFor="multi-start-room">
                              <Input
                                id="multi-start-room"
                                value={roomDraft.startRoomNumber}
                                onChange={(e) =>
                                  setRoomDraft((prev) => ({
                                    ...prev,
                                    startRoomNumber: e.target.value,
                                  }))
                                }
                                placeholder="e.g. 101 or 201"
                                required
                              />
                            </Field>

                            <div className="col-span-2 text-xs text-stone-600 flex items-center gap-2 flex-wrap">
                              <span>PMS keys generated:</span>
                              {currentGeneratedKeys.map((k) => (
                                <span
                                  key={k}
                                  className="font-mono font-bold px-2 py-0.5 bg-stone-100 rounded-md text-[#28594E]"
                                >
                                  {k}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Photo Upload: File Dropzone Only (NO URL INPUTS) */}
                      <div className="space-y-2 pt-1">
                        <label className="text-xs font-bold text-stone-900 block">
                          Room photos (Upload-only) <span className="text-red-500">*</span>
                        </label>

                        <label className="relative flex flex-col items-center justify-center p-6 border-2 border-dashed border-stone-200 rounded-xl hover:border-[#28594E] hover:bg-[#FAF8F5] transition-colors cursor-pointer group">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => { const file = e.target.files?.[0]; if (file) handleUploadImageFile(file, "room"); }}
                            disabled={isUploadingImage}
                            className="hidden"
                          />
                          <UploadCloud className="size-8 text-[#28594E] group-hover:scale-110 transition-transform mb-1.5" />
                          <span className="text-xs font-bold text-stone-800">
                            {isUploadingImage
                              ? "Optimizing and saving photo..."
                              : "Click to upload room photography or drag & drop"}
                          </span>
                          <span className="text-[11px] text-stone-400 mt-0.5">
                            High-res JPG, PNG, WEBP (No image URL needed)
                          </span>
                        </label>

                        {/* Uploaded Photo Preview */}
                        {roomDraft.coverImage && (
                          <div className="relative aspect-video max-w-sm rounded-xl overflow-hidden border border-stone-200 group shadow-2xs mt-2">
                            <img
                              src={roomDraft.coverImage}
                              alt="Room Preview"
                              className="w-full h-full object-cover"
                            />
                            <button
                              type="button"
                              onClick={() =>
                                setRoomDraft((prev) => ({ ...prev, coverImage: "" }))
                              }
                              className="absolute top-1.5 right-1.5 size-6 rounded-full bg-black/70 hover:bg-red-600 text-white flex items-center justify-center transition-colors shadow-xs"
                            >
                              <X className="size-3.5" />
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Amenities Pills & Custom Input */}
                      <div className="space-y-2 pt-1">
                        <label className="text-xs font-bold text-stone-900 block">
                          Room amenities
                        </label>
                        <div className="flex flex-wrap gap-1.5">
                          {ESSENTIAL_AMENITIES.map((amenity) => {
                            const active = roomDraft.amenities.includes(amenity);
                            return (
                              <button
                                key={amenity}
                                type="button"
                                onClick={() => toggleAmenity(amenity)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                                  active
                                    ? "bg-[#28594E] text-[#F5EBDD] border-[#28594E] shadow-2xs font-bold"
                                    : "bg-white text-stone-700 border-stone-200 hover:bg-stone-50"
                                }`}
                              >
                                {amenity} {active && "✓"}
                              </button>
                            );
                          })}
                        </div>

                        {/* Custom Tag Input */}
                        <div className="flex gap-2 items-center pt-1">
                          <Input
                            value={customAmenityInput}
                            onChange={(e) => setCustomAmenityInput(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                addCustomAmenity(customAmenityInput);
                              }
                            }}
                            placeholder="Add custom amenity (e.g. BBQ Grill, Sea View) and press Enter"
                            className="text-xs"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => addCustomAmenity(customAmenityInput)}
                            className="text-xs font-bold border-stone-200 text-stone-700 shrink-0"
                          >
                            <Plus className="size-3.5 mr-1" /> Add
                          </Button>
                        </div>

                        {roomDraft.amenities.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {roomDraft.amenities.map((item) => (
                              <span
                                key={item}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-stone-100 text-xs font-medium text-stone-800"
                              >
                                {item}
                                <button
                                  type="button"
                                  onClick={() => removeAmenity(item)}
                                  className="hover:text-red-600 transition-colors"
                                >
                                  <X className="size-3" />
                                </button>
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {guidedRoomError && (
                        <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-center gap-2.5">
                          <YoonieMascot mood="worried" size="sm" />
                          <span>{guidedRoomError}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          onClick={() => setWizardStep(2)}
                          className="text-xs font-semibold text-stone-500 hover:text-stone-900"
                        >
                          ← Back
                        </Button>
                        <Button
                          variant="ghost"
                          onClick={triggerSkipRooms}
                          className="text-xs font-semibold text-stone-400 hover:text-stone-700"
                        >
                          Skip for now
                        </Button>
                      </div>

                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        <Button
                          variant="outline"
                          onClick={() => handleProvisionRoomKeys(true)}
                          disabled={isCreatingRoom || !roomDraft.title}
                          className="text-xs font-bold border-stone-200 text-stone-700 hover:bg-stone-50 flex-1 sm:flex-initial"
                        >
                          <Plus className="size-3.5 mr-1" /> Add Another Type
                        </Button>

                        <Button
                          onClick={() => handleProvisionRoomKeys(false)}
                          disabled={isCreatingRoom || !roomDraft.title}
                          className="bg-[#28594E] hover:bg-[#1E433A] text-[#F5EBDD] font-bold px-7 py-2.5 text-xs shadow-sm flex-1 sm:flex-initial"
                        >
                          {isCreatingRoom
                            ? "Provisioning..."
                            : `Provision ${currentGeneratedKeys.length} Key(s) & Continue →`}
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {/* STAGE 4: Curated Add-ons & Services */}
                {wizardStep === 4 && (
                  <div className="bg-white p-6 sm:p-8 rounded-2xl border border-stone-200/80 shadow-xs space-y-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <h2 className="text-2xl font-bold text-[#1F2925] tracking-tight">
                          Curated Add-ons & Services
                        </h2>
                        <p className="text-xs text-stone-500 mt-1">
                          Offer optional extras like airport transfers, scooter rentals, or breakfast baskets.
                        </p>
                      </div>
                      <YoonieMascot mood="happy" size="sm" />
                    </div>

                    {/* Inline Form to Add Item */}
                    <div className="p-4 rounded-xl bg-stone-50/80 border border-stone-200/80 space-y-3">
                      <span className="block text-xs font-bold text-stone-900">
                        Add a curated service or rental
                      </span>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <Field label="Item name *" htmlFor="exp-title">
                          <Input
                            id="exp-title"
                            value={experienceDraft.name}
                            onChange={(e) =>
                              setExperienceDraft((prev) => ({ ...prev, name: e.target.value }))
                            }
                            placeholder="e.g. Scooter Rental (125cc), Floating Pool Breakfast"
                            className="text-sm font-medium"
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
                            />
                          </Field>

                          <Field label="Pricing model" htmlFor="exp-unit">
                            <Select
                              value={experienceDraft.pricingModel}
                              onValueChange={(val: any) =>
                                setExperienceDraft((prev) => ({ ...prev, pricingModel: val }))
                              }
                            >
                              <SelectTrigger id="exp-unit">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="PER_PAX">Per Guest</SelectItem>
                                <SelectItem value="PER_VEHICLE">Per Vehicle / Rental</SelectItem>
                                <SelectItem value="PER_TREATMENT">Per Session / Treatment</SelectItem>
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
                          className="text-xs font-bold border-stone-200 text-stone-800"
                        >
                          <Plus className="size-3.5 mr-1" /> Add to Service List
                        </Button>
                      </div>
                    </div>

                    {/* Added Experiences List */}
                    {customExperiences.length > 0 && (
                      <div className="space-y-2">
                        <span className="block text-xs font-bold text-stone-900">
                          Services Ready to Publish ({customExperiences.length})
                        </span>
                        <div className="divide-y divide-stone-100 rounded-xl border border-stone-200 overflow-hidden">
                          {customExperiences.map((exp, idx) => (
                            <div
                              key={idx}
                              className="p-3 bg-white flex items-center justify-between text-xs"
                            >
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-stone-900">{exp.name}</span>
                                <span className="px-2 py-0.5 rounded-full bg-stone-100 text-stone-600 text-[10px] uppercase font-bold">
                                  {exp.pricingModel}
                                </span>
                              </div>
                              <div className="flex items-center gap-3">
                                <span className="font-mono font-bold text-[#28594E]">
                                  ฿{exp.basePriceThb.toLocaleString()} ({exp.pricingModel})
                                </span>
                                <button
                                  type="button"
                                  onClick={() => removeExperienceFromList(exp.id)}
                                  className="text-stone-400 hover:text-red-600 transition-colors"
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
                      <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-center gap-2.5">
                        <YoonieMascot mood="worried" size="sm" />
                        <span>{guidedServiceError}</span>
                      </div>
                    )}

                    <div className="flex justify-between pt-2">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          onClick={() => setWizardStep(3)}
                          className="text-xs font-semibold text-stone-500 hover:text-stone-900"
                        >
                          ← Back
                        </Button>
                        <Button
                          variant="ghost"
                          onClick={triggerSkipService}
                          className="text-xs font-semibold text-stone-400 hover:text-stone-700"
                        >
                          Skip Extras & Review →
                        </Button>
                      </div>

                      <Button
                        onClick={handlePublishAllExperiences}
                        disabled={isCreatingService}
                        className="bg-[#28594E] hover:bg-[#1E433A] text-[#F5EBDD] font-bold px-7 py-2.5 text-xs shadow-sm"
                      >
                        {isCreatingService
                          ? "Publishing Extras..."
                          : `Save ${customExperiences.length} Item(s) & Continue →`}
                      </Button>
                    </div>
                  </div>
                )}

                {/* STAGE 5: Review & Launch */}
                {wizardStep === 5 && (createdWorkspace || form.hotelName) && (
                  <div className="bg-white p-6 sm:p-8 rounded-2xl border border-stone-200/80 shadow-xs space-y-6">
                    <div className="text-center space-y-1.5 pb-2">
                      <div className="flex justify-center mb-1">
                        <YoonieMascot
                          mood="happy"
                          size="md"
                          message="Your property workspace is verified and ready for live reservations!"
                        />
                      </div>
                      <h2 className="text-2xl font-bold text-[#1F2925] tracking-tight">
                        {createdWorkspace?.name || form.hotelName} is Live
                      </h2>
                      <p className="text-xs text-stone-500">
                        Review your verified inventory and open your direct booking front-door.
                      </p>
                    </div>

                    {/* Property Specs */}
                    <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
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
                        <span className="text-stone-400 block text-[11px]">City & Country</span>
                        <span className="font-bold text-stone-900">{form.city}, {form.country}</span>
                      </div>
                      <div>
                        <span className="text-stone-400 block text-[11px]">Manager</span>
                        <span className="font-bold text-stone-900">{form.ownerName}</span>
                      </div>
                    </div>

                    {/* Inventory Table */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-stone-900 flex items-center gap-1.5">
                          <Bed className="size-4 text-stone-700" /> Physical Room Inventory ({createdRooms.length} Keys)
                        </span>
                        <span className="text-[#28594E] font-semibold flex items-center gap-1 text-[11px]">
                          <CheckCircle2 className="size-3.5 text-[#28594E]" /> Ready for Direct Bookings
                        </span>
                      </div>

                      {createdRooms.length > 0 ? (
                        <div className="overflow-x-auto rounded-xl border border-stone-200">
                          <table className="w-full text-left text-xs border-collapse">
                            <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 font-medium">
                              <tr>
                                <th className="p-2.5">Room / Key #</th>
                                <th className="p-2.5">Type</th>
                                <th className="p-2.5">Nightly Rate</th>
                                <th className="p-2.5">PMS Status</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-stone-100">
                              {createdRooms.map((r) => (
                                <tr key={r._id}>
                                  <td className="p-2.5 font-mono font-bold text-stone-900">Room {r.roomNumber}</td>
                                  <td className="p-2.5">{r.roomType.replace(/_/g, " ")}</td>
                                  <td className="p-2.5 font-bold text-stone-900">฿{(r.baseRateThb ?? 0).toLocaleString()}</td>
                                  <td className="p-2.5 text-[#28594E] font-medium">Active (Clean)</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <p className="text-xs text-stone-400">Accommodation only — no physical keys provisioned yet.</p>
                      )}
                    </div>

                    {/* Services Table */}
                    {createdServices.length > 0 && (
                      <div className="space-y-2">
                        <span className="block text-xs font-bold text-stone-900">
                          Published Experiences ({createdServices.length} Active)
                        </span>
                        <div className="overflow-x-auto rounded-xl border border-stone-200">
                          <table className="w-full text-left text-xs border-collapse">
                            <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 font-medium">
                              <tr>
                                <th className="p-2.5">Service</th>
                                <th className="p-2.5">Price</th>
                                <th className="p-2.5">Model</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-stone-100">
                              {createdServices.map((s) => (
                                <tr key={s._id}>
                                  <td className="p-2.5 font-bold text-stone-900">{s.name}</td>
                                  <td className="p-2.5 font-bold text-stone-900">฿{(s.basePriceThb ?? 0).toLocaleString()}</td>
                                  <td className="p-2.5 text-stone-500">{s.pricingModel}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {/* Launch Links */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                      <Button
                        size="sm"
                        variant="outline"
                        asChild
                        className="w-full text-xs font-bold border-stone-300 text-stone-800 hover:bg-stone-50 py-3"
                      >
                        <a
                          href={getSubdomainUrl(createdWorkspace?.slug || form.slug)}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Open Direct Booking Door <ExternalLink className="size-3.5 ml-1.5" />
                        </a>
                      </Button>

                      <Button
                        size="sm"
                        asChild
                        className="w-full text-xs font-bold bg-[#28594E] hover:bg-[#1E433A] text-[#F5EBDD] py-3 shadow-sm"
                      >
                        <a href={getSubdomainUrl("ops", "/ops/rooms")}>
                          Enter Ops Hub <ArrowRight className="size-3.5 ml-1.5" />
                        </a>
                      </Button>
                    </div>

                    <div className="pt-2 flex items-center justify-between">
                      <Button
                        variant="ghost"
                        onClick={() => setWizardStep(4)}
                        className="text-xs font-semibold text-stone-500 hover:text-stone-900"
                      >
                        ← Back to Add-ons
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={resetWizard}
                        className="text-xs text-stone-400 hover:text-stone-700"
                      >
                        Done & Exit Studio
                      </Button>
                    </div>
                  </div>
                )}
              </main>

              {/* ─── RIGHT COLUMN: Live White-Label Preview & Yoonie Co-Pilot ─── */}
              <aside className="lg:col-span-3 space-y-4">
                {/* 1. Live White-Label Guest Booking Engine Preview */}
                <div className="bg-white rounded-2xl border border-stone-200/80 shadow-xs overflow-hidden">
                  {/* Browser Mockup Chrome */}
                  <div className="bg-stone-100 px-3.5 py-2 border-b border-stone-200 flex items-center gap-2">
                    <div className="flex items-center gap-1.5">
                      <span className="size-2 rounded-full bg-red-400/80" />
                      <span className="size-2 rounded-full bg-amber-400/80" />
                      <span className="size-2 rounded-full bg-emerald-400/80" />
                    </div>
                    <div className="flex-1 bg-white rounded-md px-2 py-0.5 text-[10px] font-mono text-stone-500 truncate flex items-center gap-1 border border-stone-200">
                      <Lock className="size-2.5 text-emerald-600 shrink-0" />
                      <span className="truncate">https://{form.slug || "yourhotel"}.yoonie.app</span>
                    </div>
                  </div>

                  {/* Visual Preview Content */}
                  <div className="p-3.5 space-y-3">
                    {/* Live Image Header */}
                    <div className="relative aspect-16/10 rounded-xl overflow-hidden bg-stone-100 border border-stone-200">
                      <img
                        src={
                          roomDraft.coverImage ||
                          "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80"
                        }
                        alt="Property preview"
                        className="w-full h-full object-cover transition-all duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex flex-col justify-end p-2.5 text-white">
                        <span className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-full bg-[#E8A45B] text-stone-900 w-fit mb-1">
                          Direct Booking
                        </span>
                        <div className="font-bold text-sm leading-tight font-serif truncate">
                          {form.hotelName || "Your Luxury Property"}
                        </div>
                        <div className="text-[10px] text-stone-200 flex items-center gap-1">
                          <span>{form.city || "Bangkok"}, {form.country || "TH"}</span>
                          <span>·</span>
                          <span>0% OTA Fees</span>
                        </div>
                      </div>
                    </div>

                    {/* Room & Price Pill */}
                    <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200/80 space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-stone-800 truncate">
                          {roomDraft.title || "Deluxe Suite"}
                        </span>
                        <span className="font-mono font-bold text-[#28594E]">
                          ฿{(roomDraft.baseRateThb || 3500).toLocaleString()}/nt
                        </span>
                      </div>
                      <div className="text-[10px] text-stone-500 flex items-center justify-between">
                        <span>{roomDraft.isSingleUnit ? "Standalone Key" : `${currentGeneratedKeys.length} Keys`}</span>
                        <span className="text-emerald-700 font-medium">Instant Confirmation</span>
                      </div>
                    </div>

                    <div className="text-[10px] text-center text-stone-400 font-medium pt-0.5">
                      Direct Guest Reservation Engine · Live PMS Synced
                    </div>
                  </div>
                </div>

                {/* 2. Yoonie Mascot Co-Pilot Guidance */}
                <div className="bg-[#FAF8F5] p-5 rounded-2xl border border-[#28594E]/15 shadow-xs space-y-3.5">
                  <div className="flex items-center gap-3">
                    <YoonieMascot
                      mood={
                        wizardStep === 1
                          ? "calm"
                          : wizardStep === 2
                          ? "thinking"
                          : wizardStep === 3
                          ? "checking"
                          : "happy"
                      }
                      size="sm"
                    />
                    <div className="space-y-0.5">
                      <span className="block text-xs font-bold text-[#28594E]">
                        Yoonie Co-Pilot
                      </span>
                      <span className="block text-[11px] text-stone-500">
                        {wizardStep === 1 && "Setting up your identity"}
                        {wizardStep === 2 && "Configuring your format"}
                        {wizardStep === 3 && "Optimizing inventory"}
                        {wizardStep === 4 && "Maximizing ancillary revenue"}
                        {wizardStep === 5 && "Ready for reservations"}
                      </span>
                    </div>
                  </div>

                  {/* Contextual guidance text */}
                  <div className="text-xs text-stone-600 leading-relaxed space-y-2 pt-1 border-t border-stone-200/60">
                    {wizardStep === 1 && (
                      <>
                        <p>
                          <strong className="text-stone-900">Dedicated Subdomain:</strong> Every property gets its own direct booking front door with zero commission fees.
                        </p>
                        <p>
                          <strong className="text-stone-900">Master GM Access:</strong> This account unlocks your housekeeping board and 05:30 AM dispatch run-sheet.
                        </p>
                      </>
                    )}

                    {wizardStep === 2 && (
                      <>
                        <p>
                          <strong className="text-stone-900">Boutique vs Villa:</strong> Running a single pool house or vacation rental? Select &apos;Private Villa&apos; to keep management effortless.
                        </p>
                        <p>
                          <strong className="text-stone-900">Independent Properties:</strong> Leave the brand name blank if you operate independently.
                        </p>
                      </>
                    )}

                    {wizardStep === 3 && (
                      <>
                        <p>
                          <strong className="text-stone-900">Upload Authentic Photos:</strong> Real property photos convert direct guests 4x faster than stock imagery.
                        </p>
                        <p>
                          <strong className="text-stone-900">Single Space vs Multi-Key:</strong> Single unit mode assigns 1 key directly without room-numbering fuss.
                        </p>
                      </>
                    )}

                    {wizardStep === 4 && (
                      <>
                        <p>
                          <strong className="text-stone-900">Ancillary Revenue:</strong> Offering airport pickups, scooter rentals, or breakfast adds 20–35% direct revenue.
                        </p>
                        <p>
                          <strong className="text-stone-900">Completely Optional:</strong> If you only sell accommodation, click &apos;Skip Extras&apos; to continue directly.
                        </p>
                      </>
                    )}

                    {wizardStep === 5 && (
                      <>
                        <p>
                          <strong className="text-stone-900">Frontline Operations:</strong> Room turnarounds and arrivals dispatch automatically every morning at 05:30 AM.
                        </p>
                        <p>
                          <strong className="text-stone-900">Live Booking Engine:</strong> Share your direct link to start accepting commission-free reservations immediately.
                        </p>
                      </>
                    )}
                  </div>
                </div>
              </aside>
            </div>
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
