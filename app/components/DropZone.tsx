import { DragEvent } from "react";

interface DropZoneProps {
  isDragging: boolean;
  onClick: () => void;
  onDrop: (e: DragEvent<HTMLDivElement>) => void;
  onDragOver: (e: DragEvent<HTMLDivElement>) => void;
  onDragLeave: () => void;
}

export const DropZone = ({
  isDragging,
  onClick,
  onDrop,
  onDragOver,
  onDragLeave,
}: DropZoneProps) => (
  <div
    onClick={onClick}
    onDrop={onDrop}
    onDragOver={onDragOver}
    onDragLeave={onDragLeave}
    className={`w-full rounded-xl border-2 border-dashed transition-colors duration-200 cursor-pointer mb-8 ${
      isDragging
        ? "border-purple bg-surface"
        : "border-overlay hover:border-purple"
    }`}
  >
    <div className="flex flex-col items-center justify-center gap-3 py-16 px-8 text-center">
      <p className="font-mono text-fg text-sm font-medium">
        {isDragging ? "Release to upload" : "Drop your image here"}
      </p>
      <p className="font-mono text-muted text-xs">
        {isDragging ? "" : "or click to browse"}
      </p>
      <p className="font-mono text-xs text-muted/50 mt-2">
        JPG · PNG · WEBP · HEIC · TIFF
      </p>
    </div>
  </div>
);
