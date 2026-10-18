"use client";

import * as React from "react";
import { Compass, Images, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, EmptyState } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Field, Input, InputAffix, NativeSelect } from "@/components/ui/form";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ImageUploadDropzone } from "@/components/media/ImageUploadDropzone";
import { MediaGallery } from "@/components/media/MediaGallery";
import { RowThumb, SERVICE_KIND_LABELS, formatThb } from "./adminLabels";
import {
  useServicesQuery,
  useCreateServiceMutation,
  deleteServiceImage,
} from "@/lib/domain/hospitality/hospitality-api";
import { ServiceDetailsModal } from "./ServiceDetailsModal";
import type { ServiceItem, ServiceKind } from "@/lib/types/hospitality";

const CATEGORY_FILTERS: Array<{ value: string; label: string }> = [
  { value: "ALL", label: "All" },
  { value: "TOURS", label: "Tours" },
  { value: "TRANSPORT", label: "Transport" },
  { value: "WELLNESS", label: "Wellness" },
];

const CATEGORY_LABELS: Record<string, string> = {
  TOURS: "Tours",
  TRANSPORT: "Transport",
  WELLNESS: "Wellness",
};

const PRICING_MODEL_LABELS: Record<string, string> = {
  PER_PAX: "Per guest",
  PER_VEHICLE: "Per vehicle",
  PER_TREATMENT: "Per treatment",
};

function serviceSummary(svc: ServiceItem) {
  if (svc.tour) {
    return `${svc.tour.capacity} guests max · departs ${svc.tour.departureTimes?.join(", ") || "16:30"}`;
  }
  if (svc.transfer) {
    return `${svc.transfer.airportCode} · ${svc.transfer.vehicles?.length || 0} vehicle${
      svc.transfer.vehicles?.length === 1 ? "" : "s"
    }`;
  }
  return svc.code;
}

type ExperienceCatalogPanelProps = {
  branchId: string;
};

