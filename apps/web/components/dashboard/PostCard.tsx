"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import {
  FileSpreadsheet,
  FileText,
  FileType,
  Heart,
  MessageCircle,
  Share2,
} from "lucide-react";
import Image from "next/image";
import React from "react";

import {
  getFileInfo,
  isImageType,
  isVideoType,
  type MediaType,
} from "@/lib/mediaUtils";
import { PostResponse } from "@repo/shared/types/post";

import { Card } from "../ui/card";
import FileLightbox from "./FileLightbox";
import MediaGalleryModal from "./MediaGalleryModal";
import MediaLightbox from "./MediaLightbox";
import ReadMore from "./ReadMore";

interface PostCardProps {
  post: PostResponse;
  isPending?: boolean; // For optimistic UI
}

export default function PostCard({ post, isPending = false }: PostCardProps) {
  const [isLiked, setIsLiked] = React.useState(false);
  const [showGalleryModal, setShowGalleryModal] = React.useState(false);
  const [lightboxIndex, setLightboxIndex] = React.useState<number | null>(null);
  const [fileLightboxData, setFileLightboxData] = React.useState<{
    url: string;
    type: MediaType;
    name: string;
  } | null>(null);

  const createdAt = post.created_at
    ? formatDistanceToNow(new Date(post.created_at), {
        addSuffix: true,
        locale: vi,
      })
    : "Vừa xong";

  const privacyLabel =
    {
      public: "Công khai",
      friends: "Bạn bè",
      private: "Riêng tư",
    }[post.privacy_level] || "Công khai";

  const getFileIconComponent = (type: MediaType) => {
    const iconClass = "w-8 h-8";
    switch (type) {
      case "pdf":
      case "document":
        return <FileText className={iconClass} />;
      case "word":
        return <FileType className={iconClass} />;
      case "excel":
        return <FileSpreadsheet className={iconClass} />;
      default:
        return <FileText className={iconClass} />;
    }
  };

  const imageUrls =
    post.media_urls?.filter((url) => {
      const fileInfo = getFileInfo(url);
      return isImageType(fileInfo.type);
    }) || [];

  const handleDownload = (url: string) => {
    const fileName = url.split("/").pop()?.split("?")[0] || "download";
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Card
      className={` rounded-lg shadow hover:shadow-lg transition-shadow ${
        isPending ? "opacity-50 pointer-events-none relative" : ""
      }`}
    >
      {isPending && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/50 rounded-lg">
          <div className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-full shadow-lg">
            <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
            <span className="text-sm font-medium">Đang xử lý...</span>
          </div>
        </div>
      )}
      <div className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
              <Avatar>
                <AvatarImage
                  src={post.author?.avatar_url || "/next.svg"}
                  alt={
                    post.author?.display_name ||
                    post.author?.username ||
                    "User Avatar"
                  }
                />
                <AvatarFallback>U</AvatarFallback>
              </Avatar>
            </div>
            <div>
              <p className="font-semibold text-sm">
                {post.author?.display_name || post.author?.username}
              </p>
              <p className="text-xs text-gray-500">{createdAt}</p>
            </div>
          </div>
          <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">
            {privacyLabel}
          </span>
        </div>

        {/* Content */}
        <div className="mb-3">
          <ReadMore content={post.content} />
        </div>

        {/* Media Gallery */}
        {post.media_urls && post.media_urls.length > 0 && (
          <div
            className={`grid gap-2 mb-3 ${
              post.media_urls.length === 1
                ? "grid-cols-1"
                : post.media_urls.length === 2
                ? "grid-cols-2"
                : "grid-cols-2 md:grid-cols-3"
            }`}
          >
            {post.media_urls.slice(0, 4).map((url, index) => {
              const fileInfo = getFileInfo(url);
              const isImage = isImageType(fileInfo.type);
              const isVideo = isVideoType(fileInfo.type);
              const isMoreMedia =
                post.media_urls && post.media_urls.length > 4 && index === 3;

              return (
                <div
                  key={index}
                  className="relative aspect-square bg-gray-200 rounded-lg overflow-hidden group cursor-pointer"
                  onClick={() => {
                    if (isMoreMedia) {
                      setShowGalleryModal(true);
                    } else if (isImage && imageUrls.length > 0) {
                      const imageIndex = imageUrls.indexOf(url);
                      setLightboxIndex(imageIndex);
                    } else if (!isImage && !isVideo) {
                      // Open FileLightbox for documents
                      const fileName =
                        url.split("/").pop()?.split("?")[0] || "File";
                      setFileLightboxData({
                        url,
                        type: fileInfo.type,
                        name: fileName,
                      });
                    }
                  }}
                >
                  {isImage ? (
                    <Image
                      src={url}
                      alt={`Post media ${index + 1}`}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-200"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  ) : isVideo ? (
                    <video
                      src={url}
                      className="w-full h-full object-cover "
                      controls
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 group-hover:from-blue-100 group-hover:to-indigo-200 transition-all duration-200">
                      {/* File Icon */}
                      <div className="text-blue-600 mb-2 group-hover:scale-110 transition-transform duration-200">
                        {getFileIconComponent(fileInfo.type)}
                      </div>

                      {/* File Extension Badge */}
                      <span className="inline-block bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded mb-2 uppercase">
                        {fileInfo.extension}
                      </span>

                      {/* File Name */}
                      <p className="text-xs text-gray-700 text-center px-2 line-clamp-2 group-hover:text-gray-900 font-medium mb-1">
                        {url.split("/").pop()?.split("?")[0] || "File"}
                      </p>

                      {/* Action hint */}
                      <p className="text-[10px] text-gray-500 group-hover:text-gray-700 font-medium">
                        Click để xem
                      </p>
                    </div>
                  )}
                  {isMoreMedia && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center hover:bg-black/60 transition-colors">
                      <span className="text-white font-bold text-2xl">
                        +{post.media_urls!.length - 4}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Stats */}
        <div className="flex items-center justify-between text-xs text-gray-500 border-y border-gray-200 py-2 mb-3">
          <span>{post.like_count || 0} lượt thích</span>
          <div className="flex space-x-4">
            <span>{post.comment_count || 0} bình luận</span>
            <span>{post.share_count || 0} chia sẻ</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-around text-gray-600">
          <button
            onClick={() => setIsLiked(!isLiked)}
            className={`flex items-center space-x-2 py-2 px-3 rounded hover:bg-gray-100 transition-colors ${
              isLiked ? "text-red-500" : ""
            }`}
          >
            <Heart
              className="w-4 h-4"
              fill={isLiked ? "currentColor" : "none"}
            />
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
      </div>

      {/* Gallery Modal - show all media with post content */}
      {showGalleryModal && (
        <MediaGalleryModal
          mediaUrls={post.media_urls || []}
          postContent={post.content}
          onClose={() => setShowGalleryModal(false)}
        />
      )}

      {/* Lightbox - fullscreen image viewer */}
      {lightboxIndex !== null && imageUrls.length > 0 && imageUrls[lightboxIndex] && (
        <MediaLightbox
          imageUrl={imageUrls[lightboxIndex]}
          allImageUrls={imageUrls}
          currentIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onNavigate={(index) => setLightboxIndex(index)}
        />
      )}

      {/* File Lightbox - fullscreen file viewer */}
      {fileLightboxData && (
        <FileLightbox
          fileUrl={fileLightboxData.url}
          fileType={fileLightboxData.type}
          fileName={fileLightboxData.name}
          onClose={() => setFileLightboxData(null)}
        />
      )}
    </Card>
  );
}
