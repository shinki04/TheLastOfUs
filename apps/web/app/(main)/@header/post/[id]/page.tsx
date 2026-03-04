import React from "react";

import { cachedGetPost } from "@/app/actions/cache-post";
import { Header } from "@/components/dashboard/Header";

interface HeaderPostPageProps {
  params: Promise<{ id: string }>;
}
async function HeaderPostPage({ params }: HeaderPostPageProps) {
  const { id } = await params;
  const post = await cachedGetPost(id);
  return (
    <Header
      title={
        post?.author?.display_name
          ? `Bài viết của ${post?.author?.display_name}`
          : "Bài viết"
      }
    />
  );
}

export default HeaderPostPage;
