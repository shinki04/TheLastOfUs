import { cache } from "react";

import { fetchPostById } from "./post";

/**
 * Cached version of getUserProfile.
 * React cache() deduplicates calls with the same arguments
 * within a single server request/render pass.
 * This means @header and page.tsx calling cachedGetPost("id")
 * will only hit the database ONCE per request.
 */
export const cachedGetPost = cache(
    async (id: string) => {
        return fetchPostById(id);
    }
);
