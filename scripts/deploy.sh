#!/usr/bin/env bash
set -euo pipefail

NETWORK="${1:-testnet}"
IDENTITY="${2:-deployer}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
CONTRACTS="$ROOT/contracts"

echo "==> Building contracts"
cd "$CONTRACTS"
stellar contract build --package treasury
stellar contract build --package campaign
stellar contract build --package registry

ADMIN=$(stellar keys address "$IDENTITY")
TREASURY_WASM="$CONTRACTS/target/wasm32v1-none/release/treasury.wasm"
CAMPAIGN_WASM="$CONTRACTS/target/wasm32v1-none/release/campaign.wasm"
REGISTRY_WASM="$CONTRACTS/target/wasm32v1-none/release/registry.wasm"

echo "==> Deploy Treasury"
TREASURY_ID=$(stellar contract deploy --wasm "$TREASURY_WASM" --source-account "$IDENTITY" --network "$NETWORK" -- --admin "$ADMIN")

echo "==> Deploy Campaign"
CAMPAIGN_ID=$(stellar contract deploy --wasm "$CAMPAIGN_WASM" --source-account "$IDENTITY" --network "$NETWORK" -- --admin "$ADMIN")

echo "==> Deploy Registry"
REGISTRY_ID=$(stellar contract deploy --wasm "$REGISTRY_WASM" --source-account "$IDENTITY" --network "$NETWORK" -- --admin "$ADMIN" --campaign "$CAMPAIGN_ID")

echo "==> Wire contracts"
stellar contract invoke --id "$TREASURY_ID" --source-account "$IDENTITY" --network "$NETWORK" -- set_campaign_contract --admin "$ADMIN" --campaign "$CAMPAIGN_ID"
stellar contract invoke --id "$CAMPAIGN_ID" --source-account "$IDENTITY" --network "$NETWORK" -- set_registry --admin "$ADMIN" --registry "$REGISTRY_ID"
stellar contract invoke --id "$REGISTRY_ID" --source-account "$IDENTITY" --network "$NETWORK" -- initialize_treasury --admin "$ADMIN" --treasury "$TREASURY_ID"

cat > "$ROOT/deployments.$NETWORK.json" <<EOF
{
  "network": "$NETWORK",
  "treasury": "$TREASURY_ID",
  "campaign": "$CAMPAIGN_ID",
  "registry": "$REGISTRY_ID",
  "deployedAt": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")"
}
EOF

echo ""
echo "Registry: $REGISTRY_ID"
echo "Campaign: $CAMPAIGN_ID"
echo "Treasury: $TREASURY_ID"
echo ""
echo "apps/web/.env.local:"
echo "NEXT_PUBLIC_REGISTRY_ID=$REGISTRY_ID"
