import { Database } from "@repo/shared/types/database.types";
import { createClient } from "@supabase/supabase-js";

export function createServiceClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY!
  );
}
