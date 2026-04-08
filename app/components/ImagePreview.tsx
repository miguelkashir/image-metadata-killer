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
  imageRotation?: ImageRotation;
  onReset: () => void;
  watermarkType?: WatermarkType;
  // image watermark
  watermarkUrl?: string | null;
  watermarkSize?: number;
  watermarkFlipped?: boolean;
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

function getContainedRect(elem: HTMLImageElement, rotation: ImageRotation): ImageRect {
  const { naturalWidth, naturalHeight, clientWidth, clientHeight } = elem;
  // For 90/270° the image occupies swapped natural dimensions within the element
  const isSwapped = rotation === 90 || rotation === 270;
  const natW = isSwapped ? naturalHeight : naturalWidth;
  const natH = isSwapped ? naturalWidth : naturalHeight;
  const scale = Math.min(clientWidth / natW, clientHeight / natH);
  const w = natW * scale;
  const h = natH * scale;

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
  imageRotation = 0,
  onReset,
  watermarkType = "image",
  watermarkUrl,
  watermarkSize = 25,
  watermarkFlipped = false,
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

  const updateImageRect = useCallback(() => {
    if (imgRef.current && imgRef.current.naturalWidth > 0) {
      setImageRect(getContainedRect(imgRef.current, imageRotation));
    }
  }, [imageRotation]);

  useEffect(() => {
    const observer = new ResizeObserver(updateImageRect);
    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [updateImageRect]);

  // Re-compute rect when rotation changes (ResizeObserver won't fire)
  useEffect(() => {
    updateImageRect();
  }, [imageRotation, updateImageRect]);

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

  return (
    <>
      <div
        ref={containerRef}
        className="relative w-full rounded-xl border border-overlay overflow-hidden mb-3 bg-surface"
      >
        {/* Blurred backdrop */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageUrl}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover scale-110 blur-sm brightness-[0.65]"
        />

        {/* Main image */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          ref={imgRef}
          src={imageUrl}
          alt={file.name}
          className="relative z-10 w-full max-h-96 object-contain"
          style={{
            transform: `rotate(${imageRotation}deg)${flipped ? " scaleX(-1)" : ""}`,
          }}
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
              transform: `translate(-50%, -50%) rotate(${watermarkRotation}deg)${watermarkFlipped ? " scaleX(-1)" : ""}`,
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
