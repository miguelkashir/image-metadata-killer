import { useRef } from "react";
import type { DragEvent, ChangeEvent } from "react";

interface WatermarkPanelProps {
  watermarkUrl: string | null;
  size: number;
  opacity: number;
  onDrop: (e: DragEvent<HTMLDivElement>) => void;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onSizeChange: (s: number) => void;
  onOpacityChange: (o: number) => void;
  onRemove: () => void;
}

export const WatermarkPanel = ({
  watermarkUrl,
  size,
  opacity,
  onDrop,
  onChange,
  onSizeChange,
  onOpacityChange,
  onRemove,
}: WatermarkPanelProps) => {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="w-full bg-surface rounded-xl border border-yellow/30 px-4 py-3 mb-4 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="font-mono text-xs text-yellow/80 uppercase tracking-widest">
          watermark
        </span>
        {watermarkUrl && (
          <button
            onClick={onRemove}
            className="font-mono text-xs text-red hover:text-red/70 transition-colors cursor-pointer"
          >
            × remove watermark
          </button>
        )}
      </div>

      {/* Upload area */}
      {!watermarkUrl ? (
        <div
          onDrop={onDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => inputRef.current?.click()}
          className="flex items-center justify-center gap-3 border border-dashed border-overlay hover:border-yellow/50 rounded-lg py-4 px-4 cursor-pointer transition-colors duration-150"
        >
          <span className="font-mono text-xs text-muted">
            drop watermark image or{" "}
            <span className="text-yellow/70 hover:text-yellow transition-colors">
              browse
            </span>
          </span>
        </div>
      ) : null}

      {/* Sliders — only when a watermark image is loaded */}
      {watermarkUrl && (
        <>
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs text-muted w-16 shrink-0">size</span>
            <input
              type="range"
              min={5}
              max={80}
              value={size}
              onChange={(e) => onSizeChange(Number(e.target.value))}
              className="flex-1 h-1 accent-yellow cursor-pointer"
            />
            <span className="font-mono text-xs text-fg w-8 text-right">{size}%</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="font-mono text-xs text-muted w-16 shrink-0">opacity</span>
            <input
              type="range"
              min={5}
              max={100}
              value={opacity}
              onChange={(e) => onOpacityChange(Number(e.target.value))}
              className="flex-1 h-1 accent-yellow cursor-pointer"
            />
            <span className="font-mono text-xs text-fg w-8 text-right">{opacity}%</span>
          </div>
        </>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={onChange}
      />
    </div>
  );
};
