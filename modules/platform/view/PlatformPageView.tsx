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
  { num: 1, title: "Get started", sub: "Account & domain" },
  { num: 2, title: "Property details", sub: "Location & rules" },
  { num: 3, title: "Rooms & inventory", sub: "Types, counts" },
  { num: 4, title: "Add-ons & services", sub: "Rentals, extras" },
  { num: 5, title: "Review & submit", sub: "Final check" },
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

      {/* ─── FULL OKKAMI-STYLE 3-COLUMN PROPERTY SETUP STUDIO ─────────────────── */}
      {isWizardOpen && (
        <div className="fixed inset-0 z-50 bg-[#F8F9FA] flex flex-col overflow-y-auto animate-in fade-in-0 duration-200 text-[#1F2937]">
          {/* Top Bar matching OKKAMI */}
          <header className="sticky top-0 z-40 border-b border-gray-200 bg-white px-6 py-3.5 flex items-center justify-between shadow-2xs">
            <div className="flex items-center gap-3">
              <div className="size-7 rounded-lg bg-[#E5484D] flex items-center justify-center text-white font-extrabold text-sm shadow-xs">
                ✱
              </div>
              <div className="flex items-baseline gap-2">
                <span className="font-extrabold text-base tracking-tight text-gray-900">
                  yoonie
                </span>
                <span className="text-xs font-medium text-gray-500">
                  Property onboarding
                </span>
              </div>
            </div>

            <Button
              size="sm"
              variant="ghost"
              onClick={resetWizard}
              className="text-xs font-semibold text-gray-500 hover:text-gray-900"
            >
              <X className="size-4 mr-1" /> Exit Setup
            </Button>
          </header>

          {/* 3-Column Studio Body */}
          <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* ─── LEFT COLUMN: Vertical Stepper ─────────────────────────── */}
              <aside className="lg:col-span-3">
                <div className="sticky top-20 bg-white rounded-2xl p-5 border border-gray-200/80 shadow-xs space-y-6">
                  <div className="space-y-4">
                    {ONBOARDING_STAGES.map((s) => {
                      const isPast = wizardStep > s.num;
                      const isCurrent = wizardStep === s.num;
                      return (
                        <div key={s.num} className="flex items-start gap-3 relative">
                          {/* Stepper Node Circle */}
                          <div
                            className={`size-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 transition-colors ${
                              isCurrent
                                ? "bg-[#E5484D] text-white shadow-xs"
                                : isPast
                                ? "bg-gray-900 text-white"
                                : "bg-gray-100 text-gray-400 border border-gray-200"
                            }`}
                          >
                            {isPast ? <Check className="size-3.5" /> : s.num}
                          </div>

                          {/* Stepper Labels */}
                          <div className="space-y-0.5 pt-0.5">
                            <span
                              className={`block text-xs font-bold leading-none ${
                                isCurrent
                                  ? "text-gray-900"
                                  : isPast
                                  ? "text-gray-800"
                                  : "text-gray-400"
                              }`}
                            >
                              {s.title}
                            </span>
                            <span className="block text-[11px] text-gray-400 font-normal">
                              {isCurrent ? "In progress" : isPast ? "Complete" : s.sub}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </aside>

              {/* ─── CENTER COLUMN: Minimal Forms ──────────────────────────── */}
              <main className="lg:col-span-6 space-y-6">
                {/* STAGE 1: Get started */}
                {wizardStep === 1 && (
                  <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-200 shadow-xs space-y-6">
                    <div>
                      <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">
                        Get started
                      </h2>
                      <p className="text-xs text-gray-500 mt-1">
                        Tell us your property identity and create your master management credentials.
                      </p>
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

                      <Field label="Brand name" htmlFor="brand-name" hint="Enter the chain or management brand. Leave blank if independent.">
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
                        hint="Guests will book rooms and add-ons directly here with 0% OTA commission."
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

                      <div className="pt-2 border-t border-gray-100 space-y-3">
                        <span className="block text-xs font-bold text-gray-900 uppercase tracking-wider">
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
                        className="bg-gray-900 hover:bg-black text-white font-bold px-7 py-2.5 text-xs shadow-xs"
                      >
                        Continue to Property Details →
                      </Button>
                    </div>
                  </div>
                )}

                {/* STAGE 2: Property details (Exact OKKAMI Layout) */}
                {wizardStep === 2 && (
                  <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-200 shadow-xs space-y-6">
                    <div>
                      <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">
                        Property details
                      </h2>
                      <p className="text-xs text-gray-500 mt-1">
                        Tell us about the property you&apos;re setting up.
                      </p>
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

                        <Field label="City *" htmlFor="hotel-city">
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

                      {/* Property Type: 3 Clean Cards */}
                      <div className="space-y-1.5 pt-1">
                        <label className="text-xs font-bold text-gray-900 block">
                          Property type *
                        </label>
                        <div className="grid grid-cols-3 gap-3">
                          {[
                            { id: "HOTEL", label: "Hotel", icon: Building },
                            { id: "CONDO", label: "Condo", icon: Building2 },
                            { id: "MIXED", label: "Mixed-use", icon: Layers },
                          ].map((t) => {
                            const active = form.propertyType === t.id;
                            const Icon = t.icon;
                            return (
                              <button
                                key={t.id}
                                type="button"
                                onClick={() =>
                                  setForm({ ...form, propertyType: t.id as any })
                                }
                                className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all ${
                                  active
                                    ? "border-emerald-600 bg-emerald-50/50 text-emerald-900 ring-1 ring-emerald-600 font-bold"
                                    : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50 font-medium"
                                }`}
                              >
                                <Icon className="size-5" />
                                <span className="text-xs">{t.label}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Total rooms & Number of floors */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                        <Field label="Total rooms / units *" htmlFor="total-units">
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
                        className="text-xs font-semibold text-gray-500 hover:text-gray-900"
                      >
                        ← Back
                      </Button>
                      <Button
                        onClick={handleAdvanceToRooms}
                        disabled={isLaunching || !form.city || !form.country}
                        className="bg-gray-900 hover:bg-black text-white font-bold px-7 py-2.5 text-xs shadow-xs"
                      >
                        {isLaunching ? "Saving Property..." : "Continue to Rooms & Inventory →"}
                      </Button>
                    </div>
                  </div>
                )}

                {/* STAGE 3: Rooms & inventory (Types, counts) */}
                {wizardStep === 3 && (
                  <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-200 shadow-xs space-y-6">
                    <div>
                      <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">
                        Rooms & inventory
                      </h2>
                      <p className="text-xs text-gray-500 mt-1">
                        Define your room types, set nightly rates, and generate physical keys.
                      </p>
                    </div>

                    {/* Banner of Already Added Rooms */}
                    {createdRooms.length > 0 && (
                      <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-200 text-xs space-y-1.5">
                        <div className="font-bold text-emerald-900 flex items-center gap-1.5">
                          <CheckCircle2 className="size-4 text-emerald-600" />
                          {createdRooms.length} Key(s) Provisioned in Database:
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {createdRooms.map((r) => (
                            <span
                              key={r._id}
                              className="px-2.5 py-1 rounded-md bg-white border border-emerald-300 font-mono font-medium text-emerald-900 text-xs"
                            >
                              Room {r.roomNumber} · ฿{(r.baseRateThb ?? 0).toLocaleString()}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="space-y-4">
                      {/* Space Name & Rate */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <Field label="Space / Room type title *" htmlFor="room-title">
                          <Input
                            id="room-title"
                            value={roomDraft.title}
                            onChange={(e) =>
                              setRoomDraft((prev) => ({ ...prev, title: e.target.value }))
                            }
                            placeholder="e.g. Private Pool House, Beach Villa, King Room"
                            required
                            className="text-sm font-medium"
                          />
                        </Field>

                        <Field label="Nightly base rate (THB ฿) *" htmlFor="room-rate">
                          <Input
                            id="room-rate"
                            type="number"
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

                      {/* Single Unit vs Multi-Key Toggle */}
                      <div className="space-y-2 pt-1">
                        <label className="text-xs font-bold text-gray-900 block">
                          Inventory format *
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div
                            onClick={() =>
                              setRoomDraft((prev) => ({
                                ...prev,
                                isSingleUnit: true,
                                keyCount: 1,
                                singleUnitName: prev.singleUnitName || prev.title || "Pool House",
                              }))
                            }
                            className={`cursor-pointer p-3.5 rounded-xl border text-left space-y-1 transition-all ${
                              roomDraft.isSingleUnit
                                ? "border-emerald-600 bg-emerald-50/40 text-emerald-900 ring-1 ring-emerald-600 font-bold"
                                : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                            }`}
                          >
                            <div className="flex items-center justify-between text-xs font-bold">
                              <span className="flex items-center gap-1.5">
                                <Home className="size-4 text-emerald-700" /> Single Unit
                              </span>
                              {roomDraft.isSingleUnit && <Check className="size-3.5 text-emerald-700" />}
                            </div>
                            <p className="text-[11px] text-gray-500 font-normal">
                              For standalone pool houses, villas, or cottages (1 key).
                            </p>
                          </div>

                          <div
                            onClick={() =>
                              setRoomDraft((prev) => ({
                                ...prev,
                                isSingleUnit: false,
                                keyCount: Math.max(2, prev.keyCount || 2),
                              }))
                            }
                            className={`cursor-pointer p-3.5 rounded-xl border text-left space-y-1 transition-all ${
                              !roomDraft.isSingleUnit
                                ? "border-emerald-600 bg-emerald-50/40 text-emerald-900 ring-1 ring-emerald-600 font-bold"
                                : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                            }`}
                          >
                            <div className="flex items-center justify-between text-xs font-bold">
                              <span className="flex items-center gap-1.5">
                                <Layers className="size-4 text-emerald-700" /> Multiple Rooms
                              </span>
                              {!roomDraft.isSingleUnit && <Check className="size-3.5 text-emerald-700" />}
                            </div>
                            <p className="text-[11px] text-gray-500 font-normal">
                              For hotels, hostels, or guesthouses with room numbers.
                            </p>
                          </div>
                        </div>

                        {/* Inventory inputs */}
                        {roomDraft.isSingleUnit ? (
                          <div className="pt-1">
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
                            <div className="text-xs text-gray-600 mt-1.5 flex items-center gap-2">
                              <span>Generated PMS Key:</span>
                              <span className="font-mono font-bold px-2 py-0.5 bg-gray-100 rounded-md text-gray-900">
                                {roomDraft.singleUnitName.trim() || roomDraft.title.trim() || "Pool House"}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <div className="grid grid-cols-2 gap-3 pt-1">
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
                                placeholder="101"
                                required
                              />
                            </Field>
                          </div>
                        )}
                      </div>

                      {/* Photo Upload ONLY (No Image URL) */}
                      <div className="space-y-2 pt-1">
                        <label className="text-xs font-bold text-gray-900 block">
                          Room photography (File upload only)
                        </label>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
                          <div className="sm:col-span-1 aspect-[16/10] rounded-xl overflow-hidden bg-gray-100 border border-gray-200 relative">
                            <img
                              src={roomDraft.coverImage}
                              alt="Room preview"
                              className="w-full h-full object-cover"
                            />
                          </div>

                          <div className="sm:col-span-2 space-y-2">
                            <label className="border-2 border-dashed border-gray-300 hover:border-gray-400 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer transition-colors bg-gray-50/50 hover:bg-gray-50">
                              <UploadCloud className="size-5 text-gray-500 mb-1" />
                              <span className="text-xs font-bold text-gray-700">
                                Click or drag to upload photo
                              </span>
                              <span className="text-[11px] text-gray-400">
                                PNG, JPG, or WEBP up to 10MB
                              </span>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) void handleUploadImageFile(file, "room");
                                }}
                                className="hidden"
                              />
                            </label>
                          </div>
                        </div>
                      </div>

                      {/* Amenities Toggles & Tags */}
                      <div className="space-y-2 pt-1">
                        <label className="text-xs font-bold text-gray-900 block">
                          Room amenities & highlights
                        </label>

                        <div className="flex flex-wrap gap-2">
                          {ESSENTIAL_AMENITIES.map((amenity) => {
                            const active = roomDraft.amenities.includes(amenity);
                            return (
                              <button
                                key={amenity}
                                type="button"
                                onClick={() => toggleAmenity(amenity)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                                  active
                                    ? "bg-gray-900 text-white border-gray-900 shadow-2xs"
                                    : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
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
                            className="text-xs font-bold border-gray-200 shrink-0"
                          >
                            <Plus className="size-3.5 mr-1" /> Add
                          </Button>
                        </div>

                        {roomDraft.amenities.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {roomDraft.amenities.map((item) => (
                              <span
                                key={item}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-gray-100 text-xs font-medium text-gray-800"
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
                      <Button
                        variant="ghost"
                        onClick={triggerSkipRooms}
                        className="text-xs font-semibold text-gray-500 hover:text-gray-900"
                      >
                        Skip for now
                      </Button>

                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        <Button
                          variant="outline"
                          onClick={() => handleProvisionRoomKeys(true)}
                          disabled={isCreatingRoom || !roomDraft.title}
                          className="text-xs font-bold border-gray-200 text-gray-700 hover:bg-gray-50 flex-1 sm:flex-initial"
                        >
                          <Plus className="size-3.5 mr-1" /> Add Another Type
                        </Button>

                        <Button
                          onClick={() => handleProvisionRoomKeys(false)}
                          disabled={isCreatingRoom || !roomDraft.title}
                          className="bg-gray-900 hover:bg-black text-white font-bold px-7 py-2.5 text-xs shadow-xs flex-1 sm:flex-initial"
                        >
                          {isCreatingRoom
                            ? "Provisioning..."
                            : `Provision ${currentGeneratedKeys.length} Key(s) & Continue →`}
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {/* STAGE 4: Add-ons & services */}
                {wizardStep === 4 && (
                  <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-200 shadow-xs space-y-6">
                    <div>
                      <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">
                        Add-ons & services
                      </h2>
                      <p className="text-xs text-gray-500 mt-1">
                        Offer optional extras like scooter rentals, breakfast baskets, or airport rides.
                      </p>
                    </div>

                    {/* Inline Form to Add Item */}
                    <div className="p-4 rounded-xl bg-gray-50/80 border border-gray-200/80 space-y-3">
                      <span className="block text-xs font-bold text-gray-900">
                        Add a service or rental
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

                          <Field label="Pricing unit" htmlFor="exp-unit">
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
                                <SelectItem value="PER_VEHICLE">Per Item / Day</SelectItem>
                                <SelectItem value="PER_TREATMENT">Per Booking</SelectItem>
                              </SelectContent>
                            </Select>
                          </Field>
                        </div>
                      </div>

                      <Field label="Short description" htmlFor="exp-desc">
                        <Input
                          id="exp-desc"
                          value={experienceDraft.description}
                          onChange={(e) =>
                            setExperienceDraft((prev) => ({ ...prev, description: e.target.value }))
                          }
                          placeholder="e.g. Includes helmet and 24-hr rental, or fresh tropical fruit breakfast"
                        />
                      </Field>

                      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
                        <label className="border border-gray-200 bg-white hover:bg-gray-50 rounded-lg px-3 py-1.5 text-xs text-gray-700 cursor-pointer flex items-center gap-1.5 w-full sm:w-auto">
                          <UploadCloud className="size-3.5 text-gray-500" />
                          <span>Upload photo</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) void handleUploadImageFile(file, "service");
                            }}
                            className="hidden"
                          />
                        </label>

                        <Button
                          type="button"
                          onClick={addExperienceToList}
                          disabled={!experienceDraft.name.trim()}
                          className="bg-gray-900 hover:bg-black text-white font-bold text-xs px-5 py-2 shadow-xs w-full sm:w-auto"
                        >
                          <Plus className="size-3.5 mr-1" /> Add to Catalog
                        </Button>
                      </div>
                    </div>

                    {/* Added List */}
                    <div className="space-y-2">
                      <span className="block text-xs font-bold text-gray-700">
                        Added services ({customExperiences.length} items):
                      </span>

                      {customExperiences.length === 0 ? (
                        <p className="text-xs text-gray-400 italic">
                          No add-ons configured yet. You can add items above or skip to launch.
                        </p>
                      ) : (
                        <div className="space-y-2">
                          {customExperiences.map((item) => (
                            <div
                              key={item.id}
                              className="p-3.5 rounded-xl bg-white border border-gray-200 flex items-center justify-between gap-3 shadow-2xs"
                            >
                              <div className="space-y-0.5">
                                <span className="font-bold text-xs text-gray-900 block">
                                  {item.name}
                                </span>
                                <span className="text-[11px] text-gray-500">
                                  ฿{item.basePriceThb.toLocaleString()} /{" "}
                                  {item.pricingModel === "PER_PAX"
                                    ? "guest"
                                    : item.pricingModel === "PER_VEHICLE"
                                    ? "item"
                                    : "booking"}
                                </span>
                              </div>
                              <button
                                type="button"
                                onClick={() => removeExperienceFromList(item.id)}
                                className="text-gray-400 hover:text-red-600 p-1 rounded-md transition-colors"
                              >
                                <Trash2 className="size-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {guidedServiceError && (
                      <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-center gap-2.5">
                        <YoonieMascot mood="worried" size="sm" />
                        <span>{guidedServiceError}</span>
                      </div>
                    )}

                    <div className="flex justify-between pt-2">
                      <Button
                        variant="ghost"
                        onClick={() => setWizardStep(5)}
                        className="text-xs font-semibold text-gray-500 hover:text-gray-900"
                      >
                        Skip this step — Accommodation only
                      </Button>
                      <Button
                        onClick={handlePublishAllExperiences}
                        disabled={isCreatingService}
                        className="bg-gray-900 hover:bg-black text-white font-bold px-7 py-2.5 text-xs shadow-xs"
                      >
                        {isCreatingService
                          ? "Saving..."
                          : `Save Add-ons & Review (${customExperiences.length + (experienceDraft.name.trim() ? 1 : 0)}) →`}
                      </Button>
                    </div>
                  </div>
                )}

                {/* STAGE 5: Review & submit (Final check & Launch) */}
                {wizardStep === 5 && createdWorkspace && (
                  <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-200 shadow-xs space-y-6">
                    <div className="text-center space-y-1.5 pb-2">
                      <div className="flex justify-center mb-1">
                        <YoonieMascot
                          mood="happy"
                          size="md"
                          message="Your property workspace is live and production-ready!"
                        />
                      </div>
                      <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">
                        {createdWorkspace.name} is Live
                      </h2>
                      <p className="text-xs text-gray-500">
                        Review your verified inventory and open your direct booking front-door.
                      </p>
                    </div>

                    {/* Property Specs */}
                    <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                      <div>
                        <span className="text-gray-400 block text-[11px]">Property Code</span>
                        <span className="font-mono font-bold text-gray-900">{createdWorkspace.code}</span>
                      </div>
                      <div>
                        <span className="text-gray-400 block text-[11px]">Currency</span>
                        <span className="font-bold text-gray-900">{form.currency}</span>
                      </div>
                      <div>
                        <span className="text-gray-400 block text-[11px]">City & Country</span>
                        <span className="font-bold text-gray-900">{form.city}, {form.country}</span>
                      </div>
                      <div>
                        <span className="text-gray-400 block text-[11px]">Manager</span>
                        <span className="font-bold text-gray-900">{form.ownerName}</span>
                      </div>
                    </div>

                    {/* Inventory Table */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-gray-900 flex items-center gap-1.5">
                          <Bed className="size-4 text-gray-700" /> Physical Room Inventory ({createdRooms.length} Keys)
                        </span>
                        <span className="text-emerald-700 font-semibold flex items-center gap-1 text-[11px]">
                          <CheckCircle2 className="size-3.5" /> Ready for Guests
                        </span>
                      </div>

                      {createdRooms.length > 0 ? (
                        <div className="overflow-x-auto rounded-xl border border-gray-200">
                          <table className="w-full text-left text-xs border-collapse">
                            <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-medium">
                              <tr>
                                <th className="p-2.5">Room / Key #</th>
                                <th className="p-2.5">Type</th>
                                <th className="p-2.5">Nightly Rate</th>
                                <th className="p-2.5">PMS Status</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                              {createdRooms.map((r) => (
                                <tr key={r._id}>
                                  <td className="p-2.5 font-mono font-bold text-gray-900">Room {r.roomNumber}</td>
                                  <td className="p-2.5">{r.roomType.replace(/_/g, " ")}</td>
                                  <td className="p-2.5 font-bold text-gray-900">฿{(r.baseRateThb ?? 0).toLocaleString()}</td>
                                  <td className="p-2.5 text-emerald-700 font-medium">Active (Clean)</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <p className="text-xs text-gray-400">Accommodation only — no physical keys provisioned yet.</p>
                      )}
                    </div>

                    {/* Services Table */}
                    {createdServices.length > 0 && (
                      <div className="space-y-2">
                        <span className="block text-xs font-bold text-gray-900">
                          Published Experiences ({createdServices.length} Active)
                        </span>
                        <div className="overflow-x-auto rounded-xl border border-gray-200">
                          <table className="w-full text-left text-xs border-collapse">
                            <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-medium">
                              <tr>
                                <th className="p-2.5">Service</th>
                                <th className="p-2.5">Price</th>
                                <th className="p-2.5">Model</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                              {createdServices.map((s) => (
                                <tr key={s._id}>
                                  <td className="p-2.5 font-bold text-gray-900">{s.name}</td>
                                  <td className="p-2.5 font-bold text-gray-900">฿{(s.basePriceThb ?? 0).toLocaleString()}</td>
                                  <td className="p-2.5 text-gray-500">{s.pricingModel}</td>
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
                        className="w-full text-xs font-bold border-gray-300 text-gray-800 hover:bg-gray-50 py-3"
                      >
                        <a href={getSubdomainUrl(createdWorkspace.slug)} target="_blank" rel="noopener noreferrer">
                          Open Direct Booking Door <ExternalLink className="size-3.5 ml-1.5" />
                        </a>
                      </Button>

                      <Button
                        size="sm"
                        asChild
                        className="w-full text-xs font-bold bg-gray-900 hover:bg-black text-white py-3 shadow-xs"
                      >
                        <a href={getSubdomainUrl("ops", "/ops/rooms")}>
                          Enter Ops Hub <ArrowRight className="size-3.5 ml-1.5" />
                        </a>
                      </Button>
                    </div>

                    <div className="pt-2 text-center">
                      <Button
                        variant="ghost"
                        onClick={resetWizard}
                        className="text-xs text-gray-400 hover:text-gray-700"
                      >
                        Done & Exit Onboarding
                      </Button>
                    </div>
                  </div>
                )}
              </main>

              {/* ─── RIGHT COLUMN: Contextual Guidance Cards (OKKAMI Style) ─── */}
              <aside className="lg:col-span-3 space-y-4">
                {wizardStep === 1 && (
                  <>
                    <div className="bg-white p-5 rounded-2xl border border-gray-200 border-l-4 border-l-[#E5484D] shadow-xs space-y-2">
                      <h4 className="font-bold text-xs text-gray-900">
                        Dedicated Subdomain?
                      </h4>
                      <p className="text-xs text-gray-600 leading-relaxed">
                        Every property on Yoonie gets a custom branded domain (e.g. <span className="font-mono text-gray-800">yourname.yoonie.app</span>). Direct bookings are captured with 0% OTA fees.
                      </p>
                    </div>

                    <div className="bg-white p-5 rounded-2xl border border-gray-200 border-l-4 border-l-gray-900 shadow-xs space-y-2">
                      <h4 className="font-bold text-xs text-gray-900">
                        Master GM Account
                      </h4>
                      <p className="text-xs text-gray-600 leading-relaxed">
                        This credential holds primary access to manage rooms, assign housekeeping tasks, and view the daily dispatch run-sheet.
                      </p>
                    </div>

                    <div className="bg-white/80 p-4 rounded-2xl border border-gray-200 text-xs flex items-center gap-3">
                      <YoonieMascot mood="checking" size="sm" />
                      <span className="text-gray-600 text-[11px] leading-relaxed">
                        Yoonie ensures direct reservations sync live to your central housekeeping board.
                      </span>
                    </div>
                  </>
                )}

                {wizardStep === 2 && (
                  <>
                    <div className="bg-white p-5 rounded-2xl border border-gray-200 border-l-4 border-l-[#E5484D] shadow-xs space-y-2">
                      <h4 className="font-bold text-xs text-gray-900">
                        Hotel vs mixed-use?
                      </h4>
                      <p className="text-xs text-gray-600 leading-relaxed">
                        Choose &apos;Mixed-use&apos; if the property is a private pool house, standalone villa, or combines hotel units with residential apartments.
                      </p>
                    </div>

                    <div className="bg-white p-5 rounded-2xl border border-gray-200 border-l-4 border-l-gray-900 shadow-xs space-y-2">
                      <h4 className="font-bold text-xs text-gray-900">
                        Brand name
                      </h4>
                      <p className="text-xs text-gray-600 leading-relaxed">
                        Enter the chain or management brand. If the property is independent, leave this blank.
                      </p>
                    </div>

                    <div className="bg-white p-5 rounded-2xl border border-gray-200 border-l-4 border-l-gray-400 shadow-xs space-y-2">
                      <h4 className="font-bold text-xs text-gray-900">
                        Room count
                      </h4>
                      <p className="text-xs text-gray-600 leading-relaxed">
                        Total keys or units across all room types. You can refine the breakdown in Stage 3.
                      </p>
                    </div>
                  </>
                )}

                {wizardStep === 3 && (
                  <>
                    <div className="bg-white p-5 rounded-2xl border border-gray-200 border-l-4 border-l-[#E5484D] shadow-xs space-y-2">
                      <h4 className="font-bold text-xs text-gray-900">
                        Single space vs multi-room?
                      </h4>
                      <p className="text-xs text-gray-600 leading-relaxed">
                        Selling just one pool house or entire villa? Choose &apos;Single Unit&apos; to assign 1 key with zero room-numbering clutter.
                      </p>
                    </div>

                    <div className="bg-white p-5 rounded-2xl border border-gray-200 border-l-4 border-l-gray-900 shadow-xs space-y-2">
                      <h4 className="font-bold text-xs text-gray-900">
                        Photo upload only
                      </h4>
                      <p className="text-xs text-gray-600 leading-relaxed">
                        Upload your real photos directly. Properties with authentic, high-resolution photography convert guests 4x faster.
                      </p>
                    </div>

                    <div className="bg-white/80 p-4 rounded-2xl border border-gray-200 text-xs flex items-center gap-3">
                      <YoonieMascot mood="happy" size="sm" />
                      <span className="text-gray-600 text-[11px] leading-relaxed">
                        All provisioned room keys sync automatically to your 05:30 AM morning dispatch run-sheet.
                      </span>
                    </div>
                  </>
                )}

                {wizardStep === 4 && (
                  <>
                    <div className="bg-white p-5 rounded-2xl border border-gray-200 border-l-4 border-l-[#E5484D] shadow-xs space-y-2">
                      <h4 className="font-bold text-xs text-gray-900">
                        Ancillary revenue
                      </h4>
                      <p className="text-xs text-gray-600 leading-relaxed">
                        Offering scooter rentals, floating breakfast, or island tours adds 20–35% direct revenue to room reservations.
                      </p>
                    </div>

                    <div className="bg-white p-5 rounded-2xl border border-gray-200 border-l-4 border-l-gray-900 shadow-xs space-y-2">
                      <h4 className="font-bold text-xs text-gray-900">
                        Completely optional
                      </h4>
                      <p className="text-xs text-gray-600 leading-relaxed">
                        Not every property has extra services. Click &apos;Skip this step&apos; below if you only sell accommodation. You can add items later anytime.
                      </p>
                    </div>
                  </>
                )}

                {wizardStep === 5 && (
                  <>
                    <div className="bg-white p-5 rounded-2xl border border-gray-200 border-l-4 border-l-emerald-600 shadow-xs space-y-2">
                      <h4 className="font-bold text-xs text-gray-900">
                        Direct Booking Active
                      </h4>
                      <p className="text-xs text-gray-600 leading-relaxed">
                        Your dedicated guest website is live at <span className="font-mono text-gray-900">{(createdWorkspace?.slug || form.slug)}.{activeRootDomain}</span>.
                      </p>
                    </div>

                    <div className="bg-white/80 p-4 rounded-2xl border border-gray-200 text-xs flex items-center gap-3">
                      <YoonieMascot mood="happy" size="sm" />
                      <span className="text-gray-600 text-[11px] leading-relaxed">
                        Setup complete! You can dispatch drivers, assign housekeeping, and inspect rooms from the Ops Hub.
                      </span>
                    </div>
                  </>
                )}
              </aside>
            </div>
          </div>
        </div>
      )}

      {/* ─── Skip Warning Modal ───────────────────────────────────────────── */}
      {skipWarning.isOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in-0">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-gray-200 space-y-4 text-gray-900">
            <div className="text-center space-y-2">
              <div className="mx-auto flex justify-center">
                <YoonieMascot
                  mood="worried"
                  size="md"
                  message="Wait! Are you sure you want to skip configuring room keys?"
                />
              </div>
              <h4 className="text-base font-extrabold text-gray-900 pt-1">
                Skip Room Key Creation?
              </h4>
              <p className="text-xs text-gray-500 leading-relaxed">
                A property needs at least one room key or space configured for guests to check in and book. You can configure this later in the Central Ops Hub.
              </p>
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                onClick={confirmSkipRooms}
                variant="outline"
                className="flex-1 text-xs font-semibold text-gray-600 border-gray-200 hover:bg-gray-50"
              >
                Skip Anyway
              </Button>
              <Button
                onClick={() => setSkipWarning({ isOpen: false, type: "ROOMS" })}
                className="flex-1 text-xs font-bold bg-gray-900 hover:bg-black text-white"
              >
                Keep Setting Up
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
