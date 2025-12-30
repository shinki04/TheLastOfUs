"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/components/card";
import { ShieldAlert, ShieldBan, ShieldCheck, Zap } from "lucide-react";
import * as React from "react";
import { Bar, BarChart, ResponsiveContainer, Tooltip,XAxis, YAxis } from "recharts";

import { ModerationStats } from "@/app/actions/moderation";

interface ModerationAnalyticsProps {
  stats: ModerationStats | null;
  loading: boolean;
}

export function ModerationAnalytics({ stats, loading }: ModerationAnalyticsProps) {
  if (loading || !stats) {
    return <div className="grid grid-cols-1 md:grid-cols-4 gap-4 animate-pulse">
        {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-muted rounded-lg"></div>)}
    </div>;
  }

  const chartData = [
    { name: "Blocked", value: stats.blockedCount, fill: "#ef4444" },
    { name: "Flagged", value: stats.flaggedCount, fill: "#eab308" },
    { name: "Deleted", value: stats.aiDeletedCount, fill: "#f97316" },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Actions</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalActions}</div>
            <p className="text-xs text-muted-foreground">
              Across all content types
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Keyword Blocked</CardTitle>
            <ShieldBan className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.blockedCount}</div>
            <p className="text-xs text-muted-foreground">
              Auto-blocked by keyword filter
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AI Flagged</CardTitle>
            <ShieldAlert className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.flaggedCount}</div>
            <p className="text-xs text-muted-foreground">
               Required manual review
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last 24h</CardTitle>
            <ShieldCheck className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.recentActions}</div>
            <p className="text-xs text-muted-foreground">
              New actions today
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         <Card className="col-span-1">
            <CardHeader>
               <CardTitle>Action Distribution</CardTitle>
            </CardHeader>
            <CardContent>
               <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                     <BarChart data={chartData}>
                        <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                        <Tooltip />
                        <Bar dataKey="value" radius={[4, 4, 0, 0]} />
                     </BarChart>
                  </ResponsiveContainer>
               </div>
            </CardContent>
         </Card>
      </div>
    </div>
  );
}
