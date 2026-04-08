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
import { useWatermark } from "./hooks/useWatermark";
import { WatermarkPanel } from "./components/WatermarkPanel";
import type { OutputFormat } from "./types/image";

export default function Home() {
  const metadataHook = useMetadata();
  const downloadHook = useImageDownload("jpeg");
  const watermark = useWatermark();

  const handleFileSelected = useCallback(
    (fmt: OutputFormat) => {
      metadataHook.reset();
      downloadHook.resetCleanSize();
      downloadHook.resetTargetWidth();
      downloadHook.setOutputFormat(fmt);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const fileHandler = useFileHandler(handleFileSelected, () => {
    metadataHook.reset();
    downloadHook.resetCleanSize();
    downloadHook.resetTargetWidth();
    watermark.reset();
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
              watermarkUrl={watermark.watermarkUrl}
              watermarkPosition={watermark.position}
              watermarkSize={watermark.size}
              watermarkOpacity={watermark.opacity}
              onPositionChange={watermark.setPosition}
            />

            <OutputOptions
              outputFormat={downloadHook.outputFormat}
              quality={downloadHook.quality}
              targetWidth={downloadHook.targetWidth}
              dimensions={dimensions}
              onFormatChange={downloadHook.setOutputFormat}
              onQualityChange={downloadHook.setQuality}
              onTargetWidthChange={downloadHook.setTargetWidth}
            />

            <WatermarkPanel
              watermarkUrl={watermark.watermarkUrl}
              size={watermark.size}
              opacity={watermark.opacity}
              onDrop={watermark.handleWatermarkDrop}
              onChange={watermark.handleWatermarkChange}
              onSizeChange={watermark.setSize}
              onOpacityChange={watermark.setOpacity}
              onRemove={watermark.clearWatermark}
            />

            <ActionButtons
              showMetadata={metadataHook.showMetadata}
              loadingMetadata={metadataHook.loadingMetadata}
              downloading={downloadHook.downloading}
              copying={downloadHook.copying}
              copied={downloadHook.copied}
              onDisplayMetadata={() => metadataHook.handleDisplayMetadata(file)}
              onCopy={() =>
                downloadHook.handleCopy(
                  file,
                  imageUrl!,
                  watermark.watermarkUrl
                    ? {
                        url: watermark.watermarkUrl,
                        position: watermark.position,
                        size: watermark.size,
                        opacity: watermark.opacity,
                      }
                    : undefined,
                )
              }
              onDownload={() =>
                downloadHook.handleDownload(
                  file,
                  imageUrl!,
                  watermark.watermarkUrl
                    ? {
                        url: watermark.watermarkUrl,
                        position: watermark.position,
                        size: watermark.size,
                        opacity: watermark.opacity,
                      }
                    : undefined,
                )
              }
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
