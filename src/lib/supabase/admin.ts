import { createClient } from "@supabase/supabase-js";

// This client bypasses RLS and should ONLY be used in Server Actions or API routes
// Using a fallback empty string to prevent Turbopack module evaluation crashes. 
// If the key is truly missing, calls will fail at runtime rather than crash the whole page.
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "http://127.0.0.1:54321",
  process.env.SUPABASE_SERVICE_ROLE_KEY || "dummy_key_to_prevent_crash"
);
