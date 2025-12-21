"use client";

import { Loader2 } from "lucide-react";
import React from "react";
import { useInView } from "react-intersection-observer";

import { useComments } from "@/hooks/usePostInteractions";

import { Comment, CommentItem } from "./CommentItem";

interface CommentSectionProps {
  postId: string;
  onReply: (authorName: string, parentId: string) => void;
}

export function CommentSection({ postId, onReply }: CommentSectionProps) {
  const { 
      commentsData, 
      isLoading, 
      removeComment, 
      editComment,
      fetchNextPage, 
      hasNextPage, 
      isFetchingNextPage 
  } = useComments(postId);

  const { ref, inView } = useInView();

  React.useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);
  
  const rawComments = React.useMemo(() => {
      // Flatten
      const flat = commentsData?.pages.flatMap(page => page.comments) || [];
      // Sort: Newest First (DESC)
      return flat.sort((a, b) => {
          const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
          const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
          return dateB - dateA;
      });
  }, [commentsData]);

  const commentTree = React.useMemo(() => {
    const map = new Map<string, Comment>();
    const roots: Comment[] = [];

    // Cast to Comment type to fix "is_edited" and other missing props if necessary.
    const nodes: Comment[] = rawComments.map(c => ({ 
        ...c, 
        children: [],
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        is_edited: (c as any).is_edited ?? false 
    } as unknown as Comment));

    nodes.forEach(node => map.set(node.id, node));

    nodes.forEach(node => {
        if (node.parent_id && map.has(node.parent_id)) {
            map.get(node.parent_id)!.children!.push(node);
        } else {
            roots.push(node);
        }
    });
    
    return roots;
  }, [rawComments]);
  
  const handleDelete = (commentId: string) => {
      removeComment(commentId); 
  };

  return (
    <div className="pt-4 space-y-4 pb-4">
       <div className="space-y-4">
           {isLoading && !rawComments.length && (
               <div className="flex justify-center p-4">
                   <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
               </div>
           )}
           
           {!isLoading && rawComments.length === 0 && (
               <div className="py-8 text-center text-muted-foreground">
                   <p>Chưa có bình luận nào.</p>
               </div>
           )}

           {/* Comments List */}
           {commentTree.map((comment) => (
               <CommentItem 
                 key={comment.id} 
                 comment={comment} 
                 onReply={onReply} 
                 onDelete={handleDelete}
                 onEdit={(id, content) => editComment({ commentId: id, content })}
               />
           ))}

           {/* Load More at Bottom */}
           {hasNextPage && (
               <div ref={ref} className="flex justify-center pt-2 pb-4">
                   <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
               </div>
           )}
       </div>
    </div>
  );
}
