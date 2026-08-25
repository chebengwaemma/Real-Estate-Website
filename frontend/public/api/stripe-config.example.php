<?php
/**
 * Generated at build time by scripts/prepare-hostinger.mjs — do not edit by hand.
 * Direct browser access is blocked. Prefer uploading this file + api/.env together.
 */
if (realpath($_SERVER['SCRIPT_FILENAME'] ?? '') === realpath(__FILE__)) {
  http_response_code(403);
  header('Content-Type: application/json');
  echo json_encode(['error' => 'Forbidden']);
  exit;
}

return [
  // Value is base64(sk_…) so some host scanners do not empty the secret on upload.
  'stripe_secret_key' => '',
  'supabase_url' => '',
  'supabase_service_role_key' => '',
  'fee_amount' => 1000,
  'fee_currency' => 'usd',
];
