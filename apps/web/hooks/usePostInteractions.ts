"use client";

import { Tables } from "@repo/shared/types/database.types"; 
import { Post } from "@repo/shared/types/post";
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect,useRef } from "react";
import { toast } from "sonner";

import {
  addComment,
  deleteComment,
  fetchComments,
  getPostLikeStatus,
  sharePost,
  updateComment,
  updatePostLikeStatus,
} from "@/app/actions/interactions";

import { useGetCurrentUser } from "./useAuth"; 

// Using generic type for tables until generation is confirmed/merged
type Comment = Tables<"post_comments">;
// export type Comment = any; // Fallback

export function usePostInteractions(
  postId: string,
  initialData?: { isLiked: boolean; count: number }
) {
  const queryClient = useQueryClient();

  // --- Likes ---
  const { data: likeData } = useQuery({
    queryKey: ["post-likes", postId],
    queryFn: async () => {
      const data = await getPostLikeStatus(postId);
      return { isLiked: data.isLiked, count: data.likeCount };
    },
    initialData: initialData,
    staleTime: 1000, // Trust initial data or invalidation
  });

  // --- Likes (Debounced) ---
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // We need to keep track of the latest "desired" state to send to server.
  // We can't rely on the "current" state inside the timeout callback because of closures,
  // so we use a ref. 
  // Ideally, we want to know: "After 500ms of silence, what is the final state?"
  // We can track this by updating this ref on every click.
  const latestIsLikedRef = useRef<boolean>(likeData?.isLiked ?? false);

  // Sync ref with external data when it changes (e.g. initial load)
  useEffect(() => {
    if (likeData) {
        latestIsLikedRef.current = likeData.isLiked;
    }
  }, [likeData?.isLiked]);

  const { mutate: updateLikeStatus } = useMutation({
    mutationFn: (finalIsLiked: boolean) => updatePostLikeStatus(postId, finalIsLiked),
    onMutate: async (finalIsLiked) => {
        // We don't need to do optimistic updates here because we did them manually in handleToggleLike
        // But we might want to cancel outgoing refetches? 
        // Actually, since we are managing state locally in React Query cache, we fine.
    },
    onError: (err, newTodo, context) => {
       // Revert cache if server update fails uses standard invalidation or manual rollback
       toast.error("Lỗi cập nhật lượt thích.");
       queryClient.invalidateQueries({ queryKey: ["post-likes", postId] });
    },
    onSettled: () => {
       // Ideally we don't invalidate immediately to avoid jitter if user clicks again? 
       // But for data consistency we should.
       // Let's rely on the fact that debounce ended.
       queryClient.invalidateQueries({ queryKey: ["post-likes", postId] });
    }
  });

  const handleToggleLike = () => {
    // 1. Cancel existing timeout
    if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
    }

    // 2. Calculate new state based on *current cache* (or current derived state)
    const currentData = queryClient.getQueryData<{
        isLiked: boolean;
        count: number;
    }>(["post-likes", postId]);
    
    // Fallback if no cache yet (should meet initialData but just in case)
    const currentIsLiked = currentData?.isLiked ?? (likeData?.isLiked || false);
    const currentCount = currentData?.count ?? (likeData?.count || 0);

    const nextIsLiked = !currentIsLiked;
    const nextCount = nextIsLiked ? currentCount + 1 : Math.max(0, currentCount - 1);

    // 3. Optimistic Update immediately
    queryClient.setQueryData(["post-likes", postId], {
        isLiked: nextIsLiked,
        count: nextCount
    });

    // 4. Update the ref for the timeout to read
    latestIsLikedRef.current = nextIsLiked;

    // 5. Set new timeout
    debounceTimeoutRef.current = setTimeout(() => {
        updateLikeStatus(latestIsLikedRef.current);
    }, 1000); // 1s debounce
  };

  // --- Shares ---
  const { mutate: share } = useMutation({
    mutationFn: () => sharePost(postId),
    onSuccess: () => {
      toast.success("Đã chia sẻ bài viết!");
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
    onError: () => {
        toast.error("Chia sẻ thất bại.");
    }
  });

  return {
    isLiked: likeData?.isLiked ?? false,
    likeCount: likeData?.count ?? 0,
    toggleLike: handleToggleLike,
    share,
  };
}

