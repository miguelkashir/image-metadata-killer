import type { OutputFormat } from "@/app/types/image";

// Keys that are structural to the file format and cannot be stripped.
// Their presence doesn't mean the image carries personal metadata.
export const STRUCTURAL_KEYS = new Set([
  // PNG IHDR chunk
  "ImageWidth",
  "ImageHeight",
  "BitDepth",
  "ColorType",
  "Compression",
  "Filter",
  "Interlace",
  // JPEG / JFIF
  "JFIFVersion",
  "ResolutionUnit",
  "XResolution",
  "YResolution",
  "ThumbnailWidth",
  "ThumbnailHeight",
  // Common encoding descriptors
  "ColorComponents",
  "EncodingProcess",
  "YCbCrSubSampling",
]);

export function defaultFormat(mimeType: string): OutputFormat {
  if (mimeType === "image/png") {
    return "png";
  }

  if (mimeType === "image/webp") {
    return "webp";
  }

  return "jpeg";
}
