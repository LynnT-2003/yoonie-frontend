"use client";

import * as React from "react";
import { Check, Clock, Plane, ShieldCheck, Users, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, Input, NativeSelect } from "@/components/ui/form";
import { cn } from "@/lib/utils";
import {
  GuestRoomDetailsModal,
  type RoomCatalogItem,
} from "@/modules/home/components/GuestRoomDetailsModal";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { GuestServiceDetailsModal } from "@/modules/home/components/GuestServiceDetailsModal";
import type { ServiceItem } from "@/lib/types/hospitality";
import { serviceIssue, type CartItem, type HomePageVm } from "@/modules/home/viewModel/homePageVm";
import { GuestYoonie } from "@/components/assistant/GuestYoonie";

const HERO_FALLBACK =
  "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=2000&q=80";

const CATEGORY_LABELS: Record<string, string> = {
  TOURS: "Experience",
  TRANSPORT: "Transfer",
  WELLNESS: "Wellness",
};

const formatThb = (n: number) => `฿${n.toLocaleString("en-US")}`;

const formatDate = (iso: string) => {
  const d = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });
};

const formatTimer = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
};

export function HomePageView({ vm }: { vm: HomePageVm }) {
  const [selectedRoomForModal, setSelectedRoomForModal] =
    React.useState<RoomCatalogItem | null>(null);
  const [selectedServiceForModal, setSelectedServiceForModal] =
    React.useState<ServiceItem | null>(null);

  const {
    activeBranch,
    roomCatalog,
    services,
    restaurants,
    checkIn,
    setCheckIn,
    checkOut,
    setCheckOut,
    adults,
    setAdults,
    nights,
    cart,
    addRoomToCart,
    addServiceToCart,
    updateService,
    serviceIssues,
    addDiningToCart,
    removeFromCart,
    subtotal,
    serviceCharge,
    vat,
    grandTotal,
    holdId,
    holdTimeLeft,
    isHolding,
    triggerHold,
    isCheckoutOpen,
    setIsCheckoutOpen,
    bookingGuest,
    setBookingGuest,
    finalizeBooking,
    isSubmitting,
    bookingError,
    isConfirmed,
    confirmedOrderNumber,
    resetBooking,
  } = vm;

  const hotelName = activeBranch?.name || "BKK Riverside";
  const heroImage = roomCatalog[1]?.image || roomCatalog[0]?.image || HERO_FALLBACK;
  const nightsLabel = `${nights} ${nights === 1 ? "night" : "nights"}`;
  const guestsLabel = `${adults} ${adults === 1 ? "adult" : "adults"}`;

  const scrollToRooms = () => {
    document.getElementById("tour-room-catalog")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className={cn("bg-background text-foreground", cart.length > 0 ? "pb-28 lg:pb-24" : "pb-24")}>
      <GuestYoonie hotelName={hotelName} className={cart.length > 0 ? "bottom-28 lg:bottom-24" : undefined} />
      {/* ─── Hero ──────────────────────────────────────────────────────────────── */}
      <section className="relative h-[56vh] min-h-[420px] w-full overflow-hidden bg-foreground">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={heroImage} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-linear-to-t from-black/65 via-black/20 to-black/10" />
        <div className="relative mx-auto flex h-full max-w-6xl flex-col justify-end px-4 pb-24 sm:px-6">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-white/80">
            Bangkok · Chao Phraya River
          </p>
          <h1 className="mt-3 font-display text-4xl font-medium leading-[1.05] text-white sm:text-6xl">
            {hotelName}
          </h1>
          <p className="mt-3 max-w-xl text-base text-white/85 sm:text-lg">
            Riverside rooms, dining over the water and private arrivals, reserved together.
          </p>
        </div>
      </section>

      {/* ─── Stay search ───────────────────────────────────────────────────────── */}
      <div className="relative z-10 mx-auto -mt-12 max-w-6xl px-4 sm:px-6">
        <div
          id="tour-stay-search"
          className="grid grid-cols-2 overflow-hidden rounded-lg border border-border bg-surface shadow-lg md:grid-cols-[1fr_1fr_1fr_auto]"
        >
          <label className="flex flex-col gap-1 border-b border-r border-border px-5 py-4 md:border-b-0">
            <span className="text-xs text-muted-foreground">Check-in</span>
            <input
              type="date"
              value={checkIn}
              onChange={(e) => setCheckIn(e.target.value)}
              className="w-full bg-transparent text-sm font-medium text-foreground outline-none"
            />
          </label>
          <label className="flex flex-col gap-1 border-b border-border px-5 py-4 md:border-b-0 md:border-r">
            <span className="text-xs text-muted-foreground">Check-out</span>
            <input
              type="date"
              value={checkOut}
              min={checkIn}
              onChange={(e) => setCheckOut(e.target.value)}
              className="w-full bg-transparent text-sm font-medium text-foreground outline-none"
            />
          </label>
          <div className="col-span-2 flex flex-col justify-center gap-1 border-b border-border px-5 py-4 md:col-span-1 md:border-b-0 md:border-r">
            <span className="text-xs text-muted-foreground">Guests</span>
            <Select
              value={String(adults)}
              onValueChange={(val) => setAdults(Number(val))}
            >
              <SelectTrigger className="h-auto border-0 bg-transparent p-0 text-sm font-medium text-foreground shadow-none hover:border-0 focus-visible:ring-0">
                <SelectValue placeholder="Select guests" />
              </SelectTrigger>
              <SelectContent>
                {[1, 2, 3, 4].map((n) => (
                  <SelectItem key={n} value={String(n)}>
                    {n} {n === 1 ? "adult" : "adults"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="col-span-2 flex items-center justify-between gap-4 px-5 py-3 md:col-span-1 md:justify-end">
            <span className="text-sm text-muted-foreground md:hidden lg:inline">{nightsLabel}</span>
            <Button size="lg" onClick={scrollToRooms}>
              Check availability
            </Button>
          </div>
        </div>

        <ul className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-[13px] text-muted-foreground">
          <li className="flex items-center gap-1.5">
            <ShieldCheck className="size-3.5" /> Best rate when booking direct
          </li>
          <li className="flex items-center gap-1.5">
            <Clock className="size-3.5" /> 15-minute rate hold
          </li>
          <li className="flex items-center gap-1.5">
            <Plane className="size-3.5" /> Flight-tracked airport transfers
          </li>
        </ul>
      </div>

      {/* ─── Content + summary ─────────────────────────────────────────────────── */}
      <div className="mx-auto mt-16 grid max-w-6xl grid-cols-1 gap-12 px-4 sm:px-6 lg:grid-cols-12 lg:gap-10">
        <div className="flex flex-col gap-20 lg:col-span-8">
          {/* Rooms */}
          <section id="tour-room-catalog" className="scroll-mt-24">
            <SectionHeading
              overline="Accommodation"
              title="Rooms & villas"
              description={`${formatDate(checkIn)} – ${formatDate(checkOut)} · ${nightsLabel} · ${guestsLabel}`}
            />

            <div className="mt-8 flex flex-col gap-6">
              {roomCatalog.map((room) => {
                const isSelected = cart.some((i) => i.kind === "ROOM" && i.roomType === room.type);
                return (
                  <article
                    key={room.type}
                    className={cn(
                      "grid overflow-hidden rounded-lg border bg-surface transition-colors sm:grid-cols-[40%_1fr]",
                      isSelected ? "border-primary ring-1 ring-primary" : "border-border"
                    )}
                  >
                    <button
                      type="button"
                      onClick={() => setSelectedRoomForModal(room)}
                      className="group relative aspect-4/3 overflow-hidden bg-subtle sm:aspect-auto sm:min-h-full"
                      aria-label={`View ${room.title}`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={room.image}
                        alt={room.title}
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                      />
                    </button>

                    <div className="flex flex-col gap-4 p-6">
                      <div>
                        <h3 className="font-display text-2xl font-medium leading-tight text-foreground">
                          {room.title}
                        </h3>
                        <p className="mt-1 text-sm text-muted-foreground">{room.tagline}</p>
                      </div>

                      <p className="flex items-center gap-1.5 text-[13px] text-foreground">
                        <Users className="size-3.5 text-muted-foreground" /> {room.capacity}
                      </p>

                      <p className="text-[13px] leading-relaxed text-muted-foreground">
                        {room.features.slice(0, 4).join(" · ")}
                      </p>

                      <div className="mt-auto flex flex-wrap items-end justify-between gap-4 border-t border-border pt-4">
                        <button
                          type="button"
                          onClick={() => setSelectedRoomForModal(room)}
                          className="text-sm text-foreground underline decoration-border underline-offset-4 transition hover:decoration-foreground"
                        >
                          Room details
                        </button>
                        <div className="flex items-end gap-4">
                          <div className="text-right">
                            <p className="text-sm text-foreground">
                              <span className="text-muted-foreground">From </span>
                              <span className="text-lg font-medium tabular-nums">
                                {formatThb(room.pricePerNight)}
                              </span>
                              <span className="text-muted-foreground"> / night</span>
                            </p>
                            <p className="text-xs tabular-nums text-muted-foreground">
                              {formatThb(room.pricePerNight * nights)} total for {nightsLabel}
                            </p>
                          </div>
                          <Button
                            variant={isSelected ? "outline" : "default"}
                            onClick={() => addRoomToCart(room.type, room.title, room.pricePerNight)}
                          >
                            {isSelected ? (
                              <>
                                <Check /> Selected
                              </>
                            ) : (
                              "Select"
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>

          {/* Experiences & dining */}
          <section id="tour-experiences" className="scroll-mt-24">
            <SectionHeading
              overline="During your stay"
              title="Experiences & dining"
              description="Add transfers, tours, treatments and dinner reservations to the same booking."
            />

            <div className="mt-8 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2">
              {services.map((svc) => {
                const svcImg =
                  svc.coverImage ||
                  svc.images?.[0] ||
                  (svc.kind === "AIRPORT_TRANSFER"
                    ? "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800"
                    : svc.category === "WELLNESS"
                    ? "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800"
                    : "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800");

                return (
                  <AddOnCard
                    key={svc._id}
                    image={svcImg}
                    category={CATEGORY_LABELS[svc.category] ?? "Experience"}
                    title={svc.name}
                    description={
                      svc.kind === "AIRPORT_TRANSFER"
                        ? "Private, flight-tracked pickup with a bilingual driver."
                        : svc.description || svc.tour?.meetingPoint || "Curated by our concierge team."
                    }
                    price={svc.basePriceThb}
                    inCart={cart.some((i) => i.kind === "SERVICE" && i.serviceId === svc._id)}
                    onOpen={() => setSelectedServiceForModal(svc)}
                    onAdd={() => addServiceToCart(svc)}
                  />
                );
              })}

              {restaurants.map((rest) => {
                const restImg =
                  rest.coverImage ||
                  rest.images?.[0] ||
                  "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800";
                const shift = rest.shifts?.[1] || rest.shifts?.[0];
                const shiftLabel = shift?.label || shift?.name || "Dinner";

                return (
                  <AddOnCard
                    key={rest._id}
                    image={restImg}
                    category="Dining"
                    title={rest.name}
                    description={`${rest.cuisine} · ${shiftLabel} seating, reserved table`}
                    price={1200}
                    inCart={cart.some((i) => i.kind === "DINING" && i.restaurantId === rest._id)}
                    onAdd={() =>
                      addDiningToCart(rest, shift?.code || "EVENING", `${shift?.label || "Evening"} Seating`)
                    }
                  />
                );
              })}
            </div>
          </section>
        </div>

        {/* Reservation summary (desktop) */}
        <aside className="hidden lg:col-span-4 lg:block" aria-label="Your stay">
          <div className="sticky top-24 rounded-lg border border-border bg-surface shadow-xs">
            <div className="border-b border-border px-6 py-5">
              <h2 className="font-display text-2xl font-medium">Your stay</h2>
              <p className="mt-1 text-[13px] text-muted-foreground">
                {formatDate(checkIn)} – {formatDate(checkOut)} · {guestsLabel}
              </p>
            </div>

            {cart.length === 0 ? (
              <p className="px-6 py-8 text-sm text-muted-foreground">
                Select a room to begin. Experiences and dining can be added to the same reservation.
              </p>
            ) : (
              <div className="flex flex-col gap-5 px-6 py-5">
                <CartLines
                  cart={cart}
                  onRemove={removeFromCart}
                  onUpdateService={updateService}
                  checkIn={checkIn}
                  checkOut={checkOut}
                />
                <Totals subtotal={subtotal} serviceCharge={serviceCharge} vat={vat} grandTotal={grandTotal} />
                {holdTimeLeft !== null ? (
                  <p
                    className={cn(
                      "flex items-center gap-1.5 text-[13px]",
                      holdTimeLeft < 180 ? "text-warning" : "text-muted-foreground"
                    )}
                  >
                    <Clock className="size-3.5" /> Rate held for{" "}
                    <span className="tabular-nums">{formatTimer(holdTimeLeft)}</span>
                  </p>
                ) : null}
                {bookingError && !isCheckoutOpen ? (
                  <p role="alert" className="text-[13px] text-destructive">
                    {bookingError}
                  </p>
                ) : null}
                {holdId ? (
                  <Button size="lg" className="w-full" onClick={() => setIsCheckoutOpen(true)}>
                    Continue to guest details
                  </Button>
                ) : (
                  <Button size="lg" className="w-full" onClick={() => void triggerHold()} disabled={isHolding || serviceIssues.length > 0}>
                    Hold rate for 15 minutes
                  </Button>
                )}
              </div>
            )}
          </div>
        </aside>
      </div>

      {/* ─── Mobile reservation bar ───────────────────────────────────────────── */}
      {cart.length > 0 ? (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface/95 backdrop-blur lg:hidden">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
            <div className="min-w-0">
              <p className="text-lg font-medium tabular-nums">{formatThb(grandTotal)}</p>
              <p className="truncate text-xs text-muted-foreground">
                {cart.length} {cart.length === 1 ? "item" : "items"}
                {holdTimeLeft !== null ? ` · held for ${formatTimer(holdTimeLeft)}` : " · taxes included"}
              </p>
            </div>
            <div className="shrink-0">
              {holdId ? (
                <Button size="lg" onClick={() => setIsCheckoutOpen(true)}>
                  Continue
                </Button>
              ) : (
                <Button size="lg" onClick={() => void triggerHold()} disabled={isHolding || serviceIssues.length > 0}>
                  Hold rate
                </Button>
              )}
            </div>
          </div>
        </div>
      ) : null}

      {/* ─── Guest details ────────────────────────────────────────────────────── */}
      <Dialog open={isCheckoutOpen} onOpenChange={setIsCheckoutOpen}>
        <DialogContent size="lg">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl font-medium">Guest details</DialogTitle>
            <DialogDescription>
              {hotelName} · {formatDate(checkIn)} – {formatDate(checkOut)}
            </DialogDescription>
          </DialogHeader>

          <DialogBody>
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-[1fr_15rem]">
              <form
                id="guest-details-form"
                className="flex flex-col gap-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  void finalizeBooking();
                }}
              >
                <Field label="Full name" htmlFor="guest-name">
                  <Input
                    id="guest-name"
                    autoComplete="name"
                    required
                    value={bookingGuest.fullName}
                    onChange={(e) => setBookingGuest({ ...bookingGuest, fullName: e.target.value })}
                  />
                </Field>
                <Field label="Email" htmlFor="guest-email">
                  <Input
                    id="guest-email"
                    type="email"
                    autoComplete="email"
                    required
                    value={bookingGuest.email}
                    onChange={(e) => setBookingGuest({ ...bookingGuest, email: e.target.value })}
                  />
                </Field>
                <Field label="Phone" htmlFor="guest-phone" hint="Include country code, e.g. +66 81 234 5678">
                  <Input
                    id="guest-phone"
                    type="tel"
                    autoComplete="tel"
                    value={bookingGuest.phoneE164}
                    onChange={(e) => setBookingGuest({ ...bookingGuest, phoneE164: e.target.value })}
                  />
                </Field>
                <Field label="LINE ID (optional) — for arrival updates" htmlFor="guest-line">
                  <Input
                    id="guest-line"
                    value={bookingGuest.lineUserId}
                    onChange={(e) => setBookingGuest({ ...bookingGuest, lineUserId: e.target.value })}
                  />
                </Field>
              </form>

              <div className="flex flex-col gap-4 rounded-md bg-subtle p-4 sm:self-start">
                <h3 className="text-sm font-medium">Reservation</h3>
                <CartLines cart={cart} onRemove={removeFromCart} checkIn={checkIn} checkOut={checkOut} compact />
                <Totals subtotal={subtotal} serviceCharge={serviceCharge} vat={vat} grandTotal={grandTotal} />
              </div>
            </div>
          </DialogBody>

          {bookingError ? (
            <p role="alert" className="px-6 text-sm text-destructive">
              {bookingError}
            </p>
          ) : null}
          <DialogFooter className="justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Total</p>
              <p className="text-lg font-medium tabular-nums">{formatThb(grandTotal)}</p>
            </div>
            <Button
              size="lg"
              type="submit"
              form="guest-details-form"
              disabled={cart.length === 0 || isSubmitting}
            >
              {isSubmitting ? "Confirming…" : "Confirm reservation"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── Confirmation ─────────────────────────────────────────────────────── */}
      <Dialog open={isConfirmed} onOpenChange={(open) => (open ? null : resetBooking())}>
        <DialogContent size="md">
          <DialogBody className="flex flex-col items-center gap-5 px-8 pb-6 pt-10 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-success-soft text-success">
              <Check className="size-6" />
            </div>
            <div>
              <DialogTitle className="font-display text-3xl font-medium">
                Your reservation is confirmed
              </DialogTitle>
              <p className="mt-2 font-mono text-sm text-foreground">{confirmedOrderNumber}</p>
              <DialogDescription className="mx-auto mt-2 max-w-sm">
                Thank you, {bookingGuest.fullName}. Keep this reference for check-in — payment is
                taken at {hotelName} on arrival.
              </DialogDescription>
            </div>
          </DialogBody>
          <DialogFooter className="justify-center">
            <Button size="lg" className="w-full sm:w-auto sm:min-w-40" onClick={resetBooking}>
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <GuestRoomDetailsModal
        room={selectedRoomForModal}
        isOpen={Boolean(selectedRoomForModal)}
        isSelected={
          selectedRoomForModal
            ? cart.some((i) => i.kind === "ROOM" && i.roomType === selectedRoomForModal.type)
            : false
        }
        onClose={() => setSelectedRoomForModal(null)}
        onSelectRoom={() => {
          if (selectedRoomForModal) {
            addRoomToCart(
              selectedRoomForModal.type,
              selectedRoomForModal.title,
              selectedRoomForModal.pricePerNight
            );
          }
        }}
      />

      <GuestServiceDetailsModal
        service={selectedServiceForModal}
        isOpen={Boolean(selectedServiceForModal)}
        isInCart={
          selectedServiceForModal
            ? cart.some((i) => i.kind === "SERVICE" && i.serviceId === selectedServiceForModal._id)
            : false
        }
        onClose={() => setSelectedServiceForModal(null)}
        onAddToCart={() => {
          if (selectedServiceForModal) {
            addServiceToCart(selectedServiceForModal);
          }
        }}
      />
    </div>
  );
}

function SectionHeading({
  overline,
  title,
  description,
}: {
  overline: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="border-b border-border pb-5">
      <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">{overline}</p>
      <h2 className="mt-2 font-display text-3xl font-medium text-foreground sm:text-4xl">{title}</h2>
      {description ? <p className="mt-2 text-sm text-muted-foreground">{description}</p> : null}
    </div>
  );
}

function AddOnCard({
  image,
  category,
  title,
  description,
  price,
  inCart,
  onOpen,
  onAdd,
}: {
  image: string;
  category: string;
  title: string;
  description: string;
  price: number;
  inCart: boolean;
  onOpen?: () => void;
  onAdd: () => void;
}) {
  const imageEl = (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={image}
      alt={title}
      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
    />
  );

  return (
    <article className="flex flex-col">
      {onOpen ? (
        <button
          type="button"
          onClick={onOpen}
          className="group aspect-4/3 overflow-hidden rounded-md bg-subtle"
          aria-label={`View ${title}`}
        >
          {imageEl}
        </button>
      ) : (
        <div className="aspect-4/3 overflow-hidden rounded-md bg-subtle">{imageEl}</div>
      )}
      <p className="mt-4 text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">{category}</p>
      <h3 className="mt-1.5 text-base font-medium text-foreground">
        {onOpen ? (
          <button type="button" onClick={onOpen} className="text-left hover:underline hover:underline-offset-4">
            {title}
          </button>
        ) : (
          title
        )}
      </h3>
      <p className="mt-1 line-clamp-1 text-[13px] text-muted-foreground">{description}</p>
      <div className="mt-4 flex items-center justify-between">
        <span className="text-sm font-medium tabular-nums">{formatThb(price)}</span>
        <Button size="sm" variant="outline" onClick={onAdd}>
          {inCart ? (
            <>
              <Check /> Added
            </>
          ) : (
            "Add"
          )}
        </Button>
      </div>
    </article>
  );
}

function CartLines({
  cart,
  onRemove,
  onUpdateService,
  checkIn,
  checkOut,
  compact,
}: {
  cart: CartItem[];
  onRemove: (id: string) => void;
  onUpdateService?: HomePageVm["updateService"];
  checkIn: string;
  checkOut: string;
  compact?: boolean;
}) {
  return (
    <ul className={cn("flex flex-col", compact ? "gap-2.5" : "gap-3")}>
      {cart.map((item) => (
        <li key={item.id} className="flex flex-col gap-2 text-sm">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-foreground">{item.title}</p>
              {!compact || item.kind === "SERVICE" ? (
                <p className="text-xs text-muted-foreground">{lineSummary(item)}</p>
              ) : null}
            </div>
            <div className="flex shrink-0 items-center gap-1.5">
              <span className="tabular-nums text-foreground">{formatThb(item.totalPrice)}</span>
              <button
                type="button"
                onClick={() => onRemove(item.id)}
                className="rounded p-0.5 text-muted-foreground transition hover:bg-muted hover:text-foreground"
                aria-label={`Remove ${item.title}`}
              >
                <X className="size-3.5" />
              </button>
            </div>
          </div>
          {item.kind === "SERVICE" && !compact && onUpdateService ? (
            <ServiceSchedule item={item} onChange={onUpdateService} checkIn={checkIn} checkOut={checkOut} />
          ) : null}
        </li>
      ))}
    </ul>
  );
}

function lineSummary(item: CartItem) {
  if (item.kind === "ROOM") {
    return `${item.nights} ${item.nights === 1 ? "night" : "nights"} × ${formatThb(item.pricePerNight)}`;
  }
  if (item.kind === "DINING") return `${item.pax} guests · ${formatDate(item.diningDate)}`;
  const who = item.perGuest ? `${item.pax} × ${formatThb(item.price)}` : "per vehicle";
  if (item.serviceKind === "AIRPORT_TRANSFER") {
    return item.flightNumber && item.time
      ? `${item.flightNumber.toUpperCase()} lands ${formatDate(item.date)} ${item.time} · ${who}`
      : `Arrival pickup · ${who}`;
  }
  return item.time ? `${formatDate(item.date)} ${item.time} · ${who}` : who;
}

/** Inline scheduling for a service: flight and landing time for transfers, day and slot otherwise. */
function ServiceSchedule({
  item,
  onChange,
  checkIn,
  checkOut,
}: {
  item: Extract<CartItem, { kind: "SERVICE" }>;
  onChange: HomePageVm["updateService"];
  checkIn: string;
  checkOut: string;
}) {
  const issue = serviceIssue(item, checkIn, checkOut);
  const days: string[] = [];
  for (let d = checkIn; d <= checkOut; ) {
    days.push(d);
    const next = new Date(`${d}T00:00:00Z`);
    next.setUTCDate(next.getUTCDate() + 1);
    d = next.toISOString().slice(0, 10);
  }
  const ctl = "h-8 text-[13px]";

  return (
    <div className="flex flex-col gap-1.5 rounded-md bg-subtle p-2.5">
      {item.serviceKind === "AIRPORT_TRANSFER" ? (
        <div className="grid grid-cols-2 gap-2">
          <Input
            className={ctl}
            placeholder="Flight, e.g. TG 917"
            aria-label={`${item.title} flight number`}
            value={item.flightNumber}
            onChange={(e) => onChange(item.id, { flightNumber: e.target.value })}
          />
          <Input
            className={ctl}
            type="time"
            aria-label={`${item.title} landing time on ${formatDate(item.date)}`}
            value={item.time}
            onChange={(e) => onChange(item.id, { time: e.target.value })}
          />
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          <NativeSelect
            className={ctl}
            aria-label={`${item.title} date`}
            value={item.date}
            onChange={(e) => onChange(item.id, { date: e.target.value })}
          >
            {days.map((d) => (
              <option key={d} value={d}>
                {formatDate(d)}
              </option>
            ))}
          </NativeSelect>
          {item.timeOptions.length ? (
            <NativeSelect
              className={ctl}
              aria-label={`${item.title} time`}
              value={item.time}
              onChange={(e) => onChange(item.id, { time: e.target.value })}
            >
              <option value="">Time</option>
              {item.timeOptions.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </NativeSelect>
          ) : (
            <Input
              className={ctl}
              type="time"
              aria-label={`${item.title} time`}
              value={item.time}
              onChange={(e) => onChange(item.id, { time: e.target.value })}
            />
          )}
        </div>
      )}
      <p className={cn("text-xs", issue ? "text-warning" : "text-muted-foreground")}>
        {issue ??
          (item.serviceKind === "AIRPORT_TRANSFER"
            ? `Your driver meets you on ${formatDate(item.date)} when you land.`
            : `Booked for ${item.pax} ${item.pax === 1 ? "guest" : "guests"}.`)}
      </p>
    </div>
  );
}

function Totals({
  subtotal,
  serviceCharge,
  vat,
  grandTotal,
}: {
  subtotal: number;
  serviceCharge: number;
  vat: number;
  grandTotal: number;
}) {
  return (
    <dl className="flex flex-col gap-1.5 border-t border-border pt-4 text-[13px]">
      <div className="flex justify-between text-muted-foreground">
        <dt>Subtotal</dt>
        <dd className="tabular-nums">{formatThb(subtotal)}</dd>
      </div>
      <div className="flex justify-between text-muted-foreground">
        <dt>Service charge &amp; VAT</dt>
        <dd className="tabular-nums">{formatThb(serviceCharge + vat)}</dd>
      </div>
      <div className="mt-2 flex items-baseline justify-between">
        <dt className="text-sm text-foreground">Total</dt>
        <dd className="text-2xl font-medium tabular-nums text-foreground">{formatThb(grandTotal)}</dd>
      </div>
      <p className="text-xs text-muted-foreground">Includes 10% service charge and 7% VAT</p>
    </dl>
  );
}
