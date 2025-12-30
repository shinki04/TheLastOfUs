"use server";

import { createClient } from "@repo/supabase/server";
import { revalidatePath } from "next/cache";

// Get all hashtags with pagination
export async function getAllHashtags(
  page: number = 1,
  limit: number = 20,
  search?: string
) {
  const supabase = await createClient();
  const start = (page - 1) * limit;
  const end = start + limit - 1;

  let query = supabase
    .from("hashtags")
    .select("*", { count: "exact" })
    .order("post_count", { ascending: false })
    .range(start, end);

  if (search) {
    query = query.ilike("name", `%${search}%`);
  }

  const { data, error, count } = await query;

  if (error) throw error;

  return {
    hashtags: data ?? [],
    total: count ?? 0,
    page,
    totalPages: Math.ceil((count ?? 0) / limit),
  };
}

// Get top hashtags
export async function getTopHashtags(limit: number = 10) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("hashtags")
    .select("id, name, post_count")
    .order("post_count", { ascending: false })
    .limit(limit);

  if (error) throw error;

  return data ?? [];
}

// Delete hashtag
export async function deleteHashtag(hashtagId: string) {
  const supabase = await createClient();

  // First delete from post_hashtags junction table
  await supabase
    .from("post_hashtags")
    .delete()
    .eq("hashtag_id", hashtagId);

  // Then delete the hashtag
  const { error } = await supabase
    .from("hashtags")
    .delete()
    .eq("id", hashtagId);

  if (error) throw error;

  revalidatePath("/dashboard/hashtags");
  return { success: true };
}

