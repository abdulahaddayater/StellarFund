import type { Metadata } from "next";
import Script from "next/script";
import { Geist, Geist_Mono } from "next/font/google";
import { ClientShell } from "@/components/layout/client-shell";
import { CHUNK_ERROR_RECOVERY_SCRIPT } from "@/lib/chunk-error";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "StellarFund — Decentralized Crowdfunding on Stellar",
  description:
    "Fund ideas without middlemen. Launch and back campaigns on Stellar Soroban with transparent, trustless escrow.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-[#0a0a0f] text-[#fafafa] antialiased`}
      >
        <Script id="chunk-error-recovery" strategy="beforeInteractive">
          {CHUNK_ERROR_RECOVERY_SCRIPT}
        </Script>
        <ClientShell>{children}</ClientShell>
      </body>
    </html>
  );
}
