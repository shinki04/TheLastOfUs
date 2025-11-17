import { getCurrentUser, getUserProfile } from "@/app/actions/auth";
import Profile from "@/components/profile/Profile";
import { User } from "@/types/user";
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import React from "react";

interface ProfileIdPageProps {
  params: Promise<{ id: string }>;
}

async function ProfileIdPage({ params }: ProfileIdPageProps) {
  const { id } = await params;
  const queryClient = new QueryClient();

  // const user = await queryClient.fetchQuery({
  //   queryKey: ["user", id],
  //   queryFn: () => getUserProfile(id),
  //   staleTime: 10000,
  // });

  // const CurrentDataUser: User = await queryClient.fetchQuery({
  //   queryKey: ["user"],
  //   queryFn: () => getCurrentUser(),
  //   initialData: queryClient.getQueryData(["user"]), // lấy từ cache
  // });

  // Prefetch data cho client-side
  await Promise.all([
    queryClient.fetchQuery({
      queryKey: ["user", id],
      queryFn: () => getUserProfile(id),
    }),
    queryClient.fetchQuery({
      queryKey: ["user"],
      queryFn: getCurrentUser,
    }),
  ]);

  // Lấy data từ cache để xử lý logic server-side
  const user = queryClient.getQueryData<User>(["user", id]);
  const currentUser = queryClient.getQueryData<User>(["user"]);

  if (!user || !currentUser) return "Khong tim thay nguoi dung";

  const isOwner = currentUser.id === id;
  console.log(isOwner, currentUser.id);

  return (
    <>
      <div>ID : {id}</div>
      <HydrationBoundary state={dehydrate(queryClient)}>
        <Profile user={user} isOwner={isOwner} />
      </HydrationBoundary>
    </>
  );
}

export default ProfileIdPage;
