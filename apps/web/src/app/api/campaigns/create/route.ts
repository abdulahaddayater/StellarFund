import { NextResponse } from "next/server";
import { z } from "zod";
import { TransactionBuilder, BASE_FEE, Contract } from "@stellar/stellar-sdk";
import { nativeToScVal, server } from "@/lib/soroban/client";
import { isOnChainMode, NETWORK_PASSPHRASE, REGISTRY_ID } from "@/lib/constants";
import { parseSorobanError } from "@/lib/soroban/errors";
import { isAllowedCampaignImageUrl } from "@/lib/campaign-image";

const schema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().min(1).max(5000),
  image: z
    .string()
    .url()
    .refine(isAllowedCampaignImageUrl, {
      message:
        "Image must be a direct HTTPS link from images.unsplash.com (not a search or gallery page).",
    }),
  goal: z.number().positive(),
  deadline: z.number().positive(),
  category: z.string().min(1),
  minContribution: z.number().positive(),
  creator: z.string().min(56),
});

export async function POST(req: Request) {
  try {
    const body = schema.parse(await req.json());

    if (!isOnChainMode) {
      return NextResponse.json({
        success: true,
        campaignId: 1,
        mock: true,
      });
    }

    const contract = new Contract(REGISTRY_ID);
    const account = await server.getAccount(body.creator);

    const tx = new TransactionBuilder(account, {
      fee: BASE_FEE,
      networkPassphrase: NETWORK_PASSPHRASE,
    })
      .addOperation(
        contract.call(
          "create_campaign",
          nativeToScVal(body.creator, { type: "address" }),
          nativeToScVal(body.title, { type: "string" }),
          nativeToScVal(body.description, { type: "string" }),
          nativeToScVal(body.image, { type: "string" }),
          nativeToScVal(body.goal, { type: "i128" }),
          nativeToScVal(body.deadline, { type: "u64" }),
          nativeToScVal(body.category, { type: "string" }),
          nativeToScVal(body.minContribution, { type: "i128" }),
        ),
      )
      .setTimeout(300)
      .build();

    const prepared = await server.prepareTransaction(tx);
    return NextResponse.json({
      success: true,
      xdr: prepared.toXDR(),
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: err.issues[0]?.message ?? "Validation failed" },
        { status: 400 },
      );
    }
    console.error("POST /api/campaigns/create:", err);
    return NextResponse.json({ error: parseSorobanError(err) }, { status: 400 });
  }
}
