"use server";

import { ManagementPost } from "@repo/shared/types/post";
import { PostQueueItem } from "@repo/shared/types/postQueue";
import { createClient } from "@repo/supabase/server";

export async function getUserPostsManagement(): Promise<ManagementPost[]> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error("Unauthorized");
    }

    const { data, error } = await supabase
        .from("posts")
        .select(`
      id,
      content,
      created_at,
      moderation_status,
      privacy_level,
      post_appeals(
        id,
        status,
        reason,
        created_at
      )
    `)
        .eq("author_id", user.id)
        .order("created_at", { ascending: false });

    if (error) {
        throw new Error("Failed to fetch posts: " + error.message);
    }

    return data;
}

/**
 * Fetch posts still in the queue (not yet in posts table)
 * These are truly "pending" posts waiting for worker processing
 */
export async function getQueuePendingPostsForUser(): Promise<ManagementPost[]> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return [];

    const { data, error } = await supabase
        .from("post_queue_status")
        .select("*")
        .eq("user_id", user.id)
        .in("status", ["pending", "processing", "failed"])
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Failed to fetch queue posts:", error);
        return [];
    }

    // Map queue items to a shape compatible with display
    return (data || []).map((item: PostQueueItem): ManagementPost => ({
        id: item.id,
        content: item.content,
        created_at: item.created_at,
        moderation_status: item.status === "failed" ? "failed" : "queue_pending",
        privacy_level: item.privacy_level,
        post_media: [],
        post_appeals: [],
        queue_status: item.status,
        error_message: item.error_message,
        media_count: item.media_count || 0,
        is_queue_item: true,
    }));
}

export async function submitPostAppealAction(postId: string, reason: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error("Unauthorized");
    }

    // Check if an appeal already exists that is pending
    const { data: existingAppeals } = await supabase
        .from("post_appeals")
        .select("status")
        .eq("post_id", postId)
        .in("status", ["pending", "reviewed"]);

    if (existingAppeals && existingAppeals.length > 0) {
        throw new Error("Kháng cáo cho bài viết này đang trong quá trình xử lý.");
    }

    const { error } = await supabase
        .from("post_appeals")
        .insert({
            post_id: postId,
            user_id: user.id,
            reason,
            status: "pending"
        });

    if (error) {
        throw new Error("Lỗi khi gửi kháng cáo: " + error.message);
    }

    return { success: true };
}
