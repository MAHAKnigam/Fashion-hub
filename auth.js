// Legacy authentication entry point.
// Authentication is now handled by Supabase Auth in script.js.
// Do not add localStorage password handling or demo credentials here.
if (!window.fashionSupabase) {
  console.warn("Fashion Hub: Supabase client is not available. Check config.js and script loading order.");
}
