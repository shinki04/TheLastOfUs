"use server";

import { createClient } from "@repo/supabase/server";

export async function fetchSavedPosts(page: number, itemsPerPage: number) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error("Unauthorized");

    const offset = (page - 1) * itemsPerPage;

    // We fetch posts by joining with post_likes. 
    const { data, count, error } = await supabase
        .from("posts")
        .select(`
      id,
      created_at,
      author: profiles!posts_author_id_fkey(
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
      privacy_level,
      is_anonymous,
      post_likes!inner(user_id)
    `, { count: "exact" })
        .eq("post_likes.user_id", user.id)
        .range(offset, offset + itemsPerPage - 1)
        .order("created_at", { ascending: false });

    if (error) {
        throw new Error("Failed to fetch saved posts: " + error.message);
    }

    // Formatting for UI
    const formattedPosts = (data || []).map(post => {
        // We already know it's liked by viewer because of the inner join
        const { post_likes: _post_likes, ...postData } = post;
        return {
            ...postData,
            is_liked_by_viewer: true
        };
    });

    const total = count || 0;
    return {
        posts: formattedPosts,
        hasMore: offset + itemsPerPage < total,
        total,
        currentPage: page
    };
}
