"use client";

import { PostResponse } from "@repo/shared/types/post";
import { Skeleton } from "@repo/ui/components/skeleton";
import { useIntersectionObserver } from "@uidotdev/usehooks";
import React, { useEffect } from "react";

import PostCard from "@/components/posts/PostCard";
import { useInfinitePostsQuery } from "@/hooks/useInfinitePosts";

import PendingPost from "./PendingPost";

export function InfinitePostsList() {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
  } = useInfinitePostsQuery();

  const [ref, entry] = useIntersectionObserver({
    threshold: 0,
    root: null,
    rootMargin: "0px",
  });

  useEffect(() => {
    if (entry?.isIntersecting && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [entry, hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-64 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <p className="text-red-500 font-semibold">Lỗi khi tải bài viết</p>
          <p className="text-sm text-gray-500">
            {error instanceof Error ? error.message : "Có lỗi xảy ra"}
          </p>
        </div>
      </div>
    );
  }

  const posts = data?.pages.flatMap((page) => page.posts) ?? [];

  return (
    <div className="space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto pr-2">
      {posts.length === 0 ? (
        <div className="flex items-center justify-center py-12">
          <p className="text-gray-500">Chưa có bài viết nào</p>
        </div>
      ) : (
        <>
          <PendingPost />

          {/* Regular fetched posts */}
          {posts.map((post: PostResponse) => (
            <PostCard key={post.id} post={post} />
          ))}

          {/* Observer target cho Intersection Observer */}
          <div ref={ref} className="h-8" />

          {/* Loading state khi fetch next page */}
          {isFetchingNextPage && (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton
                  key={`loading-${i}`}
                  className="h-64 w-full rounded-lg"
                />
              ))}
            </div>
          )}

          {/* No more posts */}
          {!hasNextPage && posts.length > 0 && (
            <div className="flex items-center justify-center py-8">
              <p className="text-gray-400 text-sm">
                Đã hiển thị tất cả bài viết
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
