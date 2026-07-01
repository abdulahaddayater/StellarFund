"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Megaphone,
  Wallet,
  Plus,
  Sun,
  Moon,
  Menu,
  X,
} from "lucide-react";
import { useTheme } from "next-themes";
import { useState } from "react";
import { cn, formatXlmAmount, truncateAddress } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useWallet } from "@/providers/wallet-provider";

const navLinks = [
  { href: "/campaigns", label: "Browse Projects", icon: Megaphone },
  { href: "/campaigns/create", label: "Start a Project", icon: Plus },
  { href: "/dashboard", label: "My Dashboard", icon: LayoutDashboard },
  { href: "/wallet", label: "Wallet", icon: Wallet },
];

export function Navbar() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const { address, xlmBalance, balanceLoading, isConnected, isConnecting, connect, disconnect } =
    useWallet();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-lg font-bold">
            Stellar<span className="text-orange-400">Fund</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "rounded-lg px-4 py-2 text-sm font-medium transition-colors",
                pathname === href || pathname.startsWith(href + "/")
                  ? "bg-orange-500/15 text-orange-400"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            aria-label="Toggle theme"
          >
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </Button>

          {isConnected && address ? (
            <>
              <Link href="/wallet" className="sm:hidden">
                <Button variant="outline" size="sm">
                  {balanceLoading
                    ? "..."
                    : xlmBalance !== null
                      ? `${formatXlmAmount(xlmBalance)} XLM`
                      : "Wallet"}
                </Button>
              </Link>
              <div className="hidden items-center gap-2 sm:flex">
                <Link href="/wallet">
                  <Button variant="outline" size="sm" className="gap-2">
                    <span className="font-semibold text-orange-400">
                      {balanceLoading
                        ? "..."
                        : xlmBalance !== null
                          ? `${formatXlmAmount(xlmBalance)} XLM`
                          : "— XLM"}
                    </span>
                  </Button>
                </Link>
                <Button variant="secondary" size="sm" onClick={disconnect}>
                  {truncateAddress(address)}
                </Button>
              </div>
            </>
          ) : (
            <Button size="sm" onClick={connect} disabled={isConnecting}>
              {isConnecting ? "Connecting..." : "Connect Wallet to Begin"}
            </Button>
          )}

          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {mobileOpen && (
        <motion.nav
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="border-t border-white/10 px-4 py-4 md:hidden"
        >
          {navLinks.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium hover:bg-white/5"
            >
              <Icon className="h-4 w-4 text-orange-400" />
              {label}
            </Link>
          ))}
        </motion.nav>
      )}
    </header>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-background/50">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="grid gap-8 md:grid-cols-4">
          <div>
            <div className="mb-4 flex items-center gap-2">
              <span className="text-lg font-bold">StellarFund</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Crowdfunding on Stellar — transparent, wallet-based, no middlemen.
            </p>
          </div>
          <div>
            <h4 className="mb-3 font-semibold">Platform</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/campaigns" className="hover:text-orange-400">Browse Projects</Link></li>
              <li><Link href="/campaigns/create" className="hover:text-orange-400">Start a Project</Link></li>
              <li><Link href="/dashboard" className="hover:text-orange-400">My Dashboard</Link></li>
              <li><Link href="/wallet" className="hover:text-orange-400">Wallet</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="mb-3 font-semibold">Resources</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="https://stellar.org" target="_blank" rel="noopener noreferrer" className="hover:text-orange-400">Stellar.org</a></li>
              <li><a href="https://soroban.stellar.org" target="_blank" rel="noopener noreferrer" className="hover:text-orange-400">Soroban Docs</a></li>
            </ul>
          </div>
          <div>
            <h4 className="mb-3 font-semibold">Network</h4>
            <p className="text-sm text-muted-foreground">
              Running on Stellar Soroban Testnet
            </p>
          </div>
        </div>
        <div className="mt-8 border-t border-white/10 pt-8 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} StellarFund. Built on Stellar Soroban.
        </div>
      </div>
    </footer>
  );
}
