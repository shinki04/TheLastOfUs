"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/components/card";
import type { ChartConfig } from "@repo/ui/components/chart";
import { Skeleton } from "@repo/ui/components/skeleton";
import * as React from "react";

import { getModerationTimeStats, type ModerationStats } from "@/app/actions/moderation";
import { BaseChart } from "@/components/charts/BaseChart";
import { type ChartType, ChartTypeSelector, PeriodSelector, type TimePeriod } from "@/components/charts/ChartTypeSelector";

interface ModerationDistributionChartProps {
  stats: ModerationStats;
}

const chartConfig: ChartConfig = {
  blocked: {
    label: "Keyword Blocked",
    color: "var(--chart-1)",
  },
  flagged: {
    label: "AI Flagged",
    color: "var(--chart-2)",
  },
  deleted: {
    label: "Admin Deleted",
    color: "var(--chart-4)",
  },
};

export function ModerationDistributionChart({ stats }: ModerationDistributionChartProps) {
  const [chartType, setChartType] = React.useState<ChartType>("bar");
  const [period, setPeriod] = React.useState<TimePeriod>("daily");
  const [data, setData] = React.useState<{ period: string; blocked: number; flagged: number; deleted: number }[]>([]);
  const [loading, setLoading] = React.useState(true);

  const fetchData = React.useCallback(async () => {
    setLoading(true);
    try {
      const result = await getModerationTimeStats(period);
      setData(result);
    } catch (error) {
      console.error("Failed to fetch moderation stats:", error);
    } finally {
      setLoading(false);
    }
  }, [period]);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Moderation Activity</CardTitle>
        <div className="flex items-center gap-2">
          <PeriodSelector value={period} onChange={setPeriod} />
          <ChartTypeSelector
            value={chartType}
            onChange={setChartType}
            availableTypes={["area", "bar", "line"]}
          />
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            <Skeleton className="h-[350px] w-full" />
            <div className="flex gap-4">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
        ) : data.length === 0 ? (
          <div className="flex h-[400px] items-center justify-center text-muted-foreground">
            No moderation data available
          </div>
        ) : (
          <BaseChart
            data={data}
            chartType={chartType}
            dataKeys={["blocked", "flagged", "deleted"]}
            config={chartConfig}
            className="h-[400px] w-full"
          />
        )}
      </CardContent>
    </Card>
  );
}
