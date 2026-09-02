# Run AFTER: npx supabase login  (use the account that owns xydliulffdmacdfnkqts)
# From repo root:  powershell -ExecutionPolicy Bypass -File backend/scripts/deploy-live-payments.ps1

$ErrorActionPreference = "Stop"
$ref = "xydliulffdmacdfnkqts"
$backend = Split-Path $PSScriptRoot -Parent
Set-Location $backend

# Load STRIPE_SECRET_KEY from frontend/.env or backend/.env (do not echo it)
function Read-EnvValue([string]$file, [string]$name) {
  if (-not (Test-Path $file)) { return $null }
  $line = Get-Content $file | Where-Object { $_ -match "^$name=" } | Select-Object -First 1
  if (-not $line) { return $null }
  return $line.Substring($name.Length + 1).Trim().Trim('"').Trim("'")
}

$root = Split-Path $backend -Parent
$sk = Read-EnvValue (Join-Path $root "frontend\.env") "STRIPE_SECRET_KEY"
if (-not $sk) { $sk = Read-EnvValue (Join-Path $backend ".env") "STRIPE_SECRET_KEY" }
if (-not $sk -or $sk -notmatch '^sk_(live|test)_') {
  Write-Error "Set STRIPE_SECRET_KEY=sk_live_... in frontend/.env first."
}

Write-Host "Setting Edge secrets on $ref ..."
npx --yes supabase secrets set --project-ref $ref `
  "STRIPE_SECRET_KEY=$sk" `
  "SITE_URL=https://hcheckers.org" `
  "REGISTRATION_FEE_AMOUNT=25000" `
  "REGISTRATION_FEE_CURRENCY=usd"

$fns = @(
  "create-checkout-session",
  "finalize-paid-registration",
  "stripe-webhook",
  "get-registration-by-session",
  "get-registration",
  "get-my-registration",
  "update-registration-profile",
  "submit-contact-message"
)

foreach ($fn in $fns) {
  Write-Host "Deploying $fn ..."
  npx --yes supabase functions deploy $fn --project-ref $ref
}

Write-Host "Done. Test register on https://hcheckers.org"
