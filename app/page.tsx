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
import type { WatermarkOptions } from "./hooks/useImageDownload";

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

  function buildWatermarkOptions(): WatermarkOptions | undefined {
    if (watermark.type === "image" && watermark.watermarkUrl) {
      return {
        type: "image",
        url: watermark.watermarkUrl,
        position: watermark.position,
        size: watermark.size,
        opacity: watermark.opacity,
      };
    }
    if (watermark.type === "text" && watermark.text.trim().length > 0) {
      return {
        type: "text",
        text: watermark.text,
        position: watermark.position,
        fontSize: watermark.fontSize,
        color: watermark.color,
        opacity: watermark.opacity,
      };
    }

    return undefined;
  }

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
              watermarkType={watermark.type}
              watermarkUrl={watermark.watermarkUrl}
              watermarkSize={watermark.size}
              watermarkText={watermark.text}
              watermarkFontSize={watermark.fontSize}
              watermarkColor={watermark.color}
              watermarkPosition={watermark.position}
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
              type={watermark.type}
              watermarkUrl={watermark.watermarkUrl}
              size={watermark.size}
              text={watermark.text}
              fontSize={watermark.fontSize}
              color={watermark.color}
              opacity={watermark.opacity}
              onTypeChange={watermark.setType}
              onDrop={watermark.handleWatermarkDrop}
              onChange={watermark.handleWatermarkChange}
              onSizeChange={watermark.setSize}
              onTextChange={watermark.setText}
              onFontSizeChange={watermark.setFontSize}
              onColorChange={watermark.setColor}
              onOpacityChange={watermark.setOpacity}
              onRemove={
                watermark.type === "text"
                  ? watermark.clearText
                  : watermark.clearWatermark
              }
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
                  buildWatermarkOptions(),
                )
              }
              onDownload={() =>
                downloadHook.handleDownload(
                  file,
                  imageUrl!,
                  buildWatermarkOptions(),
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