// Update hashtag name
export async function updateHashtag(hashtagId: string, name: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("hashtags")
    .update({ name: name.toLowerCase().replace(/^#/, "") })
    .eq("id", hashtagId);

  if (error) throw error;

  revalidatePath("/dashboard/hashtags");
  return { success: true };
}

// Get hashtag growth stats by period
export async function getHashtagGrowthStats(
  period: "daily" | "weekly" | "monthly" | "yearly",
  hashtagIds: string[],
  startDate?: string,
  endDate?: string
) {
  const supabase = await createClient();

  const now = new Date();
  let defaultStartDate: Date;

  switch (period) {
    case "daily":
      defaultStartDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000); // Last 30 days
      break;
    case "weekly":
      defaultStartDate = new Date(now.getTime() - 12 * 7 * 24 * 60 * 60 * 1000); // Last 12 weeks
      break;
    case "monthly":
      defaultStartDate = new Date(now.getFullYear() - 1, now.getMonth(), 1); // Last 12 months
      break;
    case "yearly":
      defaultStartDate = new Date(now.getFullYear() - 5, 0, 1); // Last 5 years
      break;
  }

  const start = startDate ? new Date(startDate) : defaultStartDate;
  const end = endDate ? new Date(endDate) : now;

  // If no hashtags selected, get top 5
  let targetHashtagIds = hashtagIds;
  if (targetHashtagIds.length === 0) {
    const { data: topHashtags } = await supabase
      .from("hashtags")
      .select("id")
      .order("post_count", { ascending: false })
      .limit(5);
    targetHashtagIds = topHashtags?.map((h) => h.id) ?? [];
  }

  if (targetHashtagIds.length === 0) {
    return { data: [], hashtags: [] };
  }

  // Get hashtag names
  const { data: hashtagsData } = await supabase
    .from("hashtags")
    .select("id, name, post_count")
    .in("id", targetHashtagIds);

  // Get post_hashtags data with posts.created_at via foreign key
  const { data: postHashtags, error } = await supabase
    .from("post_hashtags")
    .select("hashtag_id, post_id, posts(created_at)")
    .in("hashtag_id", targetHashtagIds);

  if (error) {
    console.error("Failed to fetch post_hashtags:", error);
    return { data: [], hashtags: hashtagsData ?? [] };
  }

  // Filter by date range and flatten data
  const filteredData = (postHashtags ?? [])
    .filter((row) => {
      const postCreatedAt = row.posts?.created_at;
      if (!postCreatedAt) return false;
      const postDate = new Date(postCreatedAt);
      return postDate >= start && postDate <= end;
    })
    .map((row) => ({
      hashtag_id: row.hashtag_id,
      created_at: row.posts?.created_at,
    }));

  // Helper to format week range
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

  // Group data by period and hashtag
  const grouped: Record<string, Record<string, number>> = {};
  const hashtagNameMap: Record<string, string> = {};
  hashtagsData?.forEach((h) => {
    hashtagNameMap[h.id] = h.name;
  });

  filteredData.forEach((row) => {
    if (!row.created_at) return;
    const date = new Date(row.created_at);
    let periodKey: string;

    switch (period) {
      case "daily":
        periodKey = date.toISOString().split("T")[0]!;
        break;
      case "weekly":
        periodKey = formatWeekRange(date);
        break;
      case "monthly":
        periodKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
        break;
      case "yearly":
        periodKey = String(date.getFullYear());
        break;
    }

    const hashtagName = row.hashtag_id ? (hashtagNameMap[row.hashtag_id] || row.hashtag_id) : "unknown";
    if (!grouped[periodKey]) {
      grouped[periodKey] = {};
    }
    const periodData = grouped[periodKey];
    if (periodData) {
      periodData[hashtagName] = (periodData[hashtagName] || 0) + 1;
    }
  });

  // Convert to array format for charts
  const chartData = Object.entries(grouped)
    .map(([periodKey, hashtagCounts]) => ({
      period: periodKey,
      ...hashtagCounts,
    }))
    .sort((a, b) => a.period.localeCompare(b.period));

  return {
    data: chartData,
    hashtags: hashtagsData ?? [],
  };
}

// Get all hashtags for selector (with search)
export async function getHashtagsForSelect(search?: string, limit: number = 50) {
  const supabase = await createClient();

  let query = supabase
    .from("hashtags")
    .select("id, name, post_count")
    .order("post_count", { ascending: false })
    .limit(limit);

  if (search) {
    query = query.ilike("name", `%${search}%`);
  }

  const { data, error } = await query;

  if (error) throw error;

  return data ?? [];
}

// Get posts by hashtag with pagination
export async function getPostsByHashtagId(
  hashtagId: string,
  page: number = 1,
  limit: number = 10
) {
  const supabase = await createClient();
  const start = (page - 1) * limit;
  const end = start + limit - 1;

  const { data: postHashtags, error, count } = await supabase
    .from("post_hashtags")
    .select(`
      posts (
        id,
        content,
        created_at,
        author:profiles!posts_author_id_fkey (
          id,
          display_name,
          username,
          avatar_url
        )
      )
    `, { count: "exact" })
    .eq("hashtag_id", hashtagId)
    .range(start, end);

  if (error) throw error;

  const posts = postHashtags
    ?.map((ph) => ph.posts)
    .filter(Boolean) ?? [];

  return {
    posts,
    total: count ?? 0,
    page,
    totalPages: Math.ceil((count ?? 0) / limit),
  };
}

// Get hashtag stats summary for selected hashtags
export async function getHashtagStatsSummary(
  hashtagIds: string[],
  startDate?: string,
  endDate?: string
) {
  const supabase = await createClient();

  if (hashtagIds.length === 0) {
    return {
      totalUsage: 0,
      growthPercent: 0,
      peakDay: null,
      avgPerDay: 0,
    };
  }

  const now = new Date();
  const start = startDate ? new Date(startDate) : new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const end = endDate ? new Date(endDate) : now;

  // Previous period for comparison
  const periodLength = end.getTime() - start.getTime();
  const prevStart = new Date(start.getTime() - periodLength);
  const prevEnd = new Date(start.getTime());

  // Fetch all post_hashtags with posts.created_at
  const { data: allData } = await supabase
    .from("post_hashtags")
    .select("hashtag_id, posts!inner(created_at)")
    .in("hashtag_id", hashtagIds);

  // Flatten and parse dates
  const parsedData = (allData ?? []).map((row) => ({
    hashtag_id: row.hashtag_id,
    created_at: row.posts?.created_at ? new Date(row.posts.created_at) : null,
  })).filter(row => row.created_at !== null);

  // Current period count
  const currentData = parsedData.filter(row =>
    row.created_at! >= start && row.created_at! <= end
  );
  const current = currentData.length;

  // Previous period count
  const prevData = parsedData.filter(row =>
    row.created_at! >= prevStart && row.created_at! <= prevEnd
  );
  const prev = prevData.length;

  // Calculate growth percentage
  const growthPercent = prev === 0 ? (current > 0 ? 100 : 0) : Math.round(((current - prev) / prev) * 100);

  // Find peak day
  const dailyCounts: Record<string, number> = {};
  currentData.forEach((row) => {
    if (!row.created_at) return;
    const day = row.created_at.toISOString().split("T")[0]!;
    dailyCounts[day] = (dailyCounts[day] || 0) + 1;
  });

  const peakDay = Object.entries(dailyCounts)
    .sort((a, b) => b[1] - a[1])[0];

  // Calculate average per day
  const days = Math.max(1, Math.ceil(periodLength / (24 * 60 * 60 * 1000)));
  const avgPerDay = Math.round((current / days) * 10) / 10;

  return {
    totalUsage: current,
    growthPercent,
    peakDay: peakDay ? { date: peakDay[0], count: peakDay[1] } : null,
    avgPerDay,
  };
}
