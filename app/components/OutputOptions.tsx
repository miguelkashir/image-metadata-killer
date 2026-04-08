import type { OutputFormat } from "@/app/types/image";

interface OutputOptionsProps {
  outputFormat: OutputFormat;
  quality: number;
  onFormatChange: (fmt: OutputFormat) => void;
  onQualityChange: (q: number) => void;
}

const FORMATS: OutputFormat[] = ["jpeg", "png", "webp"];

export const OutputOptions = ({
  outputFormat,
  quality,
  onFormatChange,
  onQualityChange,
}: OutputOptionsProps) => (
  <div className="w-full bg-surface rounded-xl border border-overlay px-4 py-3 mb-4 space-y-3">
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
  </div>
);
