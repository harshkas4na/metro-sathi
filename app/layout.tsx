import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";

import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/lib/auth-context";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Metro Sathi - Find Your Metro Travel Buddy",
  description:
    "Connect with fellow Delhi Metro travelers on your route. Find travel companions, stay safe, and make your commute social.",
  keywords: ["Delhi Metro", "travel buddy", "commute companion", "metro sathi"],
  icons: {
    apple: "/logo/half-logo.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#0066CC",
  interactiveWidget: "resizes-content",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* eslint-disable-next-line @next/next/no-before-interactive-script-outside-document */}
        <script
          async
          src="https://analytics.ahrefs.com/analytics.js"
          data-key="aiybReG6/Ra/vUfmFnYmew"
        />
      </head>
      <body className={`${inter.variable} font-sans antialiased`}>
        <AuthProvider>
          {children}
          <Toaster position="top-center" richColors />
        </AuthProvider>
      </body>
    </html>
  );
}

