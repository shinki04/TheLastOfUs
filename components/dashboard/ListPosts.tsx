import React from "react";
import { InfinitePostsList } from "./InfinitePostsList";
import { TrendingHashtags } from "../TrendingHashtags";

function ListPosts() {
  return (
    <div className="w-full">
      <TrendingHashtags />

      <h2 className="text-2xl font-bold mb-4">Bài viết</h2>
      <InfinitePostsList />
    </div>
  );
}

export default ListPosts;
