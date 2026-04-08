import { useState, useRef, useCallback, DragEvent, ChangeEvent } from "react";
import { defaultFormat } from "@/app/constants/metadata";
import type { OutputFormat } from "@/app/types/image";

export interface ImageDimensions {
  width: number;
  height: number;
}

interface UseFileHandlerReturn {
  file: File | null;
  imageUrl: string | null;
  dimensions: ImageDimensions | null;
  isDragging: boolean;
  inputRef: React.RefObject<HTMLInputElement | null>;
  handleDrop: (e: DragEvent<HTMLDivElement>) => void;
  handleDragOver: (e: DragEvent<HTMLDivElement>) => void;
  handleDragLeave: () => void;
  handleChange: (e: ChangeEvent<HTMLInputElement>) => void;
  reset: () => void;
  defaultOutputFormat: OutputFormat;
}

export function useFileHandler(
  onFileSelected: (format: OutputFormat) => void,
  onReset: () => void,
): UseFileHandlerReturn {
  const [file, setFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [dimensions, setDimensions] = useState<ImageDimensions | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [defaultOutputFormat, setDefaultOutputFormat] =
    useState<OutputFormat>("jpeg");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    (f: File) => {
      if (!f.type.startsWith("image/")) {
        return;
      }

      const url = URL.createObjectURL(f);

      setImageUrl((prev) => {
        if (prev) {
          URL.revokeObjectURL(prev);
        }

        return url;
      });
      setFile(f);
      setDimensions(null);

      const img = new window.Image();
      img.onload = () => {
        setDimensions({ width: img.naturalWidth, height: img.naturalHeight });
      };
      img.src = url;

      const fmt = defaultFormat(f.type);
      setDefaultOutputFormat(fmt);
      onFileSelected(fmt);
    },
    [onFileSelected],
  );

  const handleDrop = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);
      const f = e.dataTransfer.files[0];

      if (f) {
        handleFile(f);
      }
    },
    [handleFile],
  );

  const handleDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const f = e.target.files?.[0];

      if (f) {
        handleFile(f);
      }
    },
    [handleFile],
  );

  const reset = useCallback(() => {
    if (imageUrl) {
      URL.revokeObjectURL(imageUrl);
    }

    setFile(null);
    setImageUrl(null);
    setDimensions(null);

    if (inputRef.current) {
      inputRef.current.value = "";
    }

    onReset();
  }, [imageUrl, onReset]);

  return {
    file,
    imageUrl,
    dimensions,
    isDragging,
    inputRef,
    handleDrop,
    handleDragOver,
    handleDragLeave,
    handleChange,
    reset,
    defaultOutputFormat,
  };
}
