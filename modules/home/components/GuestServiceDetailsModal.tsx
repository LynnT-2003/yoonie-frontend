"use client";

import * as React from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import type { ServiceItem } from "@/lib/types/hospitality";

type GuestServiceDetailsModalProps = {
  service: ServiceItem | null;
  isOpen: boolean;
  isInCart: boolean;
  onClose: () => void;
  onAddToCart: () => void;
};

const CATEGORY_LABELS: Record<string, string> = {
  TOURS: "Experience",
  TRANSPORT: "Transfer",
  WELLNESS: "Wellness",
};

const PRICING_LABELS: Record<string, string> = {
  PER_PAX: "per guest",
  PER_VEHICLE: "per vehicle",
  PER_TREATMENT: "per treatment",
};

export function GuestServiceDetailsModal({
  service,
  isOpen,
  isInCart,
  onClose,
  onAddToCart,
}: GuestServiceDetailsModalProps) {
  const [activePhotoIndex, setActivePhotoIndex] = React.useState(0);

  React.useEffect(() => {
    setActivePhotoIndex(0);
  }, [service]);

  if (!service) return null;

  const fallbackPhoto =
    service.kind === "AIRPORT_TRANSFER"
      ? "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=1200"
      : service.category === "WELLNESS"
      ? "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=1200"
      : "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1200";

  const photos =
    service.images && service.images.length > 0 ? service.images : [service.coverImage || fallbackPhoto];

  const specs: Array<[string, string]> = [];
  if (service.tour) {
    specs.push(["Duration", `${service.tour.durationMin || 120} minutes`]);
    specs.push(["Group size", `Up to ${service.tour.capacity} guests`]);
    specs.push(["Meeting point", service.tour.meetingPoint || "Hotel pier"]);
    if (service.tour.departureTimes?.length) {
      specs.push(["Departures", service.tour.departureTimes.join(", ")]);
    }
  }
  if (service.transfer) {
    specs.push(["Airport", `${service.transfer.airportName} (${service.transfer.airportCode})`]);
    specs.push(["Arrivals", "Flight-tracked, driver adjusts to delays"]);
  }
  if (service.wellness) {
    specs.push(["Duration", `${service.wellness.durationMin} minutes`]);
  }

  const inclusions =
    service.kind === "AIRPORT_TRANSFER"
      ? [
          "Private vehicle and professional driver",
          "Meet and greet in the arrivals hall",
          "Chilled water and cold towels",
          "Tolls and parking included",
        ]
      : [
          "Bilingual English and Thai guide",
          "Chilled coconut and bottled water",
          "Safety equipment provided",
          "All fuel and pier fees included",
        ];

  const pricingLabel = PRICING_LABELS[service.pricingModel] ?? "";

  return (
    <Dialog open={isOpen} onOpenChange={(open) => (open ? null : onClose())}>
      <DialogContent size="xl">
        <DialogBody className="p-0">
          <div className="grid lg:grid-cols-2">
            <div className="flex flex-col gap-2 bg-subtle p-4 sm:p-5">
              <div className="aspect-4/3 overflow-hidden rounded-md bg-muted">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photos[activePhotoIndex]}
                  alt={`${service.name}, photo ${activePhotoIndex + 1}`}
                  className="h-full w-full object-cover"
                />
              </div>
              {photos.length > 1 ? (
                <div className="grid grid-cols-4 gap-2">
                  {photos.slice(0, 8).map((p, idx) => (
                    <button
                      key={`${p}-${idx}`}
                      type="button"
                      onClick={() => setActivePhotoIndex(idx)}
                      aria-label={`Show photo ${idx + 1}`}
                      className={cn(
                        "aspect-4/3 overflow-hidden rounded-sm ring-offset-2 ring-offset-subtle transition",
                        activePhotoIndex === idx ? "ring-1 ring-foreground" : "opacity-70 hover:opacity-100"
                      )}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={p} alt="" className="h-full w-full object-cover" />
                    </button>
                  ))}
                </div>
              ) : null}
            </div>

            <div className="flex flex-col gap-6 p-6 sm:p-8">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                  {CATEGORY_LABELS[service.category] ?? "Experience"}
                </p>
                <DialogTitle className="mt-2 font-display text-3xl font-medium leading-tight">
                  {service.name}
                </DialogTitle>
                <DialogDescription className="mt-1.5 leading-relaxed">
                  {service.description ||
                    "Designed by our concierge team with licensed local partners, refreshments and insurance included."}
                </DialogDescription>
              </div>

              {specs.length > 0 ? (
                <dl className="grid grid-cols-2 gap-x-6 gap-y-3 border-y border-border py-4 text-sm">
                  {specs.map(([label, value]) => (
                    <div key={label}>
                      <dt className="text-xs text-muted-foreground">{label}</dt>
                      <dd className="mt-0.5 text-foreground">{value}</dd>
                    </div>
                  ))}
                </dl>
              ) : null}

              <div>
                <h4 className="text-sm font-medium text-foreground">Included</h4>
                <ul className="mt-3 grid grid-cols-1 gap-x-6 gap-y-2 text-sm text-foreground sm:grid-cols-2">
                  {inclusions.map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <Check className="mt-0.5 size-3.5 shrink-0 text-primary" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </DialogBody>

        <DialogFooter className="justify-between">
          <div>
            <span className="text-lg font-medium tabular-nums text-foreground">
              ฿{service.basePriceThb.toLocaleString("en-US")}
            </span>
            {pricingLabel ? <span className="text-[13px] text-muted-foreground"> {pricingLabel}</span> : null}
          </div>
          <Button
            type="button"
            size="lg"
            variant={isInCart ? "outline" : "default"}
            onClick={() => {
              onAddToCart();
              onClose();
            }}
          >
            {isInCart ? (
              <>
                <Check /> Added
              </>
            ) : (
              "Add to stay"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
