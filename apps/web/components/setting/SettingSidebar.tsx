"use client";

import { cn } from "@repo/ui/lib/utils";
import { Bell, CheckCircle, FileText, UserCircle } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function SettingSidebar({ className }: { className?: string }) {
  const pathname = usePathname();

  const navItems = [
    { title: "Thông tin cá nhân", url: "/setting/profile", icon: UserCircle },
    { title: "Thông báo", url: "/setting/notifications", icon: Bell },
    {
      title: "Xác thực giảng viên",
      url: "/setting/verification",
      icon: CheckCircle,
    },
    { title: "Quản lý bài viết", url: "/setting/posts", icon: FileText },
  ];

  return (
    <div
      className={cn(
        "w-64 lg:w-72 shrink-0 bg-dashboard-sidebar rounded-xl border border-dashboard-border overflow-hidden h-fit sticky top-24",
        className,
      )}
    >
      <div className="p-4 border-b border-dashboard-border">
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
          Cài đặt
        </h2>
        <p className="text-sm text-muted-foreground">
          Quản lý tài khoản VLU của bạn
        </p>
      </div>
      <nav className="p-2 flex flex-col gap-1">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.url);
          return (
            <Link
              key={item.url}
              href={item.url}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm font-medium ${
                isActive
                  ? "bg-mainred/10 text-mainred"
                  : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              <item.icon className="w-5 h-5" />
              {item.title}
            </Link>
          );
        })}

        {/* <Link
          href="/setting/delete-account"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm font-medium text-red-600/70 hover:bg-red-500/10 hover:text-red-600 dark:text-red-500/70"
        >
          <Trash2 className="w-5 h-5" />
          Xóa tài khoản
        </Link> */}
      </nav>
    </div>
  );
}