export function useComments(postId: string) {
    const queryClient = useQueryClient();
    
    // Fetch comments using Infinite Query for "Load More"
    const { 
        data: commentsData, 
        isLoading, 
        fetchNextPage, 
        hasNextPage, 
        isFetchingNextPage 
    } = useInfiniteQuery({
        queryKey: ["post-comments", postId],
        queryFn: ({ pageParam }) => fetchComments(postId, pageParam as number),
        initialPageParam: 1,
        getNextPageParam: (lastPage, allPages) => {
            const currentTotal = allPages.flatMap(p => p.comments).length;
            if (currentTotal < lastPage.total) {
                return allPages.length + 1;
            }
            return undefined;
        }
    });

    const { data: currentUser } = useGetCurrentUser();

    // Add Comment
    const { mutate: sendComment, isPending: isSending } = useMutation({
        mutationFn: ({ content, parentId }: { content: string; parentId?: string }) => 
            addComment(postId, content, parentId),
        onMutate: async ({ content, parentId }) => {
             await queryClient.cancelQueries({ queryKey: ["post-comments", postId] });
             
             const previousComments = queryClient.getQueryData(["post-comments", postId]);
             
             if (currentUser) {
                 const optimisticComment = {
                     id: `temp-${Date.now()}`,
                     content,
                     created_at: new Date().toISOString(),
                     post_id: postId,
                     user_id: currentUser.id,
                     parent_id: parentId || null,
                     author: {
                         id: currentUser.id,
                         username: currentUser.username,
                         display_name: currentUser.display_name || currentUser.username,
                         avatar_url: currentUser.avatar_url
                     }
                 };
 // eslint-disable-next-line @typescript-eslint/no-explicit-any
                 queryClient.setQueryData(["post-comments", postId], (old: { pages: any }) => {
                     if (!old) {
                         return {
                             pages: [{
                                 comments: [optimisticComment],
                                 total: 1
                             }],
                             pageParams: [1]
                         };
                     }
                     
                     const newPages = [...old.pages];
                     const firstPage = { ...newPages[0] };
                     
                     // Prepend to first page (since we sort DESC - Newest First)
                     firstPage.comments = [optimisticComment, ...firstPage.comments];
                     firstPage.total = (firstPage.total || 0) + 1;
                     
                     newPages[0] = firstPage;
                     
                     return {
                         ...old,
                         pages: newPages
                     };
                 });
             }
             
             // Optimistic update for Feed (Post comment count)
             const previousFeed = queryClient.getQueryData(["posts", "infinite"]);
             queryClient.setQueryData(["posts", "infinite"], (oldFeed: { pages: { posts: Post[]; }[]; }) => {
                 if (!oldFeed) return oldFeed;
                 
                 const newPages = oldFeed.pages.map((page: { posts: Post[]; }) => ({
                     ...page,
                     posts: page.posts.map((post: Post) => {
                         if (post.id === postId) {
                             return {
                                 ...post,
                                 comment_count: (post.comment_count || 0) + 1
                             };
                         }
                         return post;
                     })
                 }));
                 
                 return { ...oldFeed, pages: newPages };
             });
             
             return { previousComments, previousFeed };
        },
        onError: (err, variables, context) => {
             if (context?.previousComments) {
                 queryClient.setQueryData(["post-comments", postId], context.previousComments);
             }
             if (context?.previousFeed) {
                 queryClient.setQueryData(["posts", "infinite"], context.previousFeed);
             }
             toast.error("Không thể gửi bình luận. Thử lại?");
        },
        onSettled: () => {
             queryClient.invalidateQueries({ queryKey: ["post-comments", postId] });
             // Invalidate likes/stats if needed
             queryClient.invalidateQueries({ queryKey: ["post-likes", postId] }); 
        }
    });

     // Delete Comment
     const { mutate: removeComment } = useMutation({
        mutationFn: (commentId: string) => deleteComment(commentId),
        onError: () => {
            toast.error("Xóa bình luận thất bại.");
        },
        onSettled: () => {
             queryClient.invalidateQueries({ queryKey: ["post-comments", postId] });
             queryClient.invalidateQueries({ queryKey: ["post-likes", postId] }); 
        }
     });

     // Update Comment
     const { mutate: editComment } = useMutation({
        mutationFn: ({ commentId, content }: { commentId: string; content: string }) => 
            updateComment(commentId, content),
        onSuccess: () => {
            toast.success("Đã cập nhật bình luận");
        },
        onError: () => {
            toast.error("Cập nhật thất bại.");
        },
        onSettled: () => {
             queryClient.invalidateQueries({ queryKey: ["post-comments", postId] });
        }
     });

    return {
        commentsData,
        isLoading,
        sendComment,
        isSending,
        removeComment,
        editComment,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage
    };
}
