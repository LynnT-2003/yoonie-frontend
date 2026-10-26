/* eslint-disable @next/next/no-img-element */
"use client";

import * as React from "react";
import {
  AlertTriangle,
  ArrowRight,
  Bed,
  Car,
  Check,
  CheckCircle2,
  Clock,
  Compass,
  ExternalLink,
  Globe,
  Lock,
  Percent,
  Plane,
  Plus,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Users,
  Waves,
  Key,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, Input, InputAffix } from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { YoonieMascot } from "@/components/mascot/YoonieMascot";
import { computeGeneratedRoomKeys, LUXURY_ROOM_PHOTOS, LUXURY_EXPERIENCE_PHOTOS, type PlatformPageVm } from "../viewModel/platformPageVm";

const AVAILABLE_AMENITIES = [
  "High-Speed WiFi",
  "Air Conditioning",
  "King Bed",
  "Private Balcony",
  "Deep Soaking Tub",
  "Ocean View",
  "Breakfast Included",
  "Mini Bar",
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
              className="bg-[#28594E] hover:bg-[#1E433A] text-[#F5EBDD] font-bold text-xs shadow-sm shadow-[#28594E]/20"
            >
              Launch Your Hotel
            </Button>
          </div>
        </div>
      </header>

      {/* ─── Hero Section ───────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden px-4 pt-16 pb-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl text-center space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#28594E]/15 bg-white/60 px-3.5 py-1 text-xs font-semibold text-[#28594E] backdrop-blur-sm shadow-sm">
            <Sparkles className="size-3.5 text-[#E8A45B]" />
            <span>0% Commission Direct Guest Bookings</span>
            <span className="text-[#7A8B84]">·</span>
            <span className="text-[#7A8B84]">Zero OTA Dependence</span>
          </div>

          <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl text-[#28594E] leading-[1.1]">
            The complete operating system for independent hotels.
          </h1>

          <p className="mx-auto max-w-2xl text-base sm:text-lg text-[#7A8B84] leading-relaxed">
            Give every property its own branded direct booking engine, front-of-house
            guest concierge, and automated 05:30 operational dispatch run-sheets.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Button
              size="lg"
              onClick={() => setIsWizardOpen(true)}
              className="w-full sm:w-auto bg-[#28594E] hover:bg-[#1E433A] text-[#F5EBDD] font-bold text-sm px-8 shadow-md shadow-[#28594E]/20"
            >
              <Plus className="size-4 mr-2" /> Create Hotel Workspace
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => scrollTo("properties")}
              className="w-full sm:w-auto border-[#28594E]/20 text-[#28594E] hover:bg-[#28594E]/5 font-bold text-sm px-6"
            >
              Explore Live Properties
            </Button>
          </div>

          <div className="pt-8 flex items-center justify-center gap-6 text-xs text-[#7A8B84]">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="size-4 text-[#28594E]" /> Multi-Tenant Subdomain
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="size-4 text-[#28594E]" /> 05:30 Daily Dispatch Run-Sheet
            </span>
            <span className="flex items-center gap-1.5">
              <Users className="size-4 text-[#28594E]" /> Unified Guest CDP
            </span>
          </div>
        </div>
      </section>

      {/* ─── Live Properties Section ────────────────────────────────────────── */}
      <section id="properties" className="border-t border-[#28594E]/10 bg-white/50 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#E8A45B]">
                Active Subdomains
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#28594E]">
                Boutique Properties Powered by Yoonie
              </h2>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsWizardOpen(true)}
              className="text-xs font-bold border-[#28594E]/20 text-[#28594E]"
            >
              + Provision New Hotel
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {branches.map((b) => {
              const slug = b.code.toLowerCase();
              const guestUrl = getSubdomainUrl(slug);
              return (
                <Card
                  key={b._id}
                  className="overflow-hidden border-[#28594E]/15 bg-white hover:shadow-lg transition-all duration-300 flex flex-col justify-between"
                >
                  <div className="relative aspect-[16/10] bg-[#F5EBDD] overflow-hidden">
                    <img
                      src={b.heroImageUrl || "/brand/mascot/yoonie-calm.png"}
                      alt={b.name}
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute top-3 left-3 rounded-full bg-[#28594E]/80 backdrop-blur-sm px-2.5 py-1 text-[10px] font-bold text-[#F5EBDD]">
                      {(b.address as any)?.city || "Bangkok"}, {(b.address as any)?.countryCode || "TH"}
                    </div>
                  </div>

                  <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between text-xs text-[#7A8B84] mb-1">
                        <span className="font-mono text-[11px]">{b.code}</span>
                        <span>{b.currency} · {b.timezone.split("/")[1] || b.timezone}</span>
                      </div>
                      <h3 className="font-extrabold text-lg text-[#28594E] line-clamp-1">
                        {b.name}
                      </h3>
                      <p className="text-xs text-[#7A8B84] mt-1 font-mono break-all">
                        {slug}.{activeRootDomain}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-[#28594E]/10 flex items-center justify-between gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        asChild
                        className="flex-1 text-xs font-bold border-[#28594E]/20 text-[#28594E] hover:bg-[#28594E]/5"
                      >
                        <a href={guestUrl} target="_blank" rel="noopener noreferrer">
                          Direct Booking <ExternalLink className="size-3 ml-1" />
                        </a>
                      </Button>
                      <Button
                        size="sm"
                        asChild
                        className="flex-1 text-xs font-bold bg-[#28594E] hover:bg-[#1E433A] text-[#F5EBDD]"
                      >
                        <a href={getSubdomainUrl("ops")}>
                          Ops Hub <ArrowRight className="size-3 ml-1" />
                        </a>
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── Platform Architecture / Value Props ────────────────────────────── */}
      <section id="features" className="py-20 border-t border-[#28594E]/10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#E8A45B]">
              Triple-Surface Architecture
            </span>
            <h2 className="text-3xl font-extrabold text-[#28594E]">
              Built for Operators, Loved by Guests
            </h2>
            <p className="text-xs sm:text-sm text-[#7A8B84]">
              Three interconnected surfaces powered by a unified hotel data model.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-6 bg-white border-[#28594E]/15 space-y-4">
              <div className="flex size-10 items-center justify-center rounded-xl bg-[#28594E]/10 text-[#28594E]">
                <Globe className="size-5" />
              </div>
              <h3 className="font-extrabold text-base text-[#28594E]">
                1. Tenant Direct Booking
              </h3>
              <p className="text-xs text-[#7A8B84] leading-relaxed">
                Every hotel gets its own dedicated subdomain ([hotel].yoonie.app).
                Guests book rooms, dining shifts, and airport transfers directly without
                OTA commissions.
              </p>
            </Card>

            <Card className="p-6 bg-white border-[#28594E]/15 space-y-4">
              <div className="flex size-10 items-center justify-center rounded-xl bg-[#E8A45B]/15 text-[#E8A45B]">
                <Clock className="size-5" />
              </div>
              <h3 className="font-extrabold text-base text-[#28594E]">
                2. 05:30 Daily Dispatch Hub
              </h3>
              <p className="text-xs text-[#7A8B84] leading-relaxed">
                Centralized operations console at ops.yoonie.app. Every morning at 05:30,
                daily run-sheets synthesize room turnovers, transfers, and dining reservations
                into actionable frontline staff tasks.
              </p>
            </Card>

            <Card className="p-6 bg-white border-[#28594E]/15 space-y-4">
              <div className="flex size-10 items-center justify-center rounded-xl bg-[#28594E]/10 text-[#28594E]">
                <Users className="size-5" />
              </div>
              <h3 className="font-extrabold text-base text-[#28594E]">
                3. Unified Guest CDP
              </h3>
              <p className="text-xs text-[#7A8B84] leading-relaxed">
                Cross-service guest profiles keep memory of guest preferences, room notes,
                dietary restrictions, and lifetime value across multiple stays.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* ─── Pricing Section ────────────────────────────────────────────────── */}
      <section id="pricing" className="py-20 border-t border-[#28594E]/10 bg-white/40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#E8A45B]">
              Transparent Pricing
            </span>
            <h2 className="text-3xl font-extrabold text-[#28594E]">
              Zero Commissions. Flat Monthly Fee.
            </h2>
            <p className="text-xs sm:text-sm text-[#7A8B84]">
              Stop giving 18% to 25% of your gross booking value to online travel agencies.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <Card className="p-6 bg-white border-[#28594E]/15 space-y-5">
              <div>
                <span className="text-xs font-bold text-[#7A8B84]">Boutique</span>
                <div className="text-3xl font-extrabold text-[#28594E] mt-1">
                  $99<span className="text-xs text-[#7A8B84] font-normal"> / mo</span>
                </div>
                <p className="text-xs text-[#7A8B84] mt-1">
                  Up to 20 rooms & suites. Full direct booking engine.
                </p>
              </div>
              <ul className="text-xs space-y-2.5 text-[#303A36]">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="size-4 text-[#28594E]" /> Custom [slug].yoonie.app
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="size-4 text-[#28594E]" /> 0% Commission direct bookings
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="size-4 text-[#28594E]" /> 05:30 Daily Dispatch board
                </li>
              </ul>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsWizardOpen(true)}
                className="w-full text-xs font-bold border-[#28594E]/20 text-[#28594E]"
              >
                Start 14-Day Trial
              </Button>
            </Card>

            <Card className="p-6 bg-[#28594E] text-[#F5EBDD] border-[#28594E] space-y-5 shadow-xl relative">
              <div className="absolute -top-3 right-4 rounded-full bg-[#E8A45B] px-3 py-0.5 text-[10px] font-extrabold text-[#303A36] uppercase tracking-wider">
                Most Popular
              </div>
              <div>
                <span className="text-xs font-bold text-[#F5EBDD]/70">Resort & Villas</span>
                <div className="text-3xl font-extrabold text-[#F5EBDD] mt-1">
                  $199<span className="text-xs text-[#F5EBDD]/70 font-normal"> / mo</span>
                </div>
                <p className="text-xs text-[#F5EBDD]/70 mt-1">
                  Up to 60 keys, dining shifts & tour dispatch.
                </p>
              </div>
              <ul className="text-xs space-y-2.5 text-[#F5EBDD]/90">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="size-4 text-[#E8A45B]" /> Custom CNAME domain support
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="size-4 text-[#E8A45B]" /> Frontline WhatsApp/LINE bots
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="size-4 text-[#E8A45B]" /> Guest CDP & lifetime metrics
                </li>
              </ul>
              <Button
                size="sm"
                onClick={() => setIsWizardOpen(true)}
                className="w-full text-xs font-bold bg-[#E8A45B] hover:bg-[#d6924b] text-[#303A36]"
              >
                Launch Property
              </Button>
            </Card>

            <Card className="p-6 bg-white border-[#28594E]/15 space-y-5">
              <div>
                <span className="text-xs font-bold text-[#7A8B84]">Hotel Group</span>
                <div className="text-3xl font-extrabold text-[#28594E] mt-1">
                  $399<span className="text-xs text-[#7A8B84] font-normal"> / mo</span>
                </div>
                <p className="text-xs text-[#7A8B84] mt-1">
                  Unlimited properties, central management & API access.
                </p>
              </div>
              <ul className="text-xs space-y-2.5 text-[#303A36]">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="size-4 text-[#28594E]" /> Multi-property dashboard
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="size-4 text-[#28594E]" /> Custom PMS & POS webhooks
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="size-4 text-[#28594E]" /> Dedicated account concierge
                </li>
              </ul>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsWizardOpen(true)}
                className="w-full text-xs font-bold border-[#28594E]/20 text-[#28594E]"
              >
                Contact Sales
              </Button>
            </Card>
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
            Direct booking engine, master guest CDP, and frontline dispatch for boutique hotels.
          </div>
        </div>
      </footer>

      {/* ─── Full-Screen Immersive B2B Property Setup Studio ─────────────────── */}
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
                    ? "Phase 3: Master Room Suite & Physical Key Inventory"
                    : wizardStep === 6
                    ? "Phase 4: Frontline Concierge & Ancillary Experiences"
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
                { num: 5, label: "Room Keys" },
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
                      placeholder="e.g. The Siam Heritage Resort & Spa"
                      required
                      className="text-base font-medium py-3"
                    />
                  </Field>

                  <Field label="Property Classification" htmlFor="hotel-class">
                    <Select
                      value={form.classification}
                      onValueChange={(val) => setForm({ ...form, classification: val })}
                    >
                      <SelectTrigger id="hotel-class">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Boutique Luxury Resort">Boutique Luxury Resort (10 - 50 keys)</SelectItem>
                        <SelectItem value="Private Pool Villa Estate">Private Pool Villa Estate (Exclusive residences)</SelectItem>
                        <SelectItem value="Historic Heritage Hotel">Historic Heritage Hotel (Urban culture & dining)</SelectItem>
                        <SelectItem value="Eco Wellness Sanctuary">Eco Wellness Sanctuary (Spa & retreat)</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>

                  <Field
                    label="Tenant Subdomain Slug (Guest Direct Front Door)"
                    htmlFor="hotel-slug"
                    hint="Guests will book rooms and transfers directly here without OTA commission deductions."
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
                        placeholder="e.g. reservations@siamheritage.com"
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
                      placeholder="e.g. gm@siamheritage.com"
                      required
                    />
                  </Field>

                  <Field label="Master Password" htmlFor="owner-password">
                    <Input
                      id="owner-password"
                      type="password"
                      value={form.ownerPassword}
                      onChange={(e) => setForm({ ...form, ownerPassword: e.target.value })}
                      placeholder="Create a strong executive password"
                      required
                    />
                  </Field>

                  {/* Onboarding Error with Mascot */}
                  {onboardingError && (
                    <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-950 flex items-start gap-3 shadow-sm">
                      <YoonieMascot mood="worried" size="sm" />
                      <div className="space-y-1 text-xs">
                        <span className="font-bold block text-red-800">
                          Workspace Provisioning Failed
                        </span>
                        <p className="text-red-700">{onboardingError}</p>
                        <p className="text-[11px] text-red-600/90 pt-1">
                          Please verify your subdomain availability and email uniqueness.
                        </p>
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
                    disabled={isLaunching || !form.ownerEmail || !form.ownerPassword}
                    className="bg-[#28594E] hover:bg-[#1E433A] text-[#F5EBDD] font-bold px-8 py-2.5 text-xs shadow-md"
                  >
                    {isLaunching ? "Provisioning Property Entity..." : "Provision Hotel Entity 🚀"}
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
                      message="Hotel Entity Initialized! Choose how you'd like to configure your property."
                    />
                  </div>
                  <h2 className="text-3xl font-extrabold text-[#28594E]">
                    Workspace Initialized: Choose Setup Path
                  </h2>
                  <p className="text-xs text-[#7A8B84]">
                    Your hotel entity is registered in the database. Now, configure your live inventory and experiences.
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
                        Deep-dive room configuration: generate physical keys (e.g. Rooms 101–104), attach high-resolution photography, and publish airport transfers or tours for day-one direct revenue.
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
                          No, I&apos;ll Configure Manually Later
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

            {/* STEP 5: Master Room Suite & Physical Key Inventory (Deep Dive) */}
            {wizardStep === 5 && (
              <div className="space-y-6">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#E8A45B]">
                    Phase 3 · Deep Dive
                  </span>
                  <h2 className="text-3xl font-extrabold text-[#28594E] mt-1">
                    Master Room Suite & Physical Key Inventory
                  </h2>
                  <p className="text-xs text-[#7A8B84] mt-1">
                    Define your suite specifications, generate the exact physical room keys for your housekeeping board, and upload cover photography.
                  </p>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-[#28594E]/15 space-y-6 shadow-sm">
                  {/* Category Selector Tabs */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-[#28594E] block">
                      Suite Classification Archetype
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {[
                        { id: "DELUXE_BALCONY", label: "Deluxe Ocean Balcony", icon: Waves, rate: "฿4,500" },
                        { id: "POOL_VILLA", label: "Private Pool Villa", icon: Sparkles, rate: "฿9,200" },
                        { id: "STANDARD_KING", label: "Garden Executive King", icon: Bed, rate: "฿2,800" },
                      ].map((cat) => {
                        const active = deepDiveRoom.roomType === cat.id;
                        const Icon = cat.icon;
                        return (
                          <div
                            key={cat.id}
                            onClick={() => selectRoomCategoryPreset(cat.id as any)}
                            className={`cursor-pointer p-4 rounded-2xl border transition-all space-y-2 ${
                              active
                                ? "bg-[#28594E]/5 border-[#28594E] ring-2 ring-[#28594E]/20"
                                : "bg-white/60 border-[#28594E]/15 hover:bg-white"
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="size-8 rounded-xl bg-[#28594E]/10 flex items-center justify-center text-[#28594E]">
                                <Icon className="size-4" />
                              </div>
                              {active && <Check className="size-4 text-[#28594E]" />}
                            </div>
                            <div className="font-extrabold text-xs text-[#28594E]">{cat.label}</div>
                            <div className="text-[11px] font-bold text-[#E8A45B]">
                              {cat.rate} <span className="font-normal text-[#7A8B84]">/ night</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Suite Specifications Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field label="Suite Display Name" htmlFor="suite-title">
                      <Input
                        id="suite-title"
                        value={deepDiveRoom.title}
                        onChange={(e) =>
                          setDeepDiveRoom((prev) => ({ ...prev, title: e.target.value }))
                        }
                        placeholder="e.g. Deluxe Ocean Balcony Suite"
                        required
                      />
                    </Field>

                    <Field label="Nightly Base Rack Rate (THB ฿)" htmlFor="suite-rate">
                      <Input
                        id="suite-rate"
                        type="number"
                        value={deepDiveRoom.baseRateThb}
                        onChange={(e) =>
                          setDeepDiveRoom((prev) => ({
                            ...prev,
                            baseRateThb: Number(e.target.value) || 0,
                          }))
                        }
                        required
                      />
                    </Field>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Field label="Room Dimensions (sqm)" htmlFor="suite-area">
                      <Input
                        id="suite-area"
                        type="number"
                        value={deepDiveRoom.areaSqm}
                        onChange={(e) =>
                          setDeepDiveRoom((prev) => ({
                            ...prev,
                            areaSqm: Number(e.target.value) || 0,
                          }))
                        }
                        placeholder="48"
                      />
                    </Field>

                    <Field label="Max Adult Guests" htmlFor="suite-adults">
                      <Input
                        id="suite-adults"
                        type="number"
                        min={1}
                        max={10}
                        value={deepDiveRoom.maxAdults}
                        onChange={(e) =>
                          setDeepDiveRoom((prev) => ({
                            ...prev,
                            maxAdults: Number(e.target.value) || 1,
                          }))
                        }
                      />
                    </Field>

                    <Field label="Bedding Configuration" htmlFor="suite-bed">
                      <Input
                        id="suite-bed"
                        value={deepDiveRoom.bedConfig}
                        onChange={(e) =>
                          setDeepDiveRoom((prev) => ({ ...prev, bedConfig: e.target.value }))
                        }
                        placeholder="1 King Bed"
                      />
                    </Field>
                  </div>

                  {/* Physical Key Inventory Generation */}
                  <div className="p-5 rounded-2xl bg-[#F5EBDD]/60 border border-[#28594E]/15 space-y-4">
                    <div>
                      <h4 className="font-extrabold text-sm text-[#28594E] flex items-center gap-2">
                        <Key className="size-4 text-[#E8A45B]" /> Physical Room Keys to Provision
                      </h4>
                      <p className="text-xs text-[#7A8B84] mt-0.5">
                        Specify how many individual rooms of this category you operate, and the starting room number.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <Field label="Number of Room Keys (Quantity)" htmlFor="key-count">
                        <Input
                          id="key-count"
                          type="number"
                          min={1}
                          max={20}
                          value={deepDiveRoom.keyCount}
                          onChange={(e) =>
                            setDeepDiveRoom((prev) => ({
                              ...prev,
                              keyCount: Math.max(1, parseInt(e.target.value, 10) || 1),
                            }))
                          }
                          required
                        />
                      </Field>

                      <Field label="Starting Room Number" htmlFor="start-number">
                        <Input
                          id="start-number"
                          value={deepDiveRoom.startRoomNumber}
                          onChange={(e) =>
                            setDeepDiveRoom((prev) => ({ ...prev, startRoomNumber: e.target.value }))
                          }
                          placeholder="e.g. 101 or PV1"
                          required
                        />
                      </Field>

                      <Field label="Floor Level" htmlFor="room-floor">
                        <Input
                          id="room-floor"
                          type="number"
                          min={1}
                          max={99}
                          value={deepDiveRoom.floor}
                          onChange={(e) =>
                            setDeepDiveRoom((prev) => ({
                              ...prev,
                              floor: parseInt(e.target.value, 10) || 1,
                            }))
                          }
                        />
                      </Field>
                    </div>

                    {/* Live Generated Keys Badges */}
                    <div className="space-y-1.5 pt-1">
                      <span className="text-[11px] font-bold text-[#28594E] block">
                        Generated PMS Inventory Keys ({deepDiveRoom.keyCount} Keys):
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {computeGeneratedRoomKeys(deepDiveRoom.startRoomNumber, deepDiveRoom.keyCount).map((k) => (
                          <span
                            key={k}
                            className="px-3 py-1 rounded-xl bg-white border border-[#28594E]/20 text-xs font-mono font-bold text-[#28594E] shadow-2xs"
                          >
                            Room {k}
                          </span>
                        ))}
                      </div>
                      <p className="text-[11px] text-[#7A8B84] pt-1">
                        Yoonie will insert individual room documents into MongoDB for housekeeping status tracking and live dispatch.
                      </p>
                    </div>
                  </div>

                  {/* High-Resolution Cover Photography */}
                  <div className="space-y-3">
                    <label className="text-xs font-bold text-[#28594E] block">
                      Suite Cover Photography & Imagery
                    </label>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                      <div className="aspect-[16/10] rounded-2xl bg-black/5 overflow-hidden border border-[#28594E]/15 relative">
                        <img
                          src={deepDiveRoom.coverImage || LUXURY_ROOM_PHOTOS[0].url}
                          alt="Cover Preview"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute bottom-2 left-2 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-sm text-[10px] font-bold text-white">
                          Live Cover Preview
                        </div>
                      </div>

                      <div className="space-y-3 text-xs">
                        <p className="text-[#7A8B84]">
                          Select from luxury curated presets or upload your own high-resolution hotel photo.
                        </p>
                        <div className="grid grid-cols-2 gap-2">
                          {LUXURY_ROOM_PHOTOS.map((p, idx) => (
                            <button
                              key={p.url}
                              type="button"
                              onClick={() => setDeepDiveRoom((prev) => ({ ...prev, coverImage: p.url }))}
                              className={`p-2 rounded-xl border text-left transition-all text-[11px] truncate ${
                                deepDiveRoom.coverImage === p.url
                                  ? "bg-[#28594E] text-[#F5EBDD] font-bold border-[#28594E]"
                                  : "bg-white/80 border-[#28594E]/15 text-[#28594E] hover:bg-white"
                              }`}
                            >
                              Preset {idx + 1}: {p.title}
                            </button>
                          ))}
                        </div>

                        <div className="pt-2">
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
                            className="text-xs text-[#7A8B84] file:mr-2 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-[#28594E] file:text-[#F5EBDD] hover:file:bg-[#1E433A]"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Amenities */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-[#28594E] block">
                      Suite Features & Amenities
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        "High-Speed Fiber WiFi",
                        "Air Conditioning",
                        "King Bed",
                        "Private Balcony",
                        "Deep Soaking Tub",
                        "Mini Bar",
                        "Espresso Machine",
                        "In-room Safe",
                        "Smart TV",
                        "Marshall Sound System",
                        "Luxury Linens",
                        "Rain Shower",
                      ].map((amenity) => {
                        const active = deepDiveRoom.amenities.includes(amenity);
                        return (
                          <button
                            key={amenity}
                            type="button"
                            onClick={() => toggleAmenity(amenity)}
                            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                              active
                                ? "bg-[#28594E] text-[#F5EBDD] shadow-sm"
                                : "bg-white/70 text-[#28594E] border border-[#28594E]/15 hover:bg-white"
                            }`}
                          >
                            {amenity} {active && "✓"}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Error if any */}
                  {guidedRoomError && (
                    <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 flex items-start gap-3">
                      <YoonieMascot mood="worried" size="sm" />
                      <div className="space-y-1 text-xs">
                        <span className="font-bold block text-amber-800">Room Provisioning Issue</span>
                        <p className="text-amber-700">{guidedRoomError}</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex justify-between pt-2">
                  <Button
                    variant="ghost"
                    onClick={triggerSkipRooms}
                    className="text-xs font-semibold text-[#7A8B84] hover:text-[#28594E]"
                  >
                    Skip Room Creation
                  </Button>
                  <Button
                    onClick={handleProvisionRoomKeys}
                    disabled={isCreatingRoom || !deepDiveRoom.startRoomNumber}
                    className="bg-[#28594E] hover:bg-[#1E433A] text-[#F5EBDD] font-bold px-8 py-2.5 text-xs shadow-md"
                  >
                    {isCreatingRoom
                      ? `Provisioning ${deepDiveRoom.keyCount} Keys in Database...`
                      : `Provision ${deepDiveRoom.keyCount} Room Keys & Continue →`}
                  </Button>
                </div>
              </div>
            )}

            {/* STEP 6: Frontline Guest Experiences & Concierge (Deep Dive) */}
            {wizardStep === 6 && (
              <div className="space-y-6">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#E8A45B]">
                    Phase 4 · Deep Dive
                  </span>
                  <h2 className="text-3xl font-extrabold text-[#28594E] mt-1">
                    Frontline Guest Experiences & Concierge
                  </h2>
                  <p className="text-xs text-[#7A8B84] mt-1">
                    Add direct-revenue excursions and chauffeured airport pickups that guests can book alongside their stay.
                  </p>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-[#28594E]/15 space-y-6 shadow-sm">
                  {/* Category Selector Tabs */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-[#28594E] block">
                      Experience Category
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {[
                        { id: "TRANSFER", label: "VIP Airport Transfer", icon: Car, rate: "฿1,200" },
                        { id: "TOUR", label: "Sunset Longtail Cruise", icon: Waves, rate: "฿2,500" },
                        { id: "WELLNESS", label: "Traditional Herbal Spa", icon: Sparkles, rate: "฿1,800" },
                      ].map((svc) => {
                        const active = deepDiveService.type === svc.id;
                        const Icon = svc.icon;
                        return (
                          <div
                            key={svc.id}
                            onClick={() => selectServicePreset(svc.id as any)}
                            className={`cursor-pointer p-4 rounded-2xl border transition-all space-y-2 ${
                              active
                                ? "bg-[#28594E]/5 border-[#28594E] ring-2 ring-[#28594E]/20"
                                : "bg-white/60 border-[#28594E]/15 hover:bg-white"
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="size-8 rounded-xl bg-[#28594E]/10 flex items-center justify-center text-[#28594E]">
                                <Icon className="size-4" />
                              </div>
                              {active && <Check className="size-4 text-[#28594E]" />}
                            </div>
                            <div className="font-extrabold text-xs text-[#28594E]">{svc.label}</div>
                            <div className="text-[11px] font-bold text-[#E8A45B]">
                              {svc.rate} <span className="font-normal text-[#7A8B84]">/ booking</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field label="Service / Experience Title" htmlFor="service-name">
                      <Input
                        id="service-name"
                        value={deepDiveService.name}
                        onChange={(e) =>
                          setDeepDiveService((prev) => ({ ...prev, name: e.target.value }))
                        }
                        placeholder="e.g. VIP Chauffeured Airport Transfer"
                        required
                      />
                    </Field>

                    <Field label="Internal Tracking Code" htmlFor="service-code">
                      <Input
                        id="service-code"
                        value={deepDiveService.code}
                        onChange={(e) =>
                          setDeepDiveService((prev) => ({
                            ...prev,
                            code: e.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, ""),
                          }))
                        }
                        required
                      />
                    </Field>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field label="Retail Base Price (THB ฿)" htmlFor="service-price">
                      <Input
                        id="service-price"
                        type="number"
                        value={deepDiveService.basePriceThb}
                        onChange={(e) =>
                          setDeepDiveService((prev) => ({
                            ...prev,
                            basePriceThb: Number(e.target.value) || 0,
                          }))
                        }
                        required
                      />
                    </Field>

                    <Field label="Pricing Model" htmlFor="service-model">
                      <Select
                        value={deepDiveService.pricingModel}
                        onValueChange={(val: any) =>
                          setDeepDiveService((prev) => ({ ...prev, pricingModel: val }))
                        }
                      >
                        <SelectTrigger id="service-model">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="PER_PAX">Per Guest / Passenger (PER_PAX)</SelectItem>
                          <SelectItem value="PER_VEHICLE">Per Vehicle / Trip (PER_VEHICLE)</SelectItem>
                          <SelectItem value="PER_TREATMENT">Per Session / Treatment (PER_TREATMENT)</SelectItem>
                        </SelectContent>
                      </Select>
                    </Field>
                  </div>

                  {/* Operational Details based on kind */}
                  {deepDiveService.kind === "AIRPORT_TRANSFER" && (
                    <div className="p-4 rounded-2xl bg-[#F5EBDD]/60 border border-[#28594E]/15 space-y-3">
                      <span className="font-bold text-xs text-[#28594E] block">
                        Airport Transfer Dispatch Configuration
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                        <Field label="Airport Code" htmlFor="airport-code">
                          <Input
                            id="airport-code"
                            value={deepDiveService.airportCode}
                            onChange={(e) =>
                              setDeepDiveService((prev) => ({
                                ...prev,
                                airportCode: e.target.value.toUpperCase(),
                              }))
                            }
                          />
                        </Field>
                        <Field label="Vehicle Plate Number" htmlFor="fleet-plate">
                          <Input
                            id="fleet-plate"
                            value={deepDiveService.fleetPlate}
                            onChange={(e) =>
                              setDeepDiveService((prev) => ({ ...prev, fleetPlate: e.target.value }))
                            }
                          />
                        </Field>
                        <Field label="Dispatch Lead Time (mins)" htmlFor="lead-time">
                          <Input
                            id="lead-time"
                            type="number"
                            value={deepDiveService.leadTimeMin}
                            onChange={(e) =>
                              setDeepDiveService((prev) => ({
                                ...prev,
                                leadTimeMin: Number(e.target.value) || 60,
                              }))
                            }
                          />
                        </Field>
                      </div>
                    </div>
                  )}

                  {/* High-Resolution Cover Photography */}
                  <div className="space-y-3">
                    <label className="text-xs font-bold text-[#28594E] block">
                      Experience Photography
                    </label>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                      <div className="aspect-[16/10] rounded-2xl bg-black/5 overflow-hidden border border-[#28594E]/15 relative">
                        <img
                          src={deepDiveService.coverImage || LUXURY_EXPERIENCE_PHOTOS[0].url}
                          alt="Cover Preview"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute bottom-2 left-2 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-sm text-[10px] font-bold text-white">
                          Live Cover Preview
                        </div>
                      </div>

                      <div className="space-y-3 text-xs">
                        <p className="text-[#7A8B84]">
                          Choose from curated luxury experience photography or upload a custom image.
                        </p>
                        <div className="space-y-1.5">
                          {LUXURY_EXPERIENCE_PHOTOS.map((p, idx) => (
                            <button
                              key={p.url}
                              type="button"
                              onClick={() => setDeepDiveService((prev) => ({ ...prev, coverImage: p.url }))}
                              className={`w-full p-2 rounded-xl border text-left transition-all text-[11px] truncate block ${
                                deepDiveService.coverImage === p.url
                                  ? "bg-[#28594E] text-[#F5EBDD] font-bold border-[#28594E]"
                                  : "bg-white/80 border-[#28594E]/15 text-[#28594E] hover:bg-white"
                              }`}
                            >
                              Preset {idx + 1}: {p.title}
                            </button>
                          ))}
                        </div>

                        <div className="pt-2">
                          <label className="block text-[11px] font-bold text-[#28594E] mb-1">
                            Upload Custom Photo
                          </label>
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
                      </div>
                    </div>
                  </div>

                  {/* Error if any */}
                  {guidedServiceError && (
                    <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 flex items-start gap-3">
                      <YoonieMascot mood="worried" size="sm" />
                      <div className="space-y-1 text-xs">
                        <span className="font-bold block text-amber-800">Experience Creation Issue</span>
                        <p className="text-amber-700">{guidedServiceError}</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex justify-between pt-2">
                  <Button
                    variant="ghost"
                    onClick={triggerSkipService}
                    className="text-xs font-semibold text-[#7A8B84] hover:text-[#28594E]"
                  >
                    Skip Experience Creation
                  </Button>
                  <Button
                    onClick={handlePublishExperience}
                    disabled={isCreatingService || !deepDiveService.name}
                    className="bg-[#28594E] hover:bg-[#1E433A] text-[#F5EBDD] font-bold px-8 py-2.5 text-xs shadow-md"
                  >
                    {isCreatingService ? "Publishing Experience in Database..." : "Publish Experience & Review Setup →"}
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
                      message="All systems operational! Your hotel workspace is live and bookable."
                    />
                  </div>
                  <h2 className="text-3xl font-extrabold text-[#28594E]">
                    {createdWorkspace.name} is Production-Ready
                  </h2>
                  <p className="text-xs text-[#7A8B84]">
                    All hotel entities, physical room keys, and guest services are provisioned in the live database. Verify your inventory below before launch.
                  </p>
                </div>

                {/* Property Identity Card */}
                <div className="bg-white p-5 rounded-2xl border border-[#28594E]/15 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                  <div>
                    <span className="text-[#7A8B84] block text-[11px]">Property Code</span>
                    <span className="font-mono font-bold text-[#28594E] text-sm">{createdWorkspace.code}</span>
                  </div>
                  <div>
                    <span className="text-[#7A8B84] block text-[11px]">Operating Currency</span>
                    <span className="font-bold text-[#28594E] text-sm">{form.currency}</span>
                  </div>
                  <div>
                    <span className="text-[#7A8B84] block text-[11px]">Operating Timezone</span>
                    <span className="font-bold text-[#28594E] text-sm">{form.timezone.split("/")[1] || form.timezone}</span>
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

                {/* Frontline Experiences Verification Table */}
                <div className="bg-white p-6 rounded-3xl border border-[#28594E]/15 space-y-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-extrabold text-sm text-[#28594E] flex items-center gap-2">
                        <Sparkles className="size-4 text-[#E8A45B]" /> Published Ancillary Experiences ({createdServices.length} Active)
                      </h4>
                      <p className="text-xs text-[#7A8B84] mt-0.5">
                        Transfers and activities published for upfront booking alongside room reservations.
                      </p>
                    </div>
                    {createdServices.length > 0 ? (
                      <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold flex items-center gap-1.5">
                        <CheckCircle2 className="size-3.5 text-emerald-600" /> {createdServices.length} Published
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-xs font-medium">
                        No experiences configured
                      </span>
                    )}
                  </div>

                  {createdServices.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="border-b border-[#28594E]/10 text-[#7A8B84]">
                            <th className="py-2.5 font-bold">Experience Title</th>
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
                    <p className="text-xs text-[#7A8B84]">No tours or airport transfers configured yet.</p>
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
                      ? "Wait! A hotel cannot take reservations without physical room keys!"
                      : "Wait! Guest transfers & tours account for 35% of direct revenue!"
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
                  ? "Without setting up room types and physical inventory keys, guests visiting your direct booking site will find an empty catalog with zero bookable dates. OTAs will continue taking 25% commissions. We strongly recommend configuring at least one room category now."
                  : skipWarning.type === "ROOMS"
                  ? "Physical room keys are required for the housekeeping run-sheet and guest reservations. Skipping now means your property will remain unbookable until you manually create keys in the Ops Hub."
                  : "Boutique hotel guests expect seamless airport pickups and concierge excursions upon booking their stay. You can always add more services later in the Ops Hub."}
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
