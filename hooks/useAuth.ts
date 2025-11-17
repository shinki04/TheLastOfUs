import {
  getCurrentUser,
  getUserProfile,
  updateProfileWithAvatar,
} from "@/app/actions/auth";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useGetCurrentUser() {
  return useQuery({
    queryKey: ["user"],
    queryFn: () => getCurrentUser(),
    placeholderData: (previousData) => previousData,
  });
}

export function useGetUser(id: string) {
  return useQuery({
    queryKey: ["user", id],
    queryFn: () => getUserProfile(id),
    placeholderData: (previousData) => previousData,
  });
}

export function useUpdateProfile(userId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: FormData) => {
      if (!userId) throw new Error("Missing user id");
      return updateProfileWithAvatar(userId, data);
    },
    onSuccess: () => {
      // Update profile cache
      // queryClient.setQueryData(["user"], (old: User | null) =>
      //   old ? { ...old, ...updatedProfile } : updatedProfile
      // );

      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ["user"] });
      queryClient.invalidateQueries({ queryKey: ["user", userId] });
    },
    onError: (error) => {
      console.error("Profile update error:", error);
    },
  });
}
