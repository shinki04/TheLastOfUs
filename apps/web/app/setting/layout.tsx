import * as React from "react";

import { Header } from "@/components/dashboard/Header";
import { SettingMobileNav } from "@/components/setting/SettingMobileNav";
import { SettingSidebar } from "@/components/setting/SettingSidebar";

interface SettingLayoutProps {
  children: React.ReactNode;
}

export default function SettingLayout({ children }: SettingLayoutProps) {
  return (
    <div className="bg-dashboard-background text-slate-900 dark:text-slate-100 min-h-screen flex flex-col font-display">
      <Header
        hideNavTabs={true}
        centerContent={
          <div className="flex items-center w-full justify-start md:justify-center">
            <SettingMobileNav />
            <h2 className="text-lg font-bold hidden md:block text-slate-900 dark:text-slate-100">
              Cài đặt hệ thống
            </h2>
          </div>
        }
      />
      <div className="flex-1 max-w-screen-2xl w-full px-4 md:px-6 lg:px-10 py-6 gap-6 mx-auto flex items-start justify-center">
        {/* Left Sidebar specific to Settings */}
        <aside className="hidden md:flex flex-col gap-6 sticky top-24 h-fit shrink-0">
          <SettingSidebar />
        </aside>

        {/* Center Content without right sidebar */}
        <div className="flex-1 min-w-0 w-full max-w-4xl border border-dashboard-border bg-dashboard-sidebar rounded-xl min-h-[50vh]">
          {children}
        </div>
      </div>
    </div>
  );
}
