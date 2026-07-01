"use client";

import { motion } from "framer-motion";
import {
  Zap,
  Globe,
  Lock,
  BarChart3,
  RefreshCw,
  Users,
} from "lucide-react";

const features = [
  {
    icon: Zap,
    title: "Instant Settlement",
    description: "XLM transfers settle in ~5 seconds on Stellar.",
  },
  {
    icon: Globe,
    title: "Borderless Funding",
    description: "Accept contributions from anywhere in the world.",
  },
  {
    icon: Lock,
    title: "Trustless Escrow",
    description: "Smart contracts hold funds until conditions are met.",
  },
  {
    icon: BarChart3,
    title: "Real-time Tracking",
    description: "Live SSE event stream for campaign activity.",
  },
  {
    icon: RefreshCw,
    title: "Automatic Refunds",
    description: "Failed campaigns trigger on-chain refund flows.",
  },
  {
    icon: Users,
    title: "Community Driven",
    description: "No gatekeepers — anyone can launch or back ideas.",
  },
];

export function FeaturesSection() {
  return (
    <section className="bg-white/[0.02] px-4 py-24 sm:px-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-3xl font-bold sm:text-4xl">Features</h2>
          <p className="text-muted-foreground">
            Everything you need for transparent crowdfunding
          </p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="glass group rounded-2xl border border-white/10 p-6 transition-colors hover:border-orange-500/30"
            >
              <f.icon className="mb-4 h-8 w-8 text-orange-400 transition-transform group-hover:scale-110" />
              <h3 className="mb-2 font-bold">{f.title}</h3>
              <p className="text-sm text-muted-foreground">{f.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
