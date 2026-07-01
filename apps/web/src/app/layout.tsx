import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Navbar, Footer } from "@/components/layout/navbar";
import { ThemeProvider } from "@/providers/theme-provider";
import { WalletProvider } from "@/providers/wallet-provider";
import { ToastProvider } from "@/providers/toast-provider";
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
    <html lang="en" suppressHydrationWarning className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-background text-foreground antialiased`}
      >
        <ThemeProvider>
          <WalletProvider>
            <Navbar />
            <main>{children}</main>
            <Footer />
            <ToastProvider />
          </WalletProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
