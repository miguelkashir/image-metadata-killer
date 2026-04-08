interface ActionButtonsProps {
  showMetadata: boolean;
  loadingMetadata: boolean;
  downloading: boolean;
  onDisplayMetadata: () => void;
  onDownload: () => void;
}

export const ActionButtons = ({
  showMetadata,
  loadingMetadata,
  downloading,
  onDisplayMetadata,
  onDownload,
}: ActionButtonsProps) => (
  <div className="flex flex-col sm:flex-row gap-3 w-full mb-4">
    <button
      onClick={onDisplayMetadata}
      disabled={loadingMetadata}
      className={`flex-1 font-mono text-sm py-3 px-5 rounded-lg border transition-colors duration-150 cursor-pointer ${
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
      onClick={onDownload}
      disabled={downloading}
      className="flex-1 font-mono text-sm py-3 px-5 rounded-lg bg-purple text-base font-semibold hover:opacity-90 transition-opacity duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-wait"
    >
      {downloading ? "processing..." : "download clean image"}
    </button>
  </div>
);
