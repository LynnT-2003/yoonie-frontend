/* eslint-disable @next/next/no-img-element */
"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  ExternalLink,
  Globe,
  Lock,
  Plane,
  Plus,
  Sparkles,
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
    createdWorkspace,
    resetWizard,
  } = vm;

  return (
    <div className="min-h-screen bg-[#F5EBDD] text-[#303A36] selection:bg-[#E8A45B]/30 font-sans">
      {/* ─── Top Platform Navigation ────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 border-b border-[#28594E]/10 bg-[#F5EBDD]/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-xl bg-[#28594E] text-[#F5EBDD] font-bold shadow-xs">
              Y
            </div>
            <div>
              <span className="font-bold text-lg tracking-tight text-[#28594E]">
                yoonie<span className="text-[#E8A45B]">.si</span>
              </span>
              <span className="hidden sm:inline-block ml-2 text-[10px] font-semibold uppercase tracking-wider text-[#7A8B84]">
                Hospitality OS
              </span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-[#303A36]/80">
            <a href="#features" className="hover:text-[#28594E] transition">
              Platform Features
            </a>
            <a href="#dispatch" className="hover:text-[#28594E] transition">
              05:30 Dispatch Engine
            </a>
            <a href="#workspaces" className="hover:text-[#28594E] transition">
              Active Properties
            </a>
            <a href="#economics" className="hover:text-[#28594E] transition">
              Direct ROI vs OTAs
            </a>
          </nav>

          <div className="flex items-center gap-2.5">
            <Button
              variant="outline"
              size="sm"
              asChild
              className="border-[#28594E]/20 bg-transparent text-[#28594E] hover:bg-[#28594E]/10 font-bold text-xs"
            >
              <Link href="/ops/dispatch">
                <Lock className="size-3.5 mr-1 text-[#E8A45B]" />
                Ops Portal (ops.yoonie.si)
              </Link>
            </Button>
            <Button
              size="sm"
              onClick={() => {
                setWizardStep(1);
                setIsWizardOpen(true);
              }}
              className="bg-[#28594E] hover:bg-[#1E433A] text-[#F5EBDD] font-bold text-xs shadow-xs"
            >
              <Plus className="size-3.5 mr-1 text-[#E8A45B]" />
              Create Hotel Workspace
            </Button>
          </div>
        </div>
      </header>

      {/* ─── Hero Section ───────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden pt-12 pb-20 sm:pt-20 sm:pb-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#28594E]/10 border border-[#28594E]/15 text-xs font-bold text-[#28594E]">
                <Sparkles className="size-3.5 text-[#E8A45B]" />
                Autonomous Hospitality Operating System
              </div>

              <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-[#28594E] leading-[1.08]">
                every booking, <span className="italic font-serif text-[#E8A45B]">closed.</span>
              </h1>

              <p className="text-base sm:text-lg text-[#303A36]/80 max-w-2xl leading-relaxed">
                Empower your independent boutique hotel with a unified direct-channel booking engine
                and synchronized frontline dispatch. Own your guest contacts, eliminate 15–25% OTA
                commissions, and orchestrate drivers and housekeeping from one native source of truth.
              </p>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
                <Button
                  size="lg"
                  onClick={() => {
                    setWizardStep(1);
                    setIsWizardOpen(true);
                  }}
                  className="h-12 px-6 rounded-xl bg-[#28594E] hover:bg-[#1E433A] text-[#F5EBDD] font-bold text-sm shadow-md"
                >
                  Create Hotel Workspace
                  <ArrowRight className="size-4 ml-2" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  asChild
                  className="h-12 px-6 rounded-xl border-[#28594E]/20 bg-white/60 text-[#28594E] hover:bg-white font-bold text-sm"
                >
                  <a href="#workspaces">
                    Explore Running Properties
                  </a>
                </Button>
              </div>

              <div className="flex items-center gap-6 pt-4 text-xs font-semibold text-[#7A8B84]">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="size-4 text-[#28594E]" />
                  Dedicated Subdomain (<code className="font-mono text-[#28594E]">[tenant].yoonie.si</code>)
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="size-4 text-[#28594E]" />
                  Central Operator Hub (<code className="font-mono text-[#28594E]">ops.yoonie.si</code>)
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="size-4 text-[#28594E]" />
                  Offline Staff Mobile App
                </span>
              </div>
            </div>

            {/* Hero Interactive Preview Card */}
            <div className="lg:col-span-5">
              <div className="rounded-3xl bg-white/80 p-6 sm:p-8 shadow-xl border border-[#28594E]/10 backdrop-blur-xs relative overflow-hidden">
                <div className="flex items-center justify-between pb-4 border-b border-[#28594E]/10">
                  <div className="flex items-center gap-3">
                    <YoonieMascot mood="happy" size="sm" />
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#E8A45B] block">
                        Live Multi-Tenant Topology
                      </span>
                      <h3 className="font-bold text-base text-[#28594E]">
                        Unified Hospitality Cloud
                      </h3>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-[#28594E]/10 text-[10px] font-bold text-[#28594E]">
                    ONLINE
                  </span>
                </div>

                <div className="space-y-3 mt-4 text-xs">
                  <div className="p-3.5 rounded-xl bg-[#F5EBDD]/60 border border-[#28594E]/10 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-[#28594E] flex items-center gap-1.5">
                        <Globe className="size-3.5 text-[#28594E]" /> Guest Booking Front Door
                      </span>
                      <span className="font-mono text-[11px] text-[#7A8B84] block mt-0.5">
                        https://sedona.yoonie.si
                      </span>
                    </div>
                    <span className="text-[10px] font-bold text-[#28594E] bg-white px-2 py-1 rounded-md border border-[#28594E]/10">
                      Isolated
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#F5EBDD]/60 border border-[#28594E]/10 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-[#28594E] flex items-center gap-1.5">
                        <Lock className="size-3.5 text-[#E8A45B]" /> Central Operator Portal
                      </span>
                      <span className="font-mono text-[11px] text-[#7A8B84] block mt-0.5">
                        https://ops.yoonie.si
                      </span>
                    </div>
                    <span className="text-[10px] font-bold text-[#E8A45B] bg-white px-2 py-1 rounded-md border border-[#28594E]/10">
                      Owner RBAC
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#F5EBDD]/60 border border-[#28594E]/10 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-[#28594E] flex items-center gap-1.5">
                        <Plane className="size-3.5 text-blue-600" /> Frontline Staff App
                      </span>
                      <span className="font-mono text-[11px] text-[#7A8B84] block mt-0.5">
                        yoonie-mobile-staff (Expo / iOS / Android)
                      </span>
                    </div>
                    <span className="text-[10px] font-bold text-blue-700 bg-white px-2 py-1 rounded-md border border-[#28594E]/10">
                      Offline-First
                    </span>
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-[#28594E]/10 flex items-center justify-between text-xs">
                  <span className="text-[#7A8B84]">Ready to launch Sedona?</span>
                  <button
                    onClick={() => {
                      setWizardStep(1);
                      setIsWizardOpen(true);
                    }}
                    className="font-bold text-[#28594E] hover:text-[#E8A45B] transition flex items-center gap-1"
                  >
                    Start 5-min Onboarding <ArrowRight className="size-3" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Running Workspaces / Properties Section ────────────────────────── */}
      <section id="workspaces" className="py-16 bg-white border-y border-[#28594E]/10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#E8A45B]">
                Tenant Registry
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#28594E] mt-1">
                Active Hotel Workspaces
              </h2>
              <p className="text-xs text-[#7A8B84] mt-1">
                Every hotel runs on its own isolated subdomain with dedicated rooms, dining, and frontline dispatch.
              </p>
            </div>
            <Button
              onClick={() => {
                setWizardStep(1);
                setIsWizardOpen(true);
              }}
              className="bg-[#28594E] hover:bg-[#1E433A] text-[#F5EBDD] font-bold text-xs"
            >
              <Plus className="size-3.5 mr-1.5" /> Register New Hotel Workspace
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {branches.map((b) => (
              <Card
                key={b._id}
                className="overflow-hidden border-[#28594E]/15 bg-[#F5EBDD]/40 hover:bg-[#F5EBDD]/70 transition-all duration-200 shadow-xs flex flex-col justify-between"
              >
                <div className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="size-11 rounded-xl bg-[#28594E] flex items-center justify-center text-[#F5EBDD] font-bold text-lg overflow-hidden shrink-0">
                      {b.logoUrl ? (
                        <img src={b.logoUrl} alt={b.name} className="size-full object-cover" />
                      ) : (
                        b.code.charAt(0)
                      )}
                    </div>
                    <span className="px-2 py-0.5 rounded-md bg-[#28594E]/10 text-[10px] font-mono font-bold text-[#28594E]">
                      {b.code.toLowerCase()}.yoonie.si
                    </span>
                  </div>

                  <h3 className="font-bold text-base text-[#28594E] mt-3">
                    {b.name}
                  </h3>
                  <p className="text-xs text-[#7A8B84] mt-1">
                    {b.address?.city || "Bangkok"}, {b.address?.countryCode || "Thailand"} · Currency: {b.currency}
                  </p>
                </div>

                <div className="border-t border-[#28594E]/10 bg-white/70 p-3.5 flex items-center justify-between gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    asChild
                    className="flex-1 text-xs font-bold border-[#28594E]/20 text-[#28594E]"
                  >
                    <Link href={`/stay/${b.code}`}>
                      <Globe className="size-3 mr-1" /> Guest Front Door
                    </Link>
                  </Button>
                  <Button
                    size="sm"
                    asChild
                    className="flex-1 text-xs font-bold bg-[#28594E] text-[#F5EBDD]"
                  >
                    <Link href="/ops/dispatch">
                      <Lock className="size-3 mr-1 text-[#E8A45B]" /> Open in Ops
                    </Link>
                  </Button>
                </div>
              </Card>
            ))}

            {/* Quick Provision Card */}
            <div
              onClick={() => {
                setWizardStep(1);
                setIsWizardOpen(true);
              }}
              className="rounded-2xl border-2 border-dashed border-[#28594E]/20 hover:border-[#28594E]/50 p-8 flex flex-col items-center justify-center gap-3 text-center cursor-pointer transition bg-white/30 hover:bg-white/60 min-h-[190px]"
            >
              <div className="size-10 rounded-full bg-[#28594E]/10 flex items-center justify-center text-[#28594E]">
                <Plus className="size-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-[#28594E]">Add Another Property</h4>
                <p className="text-xs text-[#7A8B84] mt-0.5">
                  e.g. Sedona Hotel & Resort, Chiang Mai Mountain Retreat
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── The Three Core Pillars ─────────────────────────────────────────── */}
      <section id="features" className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-wider text-[#E8A45B]">
              Native Bounded Contexts
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#28594E] mt-1">
              One Shared Inventory Model. Zero Fragmented PMS.
            </h2>
            <p className="text-sm text-[#303A36]/80 mt-2">
              Rooms, dining seats, and excursion capacity all book against atomic inventory slots,
              flowing straight into daily frontline dispatch.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="rounded-3xl bg-white p-7 border border-[#28594E]/10 shadow-xs space-y-4">
              <span className="size-10 rounded-xl bg-[#28594E]/10 text-[#28594E] flex items-center justify-center font-bold">
                1
              </span>
              <h3 className="font-bold text-lg text-[#28594E]">Direct-Channel Composite Cart</h3>
              <p className="text-xs text-[#303A36]/80 leading-relaxed">
                Guests book room-nights, private airport transfers, spa treatments, and dining tables
                in a single seamless checkout. Eliminates 15–25% OTA commissions.
              </p>
            </div>

            <div className="rounded-3xl bg-white p-7 border border-[#28594E]/10 shadow-xs space-y-4">
              <span className="size-10 rounded-xl bg-[#E8A45B]/15 text-[#E8A45B] flex items-center justify-center font-bold">
                2
              </span>
              <h3 className="font-bold text-lg text-[#28594E]">05:30 Daily Dispatch Hub</h3>
              <p className="text-xs text-[#303A36]/80 leading-relaxed">
                Automated air-traffic controller. Evaluates tour capacity economics before departure,
                prioritizes housekeeping turnaround by guest arrival ETA, and prepares driver cards.
              </p>
            </div>

            <div className="rounded-3xl bg-white p-7 border border-[#28594E]/10 shadow-xs space-y-4">
              <span className="size-10 rounded-xl bg-[#28594E]/10 text-[#28594E] flex items-center justify-center font-bold">
                3
              </span>
              <h3 className="font-bold text-lg text-[#28594E]">Frontline Staff Mobile App</h3>
              <p className="text-xs text-[#303A36]/80 leading-relaxed">
                Drivers receive flight arrivals and terminal doors; housekeepers receive clean/dirty
                queues. Operates offline with local SQLite caching for dead zones.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Footer ─────────────────────────────────────────────────────────── */}
      <footer className="border-t border-[#28594E]/10 bg-[#F5EBDD] py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#7A8B84]">
          <div className="flex items-center gap-2 font-bold text-[#28594E]">
            <span>yoonie.si</span>
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
        <DialogContent size="lg" className="bg-[#F5EBDD] border-[#28594E]/15">
          <DialogHeader>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#E8A45B] bg-[#E8A45B]/15 px-2 py-0.5 rounded-full">
                {wizardStep === 4 ? "Provisioned" : `Step ${wizardStep} of 3`}
              </span>
            </div>
            <DialogTitle className="font-extrabold text-2xl text-[#28594E]">
              {wizardStep === 1
                ? "Register Hotel Workspace"
                : wizardStep === 2
                ? "Operational Details & Location"
                : wizardStep === 3
                ? "Owner Account Credentials"
                : "Workspace Ready!"}
            </DialogTitle>
            <DialogDescription className="text-xs text-[#7A8B84]">
              {wizardStep === 1
                ? "Choose your property name and custom Yoonie subdomain."
                : wizardStep === 2
                ? "Configure your currency, timezone, and official contact channels."
                : wizardStep === 3
                ? "Create your owner sign-in to manage the hotel in ops.yoonie.si."
                : "Your hotel direct-channel booking engine and ops portal are live."}
            </DialogDescription>
          </DialogHeader>

          <DialogBody className="space-y-4 pt-2">
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
                    suffix=".yoonie.si"
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

                <div className="p-3.5 rounded-xl bg-white/70 border border-[#28594E]/10 text-xs flex items-center gap-3">
                  <YoonieMascot mood="checking" size="sm" />
                  <div>
                    <span className="font-bold text-[#28594E] block">
                      Subdomain Live Preview:
                    </span>
                    <span className="font-mono text-[#E8A45B]">
                      https://{form.slug || "yourhotel"}.yoonie.si
                    </span>
                  </div>
                </div>
              </div>
            )}

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
                  <Field label="Currency" htmlFor="hotel-currency">
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

            {wizardStep === 3 && (
              <div className="space-y-4">
                <Field label="Owner / General Manager Name" htmlFor="owner-name">
                  <Input
                    id="owner-name"
                    value={form.ownerName}
                    onChange={(e) => setForm({ ...form, ownerName: e.target.value })}
                    required
                  />
                </Field>

                <Field label="Work Email (for ops.yoonie.si login)" htmlFor="owner-email">
                  <Input
                    id="owner-email"
                    type="email"
                    value={form.ownerEmail}
                    onChange={(e) => setForm({ ...form, ownerEmail: e.target.value })}
                    required
                  />
                </Field>

                <Field label="Password" htmlFor="owner-password">
                  <Input
                    id="owner-password"
                    type="password"
                    value={form.ownerPassword}
                    onChange={(e) => setForm({ ...form, ownerPassword: e.target.value })}
                    required
                  />
                </Field>
              </div>
            )}

            {wizardStep === 4 && createdWorkspace && (
              <div className="p-6 rounded-2xl bg-white border border-[#28594E]/15 text-center space-y-4">
                <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-[#28594E]/10 text-[#28594E]">
                  <CheckCircle2 className="size-8" />
                </div>
                <div>
                  <h3 className="font-extrabold text-xl text-[#28594E]">
                    {createdWorkspace.name} is Live!
                  </h3>
                  <p className="text-xs text-[#7A8B84] mt-1">
                    Your hotel workspace is provisioned. Here are your two operational access points:
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left pt-2">
                  <div className="p-4 rounded-xl bg-[#F5EBDD]/60 border border-[#28594E]/10 space-y-2">
                    <span className="font-bold text-xs text-[#28594E] flex items-center gap-1.5">
                      <Globe className="size-3.5" /> Guest Booking Site
                    </span>
                    <p className="text-[11px] text-[#7A8B84]">
                      Send guests here to book rooms, dining & tours directly.
                    </p>
                    <Button
                      size="sm"
                      variant="outline"
                      asChild
                      className="w-full text-xs font-bold border-[#28594E]/20 text-[#28594E]"
                    >
                      <Link href={createdWorkspace.guestUrl}>
                        Open Guest Site <ExternalLink className="size-3 ml-1" />
                      </Link>
                    </Button>
                  </div>

                  <div className="p-4 rounded-xl bg-[#F5EBDD]/60 border border-[#28594E]/10 space-y-2">
                    <span className="font-bold text-xs text-[#28594E] flex items-center gap-1.5">
                      <Lock className="size-3.5 text-[#E8A45B]" /> Central Ops Portal
                    </span>
                    <p className="text-[11px] text-[#7A8B84]">
                      Add rooms, rates, dining, and manage the 05:30 dispatch hub.
                    </p>
                    <Button
                      size="sm"
                      asChild
                      className="w-full text-xs font-bold bg-[#28594E] text-[#F5EBDD]"
                    >
                      <Link href={createdWorkspace.opsUrl}>
                        Enter Ops Hub <ArrowRight className="size-3 ml-1" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </DialogBody>

          <DialogFooter className="justify-between pt-2">
            {wizardStep < 4 ? (
              <>
                <Button
                  variant="ghost"
                  onClick={() => {
                    if (wizardStep > 1) setWizardStep((wizardStep - 1) as 1 | 2 | 3);
                    else resetWizard();
                  }}
                  className="text-xs font-bold text-[#7A8B84]"
                >
                  {wizardStep === 1 ? "Cancel" : "Back"}
                </Button>

                <Button
                  onClick={() => {
                    if (wizardStep < 3) setWizardStep((wizardStep + 1) as 1 | 2 | 3);
                    else handleLaunchWorkspace();
                  }}
                  disabled={isLaunching}
                  className="bg-[#28594E] hover:bg-[#1E433A] text-[#F5EBDD] font-bold text-xs"
                >
                  {isLaunching
                    ? "Provisioning..."
                    : wizardStep === 3
                    ? "Launch Workspace 🚀"
                    : "Continue"}
                </Button>
              </>
            ) : (
              <Button
                onClick={resetWizard}
                className="w-full bg-[#28594E] text-[#F5EBDD] font-bold text-xs"
              >
                Done
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
