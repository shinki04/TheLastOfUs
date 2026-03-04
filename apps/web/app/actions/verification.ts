"use server";

import { createClient } from "@repo/supabase/server";
import { revalidatePath } from "next/cache";

export async function submitLecturerVerification(email: string) {
  if (!email || !email.trim().endsWith("@vlu.edu.vn")) {
    throw new Error("Email không hợp lệ. Bạn bắt buộc phải sử dụng email có đuôi @vlu.edu.vn");
  }

  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error("Vui lòng đăng nhập lại để thực hiện thao tác này");
  }

  // Double check the existing profile role
  const { data: profile } = await supabase
    .from("profiles")
    .select("global_role")
    .eq("id", user.id)
    .single();

  if (profile?.global_role === "lecturer" || profile?.global_role === "admin") {
    throw new Error("Tài khoản của bạn đã là Giảng viên hoặc Quản trị viên.");
  }

  // Update global role
  const { error: updateError } = await supabase
    .from("profiles")
    .update({ global_role: "lecturer" })
    .eq("id", user.id);

  if (updateError) {
    throw new Error("Lỗi cập nhật dữ liệu máy chủ: " + updateError.message);
  }

  revalidatePath("/setting/verification");
  revalidatePath("/setting/profile");
  
  return { success: true };
}
