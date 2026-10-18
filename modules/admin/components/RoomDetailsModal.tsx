"use client";

import * as React from "react";
import { CheckCircle2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogBody,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  SheetContent,
} from "@/components/ui/dialog";
import { Field, FormSection, Input, InputAffix, NativeSelect } from "@/components/ui/form";
import { ImageUploadDropzone } from "@/components/media/ImageUploadDropzone";
import { MediaGallery } from "@/components/media/MediaGallery";
import {
  useUpdateRoomMutation,
  deleteRoomImage,
} from "@/lib/domain/hospitality/hospitality-api";
import type { RoomCleaningStatus, RoomItem, RoomType } from "@/lib/types/hospitality";
import { CLEANING_STATUS_OPTIONS, CleaningStatusBadge, ROOM_TYPE_LABELS, humanizeCode } from "./adminLabels";

type RoomDetailsModalProps = {
  room: RoomItem | null;
  branchId: string;
  isOpen: boolean;
  onClose: () => void;
  onUpdated: () => void;
};

export function RoomDetailsModal({
  room,
  branchId,
  isOpen,
  onClose,
  onUpdated,
}: RoomDetailsModalProps) {
  const [roomNumber, setRoomNumber] = React.useState("");
  const [floor, setFloor] = React.useState<number>(1);
  const [roomType, setRoomType] = React.useState<RoomType>("STANDARD_KING");
  const [maxOccupancy, setMaxOccupancy] = React.useState<number>(2);
  const [baseRateThb, setBaseRateThb] = React.useState<number>(2200);
  const [cleaningStatus, setCleaningStatus] = React.useState<RoomCleaningStatus>("CLEAN");
  const [amenityInput, setAmenityInput] = React.useState("");
  const [amenities, setAmenities] = React.useState<string[]>([]);
  const [coverImage, setCoverImage] = React.useState<string | undefined>(undefined);
  const [images, setImages] = React.useState<string[]>([]);
  const [isSaving, setIsSaving] = React.useState(false);
  const [saveSuccess, setSaveSuccess] = React.useState(false);

  const updateMutation = useUpdateRoomMutation(branchId);

  // Sync form state when room opens
  React.useEffect(() => {
    if (room) {
      setRoomNumber(room.roomNumber || "");
      setFloor(room.floor || 1);
      setRoomType(room.roomType || "STANDARD_KING");
      setMaxOccupancy(room.maxOccupancy || 2);
      setBaseRateThb(room.baseRateThb || 2200);
      setCleaningStatus(room.cleaningStatus || "CLEAN");
      setAmenities(room.amenities || []);
      setCoverImage(room.coverImage || room.images?.[0] || undefined);
      setImages(room.images || []);
      setSaveSuccess(false);
    }
  }, [room]);

  if (!isOpen || !room) return null;

  const handleAddAmenity = () => {
    const trimmed = amenityInput.trim();
    if (trimmed && !amenities.includes(trimmed)) {
      setAmenities([...amenities, trimmed]);
      setAmenityInput("");
    }
  };

  const handleRemoveAmenity = (name: string) => {
    setAmenities(amenities.filter((a) => a !== name));
  };

  const handleSetCover = (url: string) => {
    setCoverImage(url);
  };

  const handleDeleteImage = async (url: string) => {
    try {
      await deleteRoomImage(room._id, url);
      const nextImages = images.filter((img) => img !== url);
      setImages(nextImages);
      if (coverImage === url) {
        setCoverImage(nextImages[0] || undefined);
      }
      onUpdated();
    } catch (err) {
      console.error("Delete room photo error:", err);
    }
  };

  const handleUploadedNewImages = (uploadedUrls: string[]) => {
    const combined = Array.from(new Set([...images, ...uploadedUrls]));
    setImages(combined);
    if (!coverImage && combined.length > 0) {
      setCoverImage(combined[0]);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      await updateMutation.mutateAsync({
        roomId: room._id,
        data: {
          roomNumber,
          floor: Number(floor),
          roomType,
          maxOccupancy: Number(maxOccupancy),
          baseRateThb: Number(baseRateThb),
          cleaningStatus,
          amenities,
          coverImage,
          images,
        },
      });
      setSaveSuccess(true);
      onUpdated();
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch (err) {
      console.error("Failed to update room:", err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => (open ? null : onClose())}>
      <SheetContent size="lg">
        <form onSubmit={handleSave} className="flex min-h-0 flex-1 flex-col">
          <DialogHeader>
            <div className="flex items-center gap-2.5">
              <DialogTitle className="text-lg tabular-nums">Room {room.roomNumber}</DialogTitle>
              <CleaningStatusBadge status={cleaningStatus} />
            </div>
            <DialogDescription>
              Floor {room.floor} · {ROOM_TYPE_LABELS[room.roomType] ?? room.roomType}
            </DialogDescription>
          </DialogHeader>

          <DialogBody>
            <FormSection title="Room details" description="How this room is identified and sold.">
              <div className="grid grid-cols-2 gap-4">
                <Field label="Room number" htmlFor="room-number">
                  <Input
                    id="room-number"
                    value={roomNumber}
                    onChange={(e) => setRoomNumber(e.target.value)}
                    required
                    className="tabular-nums"
                  />
                </Field>
                <Field label="Floor" htmlFor="room-floor">
                  <Input
                    id="room-floor"
                    type="number"
                    value={floor}
                    onChange={(e) => setFloor(Number(e.target.value))}
                    required
                  />
                </Field>
                <Field label="Room type" htmlFor="room-type" className="col-span-2">
                  <NativeSelect
                    id="room-type"
                    value={roomType}
                    onChange={(e) => setRoomType(e.target.value as RoomType)}
                  >
                    {(Object.keys(ROOM_TYPE_LABELS) as RoomType[]).map((t) => (
                      <option key={t} value={t}>
                        {ROOM_TYPE_LABELS[t]}
                      </option>
                    ))}
                  </NativeSelect>
                </Field>
              </div>
            </FormSection>

            <FormSection title="Rate & occupancy">
              <div className="grid grid-cols-2 gap-4">
                <Field label="Base rate" htmlFor="room-rate" hint="Before service charge and VAT.">
                  <InputAffix
                    id="room-rate"
                    type="number"
                    prefix="฿"
                    suffix="/ night"
                    value={baseRateThb}
                    onChange={(e) => setBaseRateThb(Number(e.target.value))}
                    required
                  />
                </Field>
                <Field label="Max occupancy" htmlFor="room-occupancy">
                  <InputAffix
                    id="room-occupancy"
                    type="number"
                    suffix="guests"
                    value={maxOccupancy}
                    onChange={(e) => setMaxOccupancy(Number(e.target.value))}
                    required
                  />
                </Field>
                <Field label="Housekeeping status" htmlFor="room-cleaning">
                  <NativeSelect
                    id="room-cleaning"
                    value={cleaningStatus}
                    onChange={(e) => setCleaningStatus(e.target.value as RoomCleaningStatus)}
                  >
                    {CLEANING_STATUS_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </NativeSelect>
                </Field>
              </div>
            </FormSection>

            <FormSection title="Amenities" description="Shown to guests on the room detail page.">
              <div className="flex gap-2">
                <Input
                  placeholder="e.g. River balcony"
                  value={amenityInput}
                  onChange={(e) => setAmenityInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddAmenity();
                    }
                  }}
                  aria-label="New amenity"
                />
                <Button type="button" variant="outline" onClick={handleAddAmenity}>
                  Add
                </Button>
              </div>

              {amenities.length > 0 ? (
                <ul className="flex flex-wrap gap-1.5">
                  {amenities.map((a) => (
                    <li
                      key={a}
                      className="inline-flex items-center gap-1 rounded-md border border-border bg-subtle py-1 pl-2.5 pr-1 text-[13px] text-foreground"
                    >
                      {humanizeCode(a)}
                      <button
                        type="button"
                        onClick={() => handleRemoveAmenity(a)}
                        className="rounded p-0.5 text-muted-foreground hover:bg-border hover:text-foreground"
                        aria-label={`Remove ${humanizeCode(a)}`}
                      >
                        <X className="size-3" />
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-[13px] text-muted-foreground">No amenities added yet.</p>
              )}
            </FormSection>

            <FormSection
              title="Photos"
              description={`${images.length} ${images.length === 1 ? "photo" : "photos"} · the cover photo leads the room gallery.`}
            >
              <MediaGallery
                images={images}
                coverImage={coverImage}
                onSetCover={handleSetCover}
                onDelete={(url) => void handleDeleteImage(url)}
              />
              <ImageUploadDropzone folder="rooms" onUploadComplete={(url) => handleUploadedNewImages([url])} />
            </FormSection>
          </DialogBody>

          <DialogFooter>
            {saveSuccess ? (
              <span className="mr-auto flex items-center gap-1.5 text-[13px] text-success animate-in fade-in">
                <CheckCircle2 className="size-4" /> Changes saved
              </span>
            ) : null}
            <Button type="button" variant="outline" onClick={onClose}>
              Close
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? "Saving…" : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </SheetContent>
    </Dialog>
  );
}
