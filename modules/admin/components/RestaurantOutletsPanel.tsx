"use client";

import * as React from "react";
import { Images, Plus, UtensilsCrossed } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, EmptyState } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Field, Input } from "@/components/ui/form";
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
import {
  useRestaurantsQuery,
  useCreateRestaurantMutation,
  deleteRestaurantImage,
} from "@/lib/domain/hospitality/hospitality-api";
import { RestaurantDetailsModal } from "./RestaurantDetailsModal";
import { RowThumb } from "./adminLabels";
import type { RestaurantItem } from "@/lib/types/hospitality";

type RestaurantOutletsPanelProps = {
  branchId: string;
};

export function RestaurantOutletsPanel({ branchId }: RestaurantOutletsPanelProps) {
  const [isAddOpen, setIsAddOpen] = React.useState(false);
  const [selectedOutlet, setSelectedOutlet] = React.useState<RestaurantItem | null>(null);
  const [selectedOutletForDetails, setSelectedOutletForDetails] = React.useState<RestaurantItem | null>(null);

  // Form state
  const [newCode, setNewCode] = React.useState("");
  const [newName, setNewName] = React.useState("");
  const [newCuisine, setNewCuisine] = React.useState("Thai & International Contemporary");
  const [newMaxSeats, setNewMaxSeats] = React.useState<number>(48);
  const [newCoverUrl, setNewCoverUrl] = React.useState<string | null>(null);

  const { data: restaurants = [], refetch } = useRestaurantsQuery(branchId);
  const createRestaurantMutation = useCreateRestaurantMutation(branchId);

  const handleCreateVenue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCode || !newName) return;
    try {
      await createRestaurantMutation.mutateAsync({
        branchId,
        code: newCode.toUpperCase().trim(),
        name: newName.trim(),
        cuisine: newCuisine.trim(),
        maxSeats: Number(newMaxSeats),
        coverImage: newCoverUrl || undefined,
        images: newCoverUrl ? [newCoverUrl] : [],
        shifts: [
          {
            code: "BREAKFAST",
            label: "Breakfast Shift",
            startTime: "06:30",
            endTime: "10:30",
          },
          {
            code: "DINNER",
            label: "Sunset Dinner Shift",
            startTime: "17:30",
            endTime: "22:30",
          },
        ],
        tables: [
          { tableCode: "T01", seats: 4, zone: "RIVER_TERRACE" },
          { tableCode: "T02", seats: 4, zone: "RIVER_TERRACE" },
          { tableCode: "T03", seats: 2, zone: "INDOOR" },
        ],
      });
      setIsAddOpen(false);
      setNewCode("");
      setNewName("");
      setNewCoverUrl(null);
      void refetch();
    } catch (err) {
      console.error("Create restaurant error:", err);
    }
  };

  const handleDeleteImage = async (restaurantId: string, imageUrl: string) => {
    try {
      await deleteRestaurantImage(restaurantId, imageUrl);
      void refetch();
    } catch (err) {
      console.error("Delete restaurant image error:", err);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          {restaurants.length} {restaurants.length === 1 ? "outlet" : "outlets"}
        </p>
        <Button onClick={() => setIsAddOpen(true)}>
          <Plus /> Add outlet
        </Button>
      </div>

      <Card className="overflow-hidden">
        {restaurants.length === 0 ? (
          <EmptyState
            icon={<UtensilsCrossed />}
            title="No dining outlets yet"
            description="Add a restaurant or bar so guests can reserve tables with their stay."
            action={
              <Button variant="outline" onClick={() => setIsAddOpen(true)}>
                <Plus /> Add outlet
              </Button>
            }
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Outlet</TableHead>
                <TableHead>Cuisine</TableHead>
                <TableHead>Service periods</TableHead>
                <TableHead className="text-right">Tables</TableHead>
                <TableHead className="text-right">Covers</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-0" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {restaurants.map((outlet) => {
                const coverImg = outlet.coverImage || outlet.images?.[0];
                const periods = outlet.shifts
                  .map((s) => s.label || s.name || s.code)
                  .join(", ");
                return (
                  <TableRow
                    key={outlet._id}
                    className="cursor-pointer"
                    onClick={() => setSelectedOutletForDetails(outlet)}
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <RowThumb src={coverImg} alt={outlet.name} />
                        <div className="min-w-0">
                          <p className="truncate font-medium text-foreground">{outlet.name}</p>
                          <p className="font-mono text-xs text-muted-foreground">{outlet.code}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{outlet.cuisine}</TableCell>
                    <TableCell className="max-w-56">
                      <p className="truncate text-muted-foreground" title={periods}>
                        {outlet.shifts.length > 0 ? periods : "—"}
                      </p>
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {outlet.tables?.length ?? 0}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {outlet.maxSeats || 48}
                    </TableCell>
                    <TableCell>
                      {outlet.shifts.length > 0 ? (
                        <Badge tone="success" dot>
                          Open
                        </Badge>
                      ) : (
                        <Badge tone="neutral" dot>
                          No service
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div
                        className="flex items-center justify-end gap-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-label={`Manage photos for ${outlet.name}`}
                          onClick={() => setSelectedOutlet(outlet)}
                        >
                          <Images />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedOutletForDetails(outlet)}
                        >
                          Edit
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </Card>

      {/* Create outlet */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent size="md">
          <form onSubmit={handleCreateVenue} className="flex min-h-0 flex-1 flex-col">
            <DialogHeader>
              <DialogTitle>Add dining outlet</DialogTitle>
              <DialogDescription>
                Breakfast and dinner service periods and three starter tables are created by default.
              </DialogDescription>
            </DialogHeader>
            <DialogBody className="flex flex-col gap-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Outlet name" htmlFor="new-outlet-name" className="sm:col-span-2">
                  <Input
                    id="new-outlet-name"
                    placeholder="Chao Phraya Waterside Terrace"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    required
                  />
                </Field>
                <Field label="Outlet code" htmlFor="new-outlet-code" hint="Used on reports and dockets.">
                  <Input
                    id="new-outlet-code"
                    placeholder="SUNSET-TERRACE"
                    value={newCode}
                    onChange={(e) => setNewCode(e.target.value)}
                    required
                    className="font-mono uppercase"
                  />
                </Field>
                <Field label="Covers" htmlFor="new-outlet-seats">
                  <Input
                    id="new-outlet-seats"
                    type="number"
                    min={1}
                    value={newMaxSeats}
                    onChange={(e) => setNewMaxSeats(Number(e.target.value))}
                    required
                    className="tabular-nums"
                  />
                </Field>
                <Field label="Cuisine" htmlFor="new-outlet-cuisine" className="sm:col-span-2">
                  <Input
                    id="new-outlet-cuisine"
                    value={newCuisine}
                    onChange={(e) => setNewCuisine(e.target.value)}
                  />
                </Field>
              </div>
              <ImageUploadDropzone
                folder="restaurants"
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
              <Button type="submit" disabled={createRestaurantMutation.isPending}>
                {createRestaurantMutation.isPending ? "Creating…" : "Create outlet"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Photo library */}
      <Dialog
        open={Boolean(selectedOutlet)}
        onOpenChange={(open) => {
          if (!open) setSelectedOutlet(null);
        }}
      >
        <DialogContent size="lg">
          <DialogHeader>
            <DialogTitle>Photos</DialogTitle>
            <DialogDescription>{selectedOutlet?.name}</DialogDescription>
          </DialogHeader>
          <DialogBody className="flex flex-col gap-5">
            <ImageUploadDropzone
              folder="restaurants"
              aspectRatio="video"
              onUploadComplete={() => void refetch()}
            />
            {selectedOutlet ? (
              <MediaGallery
                images={selectedOutlet.images ?? []}
                coverImage={selectedOutlet.coverImage}
                onDelete={(url) => void handleDeleteImage(selectedOutlet._id, url)}
              />
            ) : null}
          </DialogBody>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedOutlet(null)}>
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <RestaurantDetailsModal
        restaurant={selectedOutletForDetails}
        branchId={branchId}
        isOpen={Boolean(selectedOutletForDetails)}
        onClose={() => setSelectedOutletForDetails(null)}
        onUpdated={() => {
          void refetch();
        }}
      />
    </div>
  );
}
