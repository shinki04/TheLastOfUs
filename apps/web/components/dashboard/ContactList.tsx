"use client";

import { BLANK_AVATAR } from "@repo/shared/types/user";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@repo/ui/components/dropdown-menu";
import { Skeleton } from "@repo/ui/components/skeleton";
import { MessageCircle, User, Users } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { toast } from "sonner";

import { createOrGetDirectConversation } from "@/app/actions/messaging";
import { useGetCurrentUser } from "@/hooks/useAuth";
import { useFriends } from "@/hooks/useFriendship";

export function ContactList() {
  const { data: currentUser } = useGetCurrentUser();
  const { data: friends, isLoading } = useFriends(currentUser?.id || "");
  const router = useRouter();
  const [loadingFriendId, setLoadingFriendId] = useState<string | null>(null);

  const handleMessage = useCallback(
    async (friendId: string) => {
      try {
        setLoadingFriendId(friendId);
        const conversation = await createOrGetDirectConversation(friendId);
        router.push(`/messages?conversationId=${conversation.id}`);
      } catch {
        toast.error("Không thể mở cuộc trò chuyện");
      } finally {
        setLoadingFriendId(null);
      }
    },
    [router],
  );

  const handleViewProfile = useCallback(
    (friendId: string) => {
      router.push(`/profile/${friendId}`);
    },
    [router],
  );

  if (isLoading) {
    return (
      <div>
        <h3 className="font-bold text-base text-foreground mb-3">
          Người liên hệ
        </h3>
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center gap-3 px-2 py-1.5">
              <Skeleton className="h-9 w-9 rounded-full shrink-0" />
              <Skeleton className="h-4 w-28" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!friends || friends.length === 0) {
    return (
      <div>
        <h3 className="font-bold text-base text-foreground mb-3">
          Người liên hệ
        </h3>
        <div className="flex flex-col items-center gap-2 py-6 text-muted-foreground">
          <Users className="h-8 w-8" />
          <p className="text-sm">Chưa có bạn bè</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h3 className="font-bold text-base text-foreground mb-3">
        Người liên hệ
      </h3>
      <div className="space-y-0.5">
        {friends.map((friend) => (
          <DropdownMenu key={friend.id}>
            <DropdownMenuTrigger asChild>
              <button
                className="flex items-center gap-3 w-full rounded-lg px-2 py-2 transition-colors hover:bg-accent text-left cursor-pointer"
                disabled={loadingFriendId === friend.id}
              >
                <div className="relative shrink-0">
                  <Image
                    src={friend.avatar_url || BLANK_AVATAR}
                    alt={friend.display_name || friend.username || "User"}
                    width={36}
                    height={36}
                    className="rounded-full object-cover aspect-square"
                  />
                  {/* Online indicator dot - placeholder for future */}
                  {/* <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-green-500 ring-2 ring-background" /> */}
                </div>
                <span className="text-sm font-medium truncate">
                  {friend.display_name || friend.username}
                </span>
                {loadingFriendId === friend.id && (
                  <span className="ml-auto">
                    <span className="h-4 w-4 block rounded-full border-2 border-muted-foreground border-t-transparent animate-spin" />
                  </span>
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" side="left" sideOffset={8}>
              <DropdownMenuItem
                onClick={() => handleMessage(friend.id)}
                disabled={loadingFriendId === friend.id}
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                Nhắn tin
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleViewProfile(friend.id)}>
                <User className="h-4 w-4 mr-2" />
                Xem trang cá nhân
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ))}
      </div>
    </div>
  );
}
