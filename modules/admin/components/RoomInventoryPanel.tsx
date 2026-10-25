"use client";

import * as React from "react";
import { BedDouble, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, EmptyState } from "@/components/ui/card";
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ImageUploadDropzone } from "@/components/media/ImageUploadDropzone";
import {
  useRoomsQuery,
  useCreateRoomMutation,
} from "@/lib/domain/hospitality/hospitality-api";
import { RoomDetailsModal } from "./RoomDetailsModal";
import {
  CLEANING_STATUS_OPTIONS,
  CleaningStatusBadge,
  ROOM_TYPE_LABELS,
  RowThumb,
  formatThb,
} from "./adminLabels";
import type { RoomItem, RoomType } from "@/lib/types/hospitality";

type RoomInventoryPanelProps = {
  branchId: string;
};

export function RoomInventoryPanel({ branchId }: RoomInventoryPanelProps) {
  const [selectedType, setSelectedType] = React.useState<string>("ALL");
  const [selectedStatus, setSelectedStatus] = React.useState<string>("ALL");
  const [isAddOpen, setIsAddOpen] = React.useState(false);
  const [selectedRoomForDetails, setSelectedRoomForDetails] = React.useState<RoomItem | null>(null);

  // New room form state
  const [newRoomNumber, setNewRoomNumber] = React.useState("");
  const [newFloor, setNewFloor] = React.useState<number>(1);
  const [newType, setNewType] = React.useState<RoomType>("STANDARD_KING");
  const [newOccupancy, setNewOccupancy] = React.useState<number>(2);
  const [newRate, setNewRate] = React.useState<number>(2200);
  const [newAmenities, setNewAmenities] = React.useState("King Bed, Rain Shower, WiFi, Tea Bar");
  const [newCoverUrl, setNewCoverUrl] = React.useState<string | null>(null);

  const { data: rooms = [], refetch, isLoading } = useRoomsQuery(
    branchId,
    selectedType === "ALL" ? undefined : selectedType,
    selectedStatus === "ALL" ? undefined : selectedStatus
  );

  const createRoomMutation = useCreateRoomMutation(branchId);

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoomNumber) return;
    try {
      await createRoomMutation.mutateAsync({
        branchId,
        roomNumber: newRoomNumber.trim(),
        floor: Number(newFloor),
        roomType: newType,
        maxOccupancy: Number(newOccupancy),
        baseRateThb: Number(newRate),
        amenities: newAmenities.split(",").map((a) => a.trim()).filter(Boolean),
        coverImage: newCoverUrl || undefined,
        images: newCoverUrl ? [newCoverUrl] : [],
      });
      setIsAddOpen(false);
      setNewRoomNumber("");
      setNewCoverUrl(null);
      void refetch();
    } catch (err) {
      console.error("Create room error:", err);
    }
  };

  const isFiltered = selectedType !== "ALL" || selectedStatus !== "ALL";

  return (
    <div className="flex flex-col gap-4">
      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <Select value={selectedType} onValueChange={(val) => setSelectedType(val)}>
            <SelectTrigger className="w-48" aria-label="Filter by room type">
              <SelectValue placeholder="All room types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All room types</SelectItem>
              {(Object.keys(ROOM_TYPE_LABELS) as RoomType[]).map((t) => (
                <SelectItem key={t} value={t}>
                  {ROOM_TYPE_LABELS[t]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedStatus} onValueChange={(val) => setSelectedStatus(val)}>
            <SelectTrigger className="w-40" aria-label="Filter by housekeeping status">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All statuses</SelectItem>
              {CLEANING_STATUS_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span className="pl-1 text-sm text-muted-foreground">
            {rooms.length} {rooms.length === 1 ? "room" : "rooms"}
          </span>
        </div>

        <Button onClick={() => setIsAddOpen(true)}>
          <Plus /> Add room
        </Button>
      </div>

      {/* Inventory table */}
      <Card className="overflow-hidden">
        {rooms.length === 0 && !isLoading ? (
          <EmptyState
            icon={<BedDouble />}
            title={isFiltered ? "No rooms match these filters" : "No rooms yet"}
            description={
              isFiltered
                ? "Try a different room type or housekeeping status."
                : "Add your first physical room to start selling it on the booking engine."
            }
            action={
              isFiltered ? null : (
                <Button variant="outline" onClick={() => setIsAddOpen(true)}>
                  <Plus /> Add room
                </Button>
              )
            }
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Room</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Occupancy</TableHead>
                <TableHead className="text-right">Base rate</TableHead>
                <TableHead>Housekeeping</TableHead>
                <TableHead className="w-0" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {rooms.map((room, idx) => {
                const rowKey = room._id || room.roomType || `room-${idx}`;
                return (
                  <TableRow
                    key={rowKey}
                    className="cursor-pointer"
                    onClick={() => setSelectedRoomForDetails(room)}
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <RowThumb src={room.coverImage || room.images?.[0]} alt={`Room ${room.roomNumber}`} />
                        <div className="flex flex-col">
                          <span className="font-medium text-foreground tabular-nums">Room {room.roomNumber}</span>
                          <span className="text-xs text-muted-foreground">
                            Floor {room.floor} · {room.images?.length ?? 0}{" "}
                            {(room.images?.length ?? 0) === 1 ? "photo" : "photos"}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-foreground">{ROOM_TYPE_LABELS[room.roomType] ?? room.roomType}</TableCell>
                    <TableCell className="text-right tabular-nums text-muted-foreground">
                      {room.maxOccupancy || 2} guests
                    </TableCell>
                    <TableCell className="text-right font-medium tabular-nums">
                      {formatThb(room.baseRateThb || 2200)}
                    </TableCell>
                    <TableCell>
                      {/* read-only: cleaning status changes through Dispatch, never from setup */}
                      <CleaningStatusBadge status={room.cleaningStatus} />
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedRoomForDetails(room);
                        }}
                      >
                        Edit
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </Card>

      {/* Add room */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent size="md">
          <form onSubmit={handleCreateRoom} className="flex min-h-0 flex-1 flex-col">
            <DialogHeader>
              <DialogTitle>Add room</DialogTitle>
              <DialogDescription>Create a physical room and assign it to a sellable room type.</DialogDescription>
            </DialogHeader>

            <DialogBody className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                <Field label="Room number" htmlFor="new-room-number">
                  <Input
                    id="new-room-number"
                    placeholder="e.g. 401"
                    value={newRoomNumber}
                    onChange={(e) => setNewRoomNumber(e.target.value)}
                    required
                    className="tabular-nums"
                  />
                </Field>
                <Field label="Floor" htmlFor="new-floor">
                  <Input
                    id="new-floor"
                    type="number"
                    value={newFloor}
                    onChange={(e) => setNewFloor(Number(e.target.value))}
                    required
                  />
                </Field>
              </div>

              <Field label="Room type" htmlFor="new-type">
                <Select value={newType} onValueChange={(val) => setNewType(val as RoomType)}>
                  <SelectTrigger id="new-type" className="w-full">
                    <SelectValue placeholder="Select room type" />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.keys(ROOM_TYPE_LABELS) as RoomType[]).map((t) => (
                      <SelectItem key={t} value={t}>
                        {ROOM_TYPE_LABELS[t]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>

              <div className="grid grid-cols-2 gap-4">
                <Field label="Base rate" htmlFor="new-rate">
                  <InputAffix
                    id="new-rate"
                    type="number"
                    prefix="฿"
                    suffix="/ night"
                    value={newRate}
                    onChange={(e) => setNewRate(Number(e.target.value))}
                    required
                  />
                </Field>
                <Field label="Max occupancy" htmlFor="new-occupancy">
                  <InputAffix
                    id="new-occupancy"
                    type="number"
                    suffix="guests"
                    value={newOccupancy}
                    onChange={(e) => setNewOccupancy(Number(e.target.value))}
                    required
                  />
                </Field>
              </div>

              <Field label="Amenities" htmlFor="new-amenities" hint="Separate with commas.">
                <Input id="new-amenities" value={newAmenities} onChange={(e) => setNewAmenities(e.target.value)} />
              </Field>

              <ImageUploadDropzone
                folder="rooms"
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
              <Button type="submit" disabled={createRoomMutation.isPending}>
                {createRoomMutation.isPending ? "Creating…" : "Create room"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Room editor */}
      <RoomDetailsModal
        room={selectedRoomForDetails}
        branchId={branchId}
        isOpen={Boolean(selectedRoomForDetails)}
        onClose={() => setSelectedRoomForDetails(null)}
        onUpdated={() => {
          void refetch();
        }}
      />
    </div>
  );
}
