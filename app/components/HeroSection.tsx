import { DragEvent } from "react";
import { DropZone } from "./DropZone";
import { FeaturePills } from "./FeaturePills";

interface HeroSectionProps {
  isDragging: boolean;
  onPickFile: () => void;
  onDrop: (e: DragEvent<HTMLDivElement>) => void;
  onDragOver: (e: DragEvent<HTMLDivElement>) => void;
  onDragLeave: () => void;
}

export const HeroSection = ({
  isDragging,
  onPickFile,
  onDrop,
  onDragOver,
  onDragLeave,
}: HeroSectionProps) => (
  <>
    <div className="text-center mb-10 w-full">
      <p className="font-mono text-xs text-muted mb-4 tracking-widest uppercase">
        image metadata remover
      </p>
      <h1 className="font-mono text-4xl sm:text-5xl font-bold leading-tight mb-5">
        Strip your images <span className="text-purple">clean.</span>
      </h1>
      <p className="text-muted sm:text-lg max-w-md mx-auto leading-relaxed">
        Remove EXIF data, GPS coordinates, camera info, and all hidden metadata
        from your photos.{" "}
        <span className="text-cyan">
          No uploads. No server. Your files never leave your device.
        </span>
      </p>
    </div>

    <DropZone
      isDragging={isDragging}
      onClick={onPickFile}
      onDrop={onDrop}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
    />

    <FeaturePills />
  </>
);
