import { Heart, MessageCircle, Share2 } from "lucide-react";

// PostStats Component
interface PostStatsProps {
  likeCount: number;
  commentCount: number;
  shareCount: number;
}

export function PostStats({
  likeCount,
  commentCount,
  shareCount,
}: PostStatsProps) {
  return (
    <div className="flex items-center justify-between text-xs text-gray-500 border-y border-gray-200 py-2 mb-3">
      <span>{likeCount} lượt thích</span>
      <div className="flex space-x-4">
        <span>{commentCount} bình luận</span>
        <span>{shareCount} chia sẻ</span>
      </div>
    </div>
  );
}

// PostActions Component
interface PostActionsProps {
  isLiked: boolean;
  onLikeToggle: () => void;
}

export function PostActions({ isLiked, onLikeToggle }: PostActionsProps) {
  return (
    <div className="flex items-center justify-around text-gray-600">
      <button
        onClick={onLikeToggle}
        className={`flex items-center space-x-2 py-2 px-3 rounded hover:bg-gray-100 transition-colors ${
          isLiked ? "text-red-500" : ""
        }`}
      >
        <Heart className="w-4 h-4" fill={isLiked ? "currentColor" : "none"} />
        <span className="text-sm">Thích</span>
      </button>
      <button className="flex items-center space-x-2 py-2 px-3 rounded hover:bg-gray-100 transition-colors">
        <MessageCircle className="w-4 h-4" />
        <span className="text-sm">Bình luận</span>
      </button>
      <button className="flex items-center space-x-2 py-2 px-3 rounded hover:bg-gray-100 transition-colors">
        <Share2 className="w-4 h-4" />
        <span className="text-sm">Chia sẻ</span>
      </button>
    </div>
  );
}
