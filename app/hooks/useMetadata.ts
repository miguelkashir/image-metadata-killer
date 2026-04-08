import { useState, useCallback } from "react";
import { STRUCTURAL_KEYS } from "@/app/constants/metadata";
import type { Metadata } from "@/app/types/image";

interface UseMetadataReturn {
  metadata: Metadata | null;
  showMetadata: boolean;
  loadingMetadata: boolean;
  metadataEntries: [string, unknown][];
  hasPersonalMetadata: boolean;
  handleDisplayMetadata: (file: File) => Promise<void>;
  reset: () => void;
}

export function useMetadata(): UseMetadataReturn {
  const [metadata, setMetadata] = useState<Metadata | null>(null);
  const [showMetadata, setShowMetadata] = useState(false);
  const [loadingMetadata, setLoadingMetadata] = useState(false);

  const handleDisplayMetadata = useCallback(
    async (file: File) => {
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
        const data: Metadata | undefined = await exifr.parse(file, {
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
    },
    [showMetadata, metadata],
  );

  const reset = useCallback(() => {
    setMetadata(null);
    setShowMetadata(false);
  }, []);

  const metadataEntries = metadata ? Object.entries(metadata) : [];
  const hasPersonalMetadata = metadataEntries.some(
    ([key]) => !STRUCTURAL_KEYS.has(key),
  );

  return {
    metadata,
    showMetadata,
    loadingMetadata,
    metadataEntries,
    hasPersonalMetadata,
    handleDisplayMetadata,
    reset,
  };
}
