"use client";

import { Download, X } from "lucide-react";
import React, { useEffect, useState } from "react";

import { formatFileSize, getFileInfo, type MediaType } from "@/lib/mediaUtils";

interface FileLightboxProps {
  fileUrl: string;
  fileType: MediaType;
  fileName: string;
  fileSize?: number;
  onClose: () => void;
}

export default function FileLightbox({
  fileUrl,
  fileType,
  fileName,
  fileSize,
  onClose,
}: FileLightboxProps) {
  const [textContent, setTextContent] = useState<string>("");
  const [isLoadingText, setIsLoadingText] = useState(false);

  const fileInfo = getFileInfo(fileUrl);

  // Load text file content
  useEffect(() => {
    if (fileType !== "document" || !fileName.endsWith(".txt")) return;

    let isMounted = true;

    const loadText = async () => {
      try {
        setIsLoadingText(true);
        const res = await fetch(fileUrl);
        const text = await res.text();

        if (!isMounted) return;
        setTextContent(text);
      } catch {
        if (!isMounted) return;
        setTextContent("Không thể tải nội dung file");
      } finally {
        if (!isMounted) return;
        setIsLoadingText(false);
      }
    };

    loadText();

    return () => {
      isMounted = false;
    };
  }, [fileUrl, fileType, fileName]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      onClose();
    }
  };

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = fileUrl;
    link.download = fileName;
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderContent = () => {
    switch (fileType) {
      case "pdf":
        return (
          <div className="w-full h-full flex items-center justify-center">
            <iframe
              src={fileUrl}
              className="w-full h-full rounded-lg"
              title={fileName}
            />
          </div>
        );

      case "video":
        return (
          <div className="w-full h-full flex items-center justify-center">
            <video
              src={fileUrl}
              controls
              autoPlay
              className="max-w-full max-h-full rounded-lg"
            >
              Trình duyệt của bạn không hỗ trợ video.
            </video>
          </div>
        );

      case "document":
        if (fileName.endsWith(".txt")) {
          return (
            <div className="w-full h-full flex items-center justify-center p-8">
              <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-full overflow-auto">
                <div className="p-6">
                  <h3 className="text-lg font-semibold mb-4 text-gray-800">
                    {fileName}
                  </h3>
                  {isLoadingText ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
                    </div>
                  ) : (
                    <pre className="whitespace-pre-wrap font-mono text-sm text-gray-700 bg-gray-50 p-4 rounded border border-gray-200">
                      {textContent}
                    </pre>
                  )}
                </div>
              </div>
            </div>
          );
        }
      // Fall through for non-txt documents

      default:
        // For Word, Excel, and other documents - show info card with download
        return (
          <div className="w-full h-full flex items-center justify-center p-8">
            <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-8 text-center">
              <div className="mb-6">
                <span className="text-7xl">{fileInfo.icon}</span>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-800 break-words">
                {fileName}
              </h3>
              <p className="text-sm text-gray-500 mb-1">{fileInfo.label}</p>
              {fileSize && (
                <p className="text-sm text-gray-400 mb-6">
                  {formatFileSize(fileSize)}
                </p>
              )}
              <button
                onClick={handleDownload}
                className="inline-flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg transition-colors font-medium"
              >
                <Download className="w-5 h-5" />
                Tải xuống
              </button>
              <p className="text-xs text-gray-400 mt-4">
                File này không thể xem trước trong trình duyệt
              </p>
            </div>
          </div>
        );
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
      onClick={onClose}
      onKeyDown={handleKeyDown}
      role="dialog"
      aria-modal="true"
      tabIndex={-1}
    >
      <div
        className="relative w-full h-full flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-black/60 backdrop-blur-sm">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <span className="text-2xl">{fileInfo.icon}</span>
            <div className="flex-1 min-w-0">
              <h2 className="text-white font-medium truncate">{fileName}</h2>
              <div className="flex items-center gap-3 text-sm text-gray-300">
                <span>{fileInfo.label}</span>
                {fileSize && <span>{formatFileSize(fileSize)}</span>}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              className="bg-white/20 hover:bg-white/30 text-white rounded-lg p-2 transition-colors"
              aria-label="Tải xuống"
            >
              <Download className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="bg-white/20 hover:bg-white/30 text-white rounded-lg p-2 transition-colors"
              aria-label="Đóng"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">{renderContent()}</div>
      </div>
    </div>
  );
}
