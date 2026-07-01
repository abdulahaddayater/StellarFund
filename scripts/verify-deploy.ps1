# Quick local check before Vercel deploy
$ErrorActionPreference = "Stop"
$web = Join-Path $PSScriptRoot "..\apps\web"

Write-Host "StellarFund deploy verification" -ForegroundColor Cyan
Write-Host ""

$required = @(
  "package.json",
  "package-lock.json",
  "next.config.ts",
  "vercel.json",
  ".npmrc",
  "src/app/page.tsx",
  "src/app/layout.tsx"
)

foreach ($file in $required) {
  $path = Join-Path $web $file
  if (-not (Test-Path $path)) {
    Write-Host "MISSING: apps/web/$file" -ForegroundColor Red
    exit 1
  }
}

Write-Host "OK  Required files present" -ForegroundColor Green

Push-Location $web
try {
  Write-Host "Running npm ci..." -ForegroundColor Yellow
  npm ci
  Write-Host "Running next build..." -ForegroundColor Yellow
  npm run build
  Write-Host ""
  Write-Host "Build succeeded. App is deployable." -ForegroundColor Green
  Write-Host ""
  Write-Host "Vercel checklist:" -ForegroundColor Cyan
  Write-Host "  1. Root Directory = apps/web"
  Write-Host "  2. Install Command = OFF (default npm ci, NOT npm ci --prefix apps/web)"
  Write-Host "  3. Framework Preset = Next.js"
  Write-Host "  4. Output Directory = blank"
  Write-Host "  5. Redeploy Production without build cache"
}
finally {
  Pop-Location
}
