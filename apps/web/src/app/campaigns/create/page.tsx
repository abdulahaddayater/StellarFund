"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { submitCreateCampaign } from "@/lib/api/client";
import { CATEGORIES } from "@/lib/constants";
import { signAndSubmitXdr } from "@/lib/soroban/submit";
import { formatWalletError } from "@/lib/soroban/errors";
import { xlmToStroops } from "@/lib/utils";
import { isAllowedCampaignImageUrl } from "@/lib/campaign-image";
import { useWallet } from "@/providers/wallet-provider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Textarea, Label, Select } from "@/components/ui/input";

const PLACEHOLDER_IMAGES = [
  "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800&q=80",
  "https://images.unsplash.com/photo-1511379938545-c1f69419868d?w=800&q=80",
  "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&q=80",
  "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&q=80",
];

const schema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  goalXlm: z.number().positive("Goal must be positive"),
  days: z.number().int().min(1).max(365),
  category: z.string().min(1),
  minContributionXlm: z.number().positive(),
  image: z
    .string()
    .url("Enter a valid image URL")
    .refine(isAllowedCampaignImageUrl, {
      message:
        "Use a direct Unsplash image link (images.unsplash.com), not a search page.",
    })
    .optional()
    .or(z.literal("")),
});

type FormData = z.infer<typeof schema>;

export default function CreateCampaignPage() {
  const router = useRouter();
  const { address, isConnected, connect } = useWallet();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      category: "Technology",
      days: 30,
      minContributionXlm: 1,
      image: PLACEHOLDER_IMAGES[0],
    },
  });

  async function onSubmit(data: FormData) {
    if (!isConnected || !address) {
      await connect();
      return;
    }

    if (data.minContributionXlm > data.goalXlm) {
      toast.error("Minimum contribution cannot exceed goal");
      return;
    }

    const deadline = Math.floor(Date.now() / 1000) + data.days * 86400;
    const image =
      data.image ||
      PLACEHOLDER_IMAGES[Math.floor(Math.random() * PLACEHOLDER_IMAGES.length)];

    try {
      const result = await submitCreateCampaign({
        title: data.title,
        description: data.description,
        image,
        goal: Number(xlmToStroops(data.goalXlm)),
        deadline,
        category: data.category,
        minContribution: Number(xlmToStroops(data.minContributionXlm)),
        creator: address,
      });

      if (result.mock) {
        toast.success("Campaign created (demo mode)");
        if (result.campaignId) {
          router.push(`/campaigns/${result.campaignId}`);
        } else {
          router.push("/campaigns");
        }
        return;
      }

      if (result.xdr) {
        const { returnValue } = await signAndSubmitXdr(result.xdr, address);
        toast.success("Campaign created on-chain");
        const campaignId =
          typeof returnValue === "number"
            ? returnValue
            : typeof returnValue === "bigint"
              ? Number(returnValue)
              : undefined;
        router.push(
          campaignId && campaignId > 0
            ? `/campaigns/${campaignId}`
            : "/campaigns",
        );
        return;
      }

      toast.success("Transaction prepared — sign in your wallet");
      router.push("/campaigns");
    } catch (e) {
      toast.error(formatWalletError(e));
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="mb-2 text-3xl font-bold">Create Campaign</h1>
        <p className="mb-8 text-muted-foreground">
          Launch your project on Stellar Soroban testnet
        </p>

        <Card>
          <CardHeader>
            <CardTitle>Campaign Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input id="title" {...register("title")} placeholder="My Awesome Project" />
                {errors.title && (
                  <p className="mt-1 text-xs text-red-400">{errors.title.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  {...register("description")}
                  placeholder="Tell backers about your project..."
                />
                {errors.description && (
                  <p className="mt-1 text-xs text-red-400">
                    {errors.description.message}
                  </p>
                )}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="goalXlm">Funding Goal (XLM)</Label>
                  <Input id="goalXlm" type="number" step="0.1" {...register("goalXlm", { valueAsNumber: true })} />
                  {errors.goalXlm && (
                    <p className="mt-1 text-xs text-red-400">{errors.goalXlm.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="minContributionXlm">Min Contribution (XLM)</Label>
                  <Input
                    id="minContributionXlm"
                    type="number"
                    step="0.1"
                    {...register("minContributionXlm", { valueAsNumber: true })}
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="days">Duration (days)</Label>
                  <Input id="days" type="number" {...register("days", { valueAsNumber: true })} />
                </div>
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select id="category" {...register("category")}>
                    {CATEGORIES.filter((c) => c !== "All").map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="image">Image URL</Label>
                <Input
                  id="image"
                  {...register("image")}
                  placeholder="https://images.unsplash.com/photo-..."
                />
              </div>

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Creating..." : "Launch Campaign"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
