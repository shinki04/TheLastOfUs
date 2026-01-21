"use client";

import { Button } from "@repo/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@repo/ui/components/dialog";
import { Label } from "@repo/ui/components/label";
import { Textarea } from "@repo/ui/components/textarea";
import { XCircle } from "lucide-react";
import * as React from "react";

interface RejectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (reason: string) => void;
  loading?: boolean;
}

export function RejectDialog({
  open,
  onOpenChange,
  onConfirm,
  loading = false,
}: RejectDialogProps) {
  const [reason, setReason] = React.useState("");

  const handleConfirm = () => {
    onConfirm(reason.trim());
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setReason("");
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <XCircle className="h-5 w-5 text-destructive" />
            Từ chối bài viết
          </DialogTitle>
          <DialogDescription>
            Bài viết sẽ bị từ chối và ẩn khỏi chế độ công khai. Tác giả sẽ được thông báo.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="reason">Lý do từ chối (không bắt buộc)</Label>
            <Textarea
              id="reason"
              placeholder="Ví dụ: Vi phạm quy tắc cộng đồng, Chứa nội dung không phù hợp..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => handleOpenChange(false)}
            disabled={loading}
          >
            Hủy
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleConfirm}
            disabled={loading}
          >
            {loading && (
              <div className="animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
            )}
            Từ chối bài viết
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
