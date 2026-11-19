// Template for the public browser configuration in config.js.
// The static storefront loads config.js directly, so it contains only public
// Supabase project details. Never add a service-role key or Razorpay secret.
window.FASHION_HUB_CONFIG = {
  supabaseUrl: "https://YOUR_PROJECT_REF.supabase.co",
  supabaseAnonKey: "YOUR_SUPABASE_PUBLISHABLE_OR_ANON_KEY"
};
