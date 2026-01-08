"use client";

import type { PendingFile } from "@repo/shared/types/messaging";
import { createClient } from "@repo/supabase/client";
import Uppy from "@uppy/core";
import Vietnamese from "@uppy/locales/lib/vi_VN";
import Tus from "@uppy/tus";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

// 50MB max file size for messages (for dev)
const MAX_FILE_SIZE = 50 * 1024 * 1024;
const CHUNK_SIZE = 6 * 1024 * 1024; // 6MB chunks for resumable upload
const MAX_FILES = 10;

interface UseMessageUppyOptions {
    conversationId: string;
    onProgressUpdate?: (files: PendingFile[]) => void;
    onUploadComplete?: (urls: string[]) => void;
    onUploadError?: (error: string) => void;
}

interface UseMessageUppyReturn {
    addFiles: (files: File[]) => PendingFile[];
    startUpload: () => Promise<string[]>;
    cancelUpload: () => void;
    removeFile: (fileId: string) => void;
    pendingFiles: PendingFile[];
    isUploading: boolean;
    overallProgress: number;
}

/**
 * Hook for handling message file uploads with Uppy + TUS resumable
 * Optimized for large files up to 50MB (for dev)
 */
export function useMessageUppy({
    conversationId,
    onProgressUpdate,
    onUploadComplete,
    onUploadError,
}: UseMessageUppyOptions): UseMessageUppyReturn {
    const supabase = useMemo(() => createClient(), []);
    const initialized = useRef(false);
    const [pendingFiles, setPendingFiles] = useState<PendingFile[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [overallProgress, setOverallProgress] = useState(0);

    // Create Uppy instance
    const [uppy] = useState(
        () =>
            new Uppy({
                id: `messages-${conversationId}`,
                locale: Vietnamese,
                autoProceed: false,
                restrictions: {
                    maxFileSize: MAX_FILE_SIZE,
                    maxNumberOfFiles: MAX_FILES,
                    allowedFileTypes: [
                        "image/*",
                        "video/*",
                        "audio/*",
                        ".pdf",
                        ".doc",
                        ".docx",
                        ".txt",
                        ".xls",
                        ".xlsx",
                        ".ppt",
                        ".pptx",
                        ".zip",
                        ".rar",
                        ".7z",
                    ],
                },
            })
    );

    // Initialize Uppy with TUS plugin
    useEffect(() => {
        if (initialized.current) return;
        initialized.current = true;

        const initializeUppy = async () => {
            const {
                data: { session },
            } = await supabase.auth.getSession();

            if (!uppy.getPlugin("Tus")) {
                uppy.use(Tus, {
                    id: "Tus",
                    endpoint: `${process.env.NEXT_PUBLIC_SUPABASE_URL!}/storage/v1/upload/resumable`,
                    retryDelays: [0, 3000, 5000, 10000, 20000],
                    chunkSize: CHUNK_SIZE,
                    uploadDataDuringCreation: true,
                    removeFingerprintOnSuccess: true,
                    headers: {
                        authorization: `Bearer ${session?.access_token ?? ""}`,
                        apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
                    },
                    allowedMetaFields: [
                        "bucketName",
                        "objectName",
                        "contentType",
                        "cacheControl",
                        "metadata",
                    ],
                    onError: (error) => {
                        console.error("[MessageUppy] Upload error:", error);
                    },
                });
            }

            // Set file metadata on add
            uppy.on("file-added", (file) => {
                const timestamp = Date.now();
                const randomStr = Math.random().toString(36).substring(2, 9);
                const extension = file.name.split(".").pop() || "";
                // Path: {conversationId}/{timestamp}-{random}.{ext}
                const objectName = `${conversationId}/${timestamp}-${randomStr}.${extension}`;

                file.meta = {
                    ...file.meta,
                    bucketName: "messages",
                    objectName,
                    contentType: file.type || "application/octet-stream",
                };
            });

            // Progress updates
            uppy.on("upload-progress", (file, progress) => {
                if (!file) return;

                const bytesTotal = progress.bytesTotal ?? 1;
                setPendingFiles((prev) =>
                    prev.map((pf) =>
                        pf.id === file.id
                            ? { ...pf, progress: Math.round((progress.bytesUploaded / bytesTotal) * 100) }
                            : pf
                    )
                );
            });

            // Overall progress
            uppy.on("progress", (progress) => {
                setOverallProgress(progress);
            });

            // Individual file complete
            uppy.on("upload-success", (file, response) => {
                if (!file) return;

                const url = getPublicUrl(file.meta.objectName as string);
                setPendingFiles((prev) =>
                    prev.map((pf) =>
                        pf.id === file.id
                            ? { ...pf, progress: 100, status: "done", url }
                            : pf
                    )
                );
            });

            // Individual file error
            uppy.on("upload-error", (file, error) => {
                if (!file) return;

                setPendingFiles((prev) =>
                    prev.map((pf) =>
                        pf.id === file.id
                            ? { ...pf, status: "failed" }
                            : pf
                    )
                );
            });

            // Restriction failed
            uppy.on("restriction-failed", (file, error) => {
                const sizeLimit = MAX_FILE_SIZE / (1024 * 1024);
                if (error?.message.includes("exceeds maximum size")) {
                    toast.error(`File "${file?.name}" vượt quá ${sizeLimit}MB!`);
                } else {
                    toast.error(error?.message || `File "${file?.name}" không hợp lệ`);
                }
                onUploadError?.(error?.message || "File không hợp lệ");
            });
        };

        initializeUppy();

        return () => {
            uppy.cancelAll();
        };
    }, [uppy, conversationId, supabase, onUploadError]);

    // Notify parent of progress updates
    useEffect(() => {
        onProgressUpdate?.(pendingFiles);
    }, [pendingFiles, onProgressUpdate]);

    // Get public URL for uploaded file
    const getPublicUrl = useCallback((objectName: string): string => {
        return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/messages/${objectName}`;
    }, []);

    // Add files to upload queue
    const addFiles = useCallback(
        (files: File[]): PendingFile[] => {
            const newPendingFiles: PendingFile[] = [];

            files.forEach((file) => {
                try {
                    const uppyFile = uppy.addFile({
                        name: file.name,
                        type: file.type,
                        data: file,
                        source: "local",
                    });

                    // Create local preview for images/videos
                    let localPreview: string | undefined;
                    if (file.type.startsWith("image/") || file.type.startsWith("video/")) {
                        localPreview = URL.createObjectURL(file);
                    }

                    newPendingFiles.push({
                        id: uppyFile,
                        name: file.name,
                        size: file.size,
                        type: file.type,
                        localPreview,
                        progress: 0,
                        status: "uploading",
                    });
                } catch (err) {
                    console.error("[MessageUppy] Failed to add file:", err);
                }
            });

            setPendingFiles((prev) => [...prev, ...newPendingFiles]);
            return newPendingFiles;
        },
        [uppy]
    );

    // Start upload and return URLs
    const startUpload = useCallback(async (): Promise<string[]> => {
        if (pendingFiles.length === 0) return [];

        setIsUploading(true);

        try {
            const result = await uppy.upload();

            if (!result) {
                throw new Error("Upload failed - no result");
            }

            if (result.failed && result.failed.length > 0) {
                const errorMsg = `${result.failed.length} file(s) failed to upload`;
                onUploadError?.(errorMsg);
                throw new Error(errorMsg);
            }

            // Get URLs from successful uploads
            const urls = (result.successful || [])
                .map((file) => getPublicUrl(file.meta.objectName as string))
                .filter(Boolean);

            onUploadComplete?.(urls);

            // Clear uppy files after successful upload
            uppy.cancelAll();
            setPendingFiles([]);
            setOverallProgress(0);

            return urls;
        } catch (err) {
            console.error("[MessageUppy] Upload failed:", err);
            throw err;
        } finally {
            setIsUploading(false);
        }
    }, [uppy, pendingFiles, getPublicUrl, onUploadComplete, onUploadError]);

    // Cancel all uploads
    const cancelUpload = useCallback(() => {
        uppy.cancelAll();

        // Revoke blob URLs
        pendingFiles.forEach((pf) => {
            if (pf.localPreview) {
                URL.revokeObjectURL(pf.localPreview);
            }
        });

        setPendingFiles([]);
        setIsUploading(false);
        setOverallProgress(0);
    }, [uppy, pendingFiles]);

    // Remove single file
    const removeFile = useCallback(
        (fileId: string) => {
            try {
                uppy.removeFile(fileId);
            } catch {
                // File might not exist in uppy
            }

            setPendingFiles((prev) => {
                const file = prev.find((pf) => pf.id === fileId);
                if (file?.localPreview) {
                    URL.revokeObjectURL(file.localPreview);
                }
                return prev.filter((pf) => pf.id !== fileId);
            });
        },
        [uppy]
    );

    return {
        addFiles,
        startUpload,
        cancelUpload,
        removeFile,
        pendingFiles,
        isUploading,
        overallProgress,
    };
}
