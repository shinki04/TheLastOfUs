"use client";

import { Button } from "@repo/ui/components/button";
import { Textarea } from "@repo/ui/components/textarea"; 
import { Loader2, SendHorizontal } from "lucide-react";
import React, { useRef, useState } from "react";

import { useComments } from "@/hooks/usePostInteractions";

interface CommentInputProps {
    postId: string;
    replyTo: { name: string; parentId: string } | null;
    onCancelReply: () => void;
    onCommentSent?: () => void;
}

export function CommentInput({ postId, replyTo, onCancelReply, onCommentSent }: CommentInputProps) {
  const { sendComment, isSending } = useComments(postId);
  
  const [content, setContent] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Focus input when replyTo changes
  React.useEffect(() => {
      if (replyTo && inputRef.current) {
          inputRef.current.focus();
      }
  }, [replyTo]);

  const handleSend = () => {
      if (!content.trim()) return;
      
      const currentContent = content;
      
      // Clear immediately
      setContent("");
      onCancelReply(); // Clear reply state
      
      sendComment({ content: currentContent, parentId: replyTo?.parentId }, {
          onSuccess: () => {
              if (onCommentSent) onCommentSent();
          },
          onError: () => {
              // Restore on error if needed, but simple toast is often enough. 
              // Restoring text might be complex if user typed new stuff. 
              // Simple: just notify error.
              setContent(currentContent);
          }
      });
  };

  return (
       <div className="bg-background pt-2 pb-2 border-t">
           {replyTo && (
               <div className="flex items-center justify-between text-xs text-muted-foreground mb-2 bg-muted/50 p-2 rounded">
                   <span>Đang trả lời <b>{replyTo.name}</b></span>
                   <button onClick={onCancelReply} className="hover:text-red-500 font-medium">Hủy</button>
               </div>
           )}
           <div className="flex gap-2 items-end">
               <Textarea 
                 ref={inputRef}
                 value={content}
                 onChange={(e) => setContent(e.target.value)}
                 placeholder={replyTo ? `Trả lời ${replyTo.name}...` : "Viết bình luận..."}
                 className="min-h-[40px] max-h-[120px] resize-none py-2 bg-muted/30 focus:bg-background transition-colors"
                 onKeyDown={(e) => {
                     if (e.key === 'Enter' && !e.shiftKey) {
                         e.preventDefault();
                         handleSend();
                     }
                 }}
               />
               <Button 
                 size="icon" 
                 onClick={handleSend} 
                 disabled={isSending || !content.trim()}
                 className="mb-[2px] shrink-0"
               >
                   {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <SendHorizontal className="w-4 h-4" />}
               </Button>
           </div>
       </div>
  );
}
