param(
    [string]$Network = "testnet",
    [string]$Identity = "deployer"
)

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$Contracts = Join-Path $Root "contracts"

Push-Location $Contracts
stellar contract build --package treasury
stellar contract build --package campaign
stellar contract build --package registry
Pop-Location

$Admin = stellar keys address $Identity
$TreasuryWasm = Join-Path $Contracts "target\wasm32v1-none\release\treasury.wasm"
$CampaignWasm = Join-Path $Contracts "target\wasm32v1-none\release\campaign.wasm"
$RegistryWasm = Join-Path $Contracts "target\wasm32v1-none\release\registry.wasm"

Write-Host "==> Deploy Treasury"
$TreasuryId = stellar contract deploy --wasm $TreasuryWasm --source-account $Identity --network $Network -- --admin $Admin

Write-Host "==> Deploy Campaign"
$CampaignId = stellar contract deploy --wasm $CampaignWasm --source-account $Identity --network $Network -- --admin $Admin

Write-Host "==> Deploy Registry"
$RegistryId = stellar contract deploy --wasm $RegistryWasm --source-account $Identity --network $Network -- --admin $Admin --campaign $CampaignId

Write-Host "==> Wire contracts"
stellar contract invoke --id $TreasuryId --source-account $Identity --network $Network -- set_campaign_contract --admin $Admin --campaign $CampaignId
stellar contract invoke --id $CampaignId --source-account $Identity --network $Network -- set_registry --admin $Admin --registry $RegistryId
stellar contract invoke --id $RegistryId --source-account $Identity --network $Network -- initialize_treasury --admin $Admin --treasury $TreasuryId

@{
    network = $Network
    treasury = $TreasuryId
    campaign = $CampaignId
    registry = $RegistryId
    deployedAt = (Get-Date).ToUniversalTime().ToString("o")
} | ConvertTo-Json | Set-Content (Join-Path $Root "deployments.$Network.json")

Write-Host ""
Write-Host "NEXT_PUBLIC_REGISTRY_ID=$RegistryId"

$EnvFile = Join-Path $Root "apps\web\.env.local"
$EnvLines = @(
    "NEXT_PUBLIC_REGISTRY_ID=$RegistryId",
    "NEXT_PUBLIC_SOROBAN_RPC=https://soroban-testnet.stellar.org",
    "NEXT_PUBLIC_NETWORK=TESTNET"
)
if (Test-Path $EnvFile) {
    $Existing = Get-Content $EnvFile -Raw
    foreach ($Line in $EnvLines) {
        $Key = ($Line -split "=", 2)[0]
        if ($Existing -match "(?m)^$Key=") {
            $Existing = [regex]::Replace($Existing, "(?m)^$Key=.*$", $Line)
        } else {
            $Existing = $Existing.TrimEnd() + "`n$Line`n"
        }
    }
    Set-Content -Path $EnvFile -Value $Existing.TrimEnd()
} else {
    Set-Content -Path $EnvFile -Value ($EnvLines -join "`n")
}
Write-Host "Updated $EnvFile"
