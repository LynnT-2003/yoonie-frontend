"use client";

import * as React from "react";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Field, FormSection, Input, InputAffix } from "@/components/ui/form";
import {
  Dialog,
  DialogBody,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  SheetContent,
} from "@/components/ui/dialog";
import { ImageUploadDropzone } from "@/components/media/ImageUploadDropzone";
import { MediaGallery } from "@/components/media/MediaGallery";
import {
  useUpdateRestaurantMutation,
  deleteRestaurantImage,
} from "@/lib/domain/hospitality/hospitality-api";
import type { RestaurantItem } from "@/lib/types/hospitality";

type RestaurantDetailsModalProps = {
  restaurant: RestaurantItem | null;
  branchId: string;
  isOpen: boolean;
  onClose: () => void;
  onUpdated: () => void;
};

export function RestaurantDetailsModal({
  restaurant,
  branchId,
  isOpen,
  onClose,
  onUpdated,
}: RestaurantDetailsModalProps) {
  const [name, setName] = React.useState("");
  const [cuisine, setCuisine] = React.useState("");
  const [maxSeats, setMaxSeats] = React.useState<number>(48);
  const [avgTurnMinutes, setAvgTurnMinutes] = React.useState<number>(90);
  const [coverImage, setCoverImage] = React.useState<string | undefined>(undefined);
  const [images, setImages] = React.useState<string[]>([]);
  const [isSaving, setIsSaving] = React.useState(false);
  const [saveSuccess, setSaveSuccess] = React.useState(false);

  const updateMutation = useUpdateRestaurantMutation(branchId);

  React.useEffect(() => {
    if (restaurant) {
      setName(restaurant.name || "");
      setCuisine(restaurant.cuisine || "");
      setMaxSeats(restaurant.maxSeats || 48);
      setAvgTurnMinutes(restaurant.avgTurnMinutes || 90);
      setCoverImage(restaurant.coverImage || restaurant.images?.[0] || undefined);
      setImages(restaurant.images || []);
      setSaveSuccess(false);
    }
  }, [restaurant]);

  if (!isOpen || !restaurant) return null;

  const handleSetCover = (url: string) => {
    setCoverImage(url);
  };

  const handleDeleteImage = async (url: string) => {
    try {
      await deleteRestaurantImage(restaurant._id, url);
      const nextImages = images.filter((img) => img !== url);
      setImages(nextImages);
      if (coverImage === url) {
        setCoverImage(nextImages[0] || undefined);
      }
      onUpdated();
    } catch (err) {
      console.error("Delete restaurant photo error:", err);
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
        restaurantId: restaurant._id,
        data: {
          name,
          cuisine,
          maxSeats: Number(maxSeats),
          avgTurnMinutes: Number(avgTurnMinutes),
          coverImage,
          images,
        },
      });
      setSaveSuccess(true);
      onUpdated();
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch (err) {
      console.error("Failed to update restaurant:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const tables = restaurant.tables ?? [];

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <SheetContent size="lg">
        <form onSubmit={handleSave} className="flex min-h-0 flex-1 flex-col">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <DialogTitle>{restaurant.name}</DialogTitle>
              <Badge tone="neutral" className="font-mono">
                {restaurant.code}
              </Badge>
            </div>
            <DialogDescription>
              {restaurant.cuisine} · {restaurant.maxSeats || 48} covers
            </DialogDescription>
          </DialogHeader>

          <DialogBody>
            <FormSection title="Details" description="How the outlet appears to guests and staff.">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Outlet name" htmlFor="outlet-name">
                  <Input
                    id="outlet-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </Field>
                <Field label="Cuisine" htmlFor="outlet-cuisine">
                  <Input
                    id="outlet-cuisine"
                    value={cuisine}
                    onChange={(e) => setCuisine(e.target.value)}
                    required
                  />
                </Field>
                <Field label="Covers" htmlFor="outlet-seats" hint="Maximum guests seated at once.">
                  <Input
                    id="outlet-seats"
                    type="number"
                    min={1}
                    value={maxSeats}
                    onChange={(e) => setMaxSeats(Number(e.target.value))}
                    required
                    className="tabular-nums"
                  />
                </Field>
                <Field label="Average table turn" htmlFor="outlet-turn">
                  <InputAffix
                    id="outlet-turn"
                    type="number"
                    min={0}
                    suffix="min"
                    value={avgTurnMinutes}
                    onChange={(e) => setAvgTurnMinutes(Number(e.target.value))}
                    required
                  />
                </Field>
              </div>
            </FormSection>

            <FormSection title="Service periods" description="Seatings offered as dining add-ons.">
              {restaurant.shifts.length > 0 ? (
                <ul className="divide-y divide-border rounded-md border border-border">
                  {restaurant.shifts.map((s) => (
                    <li key={s.code} className="flex items-center justify-between px-3 py-2.5 text-sm">
                      <span className="text-foreground">{s.label || s.name || s.code}</span>
                      <span className="tabular-nums text-muted-foreground">
                        {s.startTime || s.startsAt || "17:30"} – {s.endTime || s.endsAt || "22:00"}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-[13px] text-muted-foreground">No service periods configured.</p>
              )}
            </FormSection>

            <FormSection title="Tables" description={`${tables.length} tables configured.`}>
              {tables.length > 0 ? (
                <ul className="flex flex-wrap gap-1.5">
                  {tables.map((t) => (
                    <li key={t.tableCode}>
                      <Badge tone="neutral">
                        <span className="font-mono text-foreground">{t.tableCode}</span>
                        <span>
                          {t.seats} seats · {t.zone.replace(/_/g, " ").toLowerCase()}
                        </span>
                      </Badge>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-[13px] text-muted-foreground">No tables configured.</p>
              )}
            </FormSection>

            <FormSection
              title="Photos"
              description={`${images.length} ${images.length === 1 ? "photo" : "photos"}. The cover photo leads the outlet listing.`}
            >
              <MediaGallery
                images={images}
                coverImage={coverImage}
                onSetCover={handleSetCover}
                onDelete={(url) => void handleDeleteImage(url)}
              />
              <ImageUploadDropzone
                folder="restaurants"
                onUploadComplete={(url) => handleUploadedNewImages([url])}
              />
            </FormSection>
          </DialogBody>

          <DialogFooter>
            {saveSuccess ? (
              <span className="mr-auto flex items-center gap-1.5 text-[13px] text-success animate-in fade-in">
                <CheckCircle2 className="size-4" /> Changes saved
              </span>
            ) : null}
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
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
