/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
  /** Preferred alias for the Stripe publishable key (pk_live_… / pk_test_…). */
  readonly VITE_STRIPE_PUBLIC_KEY?: string
  /** Legacy alias — same as VITE_STRIPE_PUBLIC_KEY. */
  readonly VITE_STRIPE_PUBLISHABLE_KEY?: string
  readonly VITE_REGISTRATION_FEE_AMOUNT: string
  readonly VITE_REGISTRATION_FEE_CURRENCY: string
  readonly VITE_GEO_LOOKUP_URL: string
  /** `stripe` (default) or `local` for intermediate/demo paid registration without Checkout. */
  readonly VITE_PAYMENT_MODE?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
