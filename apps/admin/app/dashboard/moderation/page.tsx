import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@repo/ui/components/breadcrumb";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/components/card";
import { Separator } from "@repo/ui/components/separator";
import { SidebarTrigger } from "@repo/ui/components/sidebar";
import { ShieldAlert, ShieldBan, ShieldCheck, Zap } from "lucide-react";
import Link from "next/link";

import { getModerationStats } from "@/app/actions/moderation";
import { AnalyticsHeader } from "@/components/analytics/AnalyticsHeader";
import { ADMIN_ROUTES } from "@/constants/admin-sidebar";

import { ModerationDistributionChart } from "../../../components/moderation/ModerationDistributionChart";

export default async function ModerationAnalyticsPage() {
  const stats = await getModerationStats();

  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem className="hidden md:block">
              <BreadcrumbLink href={ADMIN_ROUTES.DASHBOARD}>Dashboard</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="hidden md:block" />
            <BreadcrumbItem>
              <BreadcrumbPage>Moderation Analytics</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </header>
      <div className="flex flex-1 flex-col gap-4 p-4">
        <AnalyticsHeader
          title="Moderation Analytics"
          description="Overview of content moderation activities"
        />

        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Actions</CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalActions.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Across all content types</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Keyword Blocked</CardTitle>
              <ShieldBan className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-500">{stats.blockedCount}</div>
              <p className="text-xs text-muted-foreground">Auto-blocked by keyword filter</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">AI Flagged</CardTitle>
              <ShieldAlert className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-500">{stats.flaggedCount}</div>
              <p className="text-xs text-muted-foreground">Required manual review</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Actions</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-1">
              <Link href={ADMIN_ROUTES.MODERATION_ALL} className="text-primary hover:underline text-sm">
                View all actions →
              </Link>
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <ShieldCheck className="h-3 w-3 text-green-500" />
                {stats.recentActions} in last 24h
              </span>
            </CardContent>
          </Card>
        </div>

        <ModerationDistributionChart stats={stats} />
      </div>
    </>
  );
}
