import { useState, useCallback } from "react";
import type { DragEvent, ChangeEvent } from "react";

export interface WatermarkPosition {
  x: number;
  y: number;
}

interface UseWatermarkReturn {
  watermarkUrl: string | null;
  position: WatermarkPosition;
  size: number;
  opacity: number;
  setPosition: (pos: WatermarkPosition) => void;
  setSize: (s: number) => void;
  setOpacity: (o: number) => void;
  handleWatermarkFile: (f: File) => void;
  handleWatermarkDrop: (e: DragEvent<HTMLDivElement>) => void;
  handleWatermarkChange: (e: ChangeEvent<HTMLInputElement>) => void;
  clearWatermark: () => void;
  reset: () => void;
}

export function useWatermark(): UseWatermarkReturn {
  const [watermarkUrl, setWatermarkUrl] = useState<string | null>(null);
  const [position, setPosition] = useState<WatermarkPosition>({ x: 75, y: 75 });
  const [size, setSize] = useState(25);
  const [opacity, setOpacity] = useState(80);

  const handleWatermarkFile = useCallback((f: File) => {
    if (!f.type.startsWith("image/")) {
      return;
    }

    setWatermarkUrl((prev) => {
      if (prev) {
        URL.revokeObjectURL(prev);
      }

      return URL.createObjectURL(f);
    });
  }, []);

  const handleWatermarkDrop = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      const f = e.dataTransfer.files[0];

      if (f) {
        handleWatermarkFile(f);
      }
    },
    [handleWatermarkFile],
  );

  const handleWatermarkChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const f = e.target.files?.[0];

      if (f) {
        handleWatermarkFile(f);
      }
    },
    [handleWatermarkFile],
  );

  const clearWatermark = useCallback(() => {
    setWatermarkUrl((prev) => {
      if (prev) {
        URL.revokeObjectURL(prev);
      }

      return null;
    });
  }, []);

  const reset = useCallback(() => {
    clearWatermark();
    setPosition({ x: 75, y: 75 });
    setSize(25);
    setOpacity(80);
  }, [clearWatermark]);

  return {
    watermarkUrl,
    position,
    size,
    opacity,
    setPosition,
    setSize,
    setOpacity,
    handleWatermarkFile,
    handleWatermarkDrop,
    handleWatermarkChange,
    clearWatermark,
    reset,
  };
}
