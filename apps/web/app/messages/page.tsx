import { redirect } from "next/navigation";

import { getFriends } from "@/app/actions/friendship";
import { getConversation } from "@/app/actions/messaging";
import { getCurrentUser } from "@/app/actions/user";

import { MessagesClient } from "./MessagesClient";

export const metadata = {
  title: "Tin nhắn - Messages",
  description: "Nhắn tin với bạn bè và nhóm",
};

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

  // Get friends list for creating new conversations
  //TODO Get all user for creating new conversations
  // Get initial conversation if selected

  // const queryClient = new QueryClient();
  // const [friends, conversation] = await Promise.all([
  //   queryClient.prefetchQuery({
  //     queryKey: ["users"],
  //     queryFn: () =>  getFriends(currentUser.id),
  //   }),
  //   queryClient.prefetchQuery({
  //     queryKey: ["conversations"],
  //     queryFn: () =>  getConversation(currentUser.id),
  //   }),
  // ]);
 


  // let initialConversation = queryClient.getQueryData([
  //   "conversations",
  //   currentUser.id,
  // ]);
  // let initialFriends = queryClient.getQueryData([
  //   "users",
  //   currentUser.id,
  // ]);

  let initialConversation = null;
  
  const friends = await getFriends(currentUser.id); 

  if (params.conversationId) {
    try {
      initialConversation = await getConversation(params.conversationId);
    } catch (e) {
      console.error("Failed to load initial conversation", e);
    }
  }

  return (
    //  <HydrationBoundary state={dehydrate(queryClient)}> 
    //  <MessagesClient
    //   currentUser={currentUser}
    //   initialFriends={initialFriends}
    //   initialConversation={initialConversation}
    // />
    // </HydrationBoundary>
   
    <MessagesClient
      currentUser={currentUser}
      initialFriends={friends}
      initialConversation={initialConversation}
    />
    
  );
}
