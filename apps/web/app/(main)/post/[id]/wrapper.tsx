"use client";
import { GroupWithDetails } from "@/app/actions/group";
import { CommentInput } from "@/components/comments/CommentInput";
import { CommentSection } from "@/components/comments/CommentSection";
import PostCard from "@/components/posts/PostCard";
import { useGetCurrentUser } from "@/hooks/useAuth";
import { PostResponse } from "@repo/shared/types/post";
import { Card } from "@repo/ui/components/card";
import React from "react";

interface WrapperProps {
  post: PostResponse;
  group?: GroupWithDetails | null;
}
function Wrapper({ post, group }: WrapperProps) {
  const { data: currentUser } = useGetCurrentUser();
  return (
    <>
      <PostCard post={post} />
      <Card className="mt-1">
        <div className="px-2">
          <CommentSection
            postId={post.id}
            isGlobalAdmin={currentUser?.global_role === "admin"}
          />
        </div>
        {/* Comment Input - Sticky at bottom, separate from list */}
        <CommentInput
          postId={post.id}
          allowAnonymousComments={group?.allow_anonymous_comments ?? false}
        />
      </Card>
    </>
  );
}

export default Wrapper;
