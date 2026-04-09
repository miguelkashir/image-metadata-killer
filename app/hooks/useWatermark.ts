import { useState, useCallback } from "react";
import type { DragEvent, ChangeEvent } from "react";

export type WatermarkType = "image" | "text";

export interface WatermarkPosition {
  x: number;
  y: number;
}

interface UseWatermarkReturn {
  type: WatermarkType;
  // image
  watermarkUrl: string | null;
  size: number;
  flipped: boolean;
  flippedY: boolean;
  // text
  text: string;
  fontSize: number;
  color: string;
  rotation: number;
  // shared
  position: WatermarkPosition;
  opacity: number;
  setType: (t: WatermarkType) => void;
  setPosition: (pos: WatermarkPosition) => void;
  setSize: (s: number) => void;
  setFlipped: (f: boolean) => void;
  setFlippedY: (f: boolean) => void;
  setOpacity: (o: number) => void;
  setText: (t: string) => void;
  setFontSize: (s: number) => void;
  setColor: (c: string) => void;
  setRotation: (r: number) => void;
  handleWatermarkFile: (f: File) => void;
  handleWatermarkDrop: (e: DragEvent<HTMLDivElement>) => void;
  handleWatermarkChange: (e: ChangeEvent<HTMLInputElement>) => void;
  clearWatermark: () => void;
  clearText: () => void;
  reset: () => void;
}

export function useWatermark(): UseWatermarkReturn {
  const [type, setType] = useState<WatermarkType>("image");
  const [watermarkUrl, setWatermarkUrl] = useState<string | null>(null);
  const [flipped, setFlipped] = useState(false);
  const [flippedY, setFlippedY] = useState(false);
  const [position, setPosition] = useState<WatermarkPosition>({ x: 90, y: 90 });
  const [size, setSize] = useState(25);
  const [opacity, setOpacity] = useState(80);
  const [text, setText] = useState("");
  const [fontSize, setFontSize] = useState(5);
  const [color, setColor] = useState("#ffffff");
  const [rotation, setRotation] = useState(0);

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

  const clearText = useCallback(() => setText(""), []);

  const reset = useCallback(() => {
    clearWatermark();
    clearText();
    setType("image");
    setPosition({ x: 90, y: 90 });
    setSize(25);
    setFlipped(false);
    setFlippedY(false);
    setOpacity(80);
    setFontSize(5);
    setColor("#ffffff");
    setRotation(0);
  }, [clearWatermark, clearText]);

  return {
    type,
    watermarkUrl,
    size,
    flipped,
    flippedY,
    text,
    fontSize,
    color,
    rotation,
    position,
    opacity,
    setType,
    setPosition,
    setSize,
    setFlipped,
    setFlippedY,
    setOpacity,
    setText,
    setFontSize,
    setColor,
    setRotation,
    handleWatermarkFile,
    handleWatermarkDrop,
    handleWatermarkChange,
    clearWatermark,
    clearText,
    reset,
  };
}
