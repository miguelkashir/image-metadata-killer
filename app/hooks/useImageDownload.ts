import { useState, useCallback } from "react";
import type { OutputFormat } from "@/app/types/image";

interface UseImageDownloadReturn {
  outputFormat: OutputFormat;
  quality: number;
  scale: number;
  cleanSize: number | null;
  downloading: boolean;
  setOutputFormat: (fmt: OutputFormat) => void;
  setQuality: (q: number) => void;
  setScale: (s: number) => void;
  handleDownload: (file: File, imageUrl: string) => Promise<void>;
  resetCleanSize: () => void;
  resetScale: () => void;
}

export function useImageDownload(
  initialFormat: OutputFormat,
): UseImageDownloadReturn {
  const [outputFormat, setOutputFormatState] = useState<OutputFormat>(initialFormat);
  const [quality, setQualityState] = useState(92);
  const [scale, setScaleState] = useState(100);
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

  const setScale = useCallback((s: number) => {
    setScaleState(s);
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

        const canvas = document.createElement("canvas");
        canvas.width = Math.round(img.naturalWidth * (scale / 100));
        canvas.height = Math.round(img.naturalHeight * (scale / 100));
        const ctx = canvas.getContext("2d");

        if (!ctx) {
          throw new Error("Canvas not supported");
        }

        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

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
    [outputFormat, quality, scale],
  );

  const resetCleanSize = useCallback(() => setCleanSize(null), []);

  const resetScale = useCallback(() => {
    setScaleState(100);
    setCleanSize(null);
  }, []);

  return {
    outputFormat,
    quality,
    scale,
    cleanSize,
    downloading,
    setOutputFormat,
    setQuality,
    setScale,
    handleDownload,
    resetCleanSize,
    resetScale,
  };
}
