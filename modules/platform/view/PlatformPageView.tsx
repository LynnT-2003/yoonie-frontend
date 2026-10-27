/* eslint-disable @next/next/no-img-element */
"use client";

import * as React from "react";
import {
  AlertTriangle,
  ArrowRight,
  Bed,
  Check,
  CheckCircle2,
  Clock,
  Compass,
  ExternalLink,
  Globe,
  Home,
  ImageIcon,
  Key,
  Layers,
  Lock,
  Percent,
  Plus,
  ShieldCheck,
  Sparkles,
  Tag,
  Trash2,
  TrendingUp,
  Users,
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
    handleLaunchWorkspace,
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
    triggerSkipGuidance,
    confirmSkipGuidance,
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

      {/* ─── Full-Screen Immersive Property Setup Studio ─────────────────── */}
      {isWizardOpen && (
        <div className="fixed inset-0 z-50 bg-[#F5EBDD] flex flex-col overflow-y-auto animate-in fade-in-0 duration-200 text-[#303A36]">
          {/* Executive Top Navigation Bar */}
          <header className="sticky top-0 z-40 border-b border-[#28594E]/10 bg-[#F5EBDD]/95 backdrop-blur-md px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src="/brand/mascot/yoonie-calm.png"
                alt="Yoonie"
                className="size-8 object-contain"
              />
              <div>
                <span className="font-extrabold text-sm tracking-tight text-[#28594E] block">
                  yoonie <span className="text-[#E8A45B]">·</span> property setup studio
                </span>
                <span className="text-[11px] text-[#7A8B84] block font-medium">
                  {wizardStep <= 3
                    ? "Phase 1: Property Foundation & General Manager Account"
                    : wizardStep === 4
                    ? "Phase 2: Concierge Guidance Decision"
                    : wizardStep === 5
                    ? "Phase 3: Space & Room Setup"
                    : wizardStep === 6
                    ? "Phase 4: Guest Experiences & Add-on Services"
                    : "Phase 5: Executive Audit & Production Launch"}
                </span>
              </div>
            </div>

            {/* Step Progress Pills */}
            <div className="hidden lg:flex items-center gap-2">
              {[
                { num: 1, label: "Identity" },
                { num: 2, label: "Operations" },
                { num: 3, label: "Executive" },
                { num: 4, label: "Guidance" },
                { num: 5, label: "Rooms" },
                { num: 6, label: "Experiences" },
                { num: 7, label: "Launch" },
              ].map((s) => (
                <div
                  key={s.num}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                    wizardStep === s.num
                      ? "bg-[#28594E] text-[#F5EBDD] shadow-sm"
                      : wizardStep > s.num
                      ? "bg-[#28594E]/10 text-[#28594E]"
                      : "bg-black/5 text-[#7A8B84]"
                  }`}
                >
                  <span>{s.num}.</span>
                  <span>{s.label}</span>
                  {wizardStep > s.num && <Check className="size-3 text-[#28594E]" />}
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={resetWizard}
                className="text-xs font-semibold text-[#7A8B84] hover:text-[#28594E]"
              >
                <X className="size-4 mr-1" /> Exit Setup
              </Button>
            </div>
          </header>

          {/* Main Immersive Canvas */}
          <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-10 space-y-8">
            {/* STEP 1: Property Foundation & Domain */}
            {wizardStep === 1 && (
              <div className="space-y-6">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#E8A45B]">
                    Phase 1 · Step 1 of 3
                  </span>
                  <h2 className="text-3xl font-extrabold text-[#28594E] mt-1">
                    Property Identity & Custom Subdomain
                  </h2>
                  <p className="text-xs text-[#7A8B84] mt-1">
                    Every property powered by Yoonie operates on its own dedicated tenant direct booking subdomain with 0% commission fees.
                  </p>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-[#28594E]/15 space-y-5 shadow-sm">
                  <Field label="Property Full Name" htmlFor="hotel-name">
                    <Input
                      id="hotel-name"
                      value={form.hotelName}
                      onChange={(e) => handleHotelNameChange(e.target.value)}
                      placeholder="e.g. Sedona Heritage Resort or The Pool House"
                      required
                      className="text-base font-medium py-3"
                    />
                  </Field>

                  <Field
                    label="Tenant Subdomain Slug (Guest Direct Front Door)"
                    htmlFor="hotel-slug"
                    hint="Guests will book rooms and add-ons directly here without OTA commission deductions."
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

                  <div className="p-4 rounded-2xl bg-[#F5EBDD]/60 border border-[#28594E]/10 text-xs flex items-center gap-3">
                    <YoonieMascot mood="checking" size="sm" />
                    <div>
                      <span className="font-bold text-[#28594E] block">
                        Live Subdomain Destination:
                      </span>
                      <span className="font-mono text-[#E8A45B] text-sm">
                        {getSubdomainUrl(form.slug || "yourhotel")}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <Button
                    onClick={() => setWizardStep(2)}
                    disabled={!form.hotelName || !form.slug}
                    className="bg-[#28594E] hover:bg-[#1E433A] text-[#F5EBDD] font-bold px-8 py-2.5 text-xs shadow-md"
                  >
                    Continue to Operations →
                  </Button>
                </div>
              </div>
            )}

            {/* STEP 2: Operations, Currency & Front-Desk Channels */}
            {wizardStep === 2 && (
              <div className="space-y-6">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#E8A45B]">
                    Phase 1 · Step 2 of 3
                  </span>
                  <h2 className="text-3xl font-extrabold text-[#28594E] mt-1">
                    Operational Rules, Currency & Fiscal Settings
                  </h2>
                  <p className="text-xs text-[#7A8B84] mt-1">
                    Define how your room rates, local taxes, front desk communication, and morning housekeeping runs operate.
                  </p>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-[#28594E]/15 space-y-5 shadow-sm">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field label="Operating City / Region" htmlFor="hotel-city">
                      <Input
                        id="hotel-city"
                        value={form.city}
                        onChange={(e) => setForm({ ...form, city: e.target.value })}
                        placeholder="e.g. Bangkok"
                        required
                      />
                    </Field>
                    <Field label="Country Code (ISO 3166-1)" htmlFor="hotel-country">
                      <Input
                        id="hotel-country"
                        value={form.country}
                        onChange={(e) => setForm({ ...form, country: e.target.value.toUpperCase() })}
                        placeholder="TH"
                        maxLength={2}
                        required
                      />
                    </Field>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field label="Base Operating Currency" htmlFor="hotel-currency">
                      <Select
                        value={form.currency}
                        onValueChange={(val) => setForm({ ...form, currency: val })}
                      >
                        <SelectTrigger id="hotel-currency">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="THB">THB (฿) — Thai Baht</SelectItem>
                          <SelectItem value="USD">USD ($) — US Dollar</SelectItem>
                          <SelectItem value="SGD">SGD (S$) — Singapore Dollar</SelectItem>
                          <SelectItem value="EUR">EUR (€) — Euro</SelectItem>
                        </SelectContent>
                      </Select>
                    </Field>

                    <Field label="Property Timezone" htmlFor="hotel-tz">
                      <Select
                        value={form.timezone}
                        onValueChange={(val) => setForm({ ...form, timezone: val })}
                      >
                        <SelectTrigger id="hotel-tz">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Asia/Bangkok">Asia/Bangkok (UTC+7)</SelectItem>
                          <SelectItem value="Asia/Singapore">Asia/Singapore (UTC+8)</SelectItem>
                          <SelectItem value="Asia/Tokyo">Asia/Tokyo (UTC+9)</SelectItem>
                        </SelectContent>
                      </Select>
                    </Field>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field label="Reservations & Front Desk Email" htmlFor="hotel-email">
                      <Input
                        id="hotel-email"
                        type="email"
                        value={form.contactEmail}
                        onChange={(e) => setForm({ ...form, contactEmail: e.target.value })}
                        placeholder="e.g. stay@sedonahotel.example"
                        required
                      />
                    </Field>
                    <Field label="24/7 Frontline Phone (E.164)" htmlFor="hotel-phone">
                      <Input
                        id="hotel-phone"
                        type="tel"
                        value={form.contactPhone}
                        onChange={(e) => setForm({ ...form, contactPhone: e.target.value })}
                        placeholder="+66812345678"
                        required
                      />
                    </Field>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#F5EBDD]/60 border border-[#28594E]/10 text-xs flex items-start gap-3">
                    <Clock className="size-4 text-[#28594E] shrink-0 mt-0.5" />
                    <div className="space-y-0.5">
                      <span className="font-bold text-[#28594E] block">
                        Standard Operational Rules Applied:
                      </span>
                      <p className="text-[#7A8B84]">
                        Check-in at 14:00, Check-out at 12:00. The frontline Daily Dispatch Run-Sheet automatically compiles every morning at 05:30 property time.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between pt-2">
                  <Button
                    variant="ghost"
                    onClick={() => setWizardStep(1)}
                    className="text-xs font-semibold text-[#7A8B84]"
                  >
                    ← Back to Identity
                  </Button>
                  <Button
                    onClick={() => setWizardStep(3)}
                    disabled={!form.city || !form.country || !form.contactEmail}
                    className="bg-[#28594E] hover:bg-[#1E433A] text-[#F5EBDD] font-bold px-8 py-2.5 text-xs shadow-md"
                  >
                    Continue to Executive Sign-in →
                  </Button>
                </div>
              </div>
            )}

            {/* STEP 3: General Manager Master Executive Account */}
            {wizardStep === 3 && (
              <div className="space-y-6">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#E8A45B]">
                    Phase 1 · Step 3 of 3
                  </span>
                  <h2 className="text-3xl font-extrabold text-[#28594E] mt-1">
                    General Manager Master Account
                  </h2>
                  <p className="text-xs text-[#7A8B84] mt-1">
                    This founding credential will hold master administrative privileges in the Central Operations Hub (ops.yoonie.app).
                  </p>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-[#28594E]/15 space-y-5 shadow-sm">
                  <Field label="General Manager / Founding Owner Full Name" htmlFor="owner-name">
                    <Input
                      id="owner-name"
                      value={form.ownerName}
                      onChange={(e) => setForm({ ...form, ownerName: e.target.value })}
                      placeholder="e.g. Lynn Tan"
                      required
                      className="text-base font-medium py-3"
                    />
                  </Field>

                  <Field
                    label="Executive Work Email (for ops.yoonie.app login)"
                    htmlFor="owner-email"
                    hint="Your primary login for managing room assignments, staff accounts, and daily dispatch."
                  >
                    <Input
                      id="owner-email"
                      type="email"
                      value={form.ownerEmail}
                      onChange={(e) => setForm({ ...form, ownerEmail: e.target.value })}
                      placeholder="e.g. lynn@sedonahotel.example"
                      required
                    />
                  </Field>

                  <Field
                    label="Master Account Password"
                    htmlFor="owner-pass"
                    hint="Minimum 8 characters with at least one number."
                  >
                    <Input
                      id="owner-pass"
                      type="password"
                      value={form.ownerPassword}
                      onChange={(e) => setForm({ ...form, ownerPassword: e.target.value })}
                      required
                    />
                  </Field>

                  {/* Error Mascot if Onboarding Fails */}
                  {onboardingError && (
                    <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 flex items-start gap-3">
                      <YoonieMascot mood="worried" size="sm" />
                      <div className="space-y-1 text-xs">
                        <span className="font-bold block text-amber-800">
                          Workspace Provisioning Halted
                        </span>
                        <p className="text-amber-700">{onboardingError}</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex justify-between pt-2">
                  <Button
                    variant="ghost"
                    onClick={() => setWizardStep(2)}
                    className="text-xs font-semibold text-[#7A8B84]"
                  >
                    ← Back to Operations
                  </Button>
                  <Button
                    onClick={handleLaunchWorkspace}
                    disabled={isLaunching || !form.ownerName || !form.ownerEmail || !form.ownerPassword}
                    className="bg-[#28594E] hover:bg-[#1E433A] text-[#F5EBDD] font-bold px-8 py-2.5 text-xs shadow-md"
                  >
                    {isLaunching ? "Provisioning Workspace..." : "Create Property Workspace →"}
                  </Button>
                </div>
              </div>
            )}

            {/* STEP 4: Executive Guidance Decision Gate */}
            {wizardStep === 4 && (
              <div className="space-y-6">
                <div className="text-center max-w-xl mx-auto space-y-2">
                  <div className="mx-auto flex justify-center mb-2">
                    <YoonieMascot
                      mood="happy"
                      size="md"
                      message="Hotel Entity Initialized! Choose how you would like to configure your property."
                    />
                  </div>
                  <h2 className="text-3xl font-extrabold text-[#28594E]">
                    Workspace Initialized: Choose Setup Path
                  </h2>
                  <p className="text-xs text-[#7A8B84]">
                    Your property entity is registered in the database. Now, configure your live inventory and experiences.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
                  {/* Option A: Guided Setup (Recommended) */}
                  <div
                    onClick={() => setWizardStep(5)}
                    className="cursor-pointer p-6 rounded-3xl bg-white border-2 border-[#28594E] space-y-4 hover:shadow-xl transition-all duration-300 relative text-left"
                  >
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E8A45B]/15 text-[#E8A45B] text-[10px] font-extrabold uppercase tracking-wider">
                      <Sparkles className="size-3" /> Recommended
                    </div>
                    <div className="size-12 rounded-2xl bg-[#28594E]/10 flex items-center justify-center text-[#28594E]">
                      <Key className="size-6" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-lg text-[#28594E]">
                        Yes, Guide Property Setup
                      </h3>
                      <p className="text-xs text-[#7A8B84] mt-1.5 leading-relaxed">
                        Configure room details, set up physical keys (from a single pool house to multi-room floors), attach photos, and add your custom experiences.
                      </p>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => setWizardStep(5)}
                      className="w-full bg-[#28594E] hover:bg-[#1E433A] text-[#F5EBDD] font-bold text-xs"
                    >
                      Begin Guided Setup →
                    </Button>
                  </div>

                  {/* Option B: Manual Skip */}
                  <div
                    onClick={triggerSkipGuidance}
                    className="cursor-pointer p-6 rounded-3xl bg-white/70 border border-[#28594E]/15 space-y-4 hover:bg-white hover:shadow-md transition-all duration-300 text-left flex flex-col justify-between"
                  >
                    <div className="space-y-4">
                      <div className="size-12 rounded-2xl bg-black/5 flex items-center justify-center text-[#7A8B84]">
                        <Lock className="size-6" />
                      </div>
                      <div>
                        <h3 className="font-extrabold text-lg text-[#303A36]">
                          No, I will Configure Manually Later
                        </h3>
                        <p className="text-xs text-[#7A8B84] mt-1.5 leading-relaxed">
                          Skip guided inventory setup and proceed directly to the raw Central Ops board.
                        </p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={triggerSkipGuidance}
                      className="w-full text-xs font-semibold text-[#7A8B84] border-[#28594E]/20 hover:bg-black/5"
                    >
                      Skip to Ops Board
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 5: Space & Room Setup (Clean 3-Section Stepper) */}
            {wizardStep === 5 && (
              <div className="space-y-6">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#E8A45B]">
                    Phase 3 · Space & Rooms
                  </span>
                  <h2 className="text-3xl font-extrabold text-[#28594E] mt-1">
                    Space & Room Inventory Setup
                  </h2>
                  <p className="text-xs text-[#7A8B84] mt-1">
                    Configure the spaces guests can book — whether it is an entire pool house, private villa, boutique hotel suite, or hostel dorm bed.
                  </p>
                </div>

                {/* Banner of Already Provisioned Rooms if any */}
                {createdRooms.length > 0 && (
                  <div className="p-4 rounded-2xl bg-white border border-[#28594E]/20 shadow-xs space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-extrabold text-[#28594E] flex items-center gap-1.5">
                        <CheckCircle2 className="size-4 text-emerald-600" />
                        Provisioned Spaces ({createdRooms.length} keys total in database)
                      </span>
                      <span className="text-[#7A8B84]">You can add another room type below</span>
                    </div>
                    <div className="flex flex-wrap gap-2 pt-1">
                      {createdRooms.map((r) => (
                        <span
                          key={r._id}
                          className="px-2.5 py-1 rounded-xl bg-[#28594E]/5 border border-[#28594E]/20 text-xs font-medium text-[#28594E]"
                        >
                          Room {r.roomNumber} ({r.roomType.replace(/_/g, " ")}) · ฿{(r.baseRateThb ?? 0).toLocaleString()}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#28594E]/15 space-y-8 shadow-sm">
                  {/* SECTION 1: Space Basics & Pricing */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 pb-2 border-b border-[#28594E]/10">
                      <div className="size-6 rounded-full bg-[#28594E] text-[#F5EBDD] text-xs font-bold flex items-center justify-center">
                        1
                      </div>
                      <h3 className="font-extrabold text-base text-[#28594E]">
                        Space Basics & Pricing
                      </h3>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Field label="Space / Room Title" htmlFor="room-title">
                        <Input
                          id="room-title"
                          value={roomDraft.title}
                          onChange={(e) =>
                            setRoomDraft((prev) => ({ ...prev, title: e.target.value }))
                          }
                          placeholder="e.g. Private Pool House, Beach Villa, Deluxe King Room"
                          required
                          className="text-sm font-medium"
                        />
                      </Field>

                      <Field label="Nightly Base Rate (THB ฿)" htmlFor="room-rate">
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

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <Field label="Max Adult Guests" htmlFor="room-adults">
                        <Input
                          id="room-adults"
                          type="number"
                          min={1}
                          max={20}
                          value={roomDraft.maxAdults}
                          onChange={(e) =>
                            setRoomDraft((prev) => ({
                              ...prev,
                              maxAdults: Number(e.target.value) || 1,
                            }))
                          }
                        />
                      </Field>

                      <Field label="Bedding Configuration" htmlFor="room-bed">
                        <Input
                          id="room-bed"
                          value={roomDraft.bedConfig}
                          onChange={(e) =>
                            setRoomDraft((prev) => ({ ...prev, bedConfig: e.target.value }))
                          }
                          placeholder="e.g. 1 King Bed, 2 Single Beds, Bunk Bed"
                        />
                      </Field>

                      <Field label="Room Dimensions (sqm, optional)" htmlFor="room-area">
                        <Input
                          id="room-area"
                          type="number"
                          value={roomDraft.areaSqm || ""}
                          onChange={(e) =>
                            setRoomDraft((prev) => ({
                              ...prev,
                              areaSqm: Number(e.target.value) || 0,
                            }))
                          }
                          placeholder="e.g. 45"
                        />
                      </Field>
                    </div>
                  </div>

                  {/* SECTION 2: Inventory & Keys (Single Unit vs Multi-Room) */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 pb-2 border-b border-[#28594E]/10">
                      <div className="size-6 rounded-full bg-[#28594E] text-[#F5EBDD] text-xs font-bold flex items-center justify-center">
                        2
                      </div>
                      <h3 className="font-extrabold text-base text-[#28594E]">
                        Inventory & Room Keys
                      </h3>
                    </div>

                    {/* Single Unit vs Multi-Room Toggle Cards */}
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
                        className={`cursor-pointer p-4 rounded-2xl border transition-all space-y-1.5 ${
                          roomDraft.isSingleUnit
                            ? "bg-[#28594E]/5 border-[#28594E] ring-2 ring-[#28594E]/20"
                            : "bg-white/60 border-[#28594E]/15 hover:bg-white"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 font-extrabold text-xs text-[#28594E]">
                            <Home className="size-4 text-[#E8A45B]" /> Single Unit / Entire Property
                          </div>
                          {roomDraft.isSingleUnit && <Check className="size-4 text-[#28594E]" />}
                        </div>
                        <p className="text-[11px] text-[#7A8B84]">
                          For standalone spaces like a Pool House, Private Villa, Cottage, or Penthouse.
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
                        className={`cursor-pointer p-4 rounded-2xl border transition-all space-y-1.5 ${
                          !roomDraft.isSingleUnit
                            ? "bg-[#28594E]/5 border-[#28594E] ring-2 ring-[#28594E]/20"
                            : "bg-white/60 border-[#28594E]/15 hover:bg-white"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 font-extrabold text-xs text-[#28594E]">
                            <Layers className="size-4 text-[#E8A45B]" /> Multiple Rooms / Units
                          </div>
                          {!roomDraft.isSingleUnit && <Check className="size-4 text-[#28594E]" />}
                        </div>
                        <p className="text-[11px] text-[#7A8B84]">
                          For multi-key properties, boutique hotels, or hostels with room numbers.
                        </p>
                      </div>
                    </div>

                    {/* Inputs depending on Single vs Multi */}
                    {roomDraft.isSingleUnit ? (
                      <div className="p-4 rounded-2xl bg-[#F5EBDD]/50 border border-[#28594E]/15 space-y-3">
                        <Field
                          label="Unit Identifier / Room Key Name"
                          htmlFor="single-unit-name"
                          hint="This is the exact label assigned on your housekeeping board and guest booking confirmation."
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
                            placeholder="e.g. Pool House, Villa 1, Main Cabin"
                            required
                          />
                        </Field>

                        <div className="flex items-center gap-2 pt-1 text-xs">
                          <span className="font-bold text-[#28594E]">Generated PMS Key:</span>
                          <span className="px-3 py-1 rounded-xl bg-white border border-[#28594E]/20 font-mono font-bold text-[#28594E] shadow-2xs">
                            {roomDraft.singleUnitName.trim() || roomDraft.title.trim() || "Pool House"}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 rounded-2xl bg-[#F5EBDD]/50 border border-[#28594E]/15 space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <Field label="Number of Room Keys" htmlFor="key-count">
                            <Input
                              id="key-count"
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

                          <Field label="Starting Room Number" htmlFor="start-room">
                            <Input
                              id="start-room"
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

                          <Field label="Floor Level" htmlFor="floor-level">
                            <Input
                              id="floor-level"
                              type="number"
                              value={roomDraft.floor}
                              onChange={(e) =>
                                setRoomDraft((prev) => ({
                                  ...prev,
                                  floor: Number(e.target.value) || 1,
                                }))
                              }
                            />
                          </Field>
                        </div>

                        {/* Generated Keys Badges */}
                        <div className="space-y-1 pt-1">
                          <span className="text-[11px] font-bold text-[#28594E] block">
                            Generated PMS Keys ({currentGeneratedKeys.length} Keys):
                          </span>
                          <div className="flex flex-wrap gap-2">
                            {currentGeneratedKeys.map((k) => (
                              <span
                                key={k}
                                className="px-3 py-1 rounded-xl bg-white border border-[#28594E]/20 text-xs font-mono font-bold text-[#28594E] shadow-2xs"
                              >
                                Room {k}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* SECTION 3: Photography & Amenities */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 pb-2 border-b border-[#28594E]/10">
                      <div className="size-6 rounded-full bg-[#28594E] text-[#F5EBDD] text-xs font-bold flex items-center justify-center">
                        3
                      </div>
                      <h3 className="font-extrabold text-base text-[#28594E]">
                        Photography & Amenities
                      </h3>
                    </div>

                    {/* Photo upload and URL input */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                      <div className="aspect-[16/10] rounded-2xl bg-black/5 overflow-hidden border border-[#28594E]/15 relative">
                        <img
                          src={
                            roomDraft.coverImage ||
                            "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1600&q=80"
                          }
                          alt="Cover Preview"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute bottom-2 left-2 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-sm text-[10px] font-bold text-white">
                          Live Cover Preview
                        </div>
                      </div>

                      <div className="space-y-3 text-xs">
                        <div>
                          <label className="block text-[11px] font-bold text-[#28594E] mb-1">
                            Upload Custom Photo
                          </label>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) void handleUploadImageFile(file, "room");
                            }}
                            className="text-xs text-[#7A8B84] file:mr-2 file:py-1.5 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-[#28594E] file:text-[#F5EBDD] hover:file:bg-[#1E433A]"
                          />
                        </div>

                        <div>
                          <Field label="Or Enter Photo Image URL" htmlFor="room-image-url">
                            <Input
                              id="room-image-url"
                              value={roomDraft.coverImage}
                              onChange={(e) =>
                                setRoomDraft((prev) => ({
                                  ...prev,
                                  coverImage: e.target.value,
                                }))
                              }
                              placeholder="https://..."
                              className="text-xs"
                            />
                          </Field>
                        </div>
                      </div>
                    </div>

                    {/* Amenities Tag Input & Essentials */}
                    <div className="space-y-3 pt-2">
                      <label className="text-xs font-bold text-[#28594E] block">
                        Features & Amenities
                      </label>

                      {/* Quick toggles */}
                      <div className="flex flex-wrap gap-2">
                        {ESSENTIAL_AMENITIES.map((amenity) => {
                          const active = roomDraft.amenities.includes(amenity);
                          return (
                            <button
                              key={amenity}
                              type="button"
                              onClick={() => toggleAmenity(amenity)}
                              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                                active
                                  ? "bg-[#28594E] text-[#F5EBDD] shadow-sm"
                                  : "bg-white text-[#28594E] border border-[#28594E]/20 hover:bg-[#28594E]/5"
                              }`}
                            >
                              {amenity} {active && "✓"}
                            </button>
                          );
                        })}
                      </div>

                      {/* Custom Amenity Adder */}
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
                          placeholder="Type custom amenity (e.g. BBQ Grill, Sea View) and press Enter"
                          className="text-xs max-w-md"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => addCustomAmenity(customAmenityInput)}
                          className="text-xs font-bold border-[#28594E]/20 text-[#28594E] shrink-0"
                        >
                          <Plus className="size-3.5 mr-1" /> Add
                        </Button>
                      </div>

                      {/* Active Tag Chips */}
                      {roomDraft.amenities.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {roomDraft.amenities.map((item) => (
                            <span
                              key={item}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#28594E]/10 text-xs font-semibold text-[#28594E]"
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
                  </div>

                  {/* Error if any */}
                  {guidedRoomError && (
                    <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 flex items-start gap-3">
                      <YoonieMascot mood="worried" size="sm" />
                      <div className="space-y-1 text-xs">
                        <span className="font-bold block text-amber-800">
                          Room Provisioning Issue
                        </span>
                        <p className="text-amber-700">{guidedRoomError}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Bottom Action Bar */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                  <Button
                    variant="ghost"
                    onClick={triggerSkipRooms}
                    className="text-xs font-semibold text-[#7A8B84] hover:text-[#28594E]"
                  >
                    Skip Room Creation
                  </Button>

                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <Button
                      variant="outline"
                      onClick={() => handleProvisionRoomKeys(true)}
                      disabled={isCreatingRoom || !roomDraft.title}
                      className="text-xs font-bold border-[#28594E]/25 text-[#28594E] hover:bg-[#28594E]/5 flex-1 sm:flex-initial"
                    >
                      <Plus className="size-3.5 mr-1" /> Save & Add Another Space
                    </Button>

                    <Button
                      onClick={() => handleProvisionRoomKeys(false)}
                      disabled={isCreatingRoom || !roomDraft.title}
                      className="bg-[#28594E] hover:bg-[#1E433A] text-[#F5EBDD] font-bold px-8 py-2.5 text-xs shadow-md flex-1 sm:flex-initial"
                    >
                      {isCreatingRoom
                        ? "Provisioning Keys in Database..."
                        : `Provision ${currentGeneratedKeys.length} Keys & Continue →`}
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 6: Custom Experiences & Add-on Services */}
            {wizardStep === 6 && (
              <div className="space-y-6">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#E8A45B]">
                    Phase 4 · Experiences & Add-ons
                  </span>
                  <h2 className="text-3xl font-extrabold text-[#28594E] mt-1">
                    Guest Experiences & Add-on Services
                  </h2>
                  <p className="text-xs text-[#7A8B84] mt-1">
                    Offer extra services like scooter rentals, floating breakfast, kayak hire, guided tours, or airport pickup. Add as many as you like, or skip if you only offer accommodation.
                  </p>
                </div>

                <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#28594E]/15 space-y-6 shadow-sm">
                  {/* Inline Form to Add a Custom Experience */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between pb-2 border-b border-[#28594E]/10">
                      <h3 className="font-extrabold text-sm text-[#28594E] flex items-center gap-2">
                        <Plus className="size-4 text-[#E8A45B]" /> Add an Experience or Add-on Service
                      </h3>
                      <span className="text-[11px] text-[#7A8B84]">
                        Fully customizable for any property type
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Field label="Experience / Service Title" htmlFor="exp-name">
                        <Input
                          id="exp-name"
                          value={experienceDraft.name}
                          onChange={(e) =>
                            setExperienceDraft((prev) => ({ ...prev, name: e.target.value }))
                          }
                          placeholder="e.g. Scooter Rental (125cc), Floating Pool Breakfast, Kayak Tour"
                          className="text-sm font-medium"
                        />
                      </Field>

                      <div className="grid grid-cols-2 gap-3">
                        <Field label="Price (THB ฿)" htmlFor="exp-price">
                          <Input
                            id="exp-price"
                            type="number"
                            value={experienceDraft.basePriceThb}
                            onChange={(e) =>
                              setExperienceDraft((prev) => ({
                                ...prev,
                                totalPriceThb: Number(e.target.value) || 0,
                                basePriceThb: Number(e.target.value) || 0,
                              }))
                            }
                          />
                        </Field>

                        <Field label="Pricing Unit" htmlFor="exp-model">
                          <Select
                            value={experienceDraft.pricingModel}
                            onValueChange={(val: any) =>
                              setExperienceDraft((prev) => ({ ...prev, pricingModel: val }))
                            }
                          >
                            <SelectTrigger id="exp-model">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="PER_PAX">Per Guest / Person</SelectItem>
                              <SelectItem value="PER_VEHICLE">Per Item / Rental</SelectItem>
                              <SelectItem value="PER_TREATMENT">Per Booking / Stay</SelectItem>
                            </SelectContent>
                          </Select>
                        </Field>
                      </div>
                    </div>

                    <Field
                      label="Short Description (optional)"
                      htmlFor="exp-desc"
                      hint="Details for guest direct booking confirmations."
                    >
                      <Input
                        id="exp-desc"
                        value={experienceDraft.description}
                        onChange={(e) =>
                          setExperienceDraft((prev) => ({
                            ...prev,
                            description: e.target.value,
                          }))
                        }
                        placeholder="e.g. Includes helmet and 24-hr rental, or fresh tropical fruit breakfast served at your villa"
                      />
                    </Field>

                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) void handleUploadImageFile(file, "service");
                          }}
                          className="text-xs text-[#7A8B84] file:mr-2 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-[#28594E] file:text-[#F5EBDD] hover:file:bg-[#1E433A]"
                        />
                      </div>

                      <Button
                        type="button"
                        onClick={addExperienceToList}
                        disabled={!experienceDraft.name.trim()}
                        className="bg-[#28594E] hover:bg-[#1E433A] text-[#F5EBDD] font-bold text-xs px-6 py-2 shadow-sm w-full sm:w-auto"
                      >
                        <Plus className="size-3.5 mr-1" /> Add Experience to Property
                      </Button>
                    </div>
                  </div>

                  {/* List of Added Custom Experiences */}
                  <div className="space-y-3 pt-3 border-t border-[#28594E]/10">
                    <span className="font-extrabold text-xs text-[#28594E] block">
                      Configured Property Experiences ({customExperiences.length} Items):
                    </span>

                    {customExperiences.length === 0 ? (
                      <div className="p-5 rounded-2xl bg-[#F5EBDD]/40 border border-[#28594E]/10 text-xs text-[#7A8B84] text-center">
                        No extra experiences added yet. Fill in the form above and click &ldquo;Add Experience&rdquo;, or skip if you only offer accommodation.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {customExperiences.map((item) => (
                          <div
                            key={item.id}
                            className="p-4 rounded-2xl bg-white border border-[#28594E]/15 shadow-xs flex items-start justify-between gap-3"
                          >
                            <div className="space-y-1">
                              <h4 className="font-extrabold text-sm text-[#28594E]">
                                {item.name}
                              </h4>
                              <div className="text-xs font-bold text-[#E8A45B]">
                                ฿{item.basePriceThb.toLocaleString()}{" "}
                                <span className="font-normal text-[#7A8B84]">
                                  / {item.pricingModel === "PER_PAX" ? "guest" : item.pricingModel === "PER_VEHICLE" ? "item / rental" : "booking"}
                                </span>
                              </div>
                              {item.description && (
                                <p className="text-[11px] text-[#7A8B84] line-clamp-2">
                                  {item.description}
                                </p>
                              )}
                            </div>

                            <button
                              type="button"
                              onClick={() => removeExperienceFromList(item.id)}
                              className="text-red-500 hover:text-red-700 p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                              title="Remove item"
                            >
                              <Trash2 className="size-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Error if any */}
                  {guidedServiceError && (
                    <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 flex items-start gap-3">
                      <YoonieMascot mood="worried" size="sm" />
                      <div className="space-y-1 text-xs">
                        <span className="font-bold block text-amber-800">
                          Experience Creation Issue
                        </span>
                        <p className="text-amber-700">{guidedServiceError}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Bottom Navigation */}
                <div className="flex justify-between pt-2">
                  <Button
                    variant="ghost"
                    onClick={() => setWizardStep(7)}
                    className="text-xs font-semibold text-[#7A8B84] hover:text-[#28594E]"
                  >
                    Skip Experiences — Accommodation Only
                  </Button>
                  <Button
                    onClick={handlePublishAllExperiences}
                    disabled={isCreatingService}
                    className="bg-[#28594E] hover:bg-[#1E433A] text-[#F5EBDD] font-bold px-8 py-2.5 text-xs shadow-md"
                  >
                    {isCreatingService
                      ? "Publishing in Database..."
                      : customExperiences.length > 0 || experienceDraft.name.trim()
                      ? `Save Experiences & Review Launch (${customExperiences.length + (experienceDraft.name.trim() ? 1 : 0)}) →`
                      : "Continue to Launch Verification →"}
                  </Button>
                </div>
              </div>
            )}

            {/* STEP 7: Executive Audit, Verification & Live Launch */}
            {wizardStep === 7 && createdWorkspace && (
              <div className="space-y-6">
                <div className="text-center max-w-xl mx-auto space-y-2">
                  <div className="mx-auto flex justify-center mb-2">
                    <YoonieMascot
                      mood="happy"
                      size="md"
                      message="All systems operational! Your property workspace is live and bookable."
                    />
                  </div>
                  <h2 className="text-3xl font-extrabold text-[#28594E]">
                    {createdWorkspace.name} is Production-Ready
                  </h2>
                  <p className="text-xs text-[#7A8B84]">
                    All property entities, physical room keys, and guest services are provisioned in the live database. Verify your inventory below before launch.
                  </p>
                </div>

                {/* Property Identity Card */}
                <div className="bg-white p-5 rounded-2xl border border-[#28594E]/15 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                  <div>
                    <span className="text-[#7A8B84] block text-[11px]">Property Code</span>
                    <span className="font-mono font-bold text-[#28594E] text-sm">
                      {createdWorkspace.code}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#7A8B84] block text-[11px]">Operating Currency</span>
                    <span className="font-bold text-[#28594E] text-sm">{form.currency}</span>
                  </div>
                  <div>
                    <span className="text-[#7A8B84] block text-[11px]">Operating Timezone</span>
                    <span className="font-bold text-[#28594E] text-sm">
                      {form.timezone.split("/")[1] || form.timezone}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#7A8B84] block text-[11px]">General Manager</span>
                    <span className="font-bold text-[#28594E] text-sm">{form.ownerName}</span>
                  </div>
                </div>

                {/* Master Room Inventory Verification Table */}
                <div className="bg-white p-6 rounded-3xl border border-[#28594E]/15 space-y-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-extrabold text-sm text-[#28594E] flex items-center gap-2">
                        <Bed className="size-4 text-[#28594E]" /> Master Room Inventory ({createdRooms.length} Physical Keys)
                      </h4>
                      <p className="text-xs text-[#7A8B84] mt-0.5">
                        Physical keys configured for live housekeeping management and guest reservations.
                      </p>
                    </div>
                    {createdRooms.length > 0 ? (
                      <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold flex items-center gap-1.5">
                        <CheckCircle2 className="size-3.5 text-emerald-600" /> {createdRooms.length} Keys Active
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold">
                        ⚠️ 0 Keys (Catalog Empty)
                      </span>
                    )}
                  </div>

                  {createdRooms.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="border-b border-[#28594E]/10 text-[#7A8B84]">
                            <th className="py-2.5 font-bold">Room / Key #</th>
                            <th className="py-2.5 font-bold">Category</th>
                            <th className="py-2.5 font-bold">Floor</th>
                            <th className="py-2.5 font-bold">Nightly Rate</th>
                            <th className="py-2.5 font-bold">Max Guests</th>
                            <th className="py-2.5 font-bold">PMS Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#28594E]/5">
                          {createdRooms.map((r) => (
                            <tr key={r._id} className="hover:bg-black/2 transition-colors">
                              <td className="py-2.5 font-mono font-bold text-[#28594E]">Room {r.roomNumber}</td>
                              <td className="py-2.5 font-medium">{r.roomType.replace(/_/g, " ")}</td>
                              <td className="py-2.5 text-[#7A8B84]">Floor {r.floor}</td>
                              <td className="py-2.5 font-bold text-[#E8A45B]">฿ {(r.baseRateThb ?? 0).toLocaleString()}</td>
                              <td className="py-2.5">{r.maxOccupancy} Guests</td>
                              <td className="py-2.5">
                                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                                  <span className="size-1.5 rounded-full bg-emerald-500" /> Active (Clean)
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200 text-xs text-amber-900 flex items-center gap-3">
                      <YoonieMascot mood="worried" size="sm" />
                      <span>No room keys provisioned yet. Guests will see &ldquo;Rooms Opening Soon&rdquo; on your direct website.</span>
                    </div>
                  )}
                </div>

                {/* Experiences Verification Table */}
                <div className="bg-white p-6 rounded-3xl border border-[#28594E]/15 space-y-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-extrabold text-sm text-[#28594E] flex items-center gap-2">
                        <Sparkles className="size-4 text-[#E8A45B]" /> Published Experiences & Add-ons ({createdServices.length} Active)
                      </h4>
                      <p className="text-xs text-[#7A8B84] mt-0.5">
                        Excursions, rentals, and services published for upfront direct booking alongside room reservations.
                      </p>
                    </div>
                    {createdServices.length > 0 ? (
                      <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold flex items-center gap-1.5">
                        <CheckCircle2 className="size-3.5 text-emerald-600" /> {createdServices.length} Published
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-xs font-medium">
                        No extra experiences configured
                      </span>
                    )}
                  </div>

                  {createdServices.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="border-b border-[#28594E]/10 text-[#7A8B84]">
                            <th className="py-2.5 font-bold">Service / Add-on</th>
                            <th className="py-2.5 font-bold">Code</th>
                            <th className="py-2.5 font-bold">Category</th>
                            <th className="py-2.5 font-bold">Retail Price</th>
                            <th className="py-2.5 font-bold">Pricing Model</th>
                            <th className="py-2.5 font-bold">Dispatch Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#28594E]/5">
                          {createdServices.map((s) => (
                            <tr key={s._id} className="hover:bg-black/2 transition-colors">
                              <td className="py-2.5 font-extrabold text-[#28594E]">{s.name}</td>
                              <td className="py-2.5 font-mono text-[#7A8B84]">{s.code}</td>
                              <td className="py-2.5 font-medium">{s.category}</td>
                              <td className="py-2.5 font-bold text-[#E8A45B]">฿ {(s.basePriceThb ?? 0).toLocaleString()}</td>
                              <td className="py-2.5 text-[#7A8B84]">{s.pricingModel}</td>
                              <td className="py-2.5">
                                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                                  <span className="size-1.5 rounded-full bg-emerald-500" /> Active in Dispatch
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-xs text-[#7A8B84]">Accommodation only — no extra add-on services configured.</p>
                  )}
                </div>

                {/* Dual Launch Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="p-5 rounded-3xl bg-white border border-[#28594E]/15 space-y-3 shadow-sm">
                    <span className="font-extrabold text-sm text-[#28594E] flex items-center gap-2">
                      <Globe className="size-4" /> Guest Direct Booking Engine
                    </span>
                    <p className="text-xs text-[#7A8B84] leading-relaxed">
                      Your branded direct booking engine is live. Share this URL with your guests to capture 0% commission direct bookings.
                    </p>
                    <Button
                      size="sm"
                      variant="outline"
                      asChild
                      className="w-full text-xs font-bold border-[#28594E]/20 text-[#28594E] hover:bg-[#28594E]/5"
                    >
                      <a href={getSubdomainUrl(createdWorkspace.slug)} target="_blank" rel="noopener noreferrer">
                        Open {createdWorkspace.slug}.{activeRootDomain} <ExternalLink className="size-3.5 ml-1.5" />
                      </a>
                    </Button>
                  </div>

                  <div className="p-5 rounded-3xl bg-[#28594E] text-[#F5EBDD] space-y-3 shadow-md">
                    <span className="font-extrabold text-sm text-[#F5EBDD] flex items-center gap-2">
                      <Lock className="size-4 text-[#E8A45B]" /> Central Operations Hub
                    </span>
                    <p className="text-xs text-[#F5EBDD]/80 leading-relaxed">
                      Manage the 05:30 Daily Dispatch Run-Sheet, Housekeeping Board, staff mobile credentials, and guest CDP.
                    </p>
                    <Button
                      size="sm"
                      asChild
                      className="w-full text-xs font-bold bg-[#E8A45B] hover:bg-[#d6924b] text-[#303A36]"
                    >
                      <a href={getSubdomainUrl("ops", "/ops/rooms")}>
                        Enter Ops Hub <ArrowRight className="size-3.5 ml-1.5" />
                      </a>
                    </Button>
                  </div>
                </div>

                <div className="pt-4 text-center">
                  <Button
                    size="lg"
                    onClick={resetWizard}
                    className="bg-[#28594E] hover:bg-[#1E433A] text-[#F5EBDD] font-bold px-10 text-xs shadow-md"
                  >
                    Done & Exit Setup Studio
                  </Button>
                </div>
              </div>
            )}
          </main>
        </div>
      )}

      {/* ─── Mascot Skip Warning Modal ───────────────────────────────────────── */}
      {skipWarning.isOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in-0">
          <div className="w-full max-w-md rounded-3xl bg-[#F5EBDD] p-6 shadow-2xl border border-[#28594E]/20 space-y-5 text-[#303A36]">
            <div className="text-center space-y-2">
              <div className="mx-auto flex justify-center">
                <YoonieMascot
                  mood="worried"
                  size="md"
                  message={
                    skipWarning.type === "GUIDANCE"
                      ? "Wait! Skipping setup leaves your guest direct booking site completely empty!"
                      : skipWarning.type === "ROOMS"
                      ? "Wait! A property cannot take reservations without physical room keys!"
                      : "Wait! Extra guest services account for valuable direct revenue!"
                  }
                />
              </div>
              <h4 className="text-lg font-extrabold text-[#28594E] pt-2">
                {skipWarning.type === "GUIDANCE"
                  ? "Skip Guided Inventory Setup?"
                  : skipWarning.type === "ROOMS"
                  ? "Skip Creating Physical Room Keys?"
                  : "Skip Frontline Concierge Experiences?"}
              </h4>
              <p className="text-xs text-[#7A8B84] leading-relaxed">
                {skipWarning.type === "GUIDANCE"
                  ? "Without setting up room spaces and inventory keys, guests visiting your direct booking site will find an empty catalog with zero bookable dates. We strongly recommend configuring at least one space now."
                  : skipWarning.type === "ROOMS"
                  ? "Physical room keys are required for the housekeeping run-sheet and guest reservations. Skipping now means your property will remain unbookable until you manually create keys in the Ops Hub."
                  : "Guests love booking extras like scooter rentals, breakfast baskets, or island tours directly alongside their stay. You can always add more services later in the Ops Hub."}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 pt-2">
              <Button
                onClick={() => {
                  if (skipWarning.type === "GUIDANCE") confirmSkipGuidance();
                  else if (skipWarning.type === "ROOMS") confirmSkipRooms();
                  else confirmSkipService();
                }}
                variant="outline"
                className="order-2 sm:order-1 flex-1 text-xs font-semibold text-[#7A8B84] border-[#28594E]/20 hover:bg-black/5"
              >
                Skip Anyway
              </Button>
              <Button
                onClick={() => setSkipWarning({ isOpen: false, type: skipWarning.type })}
                className="order-1 sm:order-2 flex-1 text-xs font-bold bg-[#28594E] hover:bg-[#1E433A] text-[#F5EBDD]"
              >
                {skipWarning.type === "GUIDANCE"
                  ? "Return to Guided Setup"
                  : skipWarning.type === "ROOMS"
                  ? "Keep Configuring Keys"
                  : "Keep Adding Experience"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
