"use client";

import * as React from "react";
import { Check, Clock, ShieldCheck } from "lucide-react";
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
import type { RoomType } from "@/lib/types/hospitality";

export type RoomCatalogItem = {
  type: RoomType;
  title: string;
  tagline: string;
  pricePerNight: number;
  capacity: string;
  image: string;
  features: string[];
  gallery?: string[];
  description?: string;
  sizeSqm?: number;
  bedType?: string;
  view?: string;
};

type GuestRoomDetailsModalProps = {
  room: RoomCatalogItem | null;
  isOpen: boolean;
  isSelected: boolean;
  onClose: () => void;
  onSelectRoom: () => void;
};

const IN_ROOM_COMFORTS = [
  "High-speed fibre Wi-Fi",
  "Nespresso coffee bar",
  "Terry bathrobes and slippers",
  "Rain shower and soaking tub",
  "Dyson hairdryer",
  "Bluetooth speaker",
];

export function GuestRoomDetailsModal({
  room,
  isOpen,
  isSelected,
  onClose,
  onSelectRoom,
}: GuestRoomDetailsModalProps) {
  const [activePhotoIndex, setActivePhotoIndex] = React.useState(0);

  React.useEffect(() => {
    setActivePhotoIndex(0);
  }, [room]);

  if (!room) return null;

  const photos =
    room.gallery && room.gallery.length > 0
      ? room.gallery
      : [
          room.image,
          "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80",
          "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80",
          "https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1200&q=80",
        ];

  const sizeSqm =
    room.sizeSqm || (room.type === "POOL_VILLA" ? 110 : room.type === "DELUXE_BALCONY" ? 54 : 38);

  const specs: Array<[string, string]> = [
    ["Guests", room.capacity],
    ["Bed", room.bedType || "King bed"],
    ["Size", `${sizeSqm} m²`],
    ["View", room.view || "River and garden"],
  ];

  const amenities = Array.from(new Set([...room.features, ...IN_ROOM_COMFORTS]));

  return (
    <Dialog open={isOpen} onOpenChange={(open) => (open ? null : onClose())}>
      <DialogContent size="xl">
        <DialogBody className="p-0">
          <div className="grid lg:grid-cols-2">
            {/* Gallery */}
            <div className="flex flex-col gap-2 bg-subtle p-4 sm:p-5">
              <div className="aspect-4/3 overflow-hidden rounded-md bg-muted">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photos[activePhotoIndex]}
                  alt={`${room.title}, photo ${activePhotoIndex + 1} of ${photos.length}`}
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

            {/* Details */}
            <div className="flex flex-col gap-6 p-6 sm:p-8">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                  Room
                </p>
                <DialogTitle className="mt-2 font-display text-3xl font-medium leading-tight">
                  {room.title}
                </DialogTitle>
                <DialogDescription className="mt-1.5">{room.tagline}</DialogDescription>
              </div>

              <dl className="grid grid-cols-2 gap-x-6 gap-y-3 border-y border-border py-4 text-sm">
                {specs.map(([label, value]) => (
                  <div key={label}>
                    <dt className="text-xs text-muted-foreground">{label}</dt>
                    <dd className="mt-0.5 text-foreground">{value}</dd>
                  </div>
                ))}
              </dl>

              <p className="text-sm leading-relaxed text-muted-foreground">
                {room.description ||
                  "Natural teak, limestone and contemporary Thai silks, with a private balcony over the Chao Phraya. Acoustic insulation, smart lighting and dedicated high-speed Wi-Fi make it equally suited to rest or work."}
              </p>

              <div>
                <h4 className="text-sm font-medium text-foreground">In the room</h4>
                <ul className="mt-3 grid grid-cols-1 gap-x-6 gap-y-2 text-sm text-foreground sm:grid-cols-2">
                  {amenities.map((amenity) => (
                    <li key={amenity} className="flex items-start gap-2">
                      <Check className="mt-0.5 size-3.5 shrink-0 text-primary" />
                      <span>{amenity}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex flex-col gap-2 text-[13px] text-muted-foreground">
                <span className="flex items-center gap-2">
                  <Clock className="size-3.5" /> Check-in from 14:00 · Check-out by 12:00
                </span>
                <span className="flex items-center gap-2">
                  <ShieldCheck className="size-3.5" /> Free cancellation up to 48 hours before arrival
                </span>
              </div>
            </div>
          </div>
        </DialogBody>

        <DialogFooter className="justify-between">
          <div>
            <span className="text-lg font-medium tabular-nums text-foreground">
              ฿{room.pricePerNight.toLocaleString("en-US")}
            </span>
            <span className="text-[13px] text-muted-foreground"> / night, before service charge &amp; VAT</span>
          </div>
          <Button
            type="button"
            size="lg"
            variant={isSelected ? "outline" : "default"}
            onClick={() => {
              onSelectRoom();
              onClose();
            }}
          >
            {isSelected ? (
              <>
                <Check /> Selected
              </>
            ) : (
              "Select room"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
