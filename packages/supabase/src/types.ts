export type * from "@repo/shared/types/database.types";
// Re-export types from @supabase/supabase-js for apps that need them
export type { RealtimeChannel, RealtimePostgresChangesPayload, RealtimePostgresInsertPayload } from "@supabase/supabase-js";
// Re-export createServerClient for middleware usage
export { createServerClient } from "@supabase/ssr";