"use client";

import { Button } from "@repo/ui/components/button";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@repo/ui/components/table";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { CheckCircle, Loader2, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { getPendingAppeals, updateAppealStatus } from "@/app/actions/appeals";
import { PostAppeal } from "@repo/shared/types/post";

export default function AppealsPage() {
  const [appeals, setAppeals] = useState<PostAppeal[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAppeals = async () => {
    setIsLoading(true);
    try {
      const data = await getPendingAppeals();
      setAppeals(data);
    } catch {
      toast.error("Không thể tải danh sách khiếu nại");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAppeals();
  }, []);

  const handleAction = async (appealId: string, postId: string, action: "approve_post" | "reject_appeal") => {
    try {
      setAppeals((prev) => prev.filter((a) => a.id !== appealId));
      await updateAppealStatus(appealId, postId, action);
      toast.success(
        action === "approve_post"
          ? "Đã khôi phục bài viết"
          : "Đã từ chối khiếu nại",
      );
    } catch {
      toast.error("Có lỗi xảy ra");
      fetchAppeals(); // Revert on error
    }
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Kháng cáo bài viết</h2>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-12">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      ) : appeals.length === 0 ? (
        <div className="p-12 text-center text-muted-foreground border rounded-xl">
          <CheckCircle className="w-12 h-12 mb-4 text-green-500 mx-auto" />
          <p className="text-lg font-medium">Không có khiếu nại nào đang chờ xử lý</p>
        </div>
      ) : (
        <div className="border rounded-md">
          <Table>
            <TableCaption>Danh sách các bài viết bị giới hạn đang đợi quản trị viên duyệt lại.</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Người kháng cáo</TableHead>
                <TableHead className="w-[30%]">Lý do kháng cáo</TableHead>
                <TableHead className="w-[30%]">Nội dung bài viết</TableHead>
                <TableHead>Thời gian</TableHead>
                <TableHead className="text-right">Hành động</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {appeals.map((appeal) => (
                <TableRow key={appeal.id}>
                  <TableCell className="font-medium">
                    {appeal.user?.display_name || "Người dùng ẩn danh"}
                    <br/>
                    <span className="text-xs text-muted-foreground">@{appeal.user?.username}</span>
                  </TableCell>
                  <TableCell>{appeal.reason}</TableCell>
                  <TableCell className="text-muted-foreground text-xs line-clamp-2">
                    {appeal.post?.content || "Không có nội dung"}
                  </TableCell>
                  <TableCell>
                    {formatDistanceToNow(new Date(appeal.created_at), { addSuffix: true, locale: vi })}
                  </TableCell>
                  <TableCell className="text-right flex items-center justify-end gap-2">
                    <Button 
                      size="sm" 
                      onClick={() => handleAction(appeal.id, appeal.post_id, "approve_post")}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" /> Khôi phục
                    </Button>
                    <Button 
                      size="sm" 
                      variant="destructive"
                      onClick={() => handleAction(appeal.id, appeal.post_id, "reject_appeal")}
                    >
                      <XCircle className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
