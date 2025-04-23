export const environment = {
  production: true,
  SUPABASE_URL: process.env['NG_APP_SUPABASE_URL'] || "",
  SUPABASE_ANON_KEY: process.env['NG_APP_SUPABASE_ANON_KEY'] || ""
};