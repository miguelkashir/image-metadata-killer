import type { OutputFormat } from "@/app/types/image";
import type { ImageDimensions } from "@/app/hooks/useFileHandler";
import type { ImageRotation } from "@/app/hooks/useImageDownload";
import {
  RESOLUTION_PRESETS,
  detectAspectRatio,
} from "@/app/constants/resizePresets";

interface OutputOptionsProps {
  outputFormat: OutputFormat;
  quality: number;
  targetWidth: number | null;
  flipped: boolean;
  flippedY: boolean;
  imageRotation: ImageRotation;
  dimensions: ImageDimensions | null;
  onFormatChange: (fmt: OutputFormat) => void;
  onQualityChange: (q: number) => void;
  onTargetWidthChange: (w: number | null) => void;
  onFlipChange: (f: boolean) => void;
  onFlipYChange: (f: boolean) => void;
  onRotateImage: (dir: "cw" | "ccw") => void;
}

const FORMATS: OutputFormat[] = ["jpeg", "png", "webp"];

export const OutputOptions = ({
  outputFormat,
  quality,
  targetWidth,
  flipped,
  flippedY,
  imageRotation,
  dimensions,
  onFormatChange,
  onQualityChange,
  onTargetWidthChange,
  onFlipChange,
  onFlipYChange,
  onRotateImage,
}: OutputOptionsProps) => {
  const aspectKey = dimensions
    ? detectAspectRatio(dimensions.width, dimensions.height)
    : null;

  const resolutionPresets = aspectKey
    ? (RESOLUTION_PRESETS[aspectKey] ?? [])
    : [];

  const applicablePresets = resolutionPresets.filter(
    (p) => dimensions && p.width < dimensions.width,
  );

  return (
    <div className="w-full bg-surface rounded-xl border border-overlay px-4 py-3 mb-4 space-y-3">
      {/* Header */}
      <span className="font-mono text-xs text-cyan/80 uppercase tracking-widest">
        settings
      </span>

      {/* Rotate */}
      <div className="flex items-center gap-3">
        <span className="font-mono text-xs text-muted w-16 shrink-0">
          rotate
        </span>
        <div className="flex gap-1.5">
          <button
            onClick={() => onRotateImage("ccw")}
            className="font-mono text-xs px-3 py-1 rounded-md border border-overlay text-muted hover:text-fg hover:bg-overlay transition-colors duration-150 cursor-pointer"
          >
            ↺ 90°
          </button>
          <button
            onClick={() => onRotateImage("cw")}
            className="font-mono text-xs px-3 py-1 rounded-md border border-overlay text-muted hover:text-fg hover:bg-overlay transition-colors duration-150 cursor-pointer"
          >
            ↻ 90°
          </button>
        </div>
        {imageRotation !== 0 && (
          <span className="font-mono text-xs text-cyan">{imageRotation}°</span>
        )}
      </div>

      {/* Flip */}
      <div className="flex items-center gap-3">
        <span className="font-mono text-xs text-muted w-16 shrink-0">
          mirror
        </span>
        <div className="flex gap-1.5">
          <button
            onClick={() => onFlipChange(!flipped)}
            className={`font-mono text-xs px-3 py-1 rounded-md border transition-colors duration-150 cursor-pointer ${
              flipped
                ? "border-cyan bg-cyan/10 text-cyan"
                : "border-overlay text-muted hover:text-fg hover:bg-overlay"
            }`}
          >
            ↔ horizontal
          </button>
          <button
            onClick={() => onFlipYChange(!flippedY)}
            className={`font-mono text-xs px-3 py-1 rounded-md border transition-colors duration-150 cursor-pointer ${
              flippedY
                ? "border-cyan bg-cyan/10 text-cyan"
                : "border-overlay text-muted hover:text-fg hover:bg-overlay"
            }`}
          >
            ↕ vertical
          </button>
        </div>
      </div>

      {/* Format */}
      <div className="flex items-center gap-3">
        <span className="font-mono text-xs text-muted w-16 shrink-0">
          format
        </span>
        <div className="flex gap-1.5">
          {FORMATS.map((fmt) => (
            <button
              key={fmt}
              onClick={() => onFormatChange(fmt)}
              className={`font-mono text-xs px-3 py-1 rounded-md transition-colors duration-150 cursor-pointer ${
                outputFormat === fmt
                  ? "bg-cyan/20 text-cyan"
                  : "text-muted hover:text-fg hover:bg-overlay"
              }`}
            >
              {fmt.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Quality — hidden for PNG */}
      {outputFormat !== "png" && (
        <div className="flex items-center gap-3">
          <span className="font-mono text-xs text-muted w-16 shrink-0">
            quality
          </span>
          <input
            type="range"
            min={1}
            max={100}
            value={quality}
            onChange={(e) => onQualityChange(Number(e.target.value))}
            className="flex-1 h-1 accent-cyan cursor-pointer"
          />
          <span className="font-mono text-xs text-fg w-8 text-right">
            {quality}%
          </span>
        </div>
      )}

      {/* Resize — only shown when resolution presets are available */}
      {applicablePresets.length > 0 && (
        <div className="flex items-start gap-3">
          <span className="font-mono text-xs text-muted w-16 shrink-0 pt-1">
            resize
          </span>
          <div className="flex flex-wrap gap-1.5">
            {/* "Original" reset option */}
            <button
              onClick={() => onTargetWidthChange(null)}
              className={`font-mono text-xs px-2.5 py-1 rounded-md transition-colors duration-150 cursor-pointer ${
                targetWidth === null
                  ? "bg-cyan/20 text-cyan"
                  : "text-muted hover:text-fg hover:bg-overlay"
              }`}
            >
              original
            </button>

            {applicablePresets.map((p) => (
              <button
                key={p.label}
                onClick={() => onTargetWidthChange(p.width)}
                className={`font-mono text-xs px-2.5 py-1 rounded-md transition-colors duration-150 cursor-pointer ${
                  targetWidth === p.width
                    ? "bg-cyan/20 text-cyan"
                    : "text-muted hover:text-fg hover:bg-overlay"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
