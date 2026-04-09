import { useRef, useState, useCallback, useEffect } from "react";
import { formatBytes } from "@/app/utils/formatBytes";
import type {
  WatermarkPosition,
  WatermarkType,
} from "@/app/hooks/useWatermark";
import type { ImageRotation } from "@/app/hooks/useImageDownload";

interface ImagePreviewProps {
  file: File;
  imageUrl: string;
  flipped?: boolean;
  flippedY?: boolean;
  imageRotation?: ImageRotation;
  onReset: () => void;
  watermarkType?: WatermarkType;
  // image watermark
  watermarkUrl?: string | null;
  watermarkSize?: number;
  watermarkFlipped?: boolean;
  watermarkFlippedY?: boolean;
  // text watermark
  watermarkText?: string;
  watermarkFontSize?: number;
  watermarkColor?: string;
  watermarkRotation?: number;
  // shared
  watermarkPosition?: WatermarkPosition;
  watermarkOpacity?: number;
  onPositionChange?: (pos: WatermarkPosition) => void;
}

interface ImageRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

function getContainedRect(elem: HTMLImageElement): ImageRect {
  const { naturalWidth, naturalHeight, clientWidth, clientHeight } = elem;
  const scale = Math.min(
    clientWidth / naturalWidth,
    clientHeight / naturalHeight,
  );
  const w = naturalWidth * scale;
  const h = naturalHeight * scale;

  return {
    x: (clientWidth - w) / 2,
    y: (clientHeight - h) / 2,
    width: w,
    height: h,
  };
}

