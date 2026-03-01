"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

export function FeedFilterTabs() {
  const searchParams = useSearchParams();
  const filter = searchParams.get("filter") || "all";

  const getLinkClass = (currentPattern: string) => {
    return filter === currentPattern
      ? "text-mainred border-b-2 border-mainred pb-0.5"
      : "text-slate-500 hover:text-mainred transition-colors pb-0.5";
  };

  return (
    <div className="flex gap-6 mt-1 text-sm font-medium">
      <Link href="/dashboard?filter=all" className={getLinkClass("all")}>
        Tất cả
      </Link>
      <Link href="/dashboard?filter=user" className={getLinkClass("user")}>
        Người dùng
      </Link>
      <Link href="/dashboard?filter=group" className={getLinkClass("group")}>
        Nhóm
      </Link>
    </div>
  );
}
