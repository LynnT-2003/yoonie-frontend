import type { Metadata } from "next";
import { Geist_Mono, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "../providers/auth-provider";
import { AppQueryProvider } from "../providers/query-provider";
import { Navbar } from "@/modules/layout/Navbar";
import { Toaster } from "@/components/ui/sonner";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Yoonie · Your Pocket Strategist",
  description:
    "Your hotel already has the data. Yoonie cleans it, makes sense of it, and tells you what to do next.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${jakarta.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-background text-foreground overflow-x-hidden max-w-full">
        <AppQueryProvider>
          <AuthProvider>
            <Navbar />
            <main className="flex flex-1 flex-col min-w-0 max-w-full overflow-x-hidden">{children}</main>
            <Toaster />
          </AuthProvider>
        </AppQueryProvider>
      </body>
    </html>
  );
}
