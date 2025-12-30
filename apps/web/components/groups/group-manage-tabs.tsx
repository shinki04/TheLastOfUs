"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui/components/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@repo/ui/components/tabs";
import { AlertTriangle,Settings, Users } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

import type { GroupWithDetails } from "@/app/actions/group";
import { BlockedKeywordsForm } from "@/components/groups/blocked-keywords-form";
import { GroupSettingsForm } from "@/components/groups/group-settings-form";
import { MemberList } from "@/components/groups/member-list";

interface GroupManageTabsProps {
  group: GroupWithDetails;
  isAdmin: boolean;
  canManage: boolean;
  defaultTab?: string;
}

export function GroupManageTabs({ group, isAdmin, canManage, defaultTab = "members" }: GroupManageTabsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleTabChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", value);
    router.push(`?${params.toString()}`, { scroll: false });
  };

  return (
    <Tabs defaultValue={defaultTab} onValueChange={handleTabChange} className="w-full">
      <TabsList className="grid w-full grid-cols-3 mb-6">
        <TabsTrigger value="members" className="flex items-center gap-2">
          <Users className="w-4 h-4" />
          Thành viên
        </TabsTrigger>
        <TabsTrigger value="keywords" className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" />
          Từ cấm
        </TabsTrigger>
        {isAdmin && (
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Cài đặt
          </TabsTrigger>
        )}
      </TabsList>

      {/* Members Tab */}
      <TabsContent value="members" className="space-y-6">
        <MemberList groupId={group.id} currentUserRole={group.my_membership?.role ?? null} />
      </TabsContent>

      {/* Keywords Tab */}
      <TabsContent value="keywords">
        <Card>
          <CardHeader>
            <CardTitle>Quản lý từ cấm</CardTitle>
            <CardDescription>
              Từ khóa bị cấm trong group này. Bài đăng và bình luận chứa từ cấm sẽ bị chặn tự động.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <BlockedKeywordsForm groupId={group.id} canManage={canManage} />
          </CardContent>
        </Card>
      </TabsContent>

      {/* Settings Tab (Admin only) */}
      {isAdmin && (
        <TabsContent value="settings" className="max-w-2xl">
          <GroupSettingsForm group={group} />
        </TabsContent>
      )}
    </Tabs>
  );
}
