import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import { Suspense } from "react";
import { InstallBanner } from "@/components/install-banner";
import { PwaInit } from "@/components/pwa-init";
import { ACCENT_BOOT_SCRIPT } from "@/lib/settings-shared";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

const siteUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: "CineFlex — Movies & Series", template: "%s · CineFlex" },
  description:
    "CineFlex is a clean, minimal way to discover and watch movies and TV series. No sign-up, no clutter — installable on any device.",
  applicationName: "CineFlex",
  appleWebApp: { capable: true, title: "CineFlex", statusBarStyle: "black-translucent" },
  formatDetection: { telephone: false },
  openGraph: { type: "website", siteName: "CineFlex" },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = {
  themeColor: "#09090b",
  colorScheme: "dark",
  // Let the installed app draw under system bars; the nav pads with safe-area insets.
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // suppressHydrationWarning: the boot script sets the saved accent on <html> before hydration.
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} antialiased`} suppressHydrationWarning>
      <body className="min-h-dvh">
        {/* Applies the saved accent before first paint (no flash of the default color). */}
        <Script id="accent-boot" strategy="beforeInteractive">
          {ACCENT_BOOT_SCRIPT}
        </Script>
        {children}
        <PwaInit />
        <Suspense>
          <InstallBanner />
        </Suspense>
      </body>
    </html>
  );
}
