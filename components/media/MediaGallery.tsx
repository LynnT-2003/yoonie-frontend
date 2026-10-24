"use client";

import * as React from "react";
import { Star, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

type MediaGalleryProps = {
  images: string[];
  coverImage?: string;
  onSetCover?: (url: string) => void;
  onDelete?: (url: string) => void;
  className?: string;
};

/** Photo grid with cover marker and per-photo actions, used by the admin editors. */
export function MediaGallery({ images, coverImage, onSetCover, onDelete, className }: MediaGalleryProps) {
  if (images.length === 0) {
    return (
      <p className="rounded-md border border-dashed border-border px-4 py-6 text-center text-[13px] text-muted-foreground">
        No photos yet.
      </p>
    );
  }

  return (
    <ul className={cn("grid grid-cols-2 gap-3 sm:grid-cols-3", className)}>
      {images.map((url, idx) => {
        const isCover = coverImage ? coverImage === url : idx === 0;
        return (
          <li
            key={url}
            className={cn(
              "group relative aspect-4/3 overflow-hidden rounded-md border bg-subtle",
              isCover ? "border-primary ring-1 ring-primary" : "border-border"
            )}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url} alt={`Photo ${idx + 1}`} className="h-full w-full object-cover" />

            {isCover ? (
              <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded bg-white/95 px-1.5 py-0.5 text-[11px] font-medium text-[#1b2420] shadow-xs">
                <Star className="size-3 fill-current text-[#a8803f]" /> Cover
              </span>
            ) : null}

            <div className="absolute inset-x-0 bottom-0 flex items-center justify-end gap-1.5 bg-linear-to-t from-black/55 to-transparent p-2 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
              {!isCover && onSetCover ? (
                <button
                  type="button"
                  onClick={() => onSetCover(url)}
                  className="rounded bg-white/95 px-2 py-1 text-[11px] font-medium text-[#1b2420] shadow-xs hover:bg-white"
                >
                  Set as cover
                </button>
              ) : null}
              {onDelete ? (
                <button
                  type="button"
                  onClick={() => onDelete(url)}
                  className="rounded bg-white/95 p-1.5 text-[#b42318] shadow-xs hover:bg-white"
                  aria-label="Delete photo"
                >
                  <Trash2 className="size-3.5" />
                </button>
              ) : null}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
