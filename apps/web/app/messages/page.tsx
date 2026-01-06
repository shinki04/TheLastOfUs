import { ConversationWithDetails, MessageWithSender } from "@repo/shared/types/messaging";
import { conversationKeys, messageKeys } from "@repo/shared/types/queryKeys";
import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";
import { redirect } from "next/navigation";

import { getFriends } from "@/app/actions/friendship";
import { getConversation, getConversations, getMessages } from "@/app/actions/messaging";
import { getCurrentUser } from "@/app/actions/user";

import { MessagesClient } from "./MessagesClient";

export const metadata = {
  title: "Tin nhắn - Messages",
  description: "Nhắn tin với bạn bè và nhóm",
};

const MESSAGES_PER_PAGE = 50;

export default async function MessagesPage({
  searchParams,
}: {
  searchParams: { conversationId?: string };
}) {
  const params = await searchParams;
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect("/login");
  }

  const queryClient = new QueryClient();

  // Prefetch conversations list + friends in parallel
  const [friends] = await Promise.all([
    getFriends(currentUser.id),
    queryClient.prefetchQuery({
      queryKey: conversationKeys.list(),
      queryFn: getConversations,
    }),
  ]);

  // Prefetch conversation detail AND messages if conversationId is provided
  let initialConversation: ConversationWithDetails | null = null;
  let initialMessages: MessageWithSender[] = [];
  
  if (params.conversationId) {
    try {
      // Fetch conversation and messages in PARALLEL for faster initial load
      await Promise.all([
        queryClient.prefetchQuery({
          queryKey: conversationKeys.detail(params.conversationId),
          queryFn: () => getConversation(params.conversationId!),
        }),
        queryClient.prefetchQuery({
          queryKey: messageKeys.list(params.conversationId),
          queryFn: () => getMessages(params.conversationId!, MESSAGES_PER_PAGE),
        }),
      ]);
      
      initialConversation = queryClient.getQueryData<ConversationWithDetails>(
        conversationKeys.detail(params.conversationId)
      ) ?? null;
      
      initialMessages = queryClient.getQueryData<MessageWithSender[]>(
        messageKeys.list(params.conversationId)
      ) ?? [];
    } catch (e) {
      console.error("Failed to load initial conversation/messages", e);
    }
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <MessagesClient
        currentUser={currentUser}
        initialFriends={friends}
        initialConversation={initialConversation}
        initialMessages={initialMessages}
      />
    </HydrationBoundary>
  );
}
