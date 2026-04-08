import { useRef, useState, useCallback, useEffect } from "react";
import { formatBytes } from "@/app/utils/formatBytes";
import type { WatermarkPosition } from "@/app/hooks/useWatermark";

interface ImagePreviewProps {
  file: File;
  imageUrl: string;
  onReset: () => void;
  watermarkUrl?: string | null;
  watermarkPosition?: WatermarkPosition;
  watermarkSize?: number;
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
  onReset,
  watermarkUrl,
  watermarkPosition = { x: 90, y: 90 },
  watermarkSize = 25,
  watermarkOpacity = 80,
  onPositionChange,
}: ImagePreviewProps) => {
  const imgRef = useRef<HTMLImageElement>(null);
  const wmImgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [imageRect, setImageRect] = useState<ImageRect | null>(null);
  const dragging = useRef(false);

  const updateImageRect = useCallback(() => {
    if (imgRef.current && imgRef.current.naturalWidth > 0) {
      setImageRect(getContainedRect(imgRef.current));
    }
  }, []);

  useEffect(() => {
    const observer = new ResizeObserver(updateImageRect);
    if (imgRef.current) observer.observe(imgRef.current);
    return () => observer.disconnect();
  }, [updateImageRect]);

  const posFromPointer = useCallback(
    (clientX: number, clientY: number): WatermarkPosition | null => {
      if (!imageRect || !containerRef.current) return null;
      const cr = containerRef.current.getBoundingClientRect();
      const x =
        ((clientX - cr.left - imageRect.x) / imageRect.width) * 100;
      const y =
        ((clientY - cr.top - imageRect.y) / imageRect.height) * 100;

      // Clamp so the watermark edges stay within the image, not just the center.
      // halfX is watermarkSize/2 (% of image width).
      // halfY converts that pixel half-size to % of image height via the aspect ratios.
      const wm = wmImgRef.current;
      const halfX = watermarkSize / 2;
      const halfY =
        wm && wm.naturalWidth > 0
          ? (halfX * (wm.naturalHeight / wm.naturalWidth) * imageRect.width) /
            imageRect.height
          : halfX;

      return {
        x: Math.max(halfX, Math.min(100 - halfX, x)),
        y: Math.max(halfY, Math.min(100 - halfY, y)),
      };
    },
    [imageRect, watermarkSize],
  );

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (!onPositionChange) return;
      e.preventDefault();
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
      dragging.current = true;
      const pos = posFromPointer(e.clientX, e.clientY);
      if (pos) onPositionChange(pos);
    },
    [onPositionChange, posFromPointer],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragging.current || !onPositionChange) return;
      const pos = posFromPointer(e.clientX, e.clientY);
      if (pos) onPositionChange(pos);
    },
    [onPositionChange, posFromPointer],
  );

  const handlePointerUp = useCallback(() => {
    dragging.current = false;
  }, []);

  const wmStyle: React.CSSProperties | undefined =
    watermarkUrl && imageRect
      ? {
          left: imageRect.x + (watermarkPosition.x / 100) * imageRect.width,
          top: imageRect.y + (watermarkPosition.y / 100) * imageRect.height,
          transform: "translate(-50%, -50%)",
          width: (watermarkSize / 100) * imageRect.width,
          opacity: watermarkOpacity / 100,
        }
      : undefined;

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
          onLoad={updateImageRect}
        />

        {/* Watermark overlay */}
        {watermarkUrl && wmStyle && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            ref={wmImgRef}
            src={watermarkUrl}
            alt="watermark"
            className="absolute z-20 cursor-grab active:cursor-grabbing select-none"
            style={wmStyle}
            draggable={false}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
          />
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
