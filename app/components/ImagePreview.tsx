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
}

export const ImagePreview = ({
  file,
  imageUrl,
  onReset,
  watermarkUrl,
  watermarkPosition = { x: 75, y: 75 },
  watermarkSize = 25,
  watermarkOpacity = 80,
}: ImagePreviewProps) => (
  <>
    <div className="relative w-full rounded-xl border border-overlay overflow-hidden mb-3 bg-surface">
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
        src={imageUrl}
        alt={file.name}
        className="relative z-10 w-full max-h-96 object-contain"
      />

      {/* Watermark overlay */}
      {watermarkUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={watermarkUrl}
          alt="watermark"
          className="absolute z-20 pointer-events-none"
          style={{
            left: `${watermarkPosition.x}%`,
            top: `${watermarkPosition.y}%`,
            transform: "translate(-50%, -50%)",
            width: `${watermarkSize}%`,
            opacity: watermarkOpacity / 100,
          }}
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
