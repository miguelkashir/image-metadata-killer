import { useState, useCallback, useRef } from "react";
import type { OutputFormat } from "@/app/types/image";
import type { WatermarkPosition } from "@/app/hooks/useWatermark";

export type WatermarkOptions =
  | {
      type: "image";
      url: string;
      position: WatermarkPosition;
      size: number;
      opacity: number;
      rotation: number;
      flipped: boolean;
      flippedY: boolean;
    }
  | {
      type: "text";
      text: string;
      position: WatermarkPosition;
      fontSize: number;
      color: string;
      opacity: number;
      rotation: number;
    };

export type ImageRotation = 0 | 90 | 180 | 270;

interface UseImageDownloadReturn {
  outputFormat: OutputFormat;
  quality: number;
  targetWidth: number | null;
  flipped: boolean;
  flippedY: boolean;
  imageRotation: ImageRotation;
  cleanSize: number | null;
  downloading: boolean;
  copying: boolean;
  copied: boolean;
  setOutputFormat: (fmt: OutputFormat) => void;
  setQuality: (q: number) => void;
  setTargetWidth: (w: number | null) => void;
  setFlipped: (f: boolean) => void;
  setFlippedY: (f: boolean) => void;
  resetFlipped: () => void;
  resetFlippedY: () => void;
  rotateImage: (dir: "cw" | "ccw") => void;
  resetImageRotation: () => void;
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

function getWrappedLines(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
): string[] {
  const result: string[] = [];
  for (const paragraph of text.split("\n")) {
    if (paragraph === "") {
      result.push("");
      continue;
    }
    const words = paragraph.split(" ");
    let line = "";
    for (const word of words) {
      const test = line ? `${line} ${word}` : word;
      if (ctx.measureText(test).width > maxWidth && line) {
        result.push(line);
        line = word;
      } else {
        line = test;
      }
    }
    if (line) {
      result.push(line);
    }
  }

  return result;
}

async function buildBlob(
  imageUrl: string,
  targetWidth: number | null,
  mimeType: string,
  quality: number | undefined,
  flipped: boolean,
  flippedY: boolean,
  imageRotation: ImageRotation,
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

  // For 90/270° the output canvas has swapped dimensions
  const isSwapped = imageRotation === 90 || imageRotation === 270;
  const canvasW = isSwapped ? outHeight : outWidth;
  const canvasH = isSwapped ? outWidth : outHeight;

  const canvas = document.createElement("canvas");
  canvas.width = canvasW;
  canvas.height = canvasH;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Canvas not supported");
  }

  // Draw main image using center-based transform so rotation + flip compose cleanly
  ctx.save();
  ctx.translate(canvasW / 2, canvasH / 2);
  ctx.scale(flipped ? -1 : 1, flippedY ? -1 : 1);
  ctx.rotate((imageRotation * Math.PI) / 180);
  ctx.drawImage(img, -outWidth / 2, -outHeight / 2, outWidth, outHeight);
  ctx.restore();

  if (watermark) {
    // Watermark position is in output (canvas) space
    const cx = Math.round((watermark.position.x / 100) * canvasW);
    const cy = Math.round((watermark.position.y / 100) * canvasH);

    if (watermark.type === "image") {
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
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate((watermark.rotation * Math.PI) / 180);
      ctx.scale(watermark.flipped ? -1 : 1, watermark.flippedY ? -1 : 1);
      ctx.globalAlpha = watermark.opacity / 100;
      ctx.drawImage(wmImg, -wmWidth / 2, -wmHeight / 2, wmWidth, wmHeight);
      ctx.restore();
    } else {
      const fontPx = Math.round((watermark.fontSize / 100) * outWidth);
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate((watermark.rotation * Math.PI) / 180);
      ctx.font = `bold ${fontPx}px sans-serif`;
      ctx.fillStyle = watermark.color;
      ctx.globalAlpha = watermark.opacity / 100;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      const lines = getWrappedLines(ctx, watermark.text, outWidth);
      const lineHeight = fontPx * 1.2;
      const totalHeight = (lines.length - 1) * lineHeight;
      lines.forEach((line, i) => {
        ctx.fillText(line, 0, -totalHeight / 2 + i * lineHeight);
      });
      ctx.restore();
    }
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
  const [flipped, setFlippedState] = useState(false);
  const [flippedY, setFlippedYState] = useState(false);
  const [imageRotation, setImageRotationState] = useState<ImageRotation>(0);
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

  const setFlipped = useCallback((f: boolean) => {
    setFlippedState(f);
    setCleanSize(null);
  }, []);

  const setFlippedY = useCallback((f: boolean) => {
    setFlippedYState(f);
    setCleanSize(null);
  }, []);

  const rotateImage = useCallback((dir: "cw" | "ccw") => {
    setImageRotationState((prev) => {
      const delta = dir === "cw" ? 90 : 270;

      return ((prev + delta) % 360) as ImageRotation;
    });
    setCleanSize(null);
  }, []);

  const handleDownload = useCallback(
    async (file: File, imageUrl: string, watermark?: WatermarkOptions) => {
      setDownloading(true);
      try {
        const mimeType = `image/${outputFormat}` as const;
        const ext = outputFormat === "jpeg" ? "jpg" : outputFormat;
        const qualityArg = outputFormat === "png" ? undefined : quality / 100;

        const blob = await buildBlob(
          imageUrl,
          targetWidth,
          mimeType,
          qualityArg,
          flipped,
          flippedY,
          imageRotation,
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
    [outputFormat, quality, targetWidth, flipped, flippedY, imageRotation],
  );

  const handleCopy = useCallback(
    async (file: File, imageUrl: string, watermark?: WatermarkOptions) => {
      setCopying(true);

      try {
        const blob = await buildBlob(
          imageUrl,
          targetWidth,
          "image/png",
          undefined,
          flipped,
          flippedY,
          imageRotation,
          watermark,
        );
        await navigator.clipboard.write([
          new ClipboardItem({ "image/png": blob }),
        ]);
        if (copiedTimer.current) {
          clearTimeout(copiedTimer.current);
        }
        setCopied(true);
        copiedTimer.current = setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error("Copy failed:", err);
      } finally {
        setCopying(false);
      }
    },
    [targetWidth, flipped, flippedY, imageRotation],
  );

  const resetCleanSize = useCallback(() => setCleanSize(null), []);
  const resetTargetWidth = useCallback(() => {
    setTargetWidthState(null);
    setCleanSize(null);
  }, []);
  const resetFlipped = useCallback(() => {
    setFlippedState(false);
    setCleanSize(null);
  }, []);

  const resetFlippedY = useCallback(() => {
    setFlippedYState(false);
    setCleanSize(null);
  }, []);

  const resetImageRotation = useCallback(() => {
    setImageRotationState(0);
    setCleanSize(null);
  }, []);

  return {
    outputFormat,
    quality,
    targetWidth,
    flipped,
    flippedY,
    imageRotation,
    cleanSize,
    downloading,
    copying,
    copied,
    setOutputFormat,
    setQuality,
    setTargetWidth,
    setFlipped,
    setFlippedY,
    resetFlipped,
    resetFlippedY,
    rotateImage,
    resetImageRotation,
    handleDownload,
    handleCopy,
    resetCleanSize,
    resetTargetWidth,
  };
}
