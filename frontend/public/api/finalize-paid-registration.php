<?php
/**
 * Hostinger PHP finalize — verify paid Stripe session, insert registration via service role.
 * POST JSON: sessionId, password?
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

$configFile = __DIR__ . '/stripe-config.php';
if (!is_file($configFile)) {
  http_response_code(503);
  echo json_encode(['error' => 'Payments config missing on server.']);
  exit;
}

$config = require $configFile;
$secret = trim((string) ($config['stripe_secret_key'] ?? ''));
$supabaseUrl = rtrim(trim((string) ($config['supabase_url'] ?? '')), '/');
$serviceKey = trim((string) ($config['supabase_service_role_key'] ?? ''));

if ($secret === '' || !preg_match('/^sk_(live|test)_/', $secret)) {
  http_response_code(503);
  echo json_encode(['error' => 'STRIPE_SECRET_KEY is not configured.', 'paid' => false]);
  exit;
}

$raw = file_get_contents('php://input');
$body = json_decode($raw ?: '[]', true);
$sessionId = is_array($body) && isset($body['sessionId']) ? trim((string) $body['sessionId']) : '';
$password = is_array($body) && isset($body['password']) ? (string) $body['password'] : '';

if ($sessionId === '') {
  http_response_code(400);
  echo json_encode(['error' => 'Missing Stripe session id.', 'paid' => false]);
  exit;
}

$ch = curl_init('https://api.stripe.com/v1/checkout/sessions/' . rawurlencode($sessionId));
curl_setopt_array($ch, [
  CURLOPT_RETURNTRANSFER => true,
  CURLOPT_USERPWD => $secret . ':',
  CURLOPT_TIMEOUT => 30,
]);
$response = curl_exec($ch);
$status = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

$session = json_decode($response ?: '[]', true);
if ($status >= 400 || !is_array($session) || empty($session['id'])) {
  http_response_code($status === 404 ? 404 : 400);
  echo json_encode(['error' => $session['error']['message'] ?? 'Invalid checkout session.', 'paid' => false]);
  exit;
}

if (($session['payment_status'] ?? '') !== 'paid') {
  http_response_code(402);
  echo json_encode(['error' => 'Payment not completed. No account was created.', 'paid' => false]);
  exit;
}

$meta = is_array($session['metadata'] ?? null) ? $session['metadata'] : [];
$needed = ['first_name', 'last_name', 'date_of_birth', 'city', 'country', 'phone', 'email'];
foreach ($needed as $field) {
  if (empty($meta[$field])) {
    http_response_code(422);
    echo json_encode(['error' => "Checkout session is missing {$field}.", 'paid' => true]);
    exit;
  }
}

$pi = $session['payment_intent'] ?? null;
$piId = is_string($pi) ? $pi : (is_array($pi) && isset($pi['id']) ? $pi['id'] : null);

$row = [
  'first_name' => $meta['first_name'],
  'last_name' => $meta['last_name'],
  'date_of_birth' => $meta['date_of_birth'],
  'city' => $meta['city'],
  'country' => $meta['country'],
  'phone' => $meta['phone'],
  'email' => strtolower(trim($meta['email'])),
  'status' => 'paid',
  'fee_amount' => (int) ($session['amount_total'] ?? 0),
  'fee_currency' => strtolower((string) ($session['currency'] ?? 'usd')),
  'stripe_session_id' => $session['id'],
  'stripe_payment_intent' => $piId,
];

$registration = null;
$accountCreated = false;
$accountError = null;

if ($supabaseUrl !== '' && $serviceKey !== '') {
  $insertRes = supabase_rest($supabaseUrl, $serviceKey, 'POST', '/rest/v1/registrations', $row, [
    'Prefer: return=representation',
  ]);
  if ($insertRes['ok'] && is_array($insertRes['json']) && isset($insertRes['json'][0])) {
    $registration = $insertRes['json'][0];
  } elseif ($insertRes['status'] === 409 || strpos((string) ($insertRes['body'] ?? ''), '23505') !== false) {
    $existing = supabase_rest(
      $supabaseUrl,
      $serviceKey,
      'GET',
      '/rest/v1/registrations?stripe_session_id=eq.' . rawurlencode($session['id']) . '&select=*',
      null,
      []
    );
    if ($existing['ok'] && is_array($existing['json']) && isset($existing['json'][0])) {
      $registration = $existing['json'][0];
    }
  }

  if ($registration && strlen($password) >= 6) {
    $auth = supabase_rest($supabaseUrl, $serviceKey, 'POST', '/auth/v1/admin/users', [
      'email' => $row['email'],
      'password' => $password,
      'email_confirm' => true,
      'user_metadata' => [
        'championship_registration' => $registration,
        'first_name' => $row['first_name'],
        'last_name' => $row['last_name'],
      ],
    ], []);
    if ($auth['ok']) {
      $accountCreated = true;
    } else {
      $accountError = is_array($auth['json']) && isset($auth['json']['msg'])
        ? $auth['json']['msg']
        : ($auth['json']['error_description'] ?? $auth['json']['message'] ?? 'Could not create account.');
      if (preg_match('/already|registered|exists/i', (string) $accountError)) {
        $accountError = 'Account already exists. Sign in with your password.';
      }
    }
  }
} else {
  // Payment verified; DB write skipped if service role not in stripe-config.php
  $registration = array_merge(['id' => null], $row);
}

echo json_encode([
  'paid' => true,
  'registration' => $registration,
  'accountCreated' => $accountCreated,
  'accountError' => $accountError,
]);

function supabase_rest(string $base, string $key, string $method, string $path, $json, array $extraHeaders): array {
  $ch = curl_init($base . $path);
  $headers = array_merge([
    'apikey: ' . $key,
    'Authorization: Bearer ' . $key,
    'Content-Type: application/json',
  ], $extraHeaders);
  $opts = [
    CURLOPT_CUSTOMREQUEST => $method,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_HTTPHEADER => $headers,
    CURLOPT_TIMEOUT => 30,
  ];
  if ($json !== null) {
    $opts[CURLOPT_POSTFIELDS] = json_encode($json);
  }
  curl_setopt_array($ch, $opts);
  $body = curl_exec($ch);
  $status = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
  curl_close($ch);
  $decoded = json_decode($body ?: 'null', true);
  return [
    'ok' => $status >= 200 && $status < 300,
    'status' => $status,
    'body' => $body,
    'json' => $decoded,
  ];
}
