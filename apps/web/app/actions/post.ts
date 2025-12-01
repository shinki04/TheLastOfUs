import { createClient } from "@/lib/supabase/server";
import { getRedisClient } from "@repo/redis/redis";
import { getPostCacheService } from "@repo/redis/postCacheService";
import { getFeedCacheService } from "@repo/redis/feedCacheService";
import { getCacheInvalidationService } from "@repo/redis/cacheInvalidationService";
import { Post, PostResponse } from "@repo/shared/types/post";

export interface CreatePostInput {
  content: string;
  privacy_level: "public" | "friends" | "private";
  media: File[];
}

export interface CreatePostResponse {
  post: Post;
  mediaUrls: string[];
}

export interface FetchPostsResponse {
  posts: PostResponse[];
  hasMore: boolean;
  total: number;
  currentPage: number;
}

const redis = getRedisClient();
const feedCache = getFeedCacheService();
const postCache = getPostCacheService();
const cacheInvalidation = getCacheInvalidationService();

export async function fetchPosts(
  page: number,
  itemsPerPage: number,
  userId: string = "public" // For future use with user-specific feeds
): Promise<FetchPostsResponse> {
  // Try cache first
  const cachedFeed = await feedCache.getCachedFeedPage(userId, page, itemsPerPage);
  if (cachedFeed) {
    return {
      posts: cachedFeed.posts as PostResponse[],
      hasMore: cachedFeed.hasMore,
      total: cachedFeed.total,
      currentPage: cachedFeed.page,
    };
  }

  const supabase = await createClient();

  // Validate page number
  if (page < 1) {
    throw new Error("Page number must be greater than 0");
  }

  const offset = (page - 1) * itemsPerPage;

  // Get total count
  const { count, error: countError } = await supabase
    .from("posts")
    .select("*", { count: "exact", head: true });

  if (countError) {
    throw new Error(`Failed to count posts: ${countError.message}`);
  }

  const total = count || 0;

  // If offset is beyond total, return empty array
  if (offset >= total && total > 0) {
    return {
      posts: [],
      hasMore: false,
      total,
      currentPage: page,
    };
  }

  // Fetch posts for current page
  const { data, error } = await supabase
    .from("posts")
    .select(
      `
      id,
      created_at, 
      author: author_id(
        id,
        username,
        display_name,
        avatar_url,
        global_role
      ),
      content,
      media_urls,
      updated_at,
      like_count,
      comment_count,
      share_count,
      privacy_level
      `
    )
    .range(offset, offset + itemsPerPage - 1)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch posts: ${error.message}`);
  }

  // Check if there are more posts after current page
  const hasMore = offset + itemsPerPage < total;

  const result = {
    posts: data || [],
    hasMore,
    total,
    currentPage: page,
  };

  // Cache the feed page
  await feedCache.setCachedFeedPage(userId, page, itemsPerPage, {
    posts: data || [],
    page,
    hasMore,
    total,
    itemsPerPage,
  });

  return result;
}

// export async function getPostIdsWithCache(userId: string) {
//   let postIds = await redis.getCache<string[]>(`feed:${userId}`);
//   if (!postIds) {
//     const response = await fetchPosts(1, 100); // lấy nhiều ID để cache
//     postIds = response.posts.map((p) => p.id);
//     await redis.setCache(`post:${userId}`, postIds, 60);
//   }
//   return postIds;
// }
// export async function getPostCached(postId: string) {
//   let post = await redis.getCache<Post>(`post:${postId}`);
//   if (!post || post !== undefined || post !== null) {
//     // fetch từ DB
//     post = await fetchPostById(postId);
//     await redis.setCache(`post:${postId}`, post, 3600);
//   }
//   return post;
// }

export async function fetchPostById(postId: string) {
  try {
    // Use cache service with stampede protection
    const post = await postCache.getCachedOrFetch(postId, async () => {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from("posts")
        .select(
          `
          id,
          created_at, 
          author: author_id(
            id,
            username,
            display_name,
            avatar_url,
            global_role
          ),
          content,
          media_urls,
          updated_at,
          like_count,
          comment_count,
          share_count,
          privacy_level
          `
        )
        .eq("id", postId)
        .single();

      if (error) {
        throw new Error(`Failed to fetch post: ${error.message}`);
      }
      return data;
    });

    return post;
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Caught an Error object:", error.message);
    } else {
      console.error("Caught an unknown type of error:", error);
    }
  }
}

export async function deletePost(postId: string, authorId: string): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase.from("posts").delete().eq("id", postId);

  if (error) {
    throw new Error(`Failed to delete post: ${error.message}`);
  }

  // Invalidate cache
  await cacheInvalidation.onPostDeleted(postId, authorId);
}

export async function updatePost(
  postId: string,
  content: string,
  privacy_level: "public" | "friends" | "private",
  authorId: string
): Promise<Post> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("posts")
    .update({ content, privacy_level })
    .eq("id", postId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update post: ${error.message}`);
  }

  // Invalidate cache
  await cacheInvalidation.onPostUpdated(postId, authorId);

  return data;
}
