import { createBrowserClient } from "@supabase/ssr";
import { parsePublicEnv } from "@/lib/env/public";

export function createBrowserSupabaseClient(): ReturnType<
  typeof createBrowserClient
> {
  const environment = parsePublicEnv(process.env);

  return createBrowserClient(
    environment.NEXT_PUBLIC_SUPABASE_URL,
    environment.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  );
}
