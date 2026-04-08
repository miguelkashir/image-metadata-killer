"use client";

import { useCallback } from "react";
import { Footer } from "./components/Footer";
import { HeroSection } from "./components/HeroSection";
import { ImagePreview } from "./components/ImagePreview";
import { OutputOptions } from "./components/OutputOptions";
import { ActionButtons } from "./components/ActionButtons";
import { SizeComparison } from "./components/SizeComparison";
import { MetadataPanel } from "./components/MetadataPanel";
import { useFileHandler } from "./hooks/useFileHandler";
import { useMetadata } from "./hooks/useMetadata";
import { useImageDownload } from "./hooks/useImageDownload";
import type { OutputFormat } from "./types/image";

export default function Home() {
  const metadataHook = useMetadata();
  const downloadHook = useImageDownload("jpeg");

  const handleFileSelected = useCallback(
    (fmt: OutputFormat) => {
      metadataHook.reset();
      downloadHook.resetCleanSize();
      downloadHook.resetScale();
      downloadHook.setOutputFormat(fmt);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const fileHandler = useFileHandler(handleFileSelected, () => {
    metadataHook.reset();
    downloadHook.resetCleanSize();
    downloadHook.resetScale();
  });

  const { file, imageUrl, dimensions } = fileHandler;

  return (
    <div className="flex flex-col min-h-screen text-fg font-sans">
      <header className="w-full max-w-2xl mx-auto px-6 pt-8 pb-4 flex items-center justify-between">
        <span className="font-mono text-sm tracking-tight">
          <span className="text-pink">~/</span>
          <span className="text-purple font-semibold">metakill</span>
        </span>
        <span className="font-mono text-xs text-muted">v0.1.0</span>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-6 py-12 w-full max-w-2xl mx-auto">
        {!file ? (
          <HeroSection
            isDragging={fileHandler.isDragging}
            onPickFile={() => fileHandler.inputRef.current?.click()}
            onDrop={fileHandler.handleDrop}
            onDragOver={fileHandler.handleDragOver}
            onDragLeave={fileHandler.handleDragLeave}
          />
        ) : (
          <>
            <ImagePreview
              file={file}
              imageUrl={imageUrl!}
              onReset={fileHandler.reset}
            />

            <OutputOptions
              outputFormat={downloadHook.outputFormat}
              quality={downloadHook.quality}
              scale={downloadHook.scale}
              dimensions={dimensions}
              onFormatChange={downloadHook.setOutputFormat}
              onQualityChange={downloadHook.setQuality}
              onScaleChange={downloadHook.setScale}
            />

            <ActionButtons
              showMetadata={metadataHook.showMetadata}
              loadingMetadata={metadataHook.loadingMetadata}
              downloading={downloadHook.downloading}
              onDisplayMetadata={() => metadataHook.handleDisplayMetadata(file)}
              onDownload={() => downloadHook.handleDownload(file, imageUrl!)}
            />

            {downloadHook.cleanSize !== null && (
              <SizeComparison
                originalSize={file.size}
                cleanSize={downloadHook.cleanSize}
              />
            )}

            {metadataHook.showMetadata && (
              <MetadataPanel
                entries={metadataHook.metadataEntries}
                hasPersonalMetadata={metadataHook.hasPersonalMetadata}
              />
            )}
          </>
        )}
      </main>

      <Footer />

      <input
        ref={fileHandler.inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={fileHandler.handleChange}
      />
    </div>
  );
}
