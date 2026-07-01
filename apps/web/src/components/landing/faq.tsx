"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const faqs = [
  {
    q: "What is StellarFund?",
    a: "StellarFund is a decentralized crowdfunding dApp built on Stellar Soroban testnet. It lets creators raise XLM for projects with smart contract escrow and automatic refunds.",
  },
  {
    q: "Which wallets are supported?",
    a: "We support Freighter, xBull, Albedo, Rabet, and other wallets via the Stellar Wallets Kit. Connect with one click from the navbar.",
  },
  {
    q: "What happens if a campaign fails?",
    a: "If a campaign doesn't reach its goal by the deadline, its status changes to Failed. Contributors can then call the refund function to reclaim their XLM from the treasury contract.",
  },
  {
    q: "Are there platform fees?",
    a: "StellarFund charges zero platform fees. You only pay Stellar network transaction fees (fractions of a cent).",
  },
  {
    q: "Can creators withdraw before the deadline?",
    a: "Creators can withdraw once the funding goal is reached. If the goal isn't met, they must wait until after the deadline — and only if the goal was reached.",
  },
  {
    q: "Is this on mainnet?",
    a: "Currently StellarFund runs on Soroban testnet for development and demos. Set NEXT_PUBLIC_NETWORK=TESTNET in your environment.",
  },
];

export function FAQSection() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className="bg-white/[0.02] px-4 py-24 sm:px-6">
      <div className="mx-auto max-w-3xl">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-bold sm:text-4xl">FAQ</h2>
          <p className="text-muted-foreground">Common questions about StellarFund</p>
        </div>
        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div
              key={i}
              className="glass overflow-hidden rounded-xl border border-white/10"
            >
              <button
                type="button"
                onClick={() => setOpen(open === i ? null : i)}
                className="flex w-full items-center justify-between px-6 py-4 text-left font-semibold"
              >
                {faq.q}
                <ChevronDown
                  className={cn(
                    "h-5 w-5 shrink-0 text-orange-400 transition-transform",
                    open === i && "rotate-180",
                  )}
                />
              </button>
              <AnimatePresence>
                {open === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <p className="border-t border-white/10 px-6 py-4 text-sm text-muted-foreground">
                      {faq.a}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
