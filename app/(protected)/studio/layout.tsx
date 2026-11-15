import type { ReactNode } from "react";
import { StudioProvider } from "@/providers/studio-provider";
import { StudioShell } from "@/modules/studio/components/ChatPanel";
import { TourProvider } from "@/modules/studio/components/StudioTour";

export const metadata = {
  title: "Studio · Yoonie",
  description: "Upload your hotel data and get evidence-backed recommendations.",
};

export default function StudioLayout({ children }: { children: ReactNode }) {
  return (
    <StudioProvider>
      <TourProvider>
        <StudioShell>{children}</StudioShell>
      </TourProvider>
    </StudioProvider>
  );
}
