"use client";

import { motion } from "framer-motion";
import { Star, Coins, ShieldCheck, Layers } from "lucide-react";

const reasons = [
  {
    icon: Star,
    title: "Battle-Tested Network",
    description:
      "Stellar processes millions of transactions daily with 5-second finality and sub-cent fees.",
  },
  {
    icon: Coins,
    title: "Native XLM",
    description:
      "No wrapped tokens or bridges. Contributors fund campaigns directly with Stellar lumens.",
  },
  {
    icon: ShieldCheck,
    title: "Soroban Smart Contracts",
    description:
      "Rust-powered contracts with formal verification support and WASM sandboxing.",
  },
  {
    icon: Layers,
    title: "Composable DeFi",
    description:
      "Registry pattern enables modular treasury, campaign, and governance contracts.",
  },
];

export function WhyStellarSection() {
  return (
    <section className="px-4 py-24 sm:px-6">
      <div className="mx-auto max-w-7xl">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <h2 className="mb-4 text-3xl font-bold sm:text-4xl">
              Why <span className="text-orange-400">Stellar</span>?
            </h2>
            <p className="mb-8 text-muted-foreground">
              Stellar was built for payments and asset issuance at scale. Soroban
              brings smart contract capabilities without sacrificing speed or
              low fees — perfect for crowdfunding.
            </p>
            <div className="space-y-6">
              {reasons.map((r, i) => (
                <motion.div
                  key={r.title}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="flex gap-4"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-orange-500/15">
                    <r.icon className="h-5 w-5 text-orange-400" />
                  </div>
                  <div>
                    <h3 className="font-bold">{r.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {r.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="glass relative aspect-square overflow-hidden rounded-3xl border border-white/10 p-8"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 to-amber-500/5" />
            <div className="relative flex h-full flex-col items-center justify-center text-center">
              <div className="mb-4 text-6xl font-extrabold text-orange-400">
                ~5s
              </div>
              <p className="text-lg font-semibold">Transaction Finality</p>
              <p className="mt-2 text-sm text-muted-foreground">
                vs. minutes on other chains
              </p>
              <div className="mt-8 grid w-full grid-cols-2 gap-4">
                <div className="rounded-xl bg-white/5 p-4">
                  <div className="text-2xl font-bold">$0.00001</div>
                  <div className="text-xs text-muted-foreground">Avg. fee</div>
                </div>
                <div className="rounded-xl bg-white/5 p-4">
                  <div className="text-2xl font-bold">7M+</div>
                  <div className="text-xs text-muted-foreground">Accounts</div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
