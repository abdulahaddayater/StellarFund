# StellarFund Architecture

## Contract Layer

Three Soroban contracts implement separation of concerns:

1. **Registry** — User-facing facade. Validates wallet auth at the top level and delegates to Campaign.
2. **Campaign** — Stores campaign metadata, enforces deadlines, minimum contributions, creator rules, and status transitions.
3. **Treasury** — Records deposits, tracks per-contributor balances, and authorizes withdraw/refund operations.

## Security Model

- Registry is the only contract users interact with directly.
- Campaign accepts calls only from Registry (`require_registry`).
- Treasury accepts mutating calls only from Campaign (`require_campaign` via `hub.require_auth()` pattern).
- Creator cannot contribute to own campaign.
- Withdraw allowed once after goal met.
- Refund allowed once per contributor on failed/cancelled campaigns.

## Frontend Layer

Next.js 15 App Router with:

- Server route handlers for Soroban simulation and transaction preparation
- SSE endpoint polling contract events for live dashboard updates
- Stellar Wallets Kit for Freighter/xBull/Albedo
- Mock data fallback when `NEXT_PUBLIC_REGISTRY_ID` is unset

## Deployment Order

1. Treasury
2. Campaign
3. Registry
4. Wire: `set_campaign_contract`, `set_registry`, `set_treasury`
