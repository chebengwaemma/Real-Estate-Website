<?php
/**
 * Loads Stripe/Supabase secrets for Hostinger PHP payment APIs.
 * Order: payments-secrets.php → stripe-config.php → local → api/.env → getenv
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

  $secretsPhp = __DIR__ . '/payments-secrets.php';
  if (is_file($secretsPhp)) {
    include_once $secretsPhp;
    if (defined('HOPELAND_STRIPE_SECRET') && HOPELAND_STRIPE_SECRET) {
      $merged['stripe_secret_key'] = (string) HOPELAND_STRIPE_SECRET;
    }
    if (defined('HOPELAND_SUPABASE_URL') && HOPELAND_SUPABASE_URL) {
      $merged['supabase_url'] = (string) HOPELAND_SUPABASE_URL;
    }
    if (defined('HOPELAND_SERVICE_ROLE_KEY') && HOPELAND_SERVICE_ROLE_KEY) {
      $merged['supabase_service_role_key'] = (string) HOPELAND_SERVICE_ROLE_KEY;
    }
    if (defined('HOPELAND_FEE_AMOUNT')) {
      $merged['fee_amount'] = (int) HOPELAND_FEE_AMOUNT;
    }
    if (defined('HOPELAND_FEE_CURRENCY') && HOPELAND_FEE_CURRENCY) {
      $merged['fee_currency'] = (string) HOPELAND_FEE_CURRENCY;
    }
  }

  $configPhp = __DIR__ . '/stripe-config.php';
  if (is_file($configPhp)) {
    $fromPhp = include $configPhp;
    if (is_array($fromPhp)) {
      foreach ($fromPhp as $k => $v) {
        if ($v !== '' && $v !== null) {
          $merged[$k] = $v;
        }
      }
    }
  }

  $localPhp = __DIR__ . '/stripe-config.local.php';
  if (is_file($localPhp)) {
    $fromLocal = include $localPhp;
    if (is_array($fromLocal)) {
      foreach ($fromLocal as $k => $v) {
        if ($v !== '' && $v !== null) {
          $merged[$k] = $v;
        }
      }
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
