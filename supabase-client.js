// Supabase browser client bootstrap.
// Load the Supabase v2 CDN, config.js, then this file before page scripts.
(function () {
  const config = window.FASHION_HUB_CONFIG;
  if (!window.supabase || !config || !config.supabaseUrl || !config.supabaseAnonKey ||
      config.supabaseUrl.includes("YOUR_PROJECT_REF") ||
      config.supabaseAnonKey.includes("YOUR_SUPABASE")) {
    console.warn("Fashion Hub: Supabase is not configured yet. Follow supabase/README.md.");
    window.fashionSupabase = null;
    return;
  }

  window.fashionSupabase = window.supabase.createClient(
    config.supabaseUrl,
    config.supabaseAnonKey,
    {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
      }
    }
  );
})();
