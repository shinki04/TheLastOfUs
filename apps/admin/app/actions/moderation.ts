"use server";

import { ModerationActionType } from "@repo/shared/types/moderation";
import { ReportType } from "@repo/shared/types/report";
import { createClient } from "@repo/supabase/server";

export interface ModerationStats {
  totalActions: number;
  blockedCount: number;
  flaggedCount: number;
  aiDeletedCount: number;
  recentActions: number; // Last 24h
}

export interface ModerationAction {
  id: string;
  target_type: ReportType | "all";
  target_id: string;
  action_type: ModerationActionType | "all";
  reason: string;
  matched_keyword: string | null;
  ai_score: number | null;
  created_at: string;
  created_by: string | null;
  creator?: {
    email: string;
  } | null;
}

/**
 * Get moderation statistics
 */
export async function getModerationStats(
  from?: string,
  to?: string
): Promise<ModerationStats> {
  const supabase = await createClient();

  let query = supabase.from("moderation_actions").select("*", { count: "exact", head: true });

  if (from) query = query.gte("created_at", from);
  if (to) query = query.lte("created_at", to);

  const { count: totalActions } = await query;

  // We need specific counts. Doing multiple queries for now as it's simpler than raw SQL grouping via RPC
  // efficiently. For a dashboard, individual counts are fine.

  const getCount = async (type: ModerationActionType) => {
    let q = supabase.from("moderation_actions").select("*", { count: "exact", head: true }).eq("action_type", type);
    if (from) q = q.gte("created_at", from);
    if (to) q = q.lte("created_at", to);
    const { count } = await q;
    return count || 0;
  };

  const [blockedCount, flaggedCount, aiDeletedCount] = await Promise.all([
    getCount("keyword_blocked"),
    getCount("ai_flagged"),
    getCount("admin_deleted"), // Assuming AI deletion is logged as such, or valid admin deletions
  ]);

  // Recent 24h
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { count: recentActions } = await supabase
    .from("moderation_actions")
    .select("*", { count: "exact", head: true })
    .gte("created_at", oneDayAgo);

  return {
    totalActions: totalActions || 0,
    blockedCount,
    flaggedCount,
    aiDeletedCount,
    recentActions: recentActions || 0,
  };
}

/**
 * Get paginated moderation actions with filters
 */
export async function getModerationActions(
  page: number = 1,
  limit: number = 10,
  filters?: {
    actionType?: ModerationActionType | "all";
    targetType?: ReportType | "all";
  }
): Promise<{ data: ModerationAction[]; total: number; page: number; totalPages: number }> {
  const supabase = await createClient();
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase
    .from("moderation_actions")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (filters?.actionType && filters.actionType !== "all") {
    query = query.eq("action_type", filters.actionType);
  }

  if (filters?.targetType && filters.targetType !== "all") {
    query = query.eq("target_type", filters.targetType);
  }

  const { data, error, count } = await query;

  if (error) {
    console.error("Failed to fetch moderation actions:", error);
    throw new Error("Failed to fetch moderation actions");
  }

  return {
    data: data as ModerationAction[],
    total: count || 0,
    page,
    totalPages: Math.ceil((count || 0) / limit),
  };
}

/**
 * Get time-based moderation stats for charts
 */
export async function getModerationTimeStats(
  period: "daily" | "weekly" | "monthly" | "yearly" = "daily"
): Promise<{ period: string; blocked: number; flagged: number; deleted: number }[]> {
  const supabase = await createClient();

  const now = new Date();
  let startDate: Date;

  switch (period) {
    case "daily":
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;
    case "weekly":
      startDate = new Date(now.getTime() - 12 * 7 * 24 * 60 * 60 * 1000);
      break;
    case "monthly":
      startDate = new Date(now.getFullYear() - 1, now.getMonth(), 1);
      break;
    case "yearly":
      startDate = new Date(now.getFullYear() - 5, 0, 1);
      break;
  }

  const [blockedData, flaggedData, deletedData] = await Promise.all([
    supabase
      .from("moderation_actions")
      .select("created_at")
      .eq("action_type", "keyword_blocked")
      .gte("created_at", startDate.toISOString()),
    supabase
      .from("moderation_actions")
      .select("created_at")
      .eq("action_type", "ai_flagged")
      .gte("created_at", startDate.toISOString()),
    supabase
      .from("moderation_actions")
      .select("created_at")
      .eq("action_type", "admin_deleted")
      .gte("created_at", startDate.toISOString()),
  ]);

  const formatWeekRange = (date: Date): string => {
    const weekStart = new Date(date);
    weekStart.setDate(date.getDate() - date.getDay());
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);

    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const startMonth = months[weekStart.getMonth()];
    const endMonth = months[weekEnd.getMonth()];

    if (startMonth === endMonth) {
      return `${startMonth} ${weekStart.getDate()}-${weekEnd.getDate()}`;
    }
    return `${startMonth} ${weekStart.getDate()}-${endMonth} ${weekEnd.getDate()}`;
  };

  const groupByPeriod = (data: { created_at: string | null }[]) => {
    return data.reduce((acc, row) => {
      if (!row.created_at) return acc;
      const date = new Date(row.created_at);
      let key: string;

      switch (period) {
        case "daily":
          key = date.toISOString().split("T")[0]!;
          break;
        case "weekly":
          key = formatWeekRange(date);
          break;
        case "monthly":
          key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
          break;
        case "yearly":
          key = String(date.getFullYear());
          break;
      }

      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  };

  const blockedGrouped = groupByPeriod(blockedData.data ?? []);
  const flaggedGrouped = groupByPeriod(flaggedData.data ?? []);
  const deletedGrouped = groupByPeriod(deletedData.data ?? []);

  const periods = [...new Set([
    ...Object.keys(blockedGrouped),
    ...Object.keys(flaggedGrouped),
    ...Object.keys(deletedGrouped),
  ])].sort();

  return periods.map((p) => ({
    period: p,
    blocked: blockedGrouped[p] ?? 0,
    flagged: flaggedGrouped[p] ?? 0,
    deleted: deletedGrouped[p] ?? 0,
  }));
}

export interface ModerationActionDetail {
  id: string;
  target_type: string | null;
  target_id: string | null;
  action_type: string | null;
  reason: string | null;
  matched_keyword: string | null;
  ai_score: number | null;
  created_at: string | null;
  created_by: string | null;
  moderator?: {
    display_name: string | null;
    username: string | null;
  } | null;
}

/**
 * Get moderation action details for a specific target (post, comment, etc.)
 */
export async function getModerationActionForTarget(
  targetType: "post" | "comment" | "message" | "group",
  targetId: string
): Promise<ModerationActionDetail | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("moderation_actions")
    .select(`
      *,
      moderator:created_by (
        display_name,
        username
      )
    `)
    .eq("target_type", targetType)
    .eq("target_id", targetId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("Error fetching moderation action:", error);
    return null;
  }

  return data as ModerationActionDetail | null;
}
