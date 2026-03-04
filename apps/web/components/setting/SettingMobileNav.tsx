"use client";

import { Button } from "@repo/ui/components/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from "@repo/ui/components/sheet";
import { Menu } from "lucide-react";
import { usePathname } from "next/navigation";
import * as React from "react";

import { SettingSidebar } from "./SettingSidebar";

export function SettingMobileNav() {
  const [open, setOpen] = React.useState(false);
  const pathname = usePathname();

  // Close sheet when route changes
  React.useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden text-slate-700 dark:text-slate-300"
        >
          <Menu className="w-5 h-5" />
          <span className="sr-only">Mở menu cài đặt</span>
        </Button>
      </SheetTrigger>
      <SheetContent
        side="left"
        className="w-72 p-0 border-r border-dashboard-border bg-dashboard-sidebar"
      >
        <div className="sr-only">
          <SheetTitle>Menu Cài đặt</SheetTitle>
          <SheetDescription>Điều hướng cài đặt hệ thống</SheetDescription>
        </div>
        <div className="h-full overflow-y-auto w-full">
          <SettingSidebar className="w-full border-none rounded-none shadow-none h-full sticky top-0" />
        </div>
      </SheetContent>
    </Sheet>
  );
}
