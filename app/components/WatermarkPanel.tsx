import { useRef } from "react";
import type { DragEvent, ChangeEvent } from "react";
import type { WatermarkType } from "@/app/hooks/useWatermark";

const PRESET_COLORS = [
  { label: "white", value: "#f8f8f2" },
  { label: "dark", value: "#282a36" },
  { label: "red", value: "#ff5555" },
  { label: "orange", value: "#ffb86c" },
  { label: "yellow", value: "#f1fa8c" },
  { label: "green", value: "#50fa7b" },
  { label: "cyan", value: "#8be9fd" },
  { label: "purple", value: "#bd93f9" },
  { label: "pink", value: "#ff79c6" },
];

interface WatermarkPanelProps {
  type: WatermarkType;
  // image
  watermarkUrl: string | null;
  size: number;
  // text
  text: string;
  fontSize: number;
  color: string;
  // shared
  opacity: number;
  onTypeChange: (t: WatermarkType) => void;
  onDrop: (e: DragEvent<HTMLDivElement>) => void;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onSizeChange: (s: number) => void;
  onTextChange: (t: string) => void;
  onFontSizeChange: (s: number) => void;
  onColorChange: (c: string) => void;
  onOpacityChange: (o: number) => void;
  onRemove: () => void;
}

const TYPES: WatermarkType[] = ["image", "text"];

export const WatermarkPanel = ({
  type,
  watermarkUrl,
  size,
  text,
  fontSize,
  color,
  opacity,
  onTypeChange,
  onDrop,
  onChange,
  onSizeChange,
  onTextChange,
  onFontSizeChange,
  onColorChange,
  onOpacityChange,
  onRemove,
}: WatermarkPanelProps) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const hasWatermark =
    type === "image" ? watermarkUrl !== null : text.trim().length > 0;

  return (
    <div className="w-full bg-surface rounded-xl border border-yellow/30 px-4 py-3 mb-4 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="font-mono text-xs text-yellow/80 uppercase tracking-widest">
            watermark
          </span>
          <div className="flex gap-1">
            {TYPES.map((t) => (
              <button
                key={t}
                onClick={() => onTypeChange(t)}
                className={`font-mono text-xs px-2.5 py-0.5 rounded transition-colors duration-150 cursor-pointer ${
                  type === t
                    ? "bg-yellow/20 text-yellow"
                    : "text-muted hover:text-fg"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
        {hasWatermark && (
          <button
            onClick={onRemove}
            className="font-mono text-xs text-red hover:text-red/70 transition-colors cursor-pointer"
          >
            × remove
          </button>
        )}
      </div>

      {/* Image mode */}
      {type === "image" && (
        <>
          {!watermarkUrl ? (
            <div
              onDrop={onDrop}
              onDragOver={(e) => e.preventDefault()}
              onClick={() => inputRef.current?.click()}
              className="flex items-center justify-center border border-dashed border-overlay hover:border-yellow/50 rounded-lg py-4 px-4 cursor-pointer transition-colors duration-150"
            >
              <span className="font-mono text-xs text-muted">
                drop watermark image or{" "}
                <span className="text-yellow/70 hover:text-yellow transition-colors">
                  browse
                </span>
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs text-muted w-16 shrink-0">
                size
              </span>
              <input
                type="range"
                min={5}
                max={80}
                value={size}
                onChange={(e) => onSizeChange(Number(e.target.value))}
                className="flex-1 h-1 accent-yellow cursor-pointer"
              />
              <span className="font-mono text-xs text-fg w-8 text-right">
                {size}%
              </span>
            </div>
          )}
        </>
      )}

      {/* Text mode */}
      {type === "text" && (
        <>
          <textarea
            value={text}
            onChange={(e) => onTextChange(e.target.value)}
            placeholder={"© 2026 your name"}
            rows={3}
            className="w-full bg-base border border-overlay rounded-lg px-3 py-2 font-mono text-sm text-fg placeholder:text-muted focus:outline-none focus:border-yellow/50 transition-colors resize-none"
          />

          {text.trim().length > 0 && (
            <>
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs text-muted w-16 shrink-0">
                  size
                </span>
                <input
                  type="range"
                  min={1}
                  max={20}
                  value={fontSize}
                  onChange={(e) => onFontSizeChange(Number(e.target.value))}
                  className="flex-1 h-1 accent-yellow cursor-pointer"
                />
                <span className="font-mono text-xs text-fg w-8 text-right">
                  {fontSize}%
                </span>
              </div>

              <div className="flex items-center gap-3">
                <span className="font-mono text-xs text-muted w-16 shrink-0">
                  color
                </span>
                <div className="flex flex-wrap gap-4 items-center">
                  {/* Custom color picker */}
                  <label
                    title="custom color"
                    className={`w-6 h-6 rounded-md cursor-pointer relative overflow-hidden flex items-center justify-center ${
                      !PRESET_COLORS.some((p) => p.value === color)
                        ? "ring-2 ring-offset-2 ring-offset-surface ring-yellow"
                        : "ring-1 ring-overlay hover:ring-yellow/50"
                    }`}
                    style={{
                      backgroundColor: !PRESET_COLORS.some(
                        (p) => p.value === color,
                      )
                        ? color
                        : "#44475a",
                    }}
                  >
                    {PRESET_COLORS.some((p) => p.value === color) && (
                      <span className="font-mono text-[9px] text-muted leading-none pointer-events-none">
                        +
                      </span>
                    )}
                    <input
                      type="color"
                      value={color}
                      onChange={(e) => onColorChange(e.target.value)}
                      className="absolute opacity-0 inset-0 w-full h-full cursor-pointer"
                    />
                  </label>

                  {PRESET_COLORS.map(({ label, value }) => {
                    const active = color === value;

                    return (
                      <button
                        key={value}
                        title={label}
                        onClick={() => onColorChange(value)}
                        className={`w-6 h-6 rounded-md cursor-pointer transition-all ${
                          active
                            ? "ring-2 ring-offset-2 ring-offset-surface ring-yellow"
                            : "hover:ring-2 hover:ring-offset-2 hover:ring-offset-surface hover:ring-overlay"
                        }`}
                        style={{ backgroundColor: value }}
                      />
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </>
      )}

      {/* Opacity — shared, only when active watermark exists */}
      {hasWatermark && (
        <div className="flex items-center gap-3">
          <span className="font-mono text-xs text-muted w-16 shrink-0">
            opacity
          </span>
          <input
            type="range"
            min={5}
            max={100}
            value={opacity}
            onChange={(e) => onOpacityChange(Number(e.target.value))}
            className="flex-1 h-1 accent-yellow cursor-pointer"
          />
          <span className="font-mono text-xs text-fg w-8 text-right">
            {opacity}%
          </span>
        </div>
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
