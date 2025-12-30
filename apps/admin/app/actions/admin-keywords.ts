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
 * Check if user is global admin
 */
async function isGlobalAdmin(): Promise<boolean> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { data: profile } = await supabase
    .from("profiles")
    .select("global_role")
    .eq("id", user.id)
    .single();

  return profile?.global_role === "admin";
}

/**
 * Get all global blocked keywords (admin only)
 */
export async function getGlobalKeywords(): Promise<BlockedKeyword[]> {
  const supabase = await createClient();
  
  if (!(await isGlobalAdmin())) {
    return [];
  }

  const { data, error } = await supabase
    .from("blocked_keywords")
    .select("*")
    .eq("scope", "global")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching global keywords:", error);
    return [];
  }

  return data as BlockedKeyword[];
}

/**
 * Add a global blocked keyword (admin only)
 */
export async function addGlobalKeyword(
  keyword: string, 
  matchType: "exact" | "partial" = "partial"
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user || !(await isGlobalAdmin())) {
    return { error: "Unauthorized" };
  }

  // Check if keyword already exists globally
  const { data: existing } = await supabase
    .from("blocked_keywords")
    .select("id")
    .eq("keyword", keyword.toLowerCase().trim())
    .eq("scope", "global")
    .single();

  if (existing) {
    return { error: "Từ khóa này đã tồn tại" };
  }

  const { error } = await supabase
    .from("blocked_keywords")
    .insert({
      keyword: keyword.toLowerCase().trim(),
      match_type: matchType,
      scope: "global",
      group_id: null,
      created_by: user.id,
    });

  if (error) {
    console.error("Error adding global keyword:", error);
    return { error: "Không thể thêm từ khóa" };
  }

  revalidatePath("/dashboard/moderation");
  return { success: true };
}

/**
 * Update a global keyword (admin only)
 */
export async function updateGlobalKeyword(
  keywordId: string,
  data: { keyword?: string; match_type?: "exact" | "partial" }
) {
  const supabase = await createClient();
  
  if (!(await isGlobalAdmin())) {
    return { error: "Unauthorized" };
  }

  const updateData: Record<string, unknown> = {};
  if (data.keyword) updateData.keyword = data.keyword.toLowerCase().trim();
  if (data.match_type) updateData.match_type = data.match_type;

  const { error } = await supabase
    .from("blocked_keywords")
    .update(updateData)
    .eq("id", keywordId)
    .eq("scope", "global");

  if (error) {
    console.error("Error updating keyword:", error);
    return { error: "Không thể cập nhật từ khóa" };
  }

  revalidatePath("/dashboard/moderation");
  return { success: true };
}

/**
 * Delete a global blocked keyword (admin only)
 */
export async function deleteGlobalKeyword(keywordId: string) {
  const supabase = await createClient();
  
  if (!(await isGlobalAdmin())) {
    return { error: "Unauthorized" };
  }

  const { error } = await supabase
    .from("blocked_keywords")
    .delete()
    .eq("id", keywordId)
    .eq("scope", "global");

  if (error) {
    console.error("Error deleting keyword:", error);
    return { error: "Không thể xóa từ khóa" };
  }

  revalidatePath("/dashboard/moderation");
  return { success: true };
}
