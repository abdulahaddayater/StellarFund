"use client";

import { motion } from "framer-motion";

const steps = [
  {
    title: "Create your project page",
    description:
      "Add a title, description, funding goal, and deadline. This is stored on Stellar testnet.",
  },
  {
    title: "Back a project with XLM",
    description:
      "Choose an amount, connect your wallet, and approve the transaction in Freighter.",
  },
  {
    title: "Get paid or refunded automatically",
    description:
      "If the goal is reached, the creator withdraws. If not, backers can claim refunds.",
  },
];

export function HowItWorksSection() {
  return (
    <section className="px-4 py-24 sm:px-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-3xl font-bold sm:text-4xl">How it works</h2>
          <p className="mx-auto max-w-2xl text-muted-foreground">
            Three simple steps — no crypto jargon required
          </p>
        </div>
        <div className="grid gap-8 md:grid-cols-3">
          {steps.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="glass relative rounded-2xl border border-white/10 p-6"
            >
              <span className="mb-4 inline-flex h-8 w-8 items-center justify-center rounded-full bg-orange-500 text-sm font-bold text-white">
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
