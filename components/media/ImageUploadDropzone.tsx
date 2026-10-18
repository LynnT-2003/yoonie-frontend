"use client";

import * as React from "react";
import { UploadCloud, X, Loader2, Image as ImageIcon } from "lucide-react";
import { uploadMedia, type StorageFolder } from "@/lib/domain/storage/storage-api";

type ImageUploadDropzoneProps = {
  folder: StorageFolder;
  value?: string | null;
  onUploadComplete: (url: string, key: string) => void;
  onRemove?: () => void;
  label?: string;
  helperText?: string;
  aspectRatio?: "square" | "video" | "wide";
  className?: string;
  disabled?: boolean;
};

export function ImageUploadDropzone({
  folder,
  value,
  onUploadComplete,
  onRemove,
  label,
  helperText = "PNG, JPG, WebP up to 10MB",
  aspectRatio = "video",
  className = "",
  disabled = false,
}: ImageUploadDropzoneProps) {
  const [isUploading, setIsUploading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [isDragging, setIsDragging] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file (PNG, JPG, WebP).");
      return;
    }
    setError(null);
    setIsUploading(true);
    try {
      const result = await uploadMedia(file, folder);
      onUploadComplete(result.url, result.key);
    } catch (err) {
      console.error("Upload error:", err);
      setError(err instanceof Error ? err.message : "Upload failed. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      void handleFile(file);
    }
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled && !isUploading) setIsDragging(true);
  };

  const onDragLeave = () => {
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled || isUploading) return;
    const file = e.dataTransfer.files?.[0];
    if (file) {
      void handleFile(file);
    }
  };

  const aspectClass =
    aspectRatio === "square"
      ? "aspect-square max-w-[200px]"
      : aspectRatio === "wide"
      ? "aspect-21/9"
      : "aspect-16/9";

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label ? <span className="text-[13px] font-medium text-foreground">{label}</span> : null}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/avif"
        className="hidden"
        onChange={onFileChange}
        disabled={disabled || isUploading}
      />

      {value ? (
        <div className={`relative group overflow-hidden rounded-md border border-border bg-subtle ${aspectClass}`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt="Uploaded preview" className="h-full w-full object-cover" />

          <div className="absolute inset-x-0 bottom-0 flex justify-end gap-1.5 bg-linear-to-t from-black/50 to-transparent p-2 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="rounded-md bg-white/95 px-2.5 py-1 text-xs font-medium text-[#1b2420] shadow-sm hover:bg-white"
            >
              Replace
            </button>
            {onRemove ? (
              <button
                type="button"
                onClick={onRemove}
                className="rounded-md bg-white/95 p-1.5 text-[#b42318] shadow-sm hover:bg-white"
                aria-label="Remove photo"
              >
                <X className="size-3.5" />
              </button>
            ) : null}
          </div>
        </div>
      ) : (
        <div
          role="button"
          tabIndex={0}
          onClick={() => {
            if (!disabled && !isUploading) fileInputRef.current?.click();
          }}
          onKeyDown={(e) => {
            if ((e.key === "Enter" || e.key === " ") && !disabled && !isUploading) {
              e.preventDefault();
              fileInputRef.current?.click();
            }
          }}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          className={`relative flex cursor-pointer flex-col items-center justify-center rounded-md border border-dashed px-6 py-8 text-center transition focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/15 ${
            isDragging
              ? "border-primary bg-secondary/60"
              : "border-input bg-subtle/40 hover:border-muted-foreground/40 hover:bg-subtle"
          } ${aspectRatio === "video" ? "" : aspectClass}`}
        >
          {isUploading ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="size-5 animate-spin text-muted-foreground" />
              <span className="text-[13px] text-muted-foreground">Uploading…</span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              {isDragging ? (
                <UploadCloud className="size-5 text-primary" />
              ) : (
                <ImageIcon className="size-5 text-muted-foreground" />
              )}
              <p className="text-[13px] text-foreground">
                <span className="font-medium text-primary">Upload a photo</span> or drag and drop
              </p>
              <p className="text-xs text-muted-foreground">{helperText}</p>
            </div>
          )}
        </div>
      )}

      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}
