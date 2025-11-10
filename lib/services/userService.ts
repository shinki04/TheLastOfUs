import { Tables } from "@/types/database.types";
import { createClient } from "../supabase/server";

export async function getCurrentUser(id: string) {
  const supabase = await createClient();

  const { data: user, error } = await supabase
    .from("profiles")
    .select(
      `
        id,
        display_name,

        `
    )
    .eq("id", id)
    .single();

  if (error) {
    console.warn(`Error ${error}`);
    return error;
  }
  return user;
}
