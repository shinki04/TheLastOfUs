"use client";

import { createClient } from "@repo/supabase/client";
import { Button } from "@repo/ui/components/button";
import { Card } from "@repo/ui/components/card";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, CheckCircle, Loader2, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { getCurrentUser } from "@/app/actions/user";
import { submitLecturerVerification } from "@/app/actions/verification";

export function VerificationForm() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const supabase = createClient();

  const { data: user, isLoading } = useQuery({
    queryKey: ["currentUser"],
    queryFn: () => getCurrentUser(),
  });

  const isValid = user?.email?.endsWith("@vlu.edu.vn") ?? false;

  const mutation = useMutation({
    mutationFn: async (emailInput: string) => {
      return submitLecturerVerification(emailInput);
    },
    onSuccess: () => {
      toast.success(
        "Xác thực thành công! Vui lòng làm mới trang hoặc đăng nhập lại để cập nhật quyền hạn.",
      );
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Đã có lỗi xảy ra");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.email) return;
    mutation.mutate(user.email);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    queryClient.clear();
    router.push("/login");
  };

  if (isLoading)
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin text-mainred" />
      </div>
    );

  const isAlreadyLecturer =
    user?.global_role === "lecturer" || user?.global_role === "admin";

  return (
    <div className="max-w-2xl mx-auto w-full mt-4 border-none shadow-none md:border-solid bg-transparent md:bg-dashboard-card dark:md:bg-dashboard-darkCard">
      <div className="flex flex-col gap-6 mx-2 ">
        {isAlreadyLecturer ? (
          <Card className="bg-green-500/10 border border-green-500/20 rounded-xl p-8 flex flex-col items-center justify-center text-center gap-4">
            <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-500" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-green-700 dark:text-green-400 mb-2">
                Tài khoản đã được xác thực
              </h3>
              <p className="text-green-600/80 dark:text-green-500/80">
                Bạn hiện đang có quyền truy cập dành cho cán bộ Giảng viên /
                Quản trị viên trên hệ thống VLU Social.
              </p>
            </div>
          </Card>
        ) : (
          <>
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-6 flex flex-col md:flex-row gap-4 items-start">
              <AlertTriangle className="w-6 h-6 text-yellow-600 dark:text-yellow-500 shrink-0 mt-1" />
              <div className="flex flex-col gap-2">
                <h3 className="font-bold text-yellow-800 dark:text-yellow-400">
                  Lưu ý quan trọng
                </h3>
                <ul className="text-sm text-yellow-700/80 dark:text-yellow-500/80 list-disc list-inside space-y-1">
                  <li>
                    Bạn đang thực hiện xác thực với email:{" "}
                    <strong>{user?.email}</strong>
                  </li>
                  <li>
                    Bắt buộc email này phải được cấp bởi nhà trường (có đuôi{" "}
                    <strong>@vlu.edu.vn</strong>).
                  </li>
                  <li>
                    Sau khi xác thực thành công, hệ thống có thể sẽ yêu cầu bạn{" "}
                    <strong>đăng xuất và đăng nhập lại</strong> để cập nhật
                    quyền hạn.
                  </li>
                </ul>
              </div>
            </div>

            {isValid ? (
              <form onSubmit={handleSubmit} className="flex flex-col mt-4">
                <div className="pt-4 border-t border-dashboard-border flex flex-col-reverse sm:flex-row justify-between items-center gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleLogout}
                    className="text-muted-foreground w-full sm:w-auto"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Đăng xuất để đổi tài khoản
                  </Button>
                  <Button
                    type="submit"
                    disabled={mutation.isPending}
                    className="bg-mainred hover:bg-mainred-hover text-white w-full sm:w-auto px-8"
                  >
                    {mutation.isPending ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <CheckCircle className="w-4 h-4 mr-2" />
                    )}
                    Đồng ý xác thực
                  </Button>
                </div>
              </form>
            ) : (
              <div className="mt-4 p-6 text-center border rounded-xl bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-900/30 text-red-600 dark:text-red-400">
                <p className="font-medium text-lg">
                  Bạn không có quyền xác thực
                </p>
                <p className="text-sm mt-2 opacity-80">
                  Tài khoản của bạn hiện tại không sử dụng email có đuôi{" "}
                  <strong>@vlu.edu.vn</strong> nên không thể thực hiện nâng cấp
                  quyền Giảng viên.
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
