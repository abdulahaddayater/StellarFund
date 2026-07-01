import { NextResponse } from "next/server";
import { z } from "zod";
import { getCampaignFromChain, nativeToScVal, server } from "@/lib/soroban/client";
import { TransactionBuilder, BASE_FEE, Contract } from "@stellar/stellar-sdk";
import { isOnChainMode, NETWORK_PASSPHRASE, REGISTRY_ID } from "@/lib/constants";
import { parseSorobanError } from "@/lib/soroban/errors";

const schema = z.object({
  campaignId: z.number().int().positive(),
  contributor: z.string().min(56),
  amount: z.number().positive(),
});

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    const body = schema.parse(await req.json());

    if (parseInt(id, 10) !== body.campaignId) {
      return NextResponse.json({ error: "ID mismatch" }, { status: 400 });
    }

    if (!isOnChainMode) {
      return NextResponse.json({ success: true, mock: true });
    }

    const campaign = await getCampaignFromChain(body.campaignId);
    if (!campaign) {
      return NextResponse.json(
        {
          error:
            "This campaign does not exist on-chain. Create a campaign at /campaigns/create first.",
        },
        { status: 404 },
      );
    }

    const contract = new Contract(REGISTRY_ID);
    const account = await server.getAccount(body.contributor);

    const tx = new TransactionBuilder(account, {
      fee: BASE_FEE,
      networkPassphrase: NETWORK_PASSPHRASE,
    })
      .addOperation(
        contract.call(
          "contribute",
          nativeToScVal(body.campaignId, { type: "u32" }),
          nativeToScVal(body.contributor, { type: "address" }),
          nativeToScVal(body.amount, { type: "i128" }),
        ),
      )
      .setTimeout(300)
      .build();

    const prepared = await server.prepareTransaction(tx);
    return NextResponse.json({ success: true, xdr: prepared.toXDR() });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: err.issues[0]?.message ?? "Validation failed" },
        { status: 400 },
      );
    }
    console.error(`POST /api/campaigns/${id}/contribute:`, err);
    return NextResponse.json({ error: parseSorobanError(err) }, { status: 400 });
  }
}
