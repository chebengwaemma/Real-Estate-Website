# Deploy live email (Supabase SMTP secrets + Edge Functions)
# Run from repo root:
#   powershell -ExecutionPolicy Bypass -File backend/scripts/deploy-live-email.ps1
#
# Requires: npx supabase login OR SUPABASE_ACCESS_TOKEN in frontend/.env

$ErrorActionPreference = "Stop"
$ref = "xydliulffdmacdfnkqts"
$root = Split-Path (Split-Path $PSScriptRoot -Parent) -Parent
$backend = Join-Path $root "backend"

function Read-EnvValue([string]$file, [string]$name) {
  if (-not (Test-Path $file)) { return $null }
  foreach ($line in Get-Content $file) {
    if ($line -match "^$name=") {
      return $line.Substring($name.Length + 1).Trim().Trim('"').Trim("'")
    }
  }
  return $null
}

$frontendEnv = Join-Path $root "frontend\.env"
$mailEnv = Join-Path $backend "server\.env"
$token = $env:SUPABASE_ACCESS_TOKEN
if (-not $token) { $token = Read-EnvValue $frontendEnv "SUPABASE_ACCESS_TOKEN" }
if ($token) { $env:SUPABASE_ACCESS_TOKEN = $token }

Set-Location $root

Write-Host "Syncing Supabase SMTP secrets..."
Set-Location $root
npm run mail:sync
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Set-Location $backend

$emailFns = @(
  "submit-contact-message",
  "stripe-webhook",
  "finalize-paid-registration"
)

foreach ($fn in $emailFns) {
  Write-Host "Deploying $fn ..."
  npx --yes supabase functions deploy $fn --project-ref $ref
  if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
}

Set-Location $root
Write-Host "Building production frontend..."
npm run build
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host ""
Write-Host "Done. Live email uses Supabase -> Hostinger SMTP directly."
Write-Host "Test contact: https://hcheckers.org/contact"
Write-Host "If Hostinger Git deploy is enabled, push main to publish the new build."
