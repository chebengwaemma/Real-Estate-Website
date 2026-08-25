<?php
/**
 * Loads Stripe/Supabase secrets for Hostinger PHP payment APIs.
 * Order: stripe-config.local.php → stripe-config.php → api/.env → getenv
 */
function hopeland_load_payment_config(): array {
  $defaults = [
    'stripe_secret_key' => '',
    'supabase_url' => '',
    'supabase_service_role_key' => '',
    'fee_amount' => 1000,
    'fee_currency' => 'usd',
  ];

  $merged = $defaults;

  $configPhp = __DIR__ . '/stripe-config.php';
  if (is_file($configPhp)) {
    $fromPhp = include $configPhp;
    if (is_array($fromPhp)) {
      $merged = array_merge($merged, $fromPhp);
    }
  }

  $localPhp = __DIR__ . '/stripe-config.local.php';
  if (is_file($localPhp)) {
    $fromLocal = include $localPhp;
    if (is_array($fromLocal)) {
      $merged = array_merge($merged, $fromLocal);
    }
  }

  foreach ([__DIR__ . '/.env', dirname(__DIR__) . '/.env'] as $envFile) {
    if (!is_file($envFile) || !is_readable($envFile)) {
      continue;
    }
    $lines = file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    if ($lines === false) {
      continue;
    }
    foreach ($lines as $line) {
      $line = trim($line);
      if ($line === '' || $line[0] === '#' || strpos($line, '=') === false) {
        continue;
      }
      list($key, $value) = explode('=', $line, 2);
      $key = trim($key);
      $value = trim($value);
      if ($value !== '' && ($value[0] === '"' || $value[0] === "'")) {
        $value = trim($value, "\"'");
      }
      if ($key === 'STRIPE_SECRET_KEY' && $value !== '') {
        $merged['stripe_secret_key'] = $value;
      } elseif (($key === 'VITE_SUPABASE_URL' || $key === 'SUPABASE_URL') && $value !== '') {
        $merged['supabase_url'] = $value;
      } elseif ($key === 'SUPABASE_SERVICE_ROLE_KEY' && $value !== '') {
        $merged['supabase_service_role_key'] = $value;
      } elseif (($key === 'REGISTRATION_FEE_AMOUNT' || $key === 'VITE_REGISTRATION_FEE_AMOUNT') && $value !== '') {
        $merged['fee_amount'] = (int) $value;
      } elseif (($key === 'REGISTRATION_FEE_CURRENCY' || $key === 'VITE_REGISTRATION_FEE_CURRENCY') && $value !== '') {
        $merged['fee_currency'] = strtolower($value);
      }
    }
  }

  $envSecret = getenv('STRIPE_SECRET_KEY');
  if (is_string($envSecret) && $envSecret !== '') {
    $merged['stripe_secret_key'] = $envSecret;
  }

  // Allow build-time base64 so hosts that strip "sk_live_" from .php still work.
  $secret = trim((string) ($merged['stripe_secret_key'] ?? ''));
  if ($secret !== '' && strpos($secret, 'sk_') !== 0 && preg_match('#^[A-Za-z0-9+/]+=*$#', $secret)) {
    $decoded = base64_decode($secret, true);
    if (is_string($decoded) && preg_match('/^sk_(live|test)_/', $decoded)) {
      $secret = $decoded;
    }
  }
  $merged['stripe_secret_key'] = $secret;
  $merged['fee_amount'] = (int) ($merged['fee_amount'] ?? 1000);
  $merged['fee_currency'] = strtolower((string) ($merged['fee_currency'] ?? 'usd'));

  return $merged;
}
