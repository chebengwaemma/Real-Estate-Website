<?php
/**
 * Hostinger PHP checkout — creates Stripe Checkout Session (hosted).
 * POST JSON: firstName, lastName, dateOfBirth, city, country, phone, email, siteUrl?
 */
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
  http_response_code(204);
  exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  http_response_code(405);
  echo json_encode(['error' => 'Method not allowed']);
  exit;
}

require_once __DIR__ . '/load-payment-config.php';
$config = hopeland_load_payment_config();
$secret = trim((string) ($config['stripe_secret_key'] ?? ''));
if ($secret === '' || !preg_match('/^sk_(live|test)_/', $secret)) {
  http_response_code(503);
  echo json_encode([
    'error' => 'Payment secret missing on Hostinger. Replace the entire public_html/api folder from your latest local build (must include stripe-config.php + payments-secrets.php).',
    'code' => 'missing_stripe_secret',
  ]);
  exit;
}

$raw = file_get_contents('php://input');
$body = json_decode($raw ?: '[]', true);
if (!is_array($body)) {
  http_response_code(400);
  echo json_encode(['error' => 'Invalid JSON body.']);
  exit;
}

$required = ['firstName', 'lastName', 'dateOfBirth', 'city', 'country', 'phone', 'email'];
foreach ($required as $field) {
  if (!isset($body[$field]) || !is_string($body[$field]) || trim($body[$field]) === '') {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid registration payload.']);
    exit;
  }
}

$firstName = trim($body['firstName']);
$lastName = trim($body['lastName']);
$email = strtolower(trim($body['email']));
$siteUrl = isset($body['siteUrl']) && is_string($body['siteUrl'])
  ? rtrim(trim($body['siteUrl']), '/')
  : '';
if ($siteUrl === '' || !preg_match('#^https?://#i', $siteUrl)) {
  $https = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off');
  $host = $_SERVER['HTTP_HOST'] ?? 'hcheckers.org';
  $siteUrl = ($https ? 'https://' : 'http://') . $host;
}

$feeAmount = (int) ($config['fee_amount'] ?? 1000);
$feeCurrency = strtolower((string) ($config['fee_currency'] ?? 'usd'));

$params = [
  'mode' => 'payment',
  'payment_method_types' => ['card'],
  'customer_email' => $email,
  'branding_settings' => ['display_name' => 'Hopeland Global Checkers (Draughts) Federation'],
  'line_items' => [[
    'quantity' => 1,
    'price_data' => [
      'currency' => $feeCurrency,
      'unit_amount' => $feeAmount,
      'product_data' => [
        'name' => 'Hopeland Global Checkers (Draughts) Federation — Championship Registration',
        'description' => "Registration fee for {$firstName} {$lastName}",
      ],
    ],
  ]],
  'metadata' => [
    'first_name' => $firstName,
    'last_name' => $lastName,
    'date_of_birth' => trim($body['dateOfBirth']),
    'city' => trim($body['city']),
    'country' => trim($body['country']),
    'phone' => trim($body['phone']),
    'email' => $email,
  ],
  'success_url' => $siteUrl . '/register/success?session_id={CHECKOUT_SESSION_ID}',
  'cancel_url' => $siteUrl . '/register/cancelled',
];

// Stripe expects form-urlencoded nested keys
$flat = [];
$flatten = function ($data, $prefix = '') use (&$flatten, &$flat) {
  foreach ($data as $key => $value) {
    $k = $prefix === '' ? (string) $key : $prefix . '[' . $key . ']';
    if (is_array($value)) {
      $flatten($value, $k);
    } else {
      $flat[$k] = (string) $value;
    }
  }
};
$flatten($params);

$ch = curl_init('https://api.stripe.com/v1/checkout/sessions');
curl_setopt_array($ch, [
  CURLOPT_POST => true,
  CURLOPT_RETURNTRANSFER => true,
  CURLOPT_USERPWD => $secret . ':',
  CURLOPT_HTTPHEADER => ['Content-Type: application/x-www-form-urlencoded'],
  CURLOPT_POSTFIELDS => http_build_query($flat),
  CURLOPT_TIMEOUT => 30,
]);
$response = curl_exec($ch);
$status = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
$curlErr = curl_error($ch);
curl_close($ch);

if ($response === false) {
  http_response_code(500);
  echo json_encode(['error' => 'Could not reach Stripe: ' . $curlErr]);
  exit;
}

$data = json_decode($response, true);
if ($status >= 400 || !is_array($data)) {
  http_response_code(500);
  $msg = is_array($data) && isset($data['error']['message']) ? $data['error']['message'] : 'Unexpected error creating checkout session.';
  echo json_encode(['error' => $msg]);
  exit;
}

if (empty($data['url'])) {
  http_response_code(500);
  echo json_encode(['error' => 'Stripe did not return a checkout URL.']);
  exit;
}

echo json_encode(['url' => $data['url'], 'sessionId' => $data['id'] ?? null]);
