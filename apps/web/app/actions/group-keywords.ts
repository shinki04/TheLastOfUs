"use server";

import { createClient } from "@repo/supabase/server";
import { revalidatePath } from "next/cache";

export interface BlockedKeyword {
  id: string;
  keyword: string;
  match_type: "exact" | "partial";
  scope: "global" | "group";
  group_id: string | null;
  created_by: string | null;
  created_at: string | null;
}

/**
 * Get blocked keywords for a group (includes global keywords too)
 */
export async function getGroupKeywords(groupId: string): Promise<BlockedKeyword[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  // Check user has permission (admin, sub_admin, moderator)
  const { data: membership } = await supabase
    .from("group_members")
    .select("role")
    .eq("group_id", groupId)
    .eq("user_id", user.id)
    .single();

  const canManage = ["admin", "sub_admin", "moderator"].includes(membership?.role ?? "");
  if (!canManage) {
    return [];
  }

  // Get group-specific keywords only (global ones are managed by global admin)
  const { data, error } = await supabase
    .from("blocked_keywords")
    .select("*")
    .eq("scope", "group")
    .eq("group_id", groupId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching group keywords:", error);
    return [];
  }

  return data as BlockedKeyword[];
}

/**
 * Add a blocked keyword for a group
 */
export async function addGroupKeyword(
  groupId: string, 
  keyword: string, 
  matchType: "exact" | "partial" = "partial"
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  // Check permission
  const { data: membership } = await supabase
    .from("group_members")
    .select("role")
    .eq("group_id", groupId)
    .eq("user_id", user.id)
    .single();

  const canManage = ["admin", "sub_admin", "moderator"].includes(membership?.role ?? "");
  if (!canManage) {
    return { error: "Bạn không có quyền quản lý từ khóa" };
  }

  // Check if keyword already exists for this group
  const { data: existing } = await supabase
    .from("blocked_keywords")
    .select("id")
    .eq("keyword", keyword.toLowerCase().trim())
    .eq("scope", "group")
    .eq("group_id", groupId)
    .single();

  if (existing) {
    return { error: "Từ khóa này đã tồn tại" };
  }

  const { error } = await supabase
    .from("blocked_keywords")
    .insert({
      keyword: keyword.toLowerCase().trim(),
      match_type: matchType,
      scope: "group",
      group_id: groupId,
      created_by: user.id,
    });

  if (error) {
    console.error("Error adding keyword:", error);
    return { error: "Không thể thêm từ khóa" };
  }

  revalidatePath(`/groups`);
  return { success: true };
}

/**
 * Delete a blocked keyword
 */
export async function deleteGroupKeyword(keywordId: string, groupId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  // Check permission
  const { data: membership } = await supabase
    .from("group_members")
    .select("role")
    .eq("group_id", groupId)
    .eq("user_id", user.id)
    .single();

  const canManage = ["admin", "sub_admin", "moderator"].includes(membership?.role ?? "");
  if (!canManage) {
    return { error: "Bạn không có quyền xóa từ khóa" };
  }

  const { error } = await supabase
    .from("blocked_keywords")
    .delete()
    .eq("id", keywordId)
    .eq("group_id", groupId); // Ensure keyword belongs to this group

  if (error) {
    console.error("Error deleting keyword:", error);
    return { error: "Không thể xóa từ khóa" };
  }

  revalidatePath(`/groups`);
  return { success: true };
}