export const ImagePreview = ({
  file,
  imageUrl,
  flipped = false,
  flippedY = false,
  imageRotation = 0,
  onReset,
  watermarkType = "image",
  watermarkUrl,
  watermarkSize = 25,
  watermarkFlipped = false,
  watermarkFlippedY = false,
  watermarkText = "",
  watermarkFontSize = 5,
  watermarkColor = "#ffffff",
  watermarkRotation = 0,
  watermarkPosition = { x: 90, y: 90 },
  watermarkOpacity = 80,
  onPositionChange,
}: ImagePreviewProps) => {
  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [imageRect, setImageRect] = useState<ImageRect | null>(null);
  const dragging = useRef(false);

  // The last successfully rendered canvas data URL and the rotation it was
  // built for. Both are updated together (inside the async decode callback)
  // so they always agree with each other.
  const [generatedUrl, setGeneratedUrl] = useState<string | null>(null);
  const [generatedRotation, setGeneratedRotation] = useState<ImageRotation>(0);

  // Derived — no setState needed. When there are no transforms we use the
  // original imageUrl directly so the effect never has to call setState
  // synchronously, which would trigger a cascading render (lint rule).
  const noTransform = imageRotation === 0 && !flipped && !flippedY;
  const previewUrl = noTransform ? imageUrl : (generatedUrl ?? imageUrl);
  // Use the rotation baked into the current canvas, not the pending one,
  // so is90or270 and previewUrl stay in sync and avoid a layout flash.
  const is90or270 =
    !noTransform && (generatedRotation === 90 || generatedRotation === 270);

  useEffect(() => {
    // No transform needed — previewUrl is derived from imageUrl directly,
    // nothing to generate. Return without touching state.
    if (imageRotation === 0 && !flipped && !flippedY) {
      return;
    }

    let cancelled = false;

    const img = new window.Image();
    img.src = imageUrl;
    img.onload = () => {
      if (cancelled) {
        return;
      }

      const { naturalWidth: nw, naturalHeight: nh } = img;
      const isSwapped = imageRotation === 90 || imageRotation === 270;

      // 1200px is plenty for a preview panel and keeps encoding fast.
      const MAX_DIM = 1200;
      const scale = Math.min(1, MAX_DIM / Math.max(nw, nh));
      const canvasW = Math.round((isSwapped ? nh : nw) * scale);
      const canvasH = Math.round((isSwapped ? nw : nh) * scale);

      const canvas = document.createElement("canvas");
      canvas.width = canvasW;
      canvas.height = canvasH;
      const ctx = canvas.getContext("2d")!;

      // Match buildBlob transform order: flip first, then rotate.
      ctx.translate(canvasW / 2, canvasH / 2);
      ctx.scale(flipped ? -1 : 1, flippedY ? -1 : 1);
      ctx.rotate((imageRotation * Math.PI) / 180);
      ctx.scale(scale, scale);
      ctx.drawImage(img, -nw / 2, -nh / 2);

      // WebP encodes ~10× faster than PNG; toDataURL is synchronous so there
      // is no async gap between encoding and the decode() preload below.
      const dataUrl = canvas.toDataURL("image/webp", 0.92);

      // Decode the image before updating state so the browser has it
      // paint-ready the instant the <img> src changes — no blank frame.
      void (async () => {
        try {
          const preload = new window.Image();
          preload.src = dataUrl;
          await preload.decode();
        } catch {
          // decode() failed — proceed anyway
        }
        if (cancelled) {
          return;
        }

        // Both state updates are inside an async callback, never in the
        // synchronous effect body, so no cascading render lint warning.
        setGeneratedRotation(imageRotation);
        setGeneratedUrl(dataUrl);
      })();
    };

    return () => {
      cancelled = true;
    };
  }, [imageUrl, imageRotation, flipped, flippedY]);

  const updateImageRect = useCallback(() => {
    if (imgRef.current && imgRef.current.naturalWidth > 0) {
      setImageRect(getContainedRect(imgRef.current));
    }
  }, []);

  useEffect(() => {
    const observer = new ResizeObserver(updateImageRect);
    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [updateImageRect]);

  // Re-compute rect when a new canvas is committed.
  useEffect(() => {
    updateImageRect();
  }, [generatedUrl, updateImageRect]);

  // Clamp using the actual rendered element dimensions so edges stay within the image.
  const posFromPointer = useCallback(
    (
      clientX: number,
      clientY: number,
      elemPxW: number,
      elemPxH: number,
    ): WatermarkPosition | null => {
      if (!imageRect || !containerRef.current) {
        return null;
      }

      const cr = containerRef.current.getBoundingClientRect();
      const x = ((clientX - cr.left - imageRect.x) / imageRect.width) * 100;
      const y = ((clientY - cr.top - imageRect.y) / imageRect.height) * 100;
      const halfX = (elemPxW / 2 / imageRect.width) * 100;
      const halfY = (elemPxH / 2 / imageRect.height) * 100;

      return {
        x: Math.max(halfX, Math.min(100 - halfX, x)),
        y: Math.max(halfY, Math.min(100 - halfY, y)),
      };
    },
    [imageRect],
  );

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (!onPositionChange) {
        return;
      }

      e.preventDefault();
      const elem = e.currentTarget as HTMLElement;
      elem.setPointerCapture(e.pointerId);
      dragging.current = true;
      const pos = posFromPointer(
        e.clientX,
        e.clientY,
        elem.offsetWidth,
        elem.offsetHeight,
      );
      if (pos) {
        onPositionChange(pos);
      }
    },
    [onPositionChange, posFromPointer],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragging.current || !onPositionChange) {
        return;
      }
      const elem = e.currentTarget as HTMLElement;
      const pos = posFromPointer(
        e.clientX,
        e.clientY,
        elem.offsetWidth,
        elem.offsetHeight,
      );
      if (pos) {
        onPositionChange(pos);
      }
    },
    [onPositionChange, posFromPointer],
  );

  const handlePointerUp = useCallback(() => {
    dragging.current = false;
  }, []);

  const sharedDragProps = {
    draggable: false as const,
    onPointerDown: handlePointerDown,
    onPointerMove: handlePointerMove,
    onPointerUp: handlePointerUp,
  };

  const wmLeft = imageRect
    ? imageRect.x + (watermarkPosition.x / 100) * imageRect.width
    : 0;
  const wmTop = imageRect
    ? imageRect.y + (watermarkPosition.y / 100) * imageRect.height
    : 0;

  const showImageWatermark =
    watermarkType === "image" && watermarkUrl && imageRect;
  const showTextWatermark =
    watermarkType === "text" && watermarkText.trim().length > 0 && imageRect;

  // For 90°/270°, the pre-rotated canvas is portrait (or landscape-flipped).
  return (
    <>
      <div
        ref={containerRef}
        className="relative w-full rounded-xl border border-overlay overflow-hidden mb-3 bg-surface"
      >
        {/* Blurred backdrop — uses the same pre-rotated URL so it rotates with the image */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={previewUrl}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover scale-110 blur-sm brightness-[0.65]"
        />

        {/* Main image — rotation/flip already baked into previewUrl, no CSS transform needed */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          ref={imgRef}
          src={previewUrl}
          alt={file.name}
          className={`relative z-10 w-full object-contain${is90or270 ? "" : " max-h-96"}`}
          onLoad={updateImageRect}
        />

        {/* Image watermark overlay */}
        {showImageWatermark && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={watermarkUrl!}
            alt="watermark"
            className="absolute z-20 cursor-grab active:cursor-grabbing select-none"
            style={{
              left: wmLeft,
              top: wmTop,
              transform: `translate(-50%, -50%) rotate(${watermarkRotation}deg)${watermarkFlipped ? " scaleX(-1)" : ""}${watermarkFlippedY ? " scaleY(-1)" : ""}`,
              width: (watermarkSize / 100) * imageRect!.width,
              opacity: watermarkOpacity / 100,
            }}
            {...sharedDragProps}
          />
        )}

        {/* Text watermark overlay */}
        {showTextWatermark && (
          <div
            className="absolute z-20 cursor-grab active:cursor-grabbing select-none font-bold"
            style={{
              left: wmLeft,
              top: wmTop,
              transform: `translate(-50%, -50%) rotate(${watermarkRotation}deg)`,
              fontSize: (watermarkFontSize / 100) * imageRect!.width,
              color: watermarkColor,
              opacity: watermarkOpacity / 100,
              fontFamily: "sans-serif",
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
              textAlign: "center",
              maxWidth: imageRect!.width,
            }}
            {...sharedDragProps}
          >
            {watermarkText}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between w-full mb-6 px-1">
        <p className="font-mono text-xs text-muted truncate mr-4">
          <span className="text-fg">{file.name}</span>
          <span className="mx-1.5">·</span>
          {formatBytes(file.size)}
        </p>
        <button
          onClick={onReset}
          className="font-mono text-xs text-red hover:text-red/70 transition-colors shrink-0 cursor-pointer"
        >
          × remove image
        </button>
      </div>
    </>
  );
};
