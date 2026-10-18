"use client";

import * as React from "react";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Field,
  FormSection,
  Input,
  InputAffix,
  NativeSelect,
  Textarea,
} from "@/components/ui/form";
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
import { SERVICE_KIND_LABELS } from "./adminLabels";
import {
  useUpdateServiceMutation,
  deleteServiceImage,
} from "@/lib/domain/hospitality/hospitality-api";
import type {
  PricingModel,
  ServiceCategory,
  ServiceItem,
  ServiceKind,
} from "@/lib/types/hospitality";

type ServiceDetailsModalProps = {
  service: ServiceItem | null;
  branchId: string;
  isOpen: boolean;
  onClose: () => void;
  onUpdated: () => void;
};

export function ServiceDetailsModal({
  service,
  branchId,
  isOpen,
  onClose,
  onUpdated,
}: ServiceDetailsModalProps) {
  const [name, setName] = React.useState("");
  const [category, setCategory] = React.useState<ServiceCategory>("TOURS");
  const [kind, setKind] = React.useState<ServiceKind>("SCHEDULED_TOUR");
  const [description, setDescription] = React.useState("");
  const [basePriceThb, setBasePriceThb] = React.useState<number>(1800);
  const [pricingModel, setPricingModel] = React.useState<PricingModel>("PER_PAX");
  const [coverImage, setCoverImage] = React.useState<string | undefined>(undefined);
  const [images, setImages] = React.useState<string[]>([]);

  // Tour config
  const [tourCapacity, setTourCapacity] = React.useState<number>(12);
  const [tourMinPax, setTourMinPax] = React.useState<number>(3);
  const [tourFixedCost, setTourFixedCost] = React.useState<number>(4500);
  const [tourDepartureTimes, setTourDepartureTimes] = React.useState("09:00, 16:30");
  const [tourMeetingPoint, setTourMeetingPoint] = React.useState("Hotel Riverside Pier");
  const [tourDuration, setTourDuration] = React.useState<number>(120);

  // Transfer config
  const [transferAirportCode, setTransferAirportCode] = React.useState("BKK");
  const [transferAirportName, setTransferAirportName] = React.useState("Suvarnabhumi Airport");
  const [vehiclePlate, setVehiclePlate] = React.useState("1กก-9999");
  const [vehicleCapacity, setVehicleCapacity] = React.useState<number>(8);

  const [isSaving, setIsSaving] = React.useState(false);
  const [saveSuccess, setSaveSuccess] = React.useState(false);

  const updateMutation = useUpdateServiceMutation(branchId);

  React.useEffect(() => {
    if (service) {
      setName(service.name || "");
      setCategory((service.category as ServiceCategory) || "TOURS");
      setKind(service.kind || "SCHEDULED_TOUR");
      setDescription(service.description || "");
      setBasePriceThb(service.basePriceThb || 1800);
      setPricingModel((service.pricingModel as PricingModel) || "PER_PAX");
      setCoverImage(service.coverImage || service.images?.[0] || undefined);
      setImages(service.images || []);

      if (service.tour) {
        setTourCapacity(service.tour.capacity || 12);
        setTourMinPax(service.tour.minViablePax || 3);
        setTourFixedCost(service.tour.fixedCostThb || 4500);
        setTourDepartureTimes((service.tour.departureTimes || ["16:30"]).join(", "));
        setTourMeetingPoint(service.tour.meetingPoint || "Hotel Riverside Pier");
        setTourDuration(service.tour.durationMin || 120);
      }

      if (service.transfer) {
        setTransferAirportCode(service.transfer.airportCode || "BKK");
        setTransferAirportName(service.transfer.airportName || "Suvarnabhumi Airport");
        if (service.transfer.vehicles?.[0]) {
          setVehiclePlate(service.transfer.vehicles[0].plate || "1กก-9999");
          setVehicleCapacity(service.transfer.vehicles[0].capacityPax || 8);
        }
      }
      setSaveSuccess(false);
    }
  }, [service]);

  if (!isOpen || !service) return null;

  const handleSetCover = (url: string) => {
    setCoverImage(url);
  };

  const categoryLabel =
    category === "TRANSPORT" ? "Transport" : category === "WELLNESS" ? "Wellness" : "Tours";

  const handleDeleteImage = async (url: string) => {
    try {
      await deleteServiceImage(service._id, url);
      const nextImages = images.filter((img) => img !== url);
      setImages(nextImages);
      if (coverImage === url) {
        setCoverImage(nextImages[0] || undefined);
      }
      onUpdated();
    } catch (err) {
      console.error("Delete service photo error:", err);
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
      const departureTimesArray = tourDepartureTimes
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      const payload: Record<string, unknown> = {
        name,
        category,
        kind,
        description,
        basePriceThb: Number(basePriceThb),
        pricingModel,
        coverImage,
        images,
      };

      if (category === "TOURS") {
        payload.tour = {
          capacity: Number(tourCapacity),
          minViablePax: Number(tourMinPax),
          fixedCostThb: Number(tourFixedCost),
          departureTimes: departureTimesArray.length > 0 ? departureTimesArray : ["16:30"],
          meetingPoint: tourMeetingPoint,
          durationMin: Number(tourDuration),
        };
      } else if (category === "TRANSPORT") {
        payload.transfer = {
          airportCode: transferAirportCode,
          airportName: transferAirportName,
          vehicles: [
            {
              plate: vehiclePlate,
              type: "MINIVAN",
              capacityPax: Number(vehicleCapacity),
            },
          ],
        };
      }

      await updateMutation.mutateAsync({
        serviceId: service._id,
        data: payload,
      });

      setSaveSuccess(true);
      onUpdated();
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch (err) {
      console.error("Failed to update service:", err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent size="lg">
        <form onSubmit={handleSave} className="flex min-h-0 flex-1 flex-col">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <DialogTitle>{service.name}</DialogTitle>
              <Badge tone="neutral" className="font-mono">
                {service.code}
              </Badge>
            </div>
            <DialogDescription>
              {SERVICE_KIND_LABELS[kind] ?? kind} · {categoryLabel}
            </DialogDescription>
          </DialogHeader>

          <DialogBody>
            <FormSection title="General" description="How this experience appears to guests and is priced.">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Name" htmlFor="svc-name" className="sm:col-span-2">
                  <Input id="svc-name" value={name} onChange={(e) => setName(e.target.value)} required />
                </Field>
                <Field label="Category" htmlFor="svc-category">
                  <NativeSelect
                    id="svc-category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value as ServiceCategory)}
                  >
                    <option value="TOURS">Tours &amp; sightseeing</option>
                    <option value="TRANSPORT">Airport &amp; city transport</option>
                    <option value="WELLNESS">Spa &amp; wellness</option>
                  </NativeSelect>
                </Field>
                <Field label="Pricing model" htmlFor="svc-pricing">
                  <NativeSelect
                    id="svc-pricing"
                    value={pricingModel}
                    onChange={(e) => setPricingModel(e.target.value as PricingModel)}
                  >
                    <option value="PER_PAX">Per guest</option>
                    <option value="PER_VEHICLE">Per vehicle</option>
                    <option value="PER_TREATMENT">Per treatment</option>
                  </NativeSelect>
                </Field>
                <Field label="Base price" htmlFor="svc-price">
                  <InputAffix
                    id="svc-price"
                    type="number"
                    prefix="฿"
                    value={basePriceThb}
                    onChange={(e) => setBasePriceThb(Number(e.target.value))}
                    required
                  />
                </Field>
                <Field label="Description" htmlFor="svc-description" className="sm:col-span-2">
                  <Textarea
                    id="svc-description"
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Highlights, inclusions and what guests can expect."
                  />
                </Field>
              </div>
            </FormSection>

            {category === "TOURS" ? (
              <FormSection
                title="Tour operations"
                description="Capacity and break-even thresholds used when consolidating departures."
              >
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field label="Capacity" htmlFor="svc-tour-capacity">
                    <InputAffix
                      id="svc-tour-capacity"
                      type="number"
                      suffix="guests"
                      value={tourCapacity}
                      onChange={(e) => setTourCapacity(Number(e.target.value))}
                    />
                  </Field>
                  <Field label="Minimum to operate" htmlFor="svc-tour-min" hint="Break-even guest count.">
                    <InputAffix
                      id="svc-tour-min"
                      type="number"
                      suffix="guests"
                      value={tourMinPax}
                      onChange={(e) => setTourMinPax(Number(e.target.value))}
                    />
                  </Field>
                  <Field label="Fixed cost per departure" htmlFor="svc-tour-cost">
                    <InputAffix
                      id="svc-tour-cost"
                      type="number"
                      prefix="฿"
                      value={tourFixedCost}
                      onChange={(e) => setTourFixedCost(Number(e.target.value))}
                    />
                  </Field>
                  <Field label="Duration" htmlFor="svc-tour-duration">
                    <InputAffix
                      id="svc-tour-duration"
                      type="number"
                      suffix="min"
                      value={tourDuration}
                      onChange={(e) => setTourDuration(Number(e.target.value))}
                    />
                  </Field>
                  <Field label="Departure times" htmlFor="svc-tour-times" hint="Comma-separated, 24-hour.">
                    <Input
                      id="svc-tour-times"
                      value={tourDepartureTimes}
                      onChange={(e) => setTourDepartureTimes(e.target.value)}
                      placeholder="08:30, 13:30, 16:30"
                      className="tabular-nums"
                    />
                  </Field>
                  <Field label="Meeting point" htmlFor="svc-tour-meeting">
                    <Input
                      id="svc-tour-meeting"
                      value={tourMeetingPoint}
                      onChange={(e) => setTourMeetingPoint(e.target.value)}
                    />
                  </Field>
                </div>
              </FormSection>
            ) : null}

            {category === "TRANSPORT" ? (
              <FormSection title="Transfer fleet" description="Airport served and the vehicle assigned to this transfer.">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field label="Airport code" htmlFor="svc-airport-code" hint="IATA, e.g. BKK.">
                    <Input
                      id="svc-airport-code"
                      value={transferAirportCode}
                      onChange={(e) => setTransferAirportCode(e.target.value.toUpperCase())}
                      className="font-mono"
                    />
                  </Field>
                  <Field label="Airport name" htmlFor="svc-airport-name">
                    <Input
                      id="svc-airport-name"
                      value={transferAirportName}
                      onChange={(e) => setTransferAirportName(e.target.value)}
                    />
                  </Field>
                  <Field label="Vehicle plate" htmlFor="svc-vehicle-plate">
                    <Input
                      id="svc-vehicle-plate"
                      value={vehiclePlate}
                      onChange={(e) => setVehiclePlate(e.target.value)}
                      className="font-mono"
                    />
                  </Field>
                  <Field label="Vehicle capacity" htmlFor="svc-vehicle-capacity">
                    <InputAffix
                      id="svc-vehicle-capacity"
                      type="number"
                      suffix="guests"
                      value={vehicleCapacity}
                      onChange={(e) => setVehicleCapacity(Number(e.target.value))}
                    />
                  </Field>
                </div>
              </FormSection>
            ) : null}

            <FormSection
              title="Photos"
              description={`${images.length} ${images.length === 1 ? "photo" : "photos"} · the cover photo leads on the booking page.`}
            >
              <MediaGallery
                images={images}
                coverImage={coverImage}
                onSetCover={handleSetCover}
                onDelete={(url) => void handleDeleteImage(url)}
              />
              <ImageUploadDropzone folder="services" onUploadComplete={(url) => handleUploadedNewImages([url])} />
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
