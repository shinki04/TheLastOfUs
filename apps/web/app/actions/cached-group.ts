import { cache } from "react";

import { getGroup, GroupWithDetails } from "./group";

/**
 * Cached version of getGroup.
 * React cache() deduplicates calls with the same arguments
 * within a single server request/render pass.
 * This means @header and page.tsx calling cachedGetGroup({ slug: "abc" })
 * will only hit the database ONCE.
 */
export const cachedGetGroup = cache(
    async (params: { slug?: string; id?: string }): Promise<GroupWithDetails | null> => {
        return getGroup(params);
    }
);
