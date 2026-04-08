import { formatBytes } from "@/app/utils/formatBytes";

interface ImagePreviewProps {
  file: File;
  imageUrl: string;
  onReset: () => void;
}

export const ImagePreview = ({ file, imageUrl, onReset }: ImagePreviewProps) => (
  <>
    <div className="w-full rounded-xl border border-overlay overflow-hidden mb-3 bg-surface">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={imageUrl}
        alt={file.name}
        className="w-full max-h-96 object-contain"
      />
    </div>

    <div className="flex items-center justify-between w-full mb-6 px-1">
      <p className="font-mono text-xs text-muted truncate mr-4">
        <span className="text-fg">{file.name}</span>
        <span className="mx-1.5">·</span>
        {formatBytes(file.size)}
      </p>
      <button
        onClick={onReset}
        className="font-mono text-xs text-red hover:text-red/70 transition-colors shrink-0 cursor-pointer"
      >
        × change image
      </button>
    </div>
  </>
);
