// app/dashboard/actions.ts
"use server";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function getUserProfile() {
  const supabase = await createClient();

  const { data: userData, error } = await supabase.auth.getUser();
  if (!userData.user || error) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select()
    .eq("id", userData.user.id)
    .single();

  return profile;
}
