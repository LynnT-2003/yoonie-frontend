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
import type { PlatformPageVm } from "../viewModel/platformPageVm";

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

      {/* ─── Onboarding Wizard Dialog: "Create Hotel Workspace" ──────────────── */}
      <Dialog open={isWizardOpen} onOpenChange={setIsWizardOpen}>
        <DialogContent size="lg" className="bg-[#F5EBDD] border-[#28594E]/15 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#E8A45B] bg-[#E8A45B]/15 px-2 py-0.5 rounded-full">
                {wizardStep <= 3
                  ? `Step ${wizardStep} of 3 · Setup`
                  : wizardStep === 4
                  ? "Guided Inventory · Step 1 of 2"
                  : wizardStep === 5
                  ? "Guided Experiences · Step 2 of 2"
                  : "Workspace Provisioned 🚀"}
              </span>
            </div>
            <DialogTitle className="font-extrabold text-2xl text-[#28594E]">
              {wizardStep === 1
                ? "Register Hotel Workspace"
                : wizardStep === 2
                ? "Operational Details & Location"
                : wizardStep === 3
                ? "Owner Account Credentials"
                : wizardStep === 4
                ? "Add Your First Room Suite"
                : wizardStep === 5
                ? "Add Guest Experiences & Tours"
                : `${createdWorkspace?.name || "Workspace"} is Live!`}
            </DialogTitle>
            <DialogDescription className="text-xs text-[#7A8B84]">
              {wizardStep === 1
                ? "Choose your property name and custom Yoonie subdomain."
                : wizardStep === 2
                ? "Configure your currency, timezone, and official contact channels."
                : wizardStep === 3
                ? "Create your owner sign-in to manage the hotel in ops.yoonie.app."
                : wizardStep === 4
                ? "Pick an Apple-inspired suite preset or customize your first bookable room."
                : wizardStep === 5
                ? "Offer seamless airport transfers, island cruises, or wellness packages."
                : "Your hotel direct-channel booking engine and ops portal are fully provisioned."}
            </DialogDescription>
          </DialogHeader>

          <DialogBody className="space-y-4 pt-2">
            {/* STEP 1: Hotel Name & Subdomain */}
            {wizardStep === 1 && (
              <div className="space-y-4">
                <Field label="Hotel Name" htmlFor="hotel-name">
                  <Input
                    id="hotel-name"
                    value={form.hotelName}
                    onChange={(e) => handleHotelNameChange(e.target.value)}
                    placeholder="e.g. Sedona Hotel & Resort"
                    required
                  />
                </Field>

                <Field
                  label="Subdomain Slug (Guest Digital Front Door)"
                  htmlFor="hotel-slug"
                  hint="This is where your guests will book directly without OTA fees."
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

                <div className="p-3.5 rounded-xl bg-white/80 border border-[#28594E]/10 text-xs flex items-center gap-3">
                  <YoonieMascot mood="checking" size="sm" />
                  <div>
                    <span className="font-bold text-[#28594E] block">
                      Subdomain Live Preview:
                    </span>
                    <span className="font-mono text-[#E8A45B]">
                      {getSubdomainUrl(form.slug || "yourhotel")}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: Location & Operations */}
            {wizardStep === 2 && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <Field label="City / Location" htmlFor="hotel-city">
                    <Input
                      id="hotel-city"
                      value={form.city}
                      onChange={(e) => setForm({ ...form, city: e.target.value })}
                      placeholder="e.g. Bangkok"
                      required
                    />
                  </Field>
                  <Field label="Country Code" htmlFor="hotel-country">
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

                <div className="grid grid-cols-2 gap-3">
                  <Field label="Operating Currency" htmlFor="hotel-currency">
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

                  <Field label="Timezone" htmlFor="hotel-tz">
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

                <div className="grid grid-cols-2 gap-3">
                  <Field label="Contact Email" htmlFor="hotel-email">
                    <Input
                      id="hotel-email"
                      type="email"
                      value={form.contactEmail}
                      onChange={(e) => setForm({ ...form, contactEmail: e.target.value })}
                      required
                    />
                  </Field>
                  <Field label="Contact Phone" htmlFor="hotel-phone">
                    <Input
                      id="hotel-phone"
                      type="tel"
                      value={form.contactPhone}
                      onChange={(e) => setForm({ ...form, contactPhone: e.target.value })}
                      required
                    />
                  </Field>
                </div>
              </div>
            )}

            {/* STEP 3: Owner Account */}
            {wizardStep === 3 && (
              <div className="space-y-4">
                <Field label="Owner / General Manager Name" htmlFor="owner-name">
                  <Input
                    id="owner-name"
                    value={form.ownerName}
                    onChange={(e) => setForm({ ...form, ownerName: e.target.value })}
                    placeholder="e.g. Lynn Tan"
                    required
                  />
                </Field>

                <Field label="Work Email (for ops.yoonie.app login)" htmlFor="owner-email">
                  <Input
                    id="owner-email"
                    type="email"
                    value={form.ownerEmail}
                    onChange={(e) => setForm({ ...form, ownerEmail: e.target.value })}
                    placeholder="e.g. lynn@yourhotel.com"
                    required
                  />
                </Field>

                <Field label="Password" htmlFor="owner-password">
                  <Input
                    id="owner-password"
                    type="password"
                    value={form.ownerPassword}
                    onChange={(e) => setForm({ ...form, ownerPassword: e.target.value })}
                    placeholder="Create a secure password"
                    required
                  />
                </Field>

                {/* Mascot Error Callout on Failure */}
                {onboardingError && (
                  <div className="p-4 rounded-2xl bg-red-50/90 border border-red-200 text-red-950 flex items-start gap-3 shadow-sm">
                    <YoonieMascot mood="worried" size="sm" />
                    <div className="space-y-1 text-xs">
                      <span className="font-bold block text-red-800">
                        Workspace Provisioning Failed
                      </span>
                      <p className="text-red-700">{onboardingError}</p>
                      <p className="text-[11px] text-red-600/90 pt-1">
                        Please check if the subdomain or email is already taken.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* STEP 4: Guided Step 1 - Add First Room Suite */}
            {wizardStep === 4 && (
              <div className="space-y-5">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#E8A45B]">
                    Instant Inventory Presets
                  </span>
                  <p className="text-xs text-[#7A8B84] mt-0.5">
                    Select a curated suite preset or customize the fields below.
                  </p>
                </div>

                {/* Apple-style Preset Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Preset 1: Standard King */}
                  <div
                    onClick={() => selectRoomPreset("STANDARD_KING")}
                    className={`cursor-pointer rounded-2xl p-4 border transition-all text-left space-y-2 ${
                      guidedRoom.roomType === "STANDARD_KING"
                        ? "bg-white border-[#28594E] ring-2 ring-[#28594E]/20 shadow-sm"
                        : "bg-white/60 border-[#28594E]/15 hover:bg-white/90"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="size-8 rounded-xl bg-[#28594E]/10 flex items-center justify-center text-[#28594E]">
                        <Bed className="size-4" />
                      </div>
                      {guidedRoom.roomType === "STANDARD_KING" && (
                        <div className="size-5 rounded-full bg-[#28594E] text-[#F5EBDD] flex items-center justify-center">
                          <Check className="size-3" />
                        </div>
                      )}
                    </div>
                    <div>
                      <h4 className="font-extrabold text-xs text-[#28594E]">Standard King</h4>
                      <p className="text-[11px] text-[#7A8B84]">1 King Bed · 32 sqm</p>
                    </div>
                    <div className="pt-1 text-xs font-bold text-[#E8A45B]">
                      ฿ 2,800 <span className="text-[10px] font-normal text-[#7A8B84]">/ night</span>
                    </div>
                  </div>

                  {/* Preset 2: Deluxe Balcony */}
                  <div
                    onClick={() => selectRoomPreset("DELUXE_BALCONY")}
                    className={`cursor-pointer rounded-2xl p-4 border transition-all text-left space-y-2 ${
                      guidedRoom.roomType === "DELUXE_BALCONY"
                        ? "bg-white border-[#28594E] ring-2 ring-[#28594E]/20 shadow-sm"
                        : "bg-white/60 border-[#28594E]/15 hover:bg-white/90"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="size-8 rounded-xl bg-[#28594E]/10 flex items-center justify-center text-[#28594E]">
                        <Waves className="size-4" />
                      </div>
                      {guidedRoom.roomType === "DELUXE_BALCONY" && (
                        <div className="size-5 rounded-full bg-[#28594E] text-[#F5EBDD] flex items-center justify-center">
                          <Check className="size-3" />
                        </div>
                      )}
                    </div>
                    <div>
                      <h4 className="font-extrabold text-xs text-[#28594E]">Deluxe Balcony</h4>
                      <p className="text-[11px] text-[#7A8B84]">Balcony & Tub · 48 sqm</p>
                    </div>
                    <div className="pt-1 text-xs font-bold text-[#E8A45B]">
                      ฿ 4,500 <span className="text-[10px] font-normal text-[#7A8B84]">/ night</span>
                    </div>
                  </div>

                  {/* Preset 3: Pool Villa */}
                  <div
                    onClick={() => selectRoomPreset("POOL_VILLA")}
                    className={`cursor-pointer rounded-2xl p-4 border transition-all text-left space-y-2 ${
                      guidedRoom.roomType === "POOL_VILLA"
                        ? "bg-white border-[#28594E] ring-2 ring-[#28594E]/20 shadow-sm"
                        : "bg-white/60 border-[#28594E]/15 hover:bg-white/90"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="size-8 rounded-xl bg-[#28594E]/10 flex items-center justify-center text-[#28594E]">
                        <Sparkles className="size-4" />
                      </div>
                      {guidedRoom.roomType === "POOL_VILLA" && (
                        <div className="size-5 rounded-full bg-[#28594E] text-[#F5EBDD] flex items-center justify-center">
                          <Check className="size-3" />
                        </div>
                      )}
                    </div>
                    <div>
                      <h4 className="font-extrabold text-xs text-[#28594E]">Pool Villa</h4>
                      <p className="text-[11px] text-[#7A8B84]">Plunge Pool · 85 sqm</p>
                    </div>
                    <div className="pt-1 text-xs font-bold text-[#E8A45B]">
                      ฿ 9,200 <span className="text-[10px] font-normal text-[#7A8B84]">/ night</span>
                    </div>
                  </div>
                </div>

                {/* Customized Attributes */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <Field label="Room Number / Identifier" htmlFor="room-number">
                    <Input
                      id="room-number"
                      value={guidedRoom.roomNumber}
                      onChange={(e) =>
                        setGuidedRoom((prev) => ({ ...prev, roomNumber: e.target.value }))
                      }
                      placeholder="e.g. 101 or Villa A"
                      required
                    />
                  </Field>

                  <Field label="Base Nightly Rate (THB)" htmlFor="room-rate">
                    <Input
                      id="room-rate"
                      type="number"
                      value={guidedRoom.baseRateThb}
                      onChange={(e) =>
                        setGuidedRoom((prev) => ({
                          ...prev,
                          baseRateThb: Number(e.target.value) || 0,
                        }))
                      }
                      placeholder="e.g. 2800"
                      required
                    />
                  </Field>

                  <Field label="Max Occupancy" htmlFor="room-occupancy">
                    <Input
                      id="room-occupancy"
                      type="number"
                      min={1}
                      max={8}
                      value={guidedRoom.maxOccupancy}
                      onChange={(e) =>
                        setGuidedRoom((prev) => ({
                          ...prev,
                          maxOccupancy: Number(e.target.value) || 1,
                        }))
                      }
                      required
                    />
                  </Field>
                </div>

                {/* Amenities Selection Pills */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[#28594E]">
                    Suite Amenities & Features
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {AVAILABLE_AMENITIES.map((amenity) => {
                      const active = guidedRoom.amenities.includes(amenity);
                      return (
                        <button
                          key={amenity}
                          type="button"
                          onClick={() => toggleRoomAmenity(amenity)}
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

                {/* Error Callout if any */}
                {guidedRoomError && (
                  <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 flex items-start gap-3">
                    <YoonieMascot mood="worried" size="sm" />
                    <div className="space-y-1 text-xs">
                      <span className="font-bold block text-amber-800">Room Creation Issue</span>
                      <p className="text-amber-700">{guidedRoomError}</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* STEP 5: Guided Step 2 - Add First Experience / Tour */}
            {wizardStep === 5 && (
              <div className="space-y-5">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#E8A45B]">
                    Guest Experience & Tour Presets
                  </span>
                  <p className="text-xs text-[#7A8B84] mt-0.5">
                    Upsell transfers and local adventures alongside room reservations.
                  </p>
                </div>

                {/* Apple-style Preset Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Preset 1: VIP Transfer */}
                  <div
                    onClick={() => selectServicePreset("TRANSFER")}
                    className={`cursor-pointer rounded-2xl p-4 border transition-all text-left space-y-2 ${
                      guidedService.type === "TRANSFER"
                        ? "bg-white border-[#28594E] ring-2 ring-[#28594E]/20 shadow-sm"
                        : "bg-white/60 border-[#28594E]/15 hover:bg-white/90"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="size-8 rounded-xl bg-[#28594E]/10 flex items-center justify-center text-[#28594E]">
                        <Car className="size-4" />
                      </div>
                      {guidedService.type === "TRANSFER" && (
                        <div className="size-5 rounded-full bg-[#28594E] text-[#F5EBDD] flex items-center justify-center">
                          <Check className="size-3" />
                        </div>
                      )}
                    </div>
                    <div>
                      <h4 className="font-extrabold text-xs text-[#28594E]">VIP Airport Pickup</h4>
                      <p className="text-[11px] text-[#7A8B84]">Mercedes / Alphard chauffeured</p>
                    </div>
                    <div className="pt-1 text-xs font-bold text-[#E8A45B]">
                      ฿ 1,200 <span className="text-[10px] font-normal text-[#7A8B84]">/ trip</span>
                    </div>
                  </div>

                  {/* Preset 2: Sunset Cruise */}
                  <div
                    onClick={() => selectServicePreset("TOUR")}
                    className={`cursor-pointer rounded-2xl p-4 border transition-all text-left space-y-2 ${
                      guidedService.type === "TOUR"
                        ? "bg-white border-[#28594E] ring-2 ring-[#28594E]/20 shadow-sm"
                        : "bg-white/60 border-[#28594E]/15 hover:bg-white/90"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="size-8 rounded-xl bg-[#28594E]/10 flex items-center justify-center text-[#28594E]">
                        <Waves className="size-4" />
                      </div>
                      {guidedService.type === "TOUR" && (
                        <div className="size-5 rounded-full bg-[#28594E] text-[#F5EBDD] flex items-center justify-center">
                          <Check className="size-3" />
                        </div>
                      )}
                    </div>
                    <div>
                      <h4 className="font-extrabold text-xs text-[#28594E]">Sunset Longtail Tour</h4>
                      <p className="text-[11px] text-[#7A8B84]">Private scenic canal voyage</p>
                    </div>
                    <div className="pt-1 text-xs font-bold text-[#E8A45B]">
                      ฿ 2,500 <span className="text-[10px] font-normal text-[#7A8B84]">/ excursion</span>
                    </div>
                  </div>

                  {/* Preset 3: Herbal Spa */}
                  <div
                    onClick={() => selectServicePreset("WELLNESS")}
                    className={`cursor-pointer rounded-2xl p-4 border transition-all text-left space-y-2 ${
                      guidedService.type === "WELLNESS"
                        ? "bg-white border-[#28594E] ring-2 ring-[#28594E]/20 shadow-sm"
                        : "bg-white/60 border-[#28594E]/15 hover:bg-white/90"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="size-8 rounded-xl bg-[#28594E]/10 flex items-center justify-center text-[#28594E]">
                        <Sparkles className="size-4" />
                      </div>
                      {guidedService.type === "WELLNESS" && (
                        <div className="size-5 rounded-full bg-[#28594E] text-[#F5EBDD] flex items-center justify-center">
                          <Check className="size-3" />
                        </div>
                      )}
                    </div>
                    <div>
                      <h4 className="font-extrabold text-xs text-[#28594E]">Thai Herbal Massage</h4>
                      <p className="text-[11px] text-[#7A8B84]">90-min aromatic compress</p>
                    </div>
                    <div className="pt-1 text-xs font-bold text-[#E8A45B]">
                      ฿ 1,800 <span className="text-[10px] font-normal text-[#7A8B84]">/ session</span>
                    </div>
                  </div>
                </div>

                {/* Custom Experience Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Field label="Service / Experience Title" htmlFor="service-name">
                    <Input
                      id="service-name"
                      value={guidedService.name}
                      onChange={(e) =>
                        setGuidedService((prev) => ({ ...prev, name: e.target.value }))
                      }
                      placeholder="e.g. VIP Airport Transfer"
                      required
                    />
                  </Field>

                  <Field label="Price (THB)" htmlFor="service-price">
                    <Input
                      id="service-price"
                      type="number"
                      value={guidedService.basePriceThb}
                      onChange={(e) =>
                        setGuidedService((prev) => ({
                          ...prev,
                          basePriceThb: Number(e.target.value) || 0,
                        }))
                      }
                      required
                    />
                  </Field>
                </div>

                {/* Error Callout if any */}
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
            )}

            {/* STEP 6: Workspace Live Celebration */}
            {wizardStep === 6 && createdWorkspace && (
              <div className="p-6 rounded-3xl bg-white border border-[#28594E]/15 text-center space-y-5">
                <div className="mx-auto flex justify-center">
                  <YoonieMascot
                    mood="happy"
                    size="md"
                    message="Congratulations! Your hotel workspace is live and bookable!"
                  />
                </div>

                <div>
                  <h3 className="font-extrabold text-2xl text-[#28594E]">
                    {createdWorkspace.name} is Ready for Guests!
                  </h3>
                  <p className="text-xs text-[#7A8B84] mt-1 max-w-md mx-auto">
                    Your hotel workspace is provisioned with real inventory. Here are your two operational access points:
                  </p>
                </div>

                {/* Inventory badges */}
                <div className="flex flex-wrap items-center justify-center gap-2 text-xs">
                  {createdRooms.length > 0 ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold">
                      <CheckCircle2 className="size-3.5 text-emerald-600" /> Room {createdRooms[0].roomNumber} ({createdRooms[0].roomType}) created
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-[11px]">
                      ⚠️ No rooms created yet (guests will see &ldquo;Rooms Opening Soon&rdquo;)
                    </span>
                  )}

                  {createdServices.length > 0 ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold">
                      <CheckCircle2 className="size-3.5 text-emerald-600" /> {createdServices[0].name} experience added
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-[11px]">
                      No tours added yet
                    </span>
                  )}
                </div>

                {/* Dual Access Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left pt-2">
                  <div className="p-4 rounded-2xl bg-[#F5EBDD]/60 border border-[#28594E]/10 space-y-2">
                    <span className="font-bold text-xs text-[#28594E] flex items-center gap-1.5">
                      <Globe className="size-3.5" /> Guest Direct Website
                    </span>
                    <p className="text-[11px] text-[#7A8B84]">
                      Direct booking engine without OTA commissions.
                    </p>
                    <Button
                      size="sm"
                      variant="outline"
                      asChild
                      className="w-full text-xs font-bold border-[#28594E]/20 text-[#28594E]"
                    >
                      <a href={getSubdomainUrl(createdWorkspace.slug)} target="_blank" rel="noopener noreferrer">
                        Open {createdWorkspace.slug}.{activeRootDomain} <ExternalLink className="size-3 ml-1" />
                      </a>
                    </Button>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#F5EBDD]/60 border border-[#28594E]/10 space-y-2">
                    <span className="font-bold text-xs text-[#28594E] flex items-center gap-1.5">
                      <Lock className="size-3.5 text-[#E8A45B]" /> Central Ops Portal
                    </span>
                    <p className="text-[11px] text-[#7A8B84]">
                      Manage rooms, dispatch run-sheets, and bookings.
                    </p>
                    <Button
                      size="sm"
                      asChild
                      className="w-full text-xs font-bold bg-[#28594E] text-[#F5EBDD]"
                    >
                      <a href={getSubdomainUrl("ops", "/ops/rooms")}>
                        Enter Ops Hub <ArrowRight className="size-3 ml-1" />
                      </a>
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </DialogBody>

          <DialogFooter className="justify-between pt-2">
            {wizardStep === 1 && (
              <>
                <Button
                  variant="ghost"
                  onClick={resetWizard}
                  className="text-xs font-bold text-[#7A8B84]"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => setWizardStep(2)}
                  disabled={!form.hotelName || !form.slug}
                  className="bg-[#28594E] hover:bg-[#1E433A] text-[#F5EBDD] font-bold text-xs"
                >
                  Continue
                </Button>
              </>
            )}

            {wizardStep === 2 && (
              <>
                <Button
                  variant="ghost"
                  onClick={() => setWizardStep(1)}
                  className="text-xs font-bold text-[#7A8B84]"
                >
                  Back
                </Button>
                <Button
                  onClick={() => setWizardStep(3)}
                  disabled={!form.city || !form.country || !form.contactEmail}
                  className="bg-[#28594E] hover:bg-[#1E433A] text-[#F5EBDD] font-bold text-xs"
                >
                  Continue
                </Button>
              </>
            )}

            {wizardStep === 3 && (
              <>
                <Button
                  variant="ghost"
                  onClick={() => setWizardStep(2)}
                  className="text-xs font-bold text-[#7A8B84]"
                >
                  Back
                </Button>
                <Button
                  onClick={handleLaunchWorkspace}
                  disabled={isLaunching || !form.ownerEmail || !form.ownerPassword}
                  className="bg-[#28594E] hover:bg-[#1E433A] text-[#F5EBDD] font-bold text-xs"
                >
                  {isLaunching ? "Provisioning..." : "Launch Workspace 🚀"}
                </Button>
              </>
            )}

            {wizardStep === 4 && (
              <>
                <Button
                  variant="ghost"
                  onClick={triggerSkipRoom}
                  className="text-xs font-semibold text-[#7A8B84] hover:text-[#28594E]"
                >
                  Skip for now
                </Button>
                <Button
                  onClick={handleCreateGuidedRoom}
                  disabled={isCreatingRoom || !guidedRoom.roomNumber}
                  className="bg-[#28594E] hover:bg-[#1E433A] text-[#F5EBDD] font-bold text-xs"
                >
                  {isCreatingRoom ? "Saving Suite..." : "Save Suite & Next →"}
                </Button>
              </>
            )}

            {wizardStep === 5 && (
              <>
                <Button
                  variant="ghost"
                  onClick={triggerSkipService}
                  className="text-xs font-semibold text-[#7A8B84] hover:text-[#28594E]"
                >
                  Skip for now
                </Button>
                <Button
                  onClick={handleCreateGuidedService}
                  disabled={isCreatingService || !guidedService.name}
                  className="bg-[#28594E] hover:bg-[#1E433A] text-[#F5EBDD] font-bold text-xs"
                >
                  {isCreatingService ? "Saving Experience..." : "Save Experience & Finish 🚀"}
                </Button>
              </>
            )}

            {wizardStep === 6 && (
              <Button
                onClick={resetWizard}
                className="w-full bg-[#28594E] text-[#F5EBDD] font-bold text-xs"
              >
                Done & Close
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── Skip Warning Modal with Mascot ─────────────────────────────────── */}
      {skipWarning.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in-0">
          <div className="w-full max-w-md rounded-3xl bg-[#F5EBDD] p-6 shadow-2xl border border-[#28594E]/20 space-y-4">
            <div className="text-center space-y-2">
              <div className="mx-auto flex justify-center">
                <YoonieMascot
                  mood="worried"
                  size="md"
                  message={
                    skipWarning.step === 4
                      ? "Wait! A hotel needs rooms to take bookings!"
                      : "Wait! Experiences increase guest revenue by 35%!"
                  }
                />
              </div>
              <h4 className="text-lg font-extrabold text-[#28594E] pt-2">
                {skipWarning.step === 4
                  ? "Skip Adding Your First Room Suite?"
                  : "Skip Adding Tours & Experiences?"}
              </h4>
              <p className="text-xs text-[#7A8B84] leading-relaxed">
                {skipWarning.step === 4
                  ? "Without at least one room, guests visiting your website will see an empty room catalog (Rooms Opening Soon) and cannot book dates. We strongly recommend setting up one suite now."
                  : "Chauffeured airport transfers, sunset boat excursions, and spa services can be booked together with rooms to maximize revenue."}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 pt-2">
              <Button
                onClick={() =>
                  skipWarning.step === 4 ? confirmSkipRoom() : confirmSkipService()
                }
                variant="outline"
                className="order-2 sm:order-1 flex-1 text-xs font-semibold text-[#7A8B84] border-[#28594E]/20 hover:bg-black/5"
              >
                Skip Anyway
              </Button>
              <Button
                onClick={() => setSkipWarning({ isOpen: false, step: skipWarning.step })}
                className="order-1 sm:order-2 flex-1 text-xs font-bold bg-[#28594E] hover:bg-[#1E433A] text-[#F5EBDD]"
              >
                {skipWarning.step === 4 ? "Keep Adding Suite" : "Keep Adding Experience"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
