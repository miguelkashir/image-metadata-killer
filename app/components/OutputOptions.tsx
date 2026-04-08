import type { OutputFormat } from "@/app/types/image";
import type { ImageDimensions } from "@/app/hooks/useFileHandler";

interface OutputOptionsProps {
  outputFormat: OutputFormat;
  quality: number;
  scale: number;
  dimensions: ImageDimensions | null;
  onFormatChange: (fmt: OutputFormat) => void;
  onQualityChange: (q: number) => void;
  onScaleChange: (s: number) => void;
}

const FORMATS: OutputFormat[] = ["jpeg", "png", "webp"];

function DimensionDisplay({
  dimensions,
  scale,
}: {
  dimensions: ImageDimensions;
  scale: number;
}) {
  const newW = Math.round(dimensions.width * (scale / 100));
  const newH = Math.round(dimensions.height * (scale / 100));
  const isResized = scale < 100;

  return (
    <div className="flex items-center gap-2 font-mono text-xs">
      <span className={isResized ? "text-muted line-through" : "text-muted"}>
        {dimensions.width} × {dimensions.height}
      </span>
      {isResized && (
        <>
          <span className="text-overlay">→</span>
          <span className="text-cyan">
            {newW} × {newH}
          </span>
        </>
      )}
      <span className="text-muted/40">px</span>
    </div>
  );
}

export const OutputOptions = ({
  outputFormat,
  quality,
  scale,
  dimensions,
  onFormatChange,
  onQualityChange,
  onScaleChange,
}: OutputOptionsProps) => (
  <div className="w-full bg-surface rounded-xl border border-overlay px-4 py-3 mb-4 space-y-3">
    {/* Format */}
    <div className="flex items-center gap-3">
      <span className="font-mono text-xs text-muted w-16 shrink-0">format</span>
      <div className="flex gap-1.5">
        {FORMATS.map((fmt) => (
          <button
            key={fmt}
            onClick={() => onFormatChange(fmt)}
            className={`font-mono text-xs px-3 py-1 rounded-md transition-colors duration-150 cursor-pointer ${
              outputFormat === fmt
                ? "bg-purple text-base"
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
          className="flex-1 h-1 accent-purple cursor-pointer"
        />
        <span className="font-mono text-xs text-fg w-8 text-right">
          {quality}%
        </span>
      </div>
    )}

    {/* Resize */}
    <div className="space-y-1.5">
      <div className="flex items-center gap-3">
        <span className="font-mono text-xs text-muted w-16 shrink-0">
          resize
        </span>
        <input
          type="range"
          min={1}
          max={100}
          value={scale}
          onChange={(e) => onScaleChange(Number(e.target.value))}
          className="flex-1 h-1 accent-cyan cursor-pointer"
        />
        <span className="font-mono text-xs text-fg w-8 text-right">
          {scale}%
        </span>
      </div>
      {dimensions && (
        <div className="pl-19">
          <DimensionDisplay dimensions={dimensions} scale={scale} />
        </div>
      )}
    </div>
  </div>
);
