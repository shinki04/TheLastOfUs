import { Database } from "@repo/shared/types/database.types";
import { createClient } from "@supabase/supabase-js";

/**
 * Creates a Supabase service role client.
 * Use this in workers and admin operations that require elevated permissions.
 * WARNING: Never expose the service key to the client!
 */
export function createServiceClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY!
  );
}

export type SupabaseServiceClient = ReturnType<typeof createServiceClient>;
