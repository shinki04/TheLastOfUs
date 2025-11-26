import { z } from "zod";
import { fileImageSchema } from "./fileImage-schema";

// Stricter: chỉ chữ, số, space
const stricterTextRegex = /^[a-zA-Z0-9\s]*$/;

// Schema cho client-side validation (sync)
export const updateProfileSchema = z.object({
  description: z
    .string()
    .max(500, "Mô tả không được quá 500 ký tự")
    .refine((val) => stricterTextRegex.test(val), {
      message: "Mô tả chứa ký tự không hợp lệ",
    }),
  display_name: z
    .string()
    .min(2, "Tên hiển thị phải có ít nhất 2 ký tự")
    .max(50, "Tên hiển thị không được quá 50 ký tự")
    .refine((val) => stricterTextRegex.test(val), {
      message: "Mô tả chứa ký tự không hợp lệ",
    }),
  avatar_image: z.union([
    fileImageSchema.refine((file) => file.size >= 2, "Chỉ được chọn 1 ảnh"),
    z.undefined(),
  ]),
});

export type UpdateProfileFormData = z.infer<typeof updateProfileSchema>;
