import { z } from "zod";

import { fileImageSchema } from "./fileImage-schema";

// Stricter: chỉ chữ, số, space
// An toàn hơn: cho phép chữ Unicode, số, space
const safeTextRegex = /^[\p{L}\p{N}\s]+$/u;

// Schema cho client-side validation (sync)
export const updateProfileSchema = z.object({
  description: z
    .string()
    .refine((val: string) => val === "" || safeTextRegex.test(val), {
      message: "Mô tả chứa ký tự không hợp lệ",
    })
    .max(500, "Mô tả không được quá 500 ký tự")
    .transform((val: string) => val.trim()),

  display_name: z
    .string()
    .min(2, "Tên hiển thị phải có ít nhất 2 ký tự")
    .max(50, "Tên hiển thị không được quá 50 ký tự")
    .refine((val: string) => safeTextRegex.test(val), {
      message: "Mô tả chứa ký tự không hợp lệ",
    })
    .transform((val: string) => val.trim()),
  avatar_image: z.union([
    fileImageSchema.refine((file: File) => file.size >= 2, "Chỉ được chọn 1 ảnh"),
    z.undefined(),
  ]),
});

export type UpdateProfileFormData = z.infer<typeof updateProfileSchema>;
