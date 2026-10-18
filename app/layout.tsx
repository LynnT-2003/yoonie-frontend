import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "../providers/auth-provider";
import { AppQueryProvider } from "../providers/query-provider";
import { Navbar } from "@/modules/layout/Navbar";
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Yoonie · Hospitality Operating System",
  description:
    "Direct booking engine, master guest CDP, and frontline dispatch operations for boutique hotels.",
};

import { OnboardingProvider } from "@/providers/onboarding-provider";
import { YoonieOnboardingModal } from "@/components/onboarding/YoonieOnboardingModal";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${geistSans.className} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#F8F5EE] text-[#303A36] dark:bg-[#17201D] dark:text-[#F5EBDD]">
        <AppQueryProvider>
          <AuthProvider>
            <OnboardingProvider>
              <Navbar />
              <main className="flex flex-1 flex-col">{children}</main>
              <YoonieOnboardingModal />
            </OnboardingProvider>
          </AuthProvider>
        </AppQueryProvider>
      </body>
    </html>
  );
}
