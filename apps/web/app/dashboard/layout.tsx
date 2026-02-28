import * as React from "react";

// Use the new DashboardLayout
import { DashboardLayout as DashboardLayoutComponent } from "@/components/dashboard/DashboardLayout";
import RightSidebar from "@/components/dashboard/RightSidebar";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <>
      <div className="w-full h-full fixed top-0 left-0 z-0 min-h-screen pointer-events-none"></div>
      <div className="relative z-10 min-h-screen">
        <DashboardLayoutComponent rightSidebar={<RightSidebar />}>
          {children}
        </DashboardLayoutComponent>
      </div>
    </>
  );
}

