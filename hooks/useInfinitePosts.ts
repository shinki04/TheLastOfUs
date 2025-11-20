"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { fetchPosts } from "@/lib/services/postService";
import { Post } from "@/types/post";

const ITEMS_PER_PAGE = 10;

export interface PostsPage {
  posts: Post[];
  page: number;
  hasMore: boolean;
}

export function useInfinitePostsQuery() {
  return useInfiniteQuery({
    queryKey: ["posts", "infinite"],
    queryFn: async ({ pageParam = 1 }) => {
      const posts = await fetchPosts(pageParam, ITEMS_PER_PAGE);
      return {
        posts,
        page: pageParam,
        hasMore: posts.length === ITEMS_PER_PAGE,
        nextPage: pageParam + 1,
      };
    },
    getNextPageParam: (lastPage) => {
      return lastPage.hasMore ? lastPage.nextPage : undefined;
    },
    initialPageParam: 1,
  });
}
