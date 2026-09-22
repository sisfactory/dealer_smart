import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { parseServerEnv } from "@/lib/env/server";

export function createAdminSupabaseClient(): SupabaseClient {
  const environment = parseServerEnv(process.env);

  return createClient(
    environment.NEXT_PUBLIC_SUPABASE_URL,
    environment.SUPABASE_SECRET_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );
}
