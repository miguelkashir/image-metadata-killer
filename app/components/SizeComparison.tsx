import { formatBytes } from "@/app/utils/formatBytes";

interface SizeComparisonProps {
  originalSize: number;
  cleanSize: number;
}

export const SizeComparison = ({
  originalSize,
  cleanSize,
}: SizeComparisonProps) => {
  const isSmaller = cleanSize < originalSize;
  const pct = Math.round(
    (Math.abs(originalSize - cleanSize) / originalSize) * 100,
  );

  return (
    <div className="w-full flex items-center justify-center gap-3 font-mono text-xs mb-4">
      <span className="text-muted">{formatBytes(originalSize)}</span>
      <span className="text-overlay">→</span>
      <span className="text-green">{formatBytes(cleanSize)}</span>
      <span
        className={`px-2 py-0.5 rounded-full text-xs ${
          isSmaller ? "bg-green/10 text-green" : "bg-orange/10 text-orange"
        }`}
      >
        {isSmaller ? `↓ ${pct}% smaller` : `↑ ${pct}% larger`}
      </span>
    </div>
  );
};
