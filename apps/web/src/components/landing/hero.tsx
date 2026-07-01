"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const quickSteps = [
  "Connect your Stellar wallet",
  "Browse or start a project",
  "Sign the transaction in Freighter",
];

export function HeroSection() {
  return (
    <section className="hero-gradient grid-pattern relative overflow-hidden px-4 pb-24 pt-20 sm:px-6">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-4xl text-center"
        >
          <h1 className="mb-6 text-4xl font-extrabold tracking-tight sm:text-6xl lg:text-7xl">
            Raise money for your idea{" "}
            <span className="bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent">
              on Stellar
            </span>
          </h1>
          <p className="mx-auto mb-8 max-w-2xl text-lg text-muted-foreground sm:text-xl">
            StellarFund helps creators launch funding campaigns and lets backers
            support them with XLM. Everything is recorded on the blockchain so
            anyone can verify the results.
          </p>

          <div className="mx-auto mb-10 flex max-w-2xl flex-col gap-2 text-left sm:mx-auto sm:inline-flex sm:flex-row sm:gap-6 sm:text-center">
            {quickSteps.map((step, index) => (
              <div
                key={step}
                className="flex items-center gap-2 text-sm text-muted-foreground sm:flex-col sm:gap-1"
              >
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-orange-500/20 text-xs font-bold text-orange-400">
                  {index + 1}
                </span>
                <span>{step}</span>
              </div>
            ))}
          </div>

          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/campaigns">
              <Button size="lg" className="gap-2">
                Browse Projects
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/campaigns/create">
              <Button variant="secondary" size="lg">
                Start a Project
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
