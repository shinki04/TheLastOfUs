import { Database } from "@repo/shared/types/database.types";
import { createBrowserClient } from "@supabase/ssr";

let client: ReturnType<typeof createBrowserClient<Database>> | null = null;

/**
 * Creates a Supabase browser client (singleton pattern).
 * Use this in React components and client-side code.
 */
export function createClient() {
  if (!client) {
    client = createBrowserClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }
  return client;
}

export type SupabaseBrowserClient = ReturnType<typeof createClient>;
