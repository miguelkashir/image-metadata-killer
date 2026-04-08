import { useState, useCallback } from "react";
import type { OutputFormat } from "@/app/types/image";

interface UseImageDownloadReturn {
  outputFormat: OutputFormat;
  quality: number;
  targetWidth: number | null;
  cleanSize: number | null;
  downloading: boolean;
  setOutputFormat: (fmt: OutputFormat) => void;
  setQuality: (q: number) => void;
  setTargetWidth: (w: number | null) => void;
  handleDownload: (file: File, imageUrl: string) => Promise<void>;
  resetCleanSize: () => void;
  resetTargetWidth: () => void;
}

export function useImageDownload(
  initialFormat: OutputFormat,
): UseImageDownloadReturn {
  const [outputFormat, setOutputFormatState] = useState<OutputFormat>(initialFormat);
  const [quality, setQualityState] = useState(92);
  const [targetWidth, setTargetWidthState] = useState<number | null>(null);
  const [cleanSize, setCleanSize] = useState<number | null>(null);
  const [downloading, setDownloading] = useState(false);

  const setOutputFormat = useCallback((fmt: OutputFormat) => {
    setOutputFormatState(fmt);
    setCleanSize(null);
  }, []);

  const setQuality = useCallback((q: number) => {
    setQualityState(q);
    setCleanSize(null);
  }, []);

  const setTargetWidth = useCallback((w: number | null) => {
    setTargetWidthState(w);
    setCleanSize(null);
  }, []);

  const handleDownload = useCallback(
    async (file: File, imageUrl: string) => {
      setDownloading(true);
      try {
        const img = new window.Image();
        img.src = imageUrl;
        await new Promise<void>((resolve, reject) => {
          img.onload = () => resolve();
          img.onerror = reject;
        });

        const outWidth = targetWidth ?? img.naturalWidth;
        const outHeight = targetWidth
          ? Math.round((targetWidth / img.naturalWidth) * img.naturalHeight)
          : img.naturalHeight;

        const canvas = document.createElement("canvas");
        canvas.width = outWidth;
        canvas.height = outHeight;
        const ctx = canvas.getContext("2d");

        if (!ctx) {
          throw new Error("Canvas not supported");
        }

        ctx.drawImage(img, 0, 0, outWidth, outHeight);

        const mimeType = `image/${outputFormat}` as const;
        const ext = outputFormat === "jpeg" ? "jpg" : outputFormat;

        const blob = await new Promise<Blob>((resolve, reject) => {
          canvas.toBlob(
            (b) =>
              b ? resolve(b) : reject(new Error("Failed to encode image")),
            mimeType,
            outputFormat === "png" ? undefined : quality / 100,
          );
        });

        setCleanSize(blob.size);

        const baseName = file.name.replace(/\.[^/.]+$/, "");
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${baseName}-clean.${ext}`;
        a.click();
        URL.revokeObjectURL(url);
      } catch (err) {
        console.error("Download failed:", err);
      } finally {
        setDownloading(false);
      }
    },
    [outputFormat, quality, targetWidth],
  );

  const resetCleanSize = useCallback(() => {
    setCleanSize(null);
  }, []);

  const resetTargetWidth = useCallback(() => {
    setTargetWidthState(null);
    setCleanSize(null);
  }, []);

  return {
    outputFormat,
    quality,
    targetWidth,
    cleanSize,
    downloading,
    setOutputFormat,
    setQuality,
    setTargetWidth,
    handleDownload,
    resetCleanSize,
    resetTargetWidth,
  };
}
