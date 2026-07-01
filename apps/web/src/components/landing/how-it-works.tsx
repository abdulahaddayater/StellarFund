"use client";

import { motion } from "framer-motion";
import { Wallet, Rocket, Shield, ArrowDownLeft } from "lucide-react";

const steps = [
  {
    icon: Rocket,
    title: "Create a Campaign",
    description:
      "Set your funding goal, deadline, and minimum contribution. Deploy on Soroban in one transaction.",
  },
  {
    icon: Wallet,
    title: "Back with XLM",
    description:
      "Contributors connect their Stellar wallet and fund campaigns directly — no platform fees or escrow.",
  },
  {
    icon: Shield,
    title: "Smart Contract Escrow",
    description:
      "Funds are held in a treasury contract. Creators withdraw on success; backers get automatic refunds on failure.",
  },
  {
    icon: ArrowDownLeft,
    title: "Withdraw or Refund",
    description:
      "Goal reached? Creators withdraw. Campaign failed? Contributors claim refunds trustlessly on-chain.",
  },
];

export function HowItWorksSection() {
  return (
    <section className="px-4 py-24 sm:px-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-3xl font-bold sm:text-4xl">How It Works</h2>
          <p className="mx-auto max-w-2xl text-muted-foreground">
            Four simple steps to launch or back a campaign on Stellar Soroban
          </p>
        </div>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="glass relative rounded-2xl border border-white/10 p-6"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-orange-500/15">
                <step.icon className="h-6 w-6 text-orange-400" />
              </div>
              <span className="absolute right-4 top-4 text-3xl font-bold text-orange-500/20">
                {i + 1}
              </span>
              <h3 className="mb-2 text-lg font-bold">{step.title}</h3>
              <p className="text-sm text-muted-foreground">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
