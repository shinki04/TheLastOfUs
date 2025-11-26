"use client";

import React, { useEffect, useRef, useCallback } from "react";
import { useInfinitePostsQuery } from "@/hooks/useInfinitePosts";
import PostCard from "@/components/dashboard/PostCard";
import { Skeleton } from "../ui/skeleton";

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

  const observerTarget = useRef<HTMLDivElement>(null);

  // Intersection Observer để detect khi scroll đến bottom
  useEffect(() => {
    if (!observerTarget.current || !hasNextPage || isFetchingNextPage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(observerTarget.current);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handleScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      const target = e.currentTarget;
      const isNearBottom =
        target.scrollHeight - (target.scrollTop + target.clientHeight) < 200;

      if (isNearBottom && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    },
    [hasNextPage, isFetchingNextPage, fetchNextPage]
  );

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
    <div
      className="space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto pr-2"
      onScroll={handleScroll}
    >
      {posts.length === 0 ? (
        <div className="flex items-center justify-center py-12">
          <p className="text-gray-500">Chưa có bài viết nào</p>
        </div>
      ) : (
        <>
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}

          {/* Observer target cho Intersection Observer */}
          <div ref={observerTarget} className="h-8" />

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
