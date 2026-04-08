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
  // text
  text: string;
  fontSize: number;
  color: string;
  // shared
  position: WatermarkPosition;
  opacity: number;
  setType: (t: WatermarkType) => void;
  setPosition: (pos: WatermarkPosition) => void;
  setSize: (s: number) => void;
  setOpacity: (o: number) => void;
  setText: (t: string) => void;
  setFontSize: (s: number) => void;
  setColor: (c: string) => void;
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
  const [position, setPosition] = useState<WatermarkPosition>({ x: 90, y: 90 });
  const [size, setSize] = useState(25);
  const [opacity, setOpacity] = useState(80);
  const [text, setText] = useState("");
  const [fontSize, setFontSize] = useState(5);
  const [color, setColor] = useState("#ffffff");

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
    setOpacity(80);
    setFontSize(5);
    setColor("#ffffff");
  }, [clearWatermark, clearText]);

  return {
    type,
    watermarkUrl,
    size,
    text,
    fontSize,
    color,
    position,
    opacity,
    setType,
    setPosition,
    setSize,
    setOpacity,
    setText,
    setFontSize,
    setColor,
    handleWatermarkFile,
    handleWatermarkDrop,
    handleWatermarkChange,
    clearWatermark,
    clearText,
    reset,
  };
}
