"use client";

import { PostResponse } from "@repo/shared/types/post";
import { User } from "@repo/shared/types/user";
import { Button } from "@repo/ui/components/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@repo/ui/components/dialog";
import { useQueryClient } from "@tanstack/react-query";
import { RefreshCw } from "lucide-react";
import React, { useState } from "react";

import { CommentInput } from "../comments/CommentInput";
import { CommentSection } from "../comments/CommentSection";
import PostMediaGallery from "./MediaPreview";
import { PostActions } from "./PostActions";
import PostHeader from "./PostHeader";
import ReadMore from "./ReadMore";

interface PostDetailDialogProps {
  post: PostResponse;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentUser?: User; 
}

export default function PostDetailDialog({ post, open, onOpenChange, currentUser }: PostDetailDialogProps) {
  const isOwner = currentUser?.id === post.author.id;
  const queryClient = useQueryClient();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [replyTo, setReplyTo] = useState<{ name: string; parentId: string } | null>(null);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["post-comments", post.id] }),
        queryClient.invalidateQueries({ queryKey: ["post-likes", post.id] }), // if used locally
        queryClient.invalidateQueries({ queryKey: ["posts", "infinite"] }) // Refresh feed to update main counts
    ]);
    setTimeout(() => setIsRefreshing(false), 800);
  };

  const handleMediaClick = (url: string) => {
      // no-op
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl h-[80vh] flex flex-col p-0 gap-0 overflow-hidden">
        <DialogHeader className="p-4 border-b shrink-0 flex flex-row items-center justify-between">
           <div className="flex items-center gap-3">
               <DialogTitle className="text-base font-semibold">Bài viết của {post.author.display_name || post.author.username}</DialogTitle>
           </div>
           
           <div className="flex items-center gap-2 mr-6">
                <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={handleRefresh}
                    disabled={isRefreshing}
                    title="Làm mới bình luận"
                >
                    <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
                </Button>
           </div>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
            <PostHeader
                author={post.author}
                createdAt={post.created_at!}
                updatedAt={post.updated_at}
                privacyLevel={post.privacy_level}
                isOwner={isOwner}
                onDelete={() => {}} // Disabled in modal
                onUpdate={() => {}} // Disabled in modal
            />
            
            <div className="mt-4 mb-4">
                 <ReadMore 
                    content={post.content} 
                    gradientClass="bg-gradient-to-t from-background via-background/90 to-transparent"
                 />
            </div>

            {/* Media */}
            <PostMediaGallery 
                mediaUrls={post.media_urls}
                onMediaClick={handleMediaClick}
            />

            <div className="my-4 border-t pt-2">
                 <PostActions
                    post={{
                        id: post.id,
                        like_count: post.like_count || 0,
                        comment_count: post.comment_count || 0,
                        share_count: post.share_count || 0,
                        is_liked_by_viewer: post.is_liked_by_viewer || false
                    }}
                    onCommentClick={() => {
                        // Focus comment input logic if possible
                    }}
                 />
            </div>

            <div className="mt-2">
                <CommentSection 
                    postId={post.id} 
                    onReply={(name, parentId) => setReplyTo({ name, parentId })}
                />
            </div>
        </div>
        
        <CommentInput 
          postId={post.id} 
          replyTo={replyTo} 
          onCancelReply={() => setReplyTo(null)}
          onCommentSent={() => {}}
        />
      </DialogContent>
    </Dialog>
  );
}
