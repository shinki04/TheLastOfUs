import { z } from "zod";

// Stricter: chỉ chữ, số, space
const stricterTextRegex = /^[a-zA-Z0-9\s]*$/;

// Tách file schema riêng để có thể dùng sync validation
const fileSchema = z
  .instanceof(File)
  .refine((file) => file.size > 0, "Vui lòng chọn ảnh")
  .refine(
    (file) =>
      ["image/jpeg", "image/png", "image/webp", "image/jpg"].includes(
        file.type
      ),
    "Chỉ hỗ trợ định dạng JPEG, PNG và WebP"
  )
  .refine((file) => file.size <= 5_000_000, "Kích thước file phải nhỏ hơn 5MB");

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
  avatar_image: z.union([fileSchema, z.undefined()]),
});

export type UpdateProfileFormData = z.infer<typeof updateProfileSchema>;
