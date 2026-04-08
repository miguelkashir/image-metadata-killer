"use client";

import { useState, useRef, useCallback, DragEvent, ChangeEvent } from "react";

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatValue(value: unknown): string {
  if (value === null || value === undefined) return "—";
  if (value instanceof Date) return value.toLocaleString();
  if (value instanceof ArrayBuffer || ArrayBuffer.isView(value))
    return "[binary]";
  if (Array.isArray(value)) return value.map(formatValue).join(", ");
  if (typeof value === "number") {
    return Number.isInteger(value)
      ? String(value)
      : value.toFixed(6).replace(/\.?0+$/, "");
  }
  return String(value);
}

type Metadata = Record<string, unknown>;

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const [metadata, setMetadata] = useState<Metadata | null>(null);
  const [showMetadata, setShowMetadata] = useState(false);
  const [loadingMetadata, setLoadingMetadata] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((f: File) => {
    if (!f.type.startsWith("image/")) return;
    setImageUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return URL.createObjectURL(f);
    });
    setFile(f);
    setMetadata(null);
    setShowMetadata(false);
  }, []);

  const handleDrop = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);
      const f = e.dataTransfer.files[0];
      if (f) handleFile(f);
    },
    [handleFile]
  );

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) handleFile(f);
  };

  const reset = () => {
    if (imageUrl) URL.revokeObjectURL(imageUrl);
    setFile(null);
    setImageUrl(null);
    setMetadata(null);
    setShowMetadata(false);
    if (inputRef.current) inputRef.current.value = "";
  };

  const handleDisplayMetadata = async () => {
    if (showMetadata) {
      setShowMetadata(false);
      return;
    }
    if (metadata) {
      setShowMetadata(true);
      return;
    }
    setLoadingMetadata(true);
    try {
      const exifr = await import("exifr");
      const data: Metadata | undefined = await exifr.parse(file!, {
        tiff: true,
        exif: true,
        gps: true,
        iptc: true,
        xmp: true,
        icc: false,
        jfif: true,
      });
      setMetadata(data && Object.keys(data).length > 0 ? data : {});
    } catch {
      setMetadata({});
    } finally {
      setLoadingMetadata(false);
      setShowMetadata(true);
    }
  };

  const metadataEntries = metadata ? Object.entries(metadata) : [];

  return (
    <div className="flex flex-col min-h-screen text-fg font-sans">
      {/* Header */}
      <header className="w-full max-w-2xl mx-auto px-6 pt-8 pb-4 flex items-center justify-between">
        <span className="font-mono text-sm tracking-tight">
          <span className="text-pink">~/</span>
          <span className="text-purple font-semibold">metakill</span>
        </span>
        <span className="font-mono text-xs text-muted">v0.1.0</span>
      </header>

      {/* Main */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-12 w-full max-w-2xl mx-auto">
        {!file ? (
          <>
            {/* Hero */}
            <div className="text-center mb-10 w-full">
              <p className="font-mono text-xs text-muted mb-4 tracking-widest uppercase">
                image metadata remover
              </p>
              <h1 className="font-mono text-4xl sm:text-5xl font-bold leading-tight mb-5">
                Strip your images{" "}
                <span className="text-purple">clean.</span>
              </h1>
              <p className="text-muted text-base sm:text-lg max-w-md mx-auto leading-relaxed">
                Remove EXIF data, GPS coordinates, camera info, and all hidden
                metadata from your photos.{" "}
                <span className="text-cyan">
                  No uploads. No server. Your files never leave your device.
                </span>
              </p>
            </div>

            {/* Drop zone */}
            <div
              onClick={() => inputRef.current?.click()}
              onDrop={handleDrop}
              onDragOver={(e: DragEvent<HTMLDivElement>) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
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

            {/* Feature pills */}
            <div className="flex flex-wrap items-center justify-center gap-2 font-mono text-xs">
              <span className="bg-surface text-green px-3 py-1.5 rounded-full">
                ✓ no uploads
              </span>
              <span className="bg-surface text-cyan px-3 py-1.5 rounded-full">
                ✓ instant processing
              </span>
              <span className="bg-surface text-purple px-3 py-1.5 rounded-full">
                ✓ 100% private
              </span>
              <span className="bg-surface text-orange px-3 py-1.5 rounded-full">
                ✓ open source
              </span>
            </div>
          </>
        ) : (
          <>
            {/* Image preview */}
            <div className="w-full rounded-xl border border-overlay overflow-hidden mb-3 bg-surface">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imageUrl!}
                alt={file.name}
                className="w-full max-h-96 object-contain"
              />
            </div>

            {/* File info row */}
            <div className="flex items-center justify-between w-full mb-6 px-1">
              <p className="font-mono text-xs text-muted truncate mr-4">
                <span className="text-fg">{file.name}</span>
                <span className="mx-1.5">·</span>
                {formatBytes(file.size)}
              </p>
              <button
                onClick={reset}
                className="font-mono text-xs text-muted hover:text-red transition-colors shrink-0"
              >
                × change
              </button>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-3 w-full mb-6">
              <button
                onClick={handleDisplayMetadata}
                disabled={loadingMetadata}
                className={`flex-1 font-mono text-sm py-3 px-5 rounded-lg border transition-colors duration-150 ${
                  showMetadata
                    ? "border-cyan bg-cyan/10 text-cyan"
                    : "border-overlay text-cyan hover:bg-surface"
                } disabled:opacity-50 disabled:cursor-wait`}
              >
                {loadingMetadata
                  ? "reading..."
                  : showMetadata
                  ? "hide metadata"
                  : "display metadata"}
              </button>
              <button
                disabled
                className="flex-1 font-mono text-sm py-3 px-5 rounded-lg bg-purple text-base font-semibold opacity-40 cursor-not-allowed"
              >
                download clean image
              </button>
            </div>

            {/* Metadata panel */}
            {showMetadata && (
              <div className="w-full rounded-xl border border-overlay bg-surface overflow-hidden">
                {/* Panel header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-overlay">
                  <span className="font-mono text-xs text-muted uppercase tracking-widest">
                    metadata
                  </span>
                  {metadataEntries.length > 0 && (
                    <span className="font-mono text-xs text-muted">
                      {metadataEntries.length} fields
                    </span>
                  )}
                </div>

                {metadataEntries.length === 0 ? (
                  <div className="px-4 py-8 text-center">
                    <p className="font-mono text-sm text-green">
                      ✓ no metadata found
                    </p>
                    <p className="font-mono text-xs text-muted mt-1">
                      this image is already clean
                    </p>
                  </div>
                ) : (
                  <div className="max-h-72 overflow-y-auto divide-y divide-overlay/50">
                    {metadataEntries.map(([key, value]) => (
                      <div
                        key={key}
                        className="flex items-start gap-4 px-4 py-2.5 hover:bg-overlay/30 transition-colors"
                      >
                        <span className="font-mono text-xs text-muted shrink-0 w-40 pt-px truncate">
                          {key}
                        </span>
                        <span className="font-mono text-xs text-fg break-all">
                          {formatValue(value)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="w-full max-w-2xl mx-auto px-6 py-6 text-center">
        <p className="font-mono text-xs text-muted/40">
          your metadata never leaves your device
        </p>
        <p className="font-mono text-xs text-muted/40 mt-2">
          Made with ❤️ by{" "}
          <a
            href="https://github.com/miguelkashir"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted/60 hover:text-purple transition-colors duration-150"
          >
            miguelkashir
          </a>
        </p>
      </footer>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleChange}
      />
    </div>
  );
}
