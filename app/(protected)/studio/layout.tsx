import type { ReactNode } from "react";
import { StudioProvider } from "@/providers/studio-provider";

export const metadata = {
  title: "Studio · Yoonie",
  description: "Upload your hotel data and get evidence-backed recommendations.",
};

export default function StudioLayout({ children }: { children: ReactNode }) {
  return <StudioProvider>{children}</StudioProvider>;
}
