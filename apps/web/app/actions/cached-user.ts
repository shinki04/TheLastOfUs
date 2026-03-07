import type { User } from "@repo/shared/types/user";
import { cache } from "react";

import { getUserProfile } from "./user";

/**
 * Cached version of getUserProfile.
 * React cache() deduplicates calls with the same arguments
 * within a single server request/render pass.
 * This means @header and page.tsx calling cachedGetUserProfile("slug")
 * will only hit the database ONCE per request.
 */
export const cachedGetUserProfile = cache(
  async (id: string): Promise<User | null> => {
    return getUserProfile(id);
  }
);
