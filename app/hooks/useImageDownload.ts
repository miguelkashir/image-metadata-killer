import { useState, useCallback, useRef } from "react";
import type { OutputFormat } from "@/app/types/image";
import type { WatermarkPosition } from "@/app/hooks/useWatermark";

export interface WatermarkOptions {
  url: string;
  position: WatermarkPosition;
  size: number;
  opacity: number;
}

interface UseImageDownloadReturn {
  outputFormat: OutputFormat;
  quality: number;
  targetWidth: number | null;
  cleanSize: number | null;
  downloading: boolean;
  copying: boolean;
  copied: boolean;
  setOutputFormat: (fmt: OutputFormat) => void;
  setQuality: (q: number) => void;
  setTargetWidth: (w: number | null) => void;
  handleDownload: (
    file: File,
    imageUrl: string,
    watermark?: WatermarkOptions,
  ) => Promise<void>;
  handleCopy: (
    file: File,
    imageUrl: string,
    watermark?: WatermarkOptions,
  ) => Promise<void>;
  resetCleanSize: () => void;
  resetTargetWidth: () => void;
}

async function buildBlob(
  imageUrl: string,
  targetWidth: number | null,
  mimeType: string,
  quality: number | undefined,
  watermark?: WatermarkOptions,
): Promise<Blob> {
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

  if (!ctx) throw new Error("Canvas not supported");

  ctx.drawImage(img, 0, 0, outWidth, outHeight);

  if (watermark) {
    const wmImg = new window.Image();
    wmImg.src = watermark.url;
    await new Promise<void>((resolve, reject) => {
      wmImg.onload = () => resolve();
      wmImg.onerror = reject;
    });

    const wmWidth = Math.round((watermark.size / 100) * outWidth);
    const wmHeight = Math.round(
      (wmWidth / wmImg.naturalWidth) * wmImg.naturalHeight,
    );
    const wmX =
      Math.round((watermark.position.x / 100) * outWidth) - wmWidth / 2;
    const wmY =
      Math.round((watermark.position.y / 100) * outHeight) - wmHeight / 2;

    ctx.globalAlpha = watermark.opacity / 100;
    ctx.drawImage(wmImg, wmX, wmY, wmWidth, wmHeight);
    ctx.globalAlpha = 1;
  }

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("Failed to encode image"))),
      mimeType,
      quality,
    );
  });
}

export function useImageDownload(
  initialFormat: OutputFormat,
): UseImageDownloadReturn {
  const [outputFormat, setOutputFormatState] =
    useState<OutputFormat>(initialFormat);
  const [quality, setQualityState] = useState(100);
  const [targetWidth, setTargetWidthState] = useState<number | null>(null);
  const [cleanSize, setCleanSize] = useState<number | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [copying, setCopying] = useState(false);
  const [copied, setCopied] = useState(false);
  const copiedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

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
    async (file: File, imageUrl: string, watermark?: WatermarkOptions) => {
      setDownloading(true);
      try {
        const mimeType = `image/${outputFormat}` as const;
        const ext = outputFormat === "jpeg" ? "jpg" : outputFormat;
        const qualityArg =
          outputFormat === "png" ? undefined : quality / 100;

        const blob = await buildBlob(
          imageUrl,
          targetWidth,
          mimeType,
          qualityArg,
          watermark,
        );

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

  const handleCopy = useCallback(
    async (file: File, imageUrl: string, watermark?: WatermarkOptions) => {
      setCopying(true);
      try {
        // Clipboard API only reliably supports PNG across browsers
        const blob = await buildBlob(
          imageUrl,
          targetWidth,
          "image/png",
          undefined,
          watermark,
        );

        await navigator.clipboard.write([
          new ClipboardItem({ "image/png": blob }),
        ]);

        if (copiedTimer.current) clearTimeout(copiedTimer.current);
        setCopied(true);
        copiedTimer.current = setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error("Copy failed:", err);
      } finally {
        setCopying(false);
      }
    },
    [targetWidth],
  );

  const resetCleanSize = useCallback(() => setCleanSize(null), []);
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
    copying,
    copied,
    setOutputFormat,
    setQuality,
    setTargetWidth,
    handleDownload,
    handleCopy,
    resetCleanSize,
    resetTargetWidth,
  };
}
