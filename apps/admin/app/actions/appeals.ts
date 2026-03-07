"use server";

import { createClient } from "@repo/supabase/server";

interface AppealsFilter {
    search?: string;
}

export async function getPendingAppeals(
    page: number = 1,
    limit: number = 20,
    filters?: AppealsFilter
) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error("Unauthorized");

    const start = (page - 1) * limit;
    const end = start + limit - 1;

    let query = supabase
        .from("post_appeals")
        .select(`
      id,
      post_id,
      user_id,
      reason,
      status,
      created_at,
      user:profiles(display_name, avatar_url, username),
      post:posts(content, author_id, media_urls)
    `, { count: "exact" })
        .eq("status", "pending")
        .order("created_at", { ascending: false });

    if (filters?.search) {
        query = query.ilike("reason", `%${filters.search}%`);
    }

    const { data, error, count } = await query.range(start, end);

    if (error) {
        throw new Error("Failed to load appeals");
    }

    return {
        appeals: data || [],
        total: count || 0,
        page,
        totalPages: Math.ceil((count || 0) / limit),
    };
}

export async function updateAppealStatus(appealId: string, postId: string, action: "approve_post" | "reject_appeal") {
    const supabase = await createClient();

    // Update the appeal status
    await supabase
        .from("post_appeals")
        .update({ status: "resolved" })
        .eq("id", appealId);

    // If approved, restore the post
    if (action === "approve_post") {
        await supabase
            .from("posts")
            .update({ moderation_status: "approved" })
            .eq("id", postId);
    }
}
