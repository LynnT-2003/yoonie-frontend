"use client";

import * as React from "react";
import { CheckCircle2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  EmptyState,
} from "@/components/ui/card";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, Input } from "@/components/ui/form";
import { ImageUploadDropzone } from "@/components/media/ImageUploadDropzone";
import { MediaGallery } from "@/components/media/MediaGallery";
import {
  deleteBranchImage,
  createBranch,
} from "@/lib/domain/hospitality/hospitality-api";
import type { Branch } from "@/lib/types/hospitality";

type BranchSettingsPanelProps = {
  branch: Branch | null;
  onRefresh: () => void;
};

export function BranchSettingsPanel({ branch, onRefresh }: BranchSettingsPanelProps) {
  const [isCreateOpen, setIsCreateOpen] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [successMsg, setSuccessMsg] = React.useState<string | null>(null);

  // New branch form state
  const [newCode, setNewCode] = React.useState("");
  const [newName, setNewName] = React.useState("");
  const [newPhone, setNewPhone] = React.useState("+6620001234");
  const [newEmail, setNewEmail] = React.useState("");
  const [newLogoUrl, setNewLogoUrl] = React.useState<string | null>(null);
  const [newHeroUrl, setNewHeroUrl] = React.useState<string | null>(null);

  const showNotification = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  const handleLogoUpload = async () => {
    if (!branch) return;
    try {
      showNotification("Logo updated.");
      onRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  const handleHeroUpload = async () => {
    if (!branch) return;
    try {
      showNotification("Hero image updated.");
      onRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddGalleryImage = async () => {
    if (!branch) return;
    try {
      showNotification("Photo added to gallery.");
      onRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteImage = async (imageUrl: string) => {
    if (!branch) return;
    try {
      await deleteBranchImage(branch._id, imageUrl);
      showNotification("Gallery image deleted.");
      onRefresh();
    } catch (err) {
      console.error("Delete image error:", err);
    }
  };

  const handleCreateBranch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCode || !newName) return;
    setIsSubmitting(true);
    try {
      await createBranch({
        code: newCode.toUpperCase().trim(),
        name: newName.trim(),
        timezone: "Asia/Bangkok",
        currency: "THB",
        contactPhoneE164: newPhone,
        contactEmail: newEmail,
        logoUrl: newLogoUrl || undefined,
        heroImageUrl: newHeroUrl || undefined,
        images: newHeroUrl ? [newHeroUrl] : [],
        settings: {
          checkInTime: "14:00",
          checkOutTime: "12:00",
          vatRate: 0.07,
          serviceChargeRate: 0.1,
          holdTtlMinutes: 15,
          consolidationThreshold: 0.4,
          dispatchGenerationTime: "05:30",
        },
      });
      setIsCreateOpen(false);
      showNotification("Property created.");
      onRefresh();
    } catch (err) {
      console.error("Failed to create branch:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const createDialog = (
    <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
      <DialogContent size="md">
        <form onSubmit={handleCreateBranch} className="flex min-h-0 flex-1 flex-col">
          <DialogHeader>
            <DialogTitle>Add property</DialogTitle>
            <DialogDescription>
              Defaults to Asia/Bangkok, THB, 7% VAT and 10% service charge.
            </DialogDescription>
          </DialogHeader>
          <DialogBody className="grid gap-4 sm:grid-cols-2">
            <Field label="Property code" htmlFor="new-branch-code" hint="Short unique identifier.">
              <Input
                id="new-branch-code"
                placeholder="BKK-RIVERSIDE"
                value={newCode}
                onChange={(e) => setNewCode(e.target.value)}
                required
                className="font-mono uppercase"
              />
            </Field>
            <Field label="Property name" htmlFor="new-branch-name">
              <Input
                id="new-branch-name"
                placeholder="BKK Riverside Boutique Hotel"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                required
              />
            </Field>
            <Field label="Phone" htmlFor="new-branch-phone" hint="International format, e.g. +66 2 000 1234.">
              <Input
                id="new-branch-phone"
                type="tel"
                value={newPhone}
                onChange={(e) => setNewPhone(e.target.value)}
                className="tabular-nums"
              />
            </Field>
            <Field label="Reservations email" htmlFor="new-branch-email">
              <Input
                id="new-branch-email"
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
              />
            </Field>
            <ImageUploadDropzone
              folder="branches"
              label="Logo"
              value={newLogoUrl}
              onUploadComplete={(url) => setNewLogoUrl(url)}
              aspectRatio="square"
            />
            <ImageUploadDropzone
              folder="branches"
              label="Hero image"
              value={newHeroUrl}
              onUploadComplete={(url) => setNewHeroUrl(url)}
              aspectRatio="video"
            />
          </DialogBody>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating…" : "Create property"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );

  if (!branch) {
    return (
      <Card>
        <EmptyState
          title="No property yet"
          description="Register your first property to start configuring rooms, dining and experiences."
          action={
            <Button onClick={() => setIsCreateOpen(true)}>
              <Plus /> Add property
            </Button>
          }
        />
        {createDialog}
      </Card>
    );
  }

  const settings = branch.settings;
  const percent = (rate: number | undefined, fallback: number) => `${((rate || fallback) * 100).toFixed(0)}%`;

  const profileRows: Array<{ label: string; value: React.ReactNode }> = [
    { label: "Property name", value: branch.name },
    { label: "Property code", value: <span className="font-mono">{branch.code}</span> },
    {
      label: "Address",
      value: `${branch.address?.line1 || "88 Charoen Krung Rd"}, ${branch.address?.city || "Bangkok"}`,
    },
    { label: "Timezone", value: branch.timezone },
    { label: "Currency", value: branch.currency },
    { label: "Phone", value: <span className="tabular-nums">{branch.contactPhoneE164 || "+66 2 000 1234"}</span> },
    { label: "Reservations email", value: branch.contactEmail || "stay@riverside-bkk.example" },
  ];

  const policyRows: Array<{ label: string; value: React.ReactNode; hint: string }> = [
    { label: "Check-in", value: settings?.checkInTime || "14:00", hint: "Standard arrival time" },
    { label: "Check-out", value: settings?.checkOutTime || "12:00", hint: "Standard departure time" },
    { label: "VAT", value: percent(settings?.vatRate, 0.07), hint: "Applied to all charges" },
    { label: "Service charge", value: percent(settings?.serviceChargeRate, 0.1), hint: "Applied before VAT" },
    {
      label: "Booking hold",
      value: `${settings?.holdTtlMinutes || 15} min`,
      hint: "How long rates are held at checkout",
    },
    {
      label: "Daily run-sheet",
      value: settings?.dispatchGenerationTime || "05:30",
      hint: "When the dispatch plan is generated",
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      {successMsg ? (
        <div
          role="status"
          className="flex items-center gap-2 rounded-md border border-border bg-success-soft px-3 py-2 text-[13px] text-success animate-in fade-in"
        >
          <CheckCircle2 className="size-4" />
          {successMsg}
        </div>
      ) : null}

      {/* Property profile */}
      <Card>
        <CardHeader>
          <div>
            <div className="flex items-center gap-2">
              <CardTitle>Property profile</CardTitle>
              <Badge tone="neutral" className="font-mono">
                {branch.code}
              </Badge>
            </div>
            <CardDescription>Identity and contact details shown on the booking engine.</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={() => setIsCreateOpen(true)}>
            <Plus /> Add property
          </Button>
        </CardHeader>
        <CardContent className="grid gap-6 lg:grid-cols-[1fr_200px]">
          <dl className="grid gap-x-6 gap-y-4 sm:grid-cols-2">
            {profileRows.map((row) => (
              <div key={row.label} className="flex flex-col gap-0.5">
                <dt className="text-xs text-muted-foreground">{row.label}</dt>
                <dd className="text-sm text-foreground">{row.value}</dd>
              </div>
            ))}
          </dl>
          <ImageUploadDropzone
            folder="branches"
            label="Logo"
            value={branch.logoUrl}
            aspectRatio="square"
            onUploadComplete={() => void handleLogoUpload()}
          />
        </CardContent>
      </Card>

      {/* Policies & charges */}
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Policies &amp; charges</CardTitle>
            <CardDescription>Stay times, taxes and operational defaults for this property.</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="overflow-hidden rounded-b-lg p-0">
          <dl className="grid gap-px bg-border sm:grid-cols-2 lg:grid-cols-3">
            {policyRows.map((row) => (
              <div key={row.label} className="flex flex-col gap-0.5 bg-surface px-5 py-4">
                <dt className="text-xs text-muted-foreground">{row.label}</dt>
                <dd className="text-lg font-semibold tabular-nums text-foreground">{row.value}</dd>
                <p className="text-xs text-muted-foreground">{row.hint}</p>
              </div>
            ))}
          </dl>
        </CardContent>
      </Card>

      {/* Brand imagery */}
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Brand imagery</CardTitle>
            <CardDescription>Hero and gallery photography used across the booking engine.</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <div className="grid gap-6 md:grid-cols-2">
            <ImageUploadDropzone
              folder="branches"
              label="Hero image"
              value={branch.heroImageUrl}
              aspectRatio="video"
              onUploadComplete={() => void handleHeroUpload()}
            />
            <ImageUploadDropzone
              folder="branches"
              label="Add gallery photo"
              aspectRatio="video"
              onUploadComplete={() => void handleAddGalleryImage()}
            />
          </div>

          <div className="flex flex-col gap-3">
            <h4 className="text-[13px] font-medium text-foreground">
              Gallery{" "}
              <span className="font-normal text-muted-foreground">({branch.images?.length ?? 0})</span>
            </h4>
            <MediaGallery
              images={branch.images ?? []}
              coverImage={branch.heroImageUrl}
              onDelete={(url) => void handleDeleteImage(url)}
              className="md:grid-cols-4"
            />
          </div>
        </CardContent>
      </Card>

      {createDialog}
    </div>
  );
}