export function ExperienceCatalogPanel({ branchId }: ExperienceCatalogPanelProps) {
  const [selectedCategory, setSelectedCategory] = React.useState<string>("ALL");
  const [isAddOpen, setIsAddOpen] = React.useState(false);
  const [selectedService, setSelectedService] = React.useState<ServiceItem | null>(null);
  const [selectedServiceForDetails, setSelectedServiceForDetails] = React.useState<ServiceItem | null>(null);

  // Form state
  const [newCode, setNewCode] = React.useState("");
  const [newName, setNewName] = React.useState("");
  const [newCategory, setNewCategory] = React.useState<"TOURS" | "TRANSPORT" | "WELLNESS">("TOURS");
  const [newKind, setNewKind] = React.useState<ServiceKind>("SCHEDULED_TOUR");
  const [newPrice, setNewPrice] = React.useState<number>(1800);
  const [newPricingModel, setNewPricingModel] = React.useState<"PER_PAX" | "PER_VEHICLE" | "PER_TREATMENT">("PER_PAX");
  const [newCoverUrl, setNewCoverUrl] = React.useState<string | null>(null);

  const { data: services = [], refetch } = useServicesQuery(
    branchId,
    selectedCategory === "ALL" ? undefined : selectedCategory
  );

  const createServiceMutation = useCreateServiceMutation(branchId);

  // Read the photo dialog's record from the latest query data so deletes reflect immediately.
  const photoService = services.find((s) => s._id === selectedService?._id) ?? selectedService;

  const handleCreateService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCode || !newName) return;
    try {
      await createServiceMutation.mutateAsync({
        branchId,
        code: newCode.toUpperCase().trim(),
        name: newName.trim(),
        category: newCategory,
        kind: newKind,
        basePriceThb: Number(newPrice),
        pricingModel: newPricingModel,
        coverImage: newCoverUrl || undefined,
        images: newCoverUrl ? [newCoverUrl] : [],
        tour:
          newCategory === "TOURS"
            ? {
                capacity: 15,
                minViablePax: 4,
                fixedCostThb: 4500,
                departureTimes: ["16:30"],
                durationMin: 120,
                meetingPoint: "Hotel Pier",
              }
            : undefined,
        transfer:
          newCategory === "TRANSPORT"
            ? {
                airportCode: "BKK",
                airportName: "Suvarnabhumi Airport",
                vehicles: [
                  { plate: "1กก 1234", type: "MINIVAN", capacityPax: 8 },
                ],
              }
            : undefined,
        wellness:
          newCategory === "WELLNESS"
            ? {
                treatmentRooms: 3,
                durationMin: 60,
                startTimes: ["10:00", "14:00", "16:00"],
              }
            : undefined,
      });
      setIsAddOpen(false);
      setNewCode("");
      setNewName("");
      setNewCoverUrl(null);
      void refetch();
    } catch (err) {
      console.error("Create service error:", err);
    }
  };

  const handleDeleteImage = async (serviceId: string, imageUrl: string) => {
    try {
      await deleteServiceImage(serviceId, imageUrl);
      void refetch();
    } catch (err) {
      console.error("Delete service image error:", err);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <div
            role="tablist"
            aria-label="Filter by category"
            className="inline-flex rounded-md border border-border bg-subtle p-0.5"
          >
            {CATEGORY_FILTERS.map((cat) => {
              const isActive = selectedCategory === cat.value;
              return (
                <button
                  key={cat.value}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setSelectedCategory(cat.value)}
                  className={cn(
                    "rounded-[5px] px-3 py-1 text-[13px] transition-colors",
                    isActive
                      ? "bg-surface font-medium text-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>
          <span className="text-[13px] text-muted-foreground">
            {services.length} {services.length === 1 ? "experience" : "experiences"}
          </span>
        </div>

        <Button onClick={() => setIsAddOpen(true)}>
          <Plus /> Add experience
        </Button>
      </div>

      {/* Catalog */}
      <Card className="overflow-hidden">
        {services.length === 0 ? (
          <EmptyState
            icon={<Compass />}
            title="No experiences yet"
            description="Add tours, transfers and treatments that guests can book alongside their stay."
            action={
              <Button variant="outline" size="sm" onClick={() => setIsAddOpen(true)}>
                <Plus /> Add experience
              </Button>
            }
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Experience</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Pricing</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead className="w-0">
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {services.map((svc) => (
                <TableRow
                  key={svc._id}
                  onClick={() => setSelectedServiceForDetails(svc)}
                  className="cursor-pointer"
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <RowThumb src={svc.coverImage || svc.images?.[0]} alt={svc.name} />
                      <div className="min-w-0">
                        <p className="truncate font-medium text-foreground">{svc.name}</p>
                        <p className="truncate text-xs text-muted-foreground">{serviceSummary(svc)}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-muted-foreground">
                    {SERVICE_KIND_LABELS[svc.kind] ?? svc.kind}
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-muted-foreground">
                    {CATEGORY_LABELS[svc.category] ?? svc.category}
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-muted-foreground">
                    {PRICING_MODEL_LABELS[svc.pricingModel] ?? svc.pricingModel}
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-right font-medium tabular-nums">
                    {formatThb(svc.basePriceThb)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label={`Manage photos for ${svc.name}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedService(svc);
                        }}
                      >
                        <Images />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedServiceForDetails(svc);
                        }}
                      >
                        Edit
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      {/* Add Experience */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent size="md">
          <form onSubmit={handleCreateService} className="flex min-h-0 flex-1 flex-col">
            <DialogHeader>
              <DialogTitle>Add experience</DialogTitle>
              <DialogDescription>
                Create a tour, transfer or treatment. Operational details can be refined after saving.
              </DialogDescription>
            </DialogHeader>

            <DialogBody className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                <Field label="Name" htmlFor="svc-new-name" className="col-span-2">
                  <Input
                    id="svc-new-name"
                    placeholder="Private longtail canal & temple tour"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    required
                  />
                </Field>
                <Field label="Service code" htmlFor="svc-new-code" hint="Used on invoices and dispatch sheets.">
                  <Input
                    id="svc-new-code"
                    placeholder="SVC-CANAL-SUNSET"
                    value={newCode}
                    onChange={(e) => setNewCode(e.target.value)}
                    required
                    className="font-mono uppercase"
                  />
                </Field>
                <Field label="Base price" htmlFor="svc-new-price">
                  <InputAffix
                    id="svc-new-price"
                    type="number"
                    prefix="฿"
                    value={newPrice}
                    onChange={(e) => setNewPrice(Number(e.target.value))}
                    required
                  />
                </Field>
                <Field label="Category" htmlFor="svc-new-category">
                  <NativeSelect
                    id="svc-new-category"
                    value={newCategory}
                    onChange={(e) => {
                      const cat = e.target.value as "TOURS" | "TRANSPORT" | "WELLNESS";
                      setNewCategory(cat);
                      if (cat === "TOURS") setNewKind("SCHEDULED_TOUR");
                      if (cat === "TRANSPORT") setNewKind("AIRPORT_TRANSFER");
                      if (cat === "WELLNESS") setNewKind("SPA_TREATMENT");
                    }}
                  >
                    <option value="TOURS">Tours</option>
                    <option value="TRANSPORT">Transport</option>
                    <option value="WELLNESS">Wellness</option>
                  </NativeSelect>
                </Field>
                <Field label="Pricing model" htmlFor="svc-new-pricing">
                  <NativeSelect
                    id="svc-new-pricing"
                    value={newPricingModel}
                    onChange={(e) =>
                      setNewPricingModel(e.target.value as "PER_PAX" | "PER_VEHICLE" | "PER_TREATMENT")
                    }
                  >
                    <option value="PER_PAX">Per guest</option>
                    <option value="PER_VEHICLE">Per vehicle</option>
                    <option value="PER_TREATMENT">Per treatment</option>
                  </NativeSelect>
                </Field>
              </div>

              <ImageUploadDropzone
                folder="services"
                label="Cover photo"
                value={newCoverUrl}
                onUploadComplete={(url) => setNewCoverUrl(url)}
                onRemove={() => setNewCoverUrl(null)}
                aspectRatio="video"
              />
            </DialogBody>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createServiceMutation.isPending}>
                {createServiceMutation.isPending ? "Creating…" : "Create experience"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Photos */}
      <Dialog open={Boolean(selectedService)} onOpenChange={(open) => !open && setSelectedService(null)}>
        <DialogContent size="lg">
          <DialogHeader>
            <DialogTitle>Photos</DialogTitle>
            <DialogDescription>{photoService?.name}</DialogDescription>
          </DialogHeader>
          <DialogBody className="flex flex-col gap-5">
            <ImageUploadDropzone
              folder="services"
              label="Add photo"
              aspectRatio="video"
              onUploadComplete={() => void refetch()}
            />
            {photoService ? (
              <MediaGallery
                images={photoService.images ?? []}
                coverImage={photoService.coverImage}
                onDelete={(url) => void handleDeleteImage(photoService._id, url)}
              />
            ) : null}
          </DialogBody>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedService(null)}>
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Editor */}
      <ServiceDetailsModal
        service={selectedServiceForDetails}
        branchId={branchId}
        isOpen={Boolean(selectedServiceForDetails)}
        onClose={() => setSelectedServiceForDetails(null)}
        onUpdated={() => {
          void refetch();
        }}
      />
    </div>
  );
}
