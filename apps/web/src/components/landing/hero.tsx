"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

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
            Fund Ideas{" "}
            <span className="bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent">
              Without Middlemen
            </span>
          </h1>
          <p className="mx-auto mb-10 max-w-2xl text-lg text-muted-foreground sm:text-xl">
            StellarFund is a decentralized crowdfunding platform on Stellar
            Soroban. Launch campaigns, contribute with XLM, and track every
            transaction on-chain — transparent, secure, and borderless.
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/campaigns">
              <Button size="lg" className="gap-2">
                Explore Campaigns
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/campaigns/create">
              <Button variant="secondary" size="lg">
                Start a Campaign
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
